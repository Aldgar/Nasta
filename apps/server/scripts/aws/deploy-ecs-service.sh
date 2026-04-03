#!/usr/bin/env bash
set -euo pipefail

# Deploy Cumprido server to ECS by:
# 1) Building + pushing a new ECR image tag
# 2) Registering a new task definition revision with that image
# 3) Updating the ECS service to that revision
# 4) Waiting for the service to stabilize
#
# IMPORTANT: Requires Docker daemon running.
# Run from monorepo root: `cd cumprido`

require() {
  if [[ -z "${!1:-}" ]]; then
    echo "Missing required env var: $1" >&2
    exit 1
  fi
}

require AWS_REGION
require AWS_ACCOUNT_ID
require ECR_REPOSITORY
require ECS_CLUSTER
require ECS_SERVICE

TASK_FAMILY="${TASK_FAMILY:-cumprido-server}"
CONTAINER_NAME="${CONTAINER_NAME:-api}"
IMAGE_TAG="${IMAGE_TAG:-$(date -u +%Y%m%d%H%M%S)-fixes-amd64}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Start Docker Desktop and retry." >&2
  exit 1
fi

# 1) Build + push image
export IMAGE_TAG
"${SCRIPT_DIR}/push-ecr-image.sh" >/dev/null

ACCOUNT_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${ACCOUNT_URI}/${ECR_REPOSITORY}:${IMAGE_TAG}"

# 2) Fetch task definition + register new revision
TMPDIR="${TMPDIR:-/tmp}"
IN_JSON="${TMPDIR}/cumprido-taskdef-in.json"
OUT_JSON="${TMPDIR}/cumprido-taskdef-register.json"

AWS_PAGER="" aws ecs describe-task-definition \
  --region "${AWS_REGION}" \
  --task-definition "${TASK_FAMILY}" \
  --output json > "${IN_JSON}"

export IN_JSON OUT_JSON IMAGE_URI CONTAINER_NAME
export SERVER_PUBLIC_URL="${SERVER_PUBLIC_URL:-}"

node <<'NODE'
const fs = require('fs');

const inPath = process.env.IN_JSON;
const outPath = process.env.OUT_JSON;
const imageUri = process.env.IMAGE_URI;
const containerName = process.env.CONTAINER_NAME;
const serverPublicUrl = process.env.SERVER_PUBLIC_URL;

if (!inPath || !outPath || !imageUri || !containerName) {
  console.error('Missing env for taskdef transform');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const taskDef = raw.taskDefinition;
if (!taskDef) {
  console.error('No taskDefinition in input');
  process.exit(1);
}

// Remove read-only / server-populated fields that RegisterTaskDefinition rejects
const stripKeys = [
  'taskDefinitionArn',
  'revision',
  'status',
  'requiresAttributes',
  'compatibilities',
  'registeredAt',
  'registeredBy',
  'inferenceAccelerators',
  'ephemeralStorage',
  'runtimePlatform',
  'enableFaultInjection',
];
for (const k of stripKeys) delete taskDef[k];

// Update container image
const containers = taskDef.containerDefinitions || [];
const target = containers.find((c) => c?.name === containerName);
if (!target) {
  console.error(`Container '${containerName}' not found in task definition`);
  process.exit(1);
}

target.image = imageUri;

// Optionally override SERVER_PUBLIC_URL so email links are valid HTTPS in production.
if (serverPublicUrl) {
  target.environment = Array.isArray(target.environment) ? target.environment : [];
  const existing = target.environment.find((e) => e && e.name === 'SERVER_PUBLIC_URL');
  if (existing) {
    existing.value = serverPublicUrl;
  } else {
    target.environment.push({ name: 'SERVER_PUBLIC_URL', value: serverPublicUrl });
  }
}

// ECS RegisterTaskDefinition expects the object shape without wrapper keys
fs.writeFileSync(outPath, JSON.stringify(taskDef));
NODE

NEW_TASKDEF_ARN=$(AWS_PAGER="" aws ecs register-task-definition \
  --region "${AWS_REGION}" \
  --cli-input-json "file://${OUT_JSON}" \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

# 3) Update service
AWS_PAGER="" aws ecs update-service \
  --region "${AWS_REGION}" \
  --cluster "${ECS_CLUSTER}" \
  --service "${ECS_SERVICE}" \
  --task-definition "${NEW_TASKDEF_ARN}" \
  --query 'service.serviceArn' \
  --output text >/dev/null

# 4) Wait for stability
AWS_PAGER="" aws ecs wait services-stable \
  --region "${AWS_REGION}" \
  --cluster "${ECS_CLUSTER}" \
  --services "${ECS_SERVICE}"

echo "OK: deployed ${IMAGE_URI}"
echo "OK: task definition ${NEW_TASKDEF_ARN}"
