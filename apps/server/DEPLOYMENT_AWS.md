# Deploying Cumprido Server to AWS (Docker)

This repo ships a production-ready Docker image for the NestJS API in [apps/server/Dockerfile](apps/server/Dockerfile).

The deployment flow is:

1) Build image from the monorepo root
2) Push image to ECR
3) Restart your runtime (ECS service / App Runner / EC2 Docker)

## Prereqs

- AWS CLI configured (`aws sts get-caller-identity` works)
- Docker installed
- An AWS ECR repository for the server image
- Your runtime must mount a persistent volume for `uploads/` (see below)

## Important: persistent `uploads/` volume

The server serves `/uploads/*` from the container filesystem and saves support-ticket attachments to:

- `apps/server/uploads/support/*`

In AWS, **container filesystems are ephemeral**.

- ECS/Fargate: mount an **EFS** volume to `/repo/apps/server/uploads`
- EC2 Docker: bind-mount a host directory to `/repo/apps/server/uploads`
- If you don’t want filesystem storage, the correct long-term fix is S3 storage + signed URLs (not implemented here).

If you deploy without a persistent mount, attachments will be lost on redeploy/restart.

## Option A: ECS (common)

### If your task definition uses `:latest`

1) Push a new `:latest` image to ECR.
2) Force a new deployment:

`aws ecs update-service --cluster <cluster> --service <service> --force-new-deployment`

### If your task definition pins a tag (recommended)

- Push an image with a unique tag (e.g. `2026-01-10T0100Z`)
- Register a new task definition revision referencing that tag
- Update the service to the new task definition

This repo includes a helper to push to ECR: [apps/server/scripts/aws/push-ecr-image.sh](apps/server/scripts/aws/push-ecr-image.sh).

## Option B: AWS App Runner

- App Runner will deploy from a new ECR image when you start a deployment.

Example:

`aws apprunner start-deployment --service-arn <service-arn>`

## Option C: EC2 (Docker)

Typical flow on the instance:

- `docker pull <account>.dkr.ecr.<region>.amazonaws.com/<repo>:<tag>`
- `docker stop` / `docker rm` the old container
- `docker run ... -v /data/cumprido/uploads:/repo/apps/server/uploads ... <image>`

## Required environment variables

At minimum, production must set:

- `NODE_ENV=production`
- `PORT=3001` (or whatever your ALB targets)
- `DATABASE_URL=...`
- `JWT_SECRET=...` (must be present)

Other vars depend on enabled features (Stripe, email, etc.). See `apps/server/.env.example`.

## Quick push to ECR (recommended)

From the monorepo root (`cumprido/`):

1) `chmod +x apps/server/scripts/aws/*.sh`
2) Export required vars:

- `AWS_REGION`
- `AWS_ACCOUNT_ID`
- `ECR_REPOSITORY` (repo name, e.g. `cumprido-server`)
- `IMAGE_TAG` (e.g. `latest` or `2026-01-10-1`)

3) Run:

`apps/server/scripts/aws/push-ecr-image.sh`

It prints the full image URI you can drop into ECS/App Runner.
