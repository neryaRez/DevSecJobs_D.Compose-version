#!/bin/bash
set -euo pipefail

LOG=/var/log/devsecjobs-bootstrap.log
exec > >(tee -a "$LOG") 2>&1
set -x

echo "=== DevSecJobs bootstrap started ==="

# -------------------------
# Vars from Terraform templatefile()
# -------------------------
AWS_REGION="${AWS_REGION}"
ACCOUNT_ID="${ACCOUNT_ID}"
PROJECT_NAME="${PROJECT_NAME}"

echo "AWS_REGION=$AWS_REGION"
echo "ACCOUNT_ID=$ACCOUNT_ID"
echo "PROJECT_NAME=$PROJECT_NAME"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release git unzip openssl

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip -q awscliv2.zip
./aws/install || true
aws --version

# Docker
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
usermod -aG docker ubuntu || true
systemctl enable docker
systemctl start docker

until docker info >/dev/null 2>&1; do
  echo "Waiting for Docker daemon..."
  sleep 2
done

# Docker Compose plugin
if ! docker compose version >/dev/null 2>&1; then
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -fsSL "https://github.com/docker/compose/releases/download/v2.25.0/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

# Clone repo
APP_DIR=/opt/devsecjobs
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "https://github.com/neryaRez/DevSecJobs_D.Compose-version.git" "$APP_DIR"
fi

cd "$APP_DIR/Devops"

# ECR login (EC2 role)
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin \
    "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Helpers: IMDSv2 + SSM retry
get_imdsv2_token() {
  curl -sX PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" || true
}

get_public_ip() {
  local token
  token="$(get_imdsv2_token)"
  if [ -n "$token" ]; then
    curl -sH "X-aws-ec2-metadata-token: $token" \
      "http://169.254.169.254/latest/meta-data/public-ipv4" || true
  else
    curl -s "http://169.254.169.254/latest/meta-data/public-ipv4" || true
  fi
}

ssm_get() {
  local name="$1"
  local decrypt="$2"
  local tries=30
  local i=1
  local val=""

  while [ $i -le $tries ]; do
    if [ "$decrypt" = "with" ]; then
      if val="$(aws ssm get-parameter --with-decryption --name "$name" --query "Parameter.Value" --output text --region "$AWS_REGION" 2>/dev/null)"; then
        echo "$val"; return 0
      fi
    else
      if val="$(aws ssm get-parameter --name "$name" --query "Parameter.Value" --output text --region "$AWS_REGION" 2>/dev/null)"; then
        echo "$val"; return 0
      fi
    fi

    echo "SSM not ready / param missing: $name (try $i/$tries). Sleeping 10s..."
    sleep 10
    i=$((i+1))
  done

  echo "ERROR: Failed to read SSM parameter: $name"
  return 1
}

# Build .env from SSM
echo "Creating .env from SSM Parameter Store..."

# ---- DON'T LEAK SECRETS TO LOGS ----
set +x

MYSQL_DATABASE="$(ssm_get "/$PROJECT_NAME/MYSQL_DATABASE" "without")"
MYSQL_USER="$(ssm_get "/$PROJECT_NAME/MYSQL_USER" "without")"
MYSQL_PASSWORD="$(ssm_get "/$PROJECT_NAME/MYSQL_PASSWORD" "with")"
MYSQL_ROOT_PASSWORD="$(ssm_get "/$PROJECT_NAME/MYSQL_ROOT_PASSWORD" "with")"

JWT_PARAM="/$PROJECT_NAME/JWT_SECRET_KEY"

# Use the retry helper for JWT too (more consistent)
JWT_SECRET_KEY="$(ssm_get "$JWT_PARAM" "with")"

# If dummy/missing -> generate, store to SSM, and verify immediately
if [ -z "$JWT_SECRET_KEY" ] || [ "$JWT_SECRET_KEY" = "DUMMY_JWT_SECRET" ]; then
  echo "JWT secret is missing/dummy -> generating and storing in SSM..."
  JWT_SECRET_KEY="$(openssl rand -hex 32)"

  aws ssm put-parameter \
    --name "$JWT_PARAM" \
    --type "SecureString" \
    --value "$JWT_SECRET_KEY" \
    --overwrite \
    --region "$AWS_REGION"

  VERIFY="$(aws ssm get-parameter --with-decryption --name "$JWT_PARAM" \
  --query "Parameter.Value" --output text --region "$AWS_REGION")"

  if [ -z "$VERIFY" ] || [ "$VERIFY" = "DUMMY_JWT_SECRET" ]; then
    echo "ERROR: JWT secret was not updated in SSM"
    exit 1
  fi

  JWT_SECRET_KEY="$VERIFY"
fi

echo "JWT secret length: ${#JWT_SECRET_KEY}"

EC2_PUBLIC_IP="$(get_public_ip)"
CORS_ORIGINS="http://$EC2_PUBLIC_IP"

# Create .env WITHOUT printing values
cat > .env <<EOF
AWS_REGION=$AWS_REGION
ACCOUNT_ID=$ACCOUNT_ID
APP_TAG=latest

MYSQL_DATABASE=$MYSQL_DATABASE
MYSQL_USER=$MYSQL_USER
MYSQL_PASSWORD=$MYSQL_PASSWORD
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD

JWT_SECRET_KEY=$JWT_SECRET_KEY
CORS_ORIGINS=$CORS_ORIGINS
EOF

chmod 600 .env
echo ".env created."

# Turn xtrace back on for non-secret parts
set -x
# ---- END SECRET SECTION ----

echo "Waiting for images in ECR..."

while true; do
  if docker compose pull; then
    docker compose up -d --remove-orphans
    echo "DevSecJobs stack is running"
    break
  else
    echo "Images not available yet. Sleeping for 300 seconds..."
    sleep 300
  fi
done

echo "=== Bootstrap finished ==="
