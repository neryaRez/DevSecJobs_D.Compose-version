data "aws_iam_policy_document" "devsecjobs-assume-role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "devsecjobs-role" {
  name               = "${var.project_name}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.devsecjobs-assume-role.json
  tags = {
    Name = "${var.project_name}-ec2-role"
  }
}

resource "aws_iam_role_policy_attachment" "devsecjobs-ecr-attachment" {
  role       = aws_iam_role.devsecjobs-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}
resource "aws_iam_role_policy_attachment" "devsecjobs-ssm-attachment" {
  role       = aws_iam_role.devsecjobs-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"

}

data "aws_iam_policy_document" "devsecjobs_param_read" {
  statement {
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath"
    ]
    resources = [
      "arn:aws:ssm:${var.aws_region}:${var.account_id}:parameter/${var.project_name}/*"
    ]
  }
}

resource "aws_iam_role_policy" "devsecjobs_param_read" {
  name   = "${var.project_name}-param-read"
  role   = aws_iam_role.devsecjobs-role.id
  policy = data.aws_iam_policy_document.devsecjobs_param_read.json
}
