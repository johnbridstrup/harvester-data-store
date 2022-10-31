from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from common.async_metrics import ASYNC_ERROR_COUNTER
import os
from collections.abc import Mapping


TOKEN = os.environ.get("SLACK_TOKEN")

class SlackError(Exception):
    # Unfortunately SlackApiErrors can't be serialized to JSON, to celery complains heavily
    # if an exception is ever raised (channel not found, for instance).
    pass

def post_to_slack(message, channel='hds-test'):
    if TOKEN:
        client = WebClient(token=TOKEN)
        try:
            if isinstance(message, Mapping):
                client.chat_postMessage(**message)
            else:
                client.chat_postMessage(text=message, channel=channel)
        except SlackApiError as e:
            ASYNC_ERROR_COUNTER.labels("post_to_slack", "SlackApiError", e.response['error']).inc()
            raise SlackError(e.response['error'])
        return "Posted to slack"
    
    ASYNC_ERROR_COUNTER.labels("post_to_slack", "none", "no_token").inc()
    return "No slack token"
