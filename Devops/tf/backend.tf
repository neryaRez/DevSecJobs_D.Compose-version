terraform {
  backend "s3" {
    bucket         = "PASTE_BUCKET_NAME_FROM_BOOTSTRAP_OUTPUT"
    key            = "devsecjobs/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
