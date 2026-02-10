resource "aws_vpc" "my-vpc" {
    cidr_block = "10.0.0.0/16"
    enable_dns_hostnames = true
    enable_dns_support = true
    tags = {
        Name = "${var.project_name}-vpc"
    }
}

resource "aws_subnet" "public_devsecjobs" {
    vpc_id = aws_vpc.my-vpc.id
    cidr_block = "10.0.1.0/24"
    map_public_ip_on_launch = true
    availability_zone = "us-east-1a"
    tags = {
        Name = "${var.project_name}-public-subnet"
    }
}

resource "aws_internet_gateway" "my-gateway" {
    vpc_id = aws_vpc.my-vpc.id
    tags = {
        Name = "${var.project_name}-internet-gateway"
    }
}

resource "aws_route_table" "public_devsecjobs" {
    vpc_id = aws_vpc.my-vpc.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.my-gateway.id
    }
    tags = {
        Name = "${var.project_name}-public-route-table"
    }
}

resource "aws_route_table_association" "public_devsecjobs" {
    subnet_id = aws_subnet.public_devsecjobs.id
    route_table_id = aws_route_table.public_devsecjobs.id
}

data "aws_availability_zones" "available" {}