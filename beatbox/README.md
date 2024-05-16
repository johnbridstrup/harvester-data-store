# Beatbox Continuous Integration

We have implemented [beatbox](https://github.com/AdvancedFarm/beatbox) to run continuous integration of HDS.
These tests are performed by a separate server and their purpose is to continuously test HDs functionality
as well as our full data pipeline by making requests and uploading files to our production resources. If any
of these tests fail, an html report is sent to slack describing the failures.

Beatbox functionality is implemented separately. ALL that needs to be implemented in this project are tests and
any utils the tests require, which are ultimately copied into the beatbox container.


## Writing new tests
Writing new tests is as simple writing any other `pytest` unittest. Use the client (from `beatbox.test_utils.Client`)
to make requests against various endpoints in HDS and `assert` that responses are what is expected. The beatbox user
has read permission for all resources, and should not create any resources directly. Instead, it should upload files
to S3, mimicking the true pipeline, delay as necessary and then check that the final resources are created. It should
always delete these resources afterward and failure to delete should result in test failure.

For operations other than `GET`, the beatbox role (`hds.roles.RoleChoices.BEATBOX`) should be added to the relevant
views `view_permissions_update` object for the action in question.

## Beatbox container environment
Beatbox relies on three main environment variables added in this project (see [beatbox](https://github.com/AdvancedFarm/beatbox)
documentation for implementation details of builtin variables)
| Var | Description| builtin/custom |
| --- | ---------- | -------------- |
| TEST_HOSTNAME | The base URL of the HDS server to test | custom |
| TEST_USERNAME | The beatbox user's username | custom |
| TEST_PASSWORD | The beatbox user's password | custom |
| SLACK_TOKEN | Token for sending failure reports to slack | builtin |
| SLACK_CHANNEL | Channel to send reports to | builtin |
| SERVER_ADDRESS | Address at which beatbox is hosted | builtin |

These are supplied via terraform for cloud hosted HDS, or in `docker-compose.beatbox.yml` if running locally with docker
compose. Do not version control any sensitive information.
