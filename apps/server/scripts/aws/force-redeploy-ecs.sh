#!/usr/bin/env bash
set -euo pipefail

# Forces a new ECS deployment after pushing a new image.
# This works if your ECS task definition references an image tag that you just pushed
# (commonly `:latest`), or if it references an image digest.

require() {
  if [[ -z "${!1:-}" ]]; then
    echo "Missing required env var: $1" >&2
    exit 1
  fi
}

require AWS_REGION
require ECS_CLUSTER
require ECS_SERVICE

command -v aws >/dev/null 2>&1 || { echo "aws CLI not found" >&2; exit 1; }

echo "==> Forcing new deployment: cluster=${ECS_CLUSTER} service=${ECS_SERVICE}" >&2
aws ecs update-service \
  --region "${AWS_REGION}" \
  --cluster "${ECS_CLUSTER}" \
  --service "${ECS_SERVICE}" \
  --force-new-deployment >/dev/null

echo "OK: deployment triggered"