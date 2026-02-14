
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

data "aws_iam_policy_document" "github_actions_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:neryaRez/DevSecJobs_D.Compose-version:ref:refs/heads/main"]
    }

  }
}

resource "aws_iam_role" "github_actions_role" {
  name               = "${var.project_name}-github-actions-role"
  assume_role_policy = data.aws_iam_policy_document.github_actions_assume_role.json
}

data "aws_iam_policy_document" "github_ecr_push" {
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:CompleteLayerUpload",
      "ecr:GetDownloadUrlForLayer",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
      "ecr:DescribeRepositories",
      "ecr:ListImages"
    ]
    resources = [
      "arn:aws:ecr:${var.aws_region}:${var.account_id}:repository/${var.project_name}-frontend",
      "arn:aws:ecr:${var.aws_region}:${var.account_id}:repository/${var.project_name}-backend"
    ]
  }
}

resource "aws_iam_role_policy" "github_ecr_push" {
  name   = "${var.project_name}-github-ecr-push"
  role   = aws_iam_role.github_actions_role.id
  policy = data.aws_iam_policy_document.github_ecr_push.json
}

data "aws_iam_policy_document" "github_sg_temp_ssh" {
  statement {
    effect = "Allow"
    actions = [
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:RevokeSecurityGroupIngress"
    ]

    resources = [
      "arn:aws:ec2:${var.aws_region}:${var.account_id}:security-group/sg-0e8e89f30f3d24f87"
    ]
  }
  statement {
    effect = "Allow"
    actions = ["ec2:DescribeSecurityGroups"]
    resources = ["*"]

  }
}

resource "aws_iam_role_policy" "github_sg_temp_ssh" {
  name   = "${var.project_name}-github-temp-ssh"
  role   = aws_iam_role.github_actions_role.id
  policy = data.aws_iam_policy_document.github_sg_temp_ssh.json
}


output "github_actions_role_arn" {
  value = aws_iam_role.github_actions_role.arn
}
