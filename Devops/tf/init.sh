#!/bin/bash
set -e

REGION="us-east-1"
KEY="devsecjobs/terraform.tfstate"
LOCK_TABLE="terraform-locks"

aws sts get-caller-identity > /dev/null 2>&1 || {
  echo "❌ AWS CLI not configured. Run aws configure first."
  exit 1
}

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET="devsecjobs-tfstate-${ACCOUNT_ID}"

echo "🔹 Initializing main Terraform stack..."
terraform init -migrate-state \
  -backend-config="bucket=${BUCKET}" \
  -backend-config="key=${KEY}" \
  -backend-config="region=${REGION}" \
  -backend-config="dynamodb_table=${LOCK_TABLE}" \
  -backend-config="encrypt=true"

echo "🔹 Applying infrastructure..."