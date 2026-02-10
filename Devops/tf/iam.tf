data "aws_iam_policy_document" "devsecjobs-assume-role" {
    statement {
        effect = "Allow"
        principals {
            type = "Service"
            identifiers = ["ec2.amazonaws.com"]
        }
        actions = ["sts:AssumeRole"]
    }
}

resource "aws_iam_role" "devsecjobs-role" {
    name = "${var.project_name}-ec2-role"
    assume_role_policy = data.aws_iam_policy_document.devsecjobs-assume-role.json
    tags = {
        Name = "${var.project_name}-ec2-role"
    }
}

resource "aws_iam_role_policy_attachment" "devsecjobs-attachment" {
    role = aws_iam_role.devsecjobs-role.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonEC2FullAccess"
}