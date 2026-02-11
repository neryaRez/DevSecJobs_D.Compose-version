data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"]
}

locals {
  user_data = templatefile("${path.module}/user_data.sh", {
    AWS_REGION   = var.aws_region
    ACCOUNT_ID   = var.account_id
    PROJECT_NAME = var.project_name
  })

}


resource "aws_iam_instance_profile" "devsecjobs_profile" {
  name = "${var.project_name}-instance-profile"
  role = aws_iam_role.devsecjobs-role.name
}
resource "aws_instance" "devsecjobs-ec2" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.public_devsecjobs.id
  vpc_security_group_ids = [aws_security_group.devsecjobs-sg.id]
  iam_instance_profile   = aws_iam_instance_profile.devsecjobs_profile.name
  depends_on = [aws_ecr_repository.repositories,
    aws_ssm_parameter.mysql_database,
    aws_ssm_parameter.mysql_user,
    aws_ssm_parameter.mysql_password,
    aws_ssm_parameter.mysql_root_password,
  aws_ssm_parameter.jwt_secret_key]
  user_data = local.user_data
  tags = {
    Name = "${var.project_name}-server"
  }
  metadata_options {
    http_tokens = "required"
  }

}