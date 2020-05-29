# Takomo

[![NPM Version](https://img.shields.io/npm/v/npm.svg?style=flat)]()
[![NPM License](https://img.shields.io/npm/l/all-contributors.svg?style=flat)](https://github.com/takomo-io/takomo/blob/master/LICENSE)
[![Build](/github/workflow/status/takomo-io/takomo/Default/master?style=flat)]


Takomo makes it easy to organize, parameterize and deploy your CloudFormation stacks across multiple regions and accounts. In addition to stacks, you can also manage accounts, organizational units and service control policies that belong to your AWS organization.

# Quick Start

Let's see how to create a simple CloudFormation stack using Takomo.

## Installation

Install Takomo globally:

    npm i -g takomo

Verify installation:

    tkm --version

## AWS Credentials

You need to have valid AWS credentials configured. Create a profile named `takomo-example` in your `~/.aws/credentials` file:

    [takomo-example]
    aws_access_key_id=XXXXXXXXXXXXXXXXXXXX
    aws_secret_access_key=YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY

## Stack Configuration

Our stack contains a VPC whose CIDR range can be parameterized. First, we need to create a `stacks` directory that will host all stack configurations. Create the directory and add there a file named `vpc.yml` with the following contents:

    regions: eu-west-1
    parameters:
      CidrBlock: 10.0.0.0/24

## Stack Template

Next, we need to provide a CloudFormation template for our stack. Create `templates` directory next to the `stacks` directory, and add there a file named `vpc.yml` with the following contents:

    Description: My VPC
    Parameters:
      CidrBlock:
        Type: String
        Description: VPC CIDR block
    Resources:
      VPC:
        Type: AWS::EC2::VPC
        Properties:
          CidrBlock: !Ref CidrBlock

## Stack Deployment

Alright, we are ready to deploy our stack. Change to the project root directory and run:

    tkm stacks deploy --profile takomo-example

You will be prompted if you want to continue the deployment. You also need to review and approve the changes. If you answer yes to both questions, then the deploy will proceed, and given your AWS credentials had all the needed IAM permissions, it should also succeed.

## Clean Up

You can delete the stack with command:

    tkm stacks undeploy --profile takomo-example

## Next Steps

Take a look at https://takomo.io for more documentation.
