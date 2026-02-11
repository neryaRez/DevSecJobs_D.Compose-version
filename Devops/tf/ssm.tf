resource "aws_ssm_parameter" "mysql_database" {
  name  = "/${var.project_name}/MYSQL_DATABASE"
  type  = "String"
  value = var.mysql_database
}

resource "aws_ssm_parameter" "mysql_user" {
  name  = "/${var.project_name}/MYSQL_USER"
  type  = "String"
  value = var.mysql_user
}

resource "aws_ssm_parameter" "mysql_password" {
  name  = "/${var.project_name}/MYSQL_PASSWORD"
  type  = "SecureString"
  value = var.mysql_password
}

resource "aws_ssm_parameter" "mysql_root_password" {
  name  = "/${var.project_name}/MYSQL_ROOT_PASSWORD"
  type  = "SecureString"
  value = var.mysql_root_password
}

resource "aws_ssm_parameter" "jwt_secret_key" {
  name  = "/${var.project_name}/JWT_SECRET_KEY"
  type  = "SecureString"
  value = "DUMMY_JWT_SECRET"

  lifecycle {
    ignore_changes = [value]
  }
}

