locals {
  repos = [
    "${var.project_name}-frontend",
    "${var.project_name}-backend",
  ]
}

resource "aws_ecr_repository" "repositories" {
  for_each = toset(local.repos)

  name                 = each.value
  image_tag_mutability = "IMMUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
  tags = {
    Name = each.value
  }
}

resource "aws_ecr_lifecycle_policy" "lifecycle_policies" {
  for_each   = aws_ecr_repository.repositories
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 15 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 15
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

output "ecr_repo_urls" {
  value = { for repo in aws_ecr_repository.repositories : repo.name => repo.repository_url }
}