#!/usr/bin/env bash
set -euo pipefail

# Build and push the Cumprido server Docker image to AWS ECR.
# Run this from the monorepo root: `cd cumprido`

require() {
  if [[ -z "${!1:-}" ]]; then
    echo "Missing required env var: $1" >&2
    exit 1
  fi
}

require AWS_REGION
require AWS_ACCOUNT_ID
require ECR_REPOSITORY

IMAGE_TAG="${IMAGE_TAG:-latest}"

ACCOUNT_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${ACCOUNT_URI}/${ECR_REPOSITORY}:${IMAGE_TAG}"

command -v aws >/dev/null 2>&1 || { echo "aws CLI not found" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "docker not found" >&2; exit 1; }

echo "==> Ensuring ECR repo exists: ${ECR_REPOSITORY}" >&2
aws ecr describe-repositories --repository-names "${ECR_REPOSITORY}" --region "${AWS_REGION}" >/dev/null 2>&1 \
  || aws ecr create-repository --repository-name "${ECR_REPOSITORY}" --region "${AWS_REGION}" >/dev/null

echo "==> Logging into ECR: ${ACCOUNT_URI}" >&2
aws ecr get-login-password --region "${AWS_REGION}" \
  | docker login --username AWS --password-stdin "${ACCOUNT_URI}" >/dev/null

echo "==> Building Docker image (apps/server/Dockerfile)" >&2
# Build context is the monorepo root (must contain pnpm-workspace.yaml)
# ECS runtime platform is X86_64, so build linux/amd64 to avoid arch mismatch on Apple Silicon.
if docker buildx version >/dev/null 2>&1; then
  docker buildx build --platform linux/amd64 -f apps/server/Dockerfile -t "${IMAGE_URI}" --load .
else
  docker build --platform linux/amd64 -f apps/server/Dockerfile -t "${IMAGE_URI}" .
fi

echo "==> Pushing ${IMAGE_URI}" >&2
docker push "${IMAGE_URI}" >/dev/null

echo "OK: pushed ${IMAGE_URI}"
