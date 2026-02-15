# DevSecJobs --- Cloud-Native DevOps Recruitment Platform

DevSecJobs is a production-style full-stack recruitment platform
designed specifically for **DevOps, Cloud, and Security professionals**.

This project demonstrates real-world DevOps practices including secure
CI/CD, Infrastructure as Code, dynamic secret provisioning, container
orchestration, and cloud-native deployment.

------------------------------------------------------------------------

## 🌍 Live Demo

**Public Deployment:**\
http://3.85.124.172/

Deployed on AWS EC2 using Docker Compose with secure CI/CD automation.

------------------------------------------------------------------------

## 🧠 Platform Overview

DevSecJobs is a role-based recruitment system.

### 👤 Candidate Area

-   Build and manage professional profile\
-   Browse job feed\
-   Apply to positions\
-   Track match score and application status

### 🧑‍💼 Manager Area

-   Create and manage job postings\
-   Review job applications\
-   Browse candidate pool\
-   Evaluate match scores

------------------------------------------------------------------------

## 🏗 Tech Stack

### Frontend

-   React (Vite)
-   TailwindCSS
-   JWT-based authentication
-   Role-based routing

### Backend

-   Flask (Python)
-   REST API architecture
-   JWT authentication & authorization
-   MySQL integration

### Database

-   MySQL (containerized)

### Containerization

-   Docker
-   Docker Compose

### Cloud & DevOps

-   AWS EC2
-   Amazon ECR
-   AWS SSM Parameter Store
-   GitHub Actions (CI/CD)
-   OIDC Federation (No static AWS keys)
-   Terraform (Infrastructure as Code)
-   Remote Terraform backend (S3 + state locking)

------------------------------------------------------------------------

## 🔐 Security Architecture

### OIDC Instead of Static AWS Credentials

GitHub Actions assumes an IAM role via OIDC.\
No AWS access keys are stored in the repository or GitHub Secrets.

### Dynamic Secret Provisioning

Secrets such as: - JWT secret - Database credentials - Environment
configuration

are stored in AWS SSM Parameter Store and dynamically injected at
runtime via EC2 user-data.

No hardcoded secrets exist in the repository.

### Temporary CI/CD SSH Access

During deployment: 1. GitHub runner IP is detected 2. Temporarily
allowed in the EC2 Security Group 3. Revoked after deployment

------------------------------------------------------------------------

## 🔁 CI/CD Workflow

### Build & Push

-   Builds frontend and backend Docker images
-   Tags images with commit SHA + latest
-   Pushes to Amazon ECR

### Auto Update on Push

-   Detects which directory changed
-   Builds only changed service
-   Pushes new image
-   SSH into EC2
-   Pulls updated container
-   Recreates service
-   Revokes temporary SSH rule

All deployments are traceable via commit SHA tagging.

------------------------------------------------------------------------

## ☁ Infrastructure Design

Infrastructure is fully parameterized via Terraform.

### Key Principles

-   No hardcoded AWS account values
-   Environment-agnostic deployment
-   Reusable infrastructure modules
-   Remote Terraform state for safety

------------------------------------------------------------------------

## 🖥 Architecture Flow

    Developer Push
          ↓
    GitHub Actions
          ↓
    OIDC → Assume IAM Role
          ↓
    Build Docker Images
          ↓
    Push to Amazon ECR
          ↓
    SSH to EC2
          ↓
    docker compose pull
          ↓
    docker compose up -d

------------------------------------------------------------------------

## 🎨 Application Screenshots

### Landing Page

![Landing Page](images/landing.png)

### Candidate Dashboard

![Candidate Area](images/candidate.png)

### Manager Dashboard

![Manager Area](images/manager.png)

------------------------------------------------------------------------

## 📌 Design Decisions

-   Docker Compose chosen for simplicity and clarity
-   OIDC for secure GitHub integration
-   SSM for dynamic secret handling
-   Remote Terraform backend for state management
-   Parameterized infrastructure for portability
-   SHA-based image tagging for reproducible deployments

------------------------------------------------------------------------

## 🚀 Future Enhancements

-   Custom domain + HTTPS
-   Application Load Balancer
-   Auto Scaling Group
-   Blue/Green deployment strategy
-   Centralized logging & monitoring

------------------------------------------------------------------------

## 📄 Professional Summary (For CV)

Designed and implemented a secure cloud-native recruitment platform
using Terraform, AWS, Docker, and GitHub Actions.\
Built a full CI/CD pipeline using OIDC federation (no static
credentials), dynamic secret provisioning via AWS SSM, automated EC2
bootstrap, and Docker Compose deployment with SHA-based image
versioning.

------------------------------------------------------------------------

## 👨‍💻 Author

DevSecJobs was built as a DevOps portfolio project to demonstrate
production-level infrastructure thinking, secure automation, and cloud
deployment best practices.