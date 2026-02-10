variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}
variable "project_name" {
  description = "The name of the project"
  type        = string
  default     = "my-devsecjobs-project"
}
variable "instance_type" {
  description = "The type of EC2 instance to use for the Jenkins server"
  type        = string
  default     = "t2.micro"
}
variable "key_pair_name" {
  description = "The name of the EC2 key pair to use for SSH access to the Jenkins server"
  type        = string
}
variable "admin_cidr" {
  description = "CIDR block for admin access (SSH)"
  type        = string
}
variable "account_id" {
  description = "AWS Account ID (for ECR login)"
  type        = string
}

variable "mysql_database" { type = string }
variable "mysql_user"     { type = string }

variable "mysql_password" {
  type      = string
  sensitive = true
}
variable "mysql_root_password" {
  type      = string
  sensitive = true
}
variable "jwt_secret_key" {
  type      = string
  sensitive = true
}

