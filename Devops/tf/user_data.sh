#!/bin/bash
set -euo pipefail

LOG=/var/log/devsecjobs-bootstrap.log
exec > >(tee -a "$LOG") 2>&1

# xtrace ON for general debug (we'll turn it OFF around secrets)
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

# -------------------------
# Base packages
# -------------------------
apt-get update -y
apt-get install -y \
  ca-certificates curl gnupg lsb-release git unzip openssl \
  apt-transport-https software-properties-common

# -------------------------
# AWS CLI v2
# -------------------------
if ! command -v aws >/dev/null 2>&1; then
  curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
  unzip -q /tmp/awscliv2.zip -d /tmp
  /tmp/aws/install || true
fi
aws --version

# -------------------------
# Docker + Compose (stable install via Docker apt repo)
# -------------------------
if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  UBUNTU_CODENAME="$(. /etc/os-release && echo "$VERSION_CODENAME")"

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $UBUNTU_CODENAME stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

systemctl enable --now docker
usermod -aG docker ubuntu || true

# Wait for docker daemon
until docker info >/dev/null 2>&1; do
  echo "Waiting for Docker daemon..."
  sleep 2
done

docker --version
docker compose version

# -------------------------
# Clone repo
# -------------------------
APP_DIR=/opt/devsecjobs
REPO_URL="https://github.com/neryaRez/DevSecJobs_D.Compose-version.git"

if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
else
  # optional: keep it updated on reboots (safe)
  git -C "$APP_DIR" pull || true
fi

cd "$APP_DIR/Devops"   # docker-compose.yml is here

# -------------------------
# ECR login (EC2 IAM role)
# -------------------------
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin \
    "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# -------------------------
# Helpers: IMDSv2 + SSM retry
# -------------------------
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

# -------------------------
# Build .env from SSM
# -------------------------
echo "Creating .env from SSM Parameter Store..."

# ---- DON'T LEAK SECRETS TO LOGS ----
set +x

MYSQL_DATABASE="$(ssm_get "/$PROJECT_NAME/MYSQL_DATABASE" "without")"
MYSQL_USER="$(ssm_get "/$PROJECT_NAME/MYSQL_USER" "without")"
MYSQL_PASSWORD="$(ssm_get "/$PROJECT_NAME/MYSQL_PASSWORD" "with")"
MYSQL_ROOT_PASSWORD="$(ssm_get "/$PROJECT_NAME/MYSQL_ROOT_PASSWORD" "with")"

JWT_PARAM="/$PROJECT_NAME/JWT_SECRET_KEY"

# Read current JWT (if missing -> empty)
JWT_SECRET_KEY="$(aws ssm get-parameter \
  --with-decryption \
  --name "$JWT_PARAM" \
  --query "Parameter.Value" \
  --output text \
  --region "$AWS_REGION" 2>/dev/null || true)"

if [ -z "$JWT_SECRET_KEY" ]; then
  echo "JWT secret missing -> generating and storing in SSM..."
  JWT_SECRET_KEY="$(openssl rand -hex 32)"
  aws ssm put-parameter \
    --name "$JWT_PARAM" \
    --type "SecureString" \
    --value "$JWT_SECRET_KEY" \
    --region "$AWS_REGION"

elif [ "$JWT_SECRET_KEY" = "DUMMY_JWT_SECRET" ]; then
  echo "JWT secret is DUMMY -> generating and overwriting in SSM..."
  JWT_SECRET_KEY="$(openssl rand -hex 32)"
  aws ssm put-parameter \
    --name "$JWT_PARAM" \
    --type "SecureString" \
    --value "$JWT_SECRET_KEY" \
    --overwrite \
    --region "$AWS_REGION"
else
  echo "JWT secret already set (non-dummy) -> leaving as-is."
fi

# Re-read to be 100% sure we use the final value
JWT_SECRET_KEY="$(aws ssm get-parameter \
  --with-decryption \
  --name "$JWT_PARAM" \
  --query "Parameter.Value" \
  --output text \
  --region "$AWS_REGION")"

EC2_PUBLIC_IP="$(get_public_ip)"
CORS_ORIGINS="http://$EC2_PUBLIC_IP"

# Create .env (do not print values)
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

# (Safe) log only lengths / non-secret info
echo ".env created."
echo "CORS_ORIGINS=$CORS_ORIGINS"
echo "JWT secret length: $(echo -n "$JWT_SECRET_KEY" | wc -c)"

# Turn xtrace back on for non-secret parts
set -x
# ---- END SECRET SECTION ----

# -------------------------
# Start the stack (retry until images exist)
# -------------------------
echo "Waiting for images in ECR and starting compose..."

# If your compose uses env_file: .env you're good. Otherwise it will still pick .env automatically.
while true; do
  if docker compose pull; then
    docker compose up -d --remove-orphans
    docker compose ps
    echo "DevSecJobs stack is running"
    break
  else
    echo "Images not available yet or ECR pull failed. Sleeping 60s..."
    sleep 60
  fi
done

echo "=== Bootstrap finished ==="
