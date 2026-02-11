variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "bucket_prefix" {
  type    = string
  default = "devsecjobs-tfstate"
}

variable "dynamodb_table_name" {
  type    = string
  default = "terraform-locks"
}
