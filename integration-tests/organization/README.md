# Takomo - Integration tests for organization functionaliies

Tests organization functionalities against a single master account whose account id must be found from environment variable `TKM_ORG_B_MASTER_ACCOUNT_ID`.

## Running Locally

To run tests locally you must have `.env` file in this directory with following content:

    AWS_ACCESS_KEY_ID = <aws access key id>
    AWS_SECRET_ACCESS_KEY = <aws secret access key>
    TKM_ORG_B_MASTER_ACCOUNT_ID = <AWS account id of the master account>

Run tests:

    yarn integration-test
