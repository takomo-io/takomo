# Takomo - Integration tests for organization functionalities #2

Tests organization functionalities against a single master account whose account id must be found from environment variable `TKM_ORG_3_MASTER_ACCOUNT_ID`.

## Running Locally

To run tests locally you must have `.env` file in this directory with following content:

    AWS_ACCESS_KEY_ID = <aws access key id>
    AWS_SECRET_ACCESS_KEY = <aws secret access key>
    TKM_ORG_3_MASTER_ACCOUNT_ID = <AWS account id of the master account>
    TKM_ORG_3_ACCOUNT_01_ID = <AWS account id of account 01>
Run tests:

    yarn integration-test
