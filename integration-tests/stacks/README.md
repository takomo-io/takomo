# Takomo - Integration tests for stacks

Tests stacks functionalities against multiple accounts.

## Running Locally

To run tests locally you must have `.env` file in this directory with following content:

    AWS_ACCESS_KEY_ID = <aws access key id>
    AWS_SECRET_ACCESS_KEY = <aws secret access key>

    TKM_ORG_A_ACCOUNT_1_ID = "<account id of account 1>"
    TKM_ORG_A_ACCOUNT_2_ID = "<account id of account 2>"
    TKM_ORG_A_ACCOUNT_3_ID = "<account id of account 3>"

Run tests:

    yarn integration-test
