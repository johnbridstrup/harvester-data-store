from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from common.async_metrics import ASYNC_ERROR_COUNTER
import os


TOKEN = os.environ.get("SLACK_TOKEN")

def post_to_slack(message, channel='hds-test'):
    if TOKEN:
        client = WebClient(token=TOKEN)
        try:
            client.chat_postMessage(text=message, channel=channel)
        except SlackApiError as e:
            ASYNC_ERROR_COUNTER.labels("post_to_slack", "SlackApiError", e.response['error']).inc()
            raise e
        return "Posted to slack"
    
    ASYNC_ERROR_COUNTER.labels("post_to_slack", "none", "no_token").inc()
    return "No slack token"
