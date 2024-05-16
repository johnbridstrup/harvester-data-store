import os

from common.async_metrics import ASYNC_ERROR_COUNTER
from collections.abc import Mapping
from enum import Enum
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError


TOKEN = os.environ.get("SLACK_TOKEN")


class Emojis(Enum):
    REDX = ":red_cross:"
    GREENCHECK = ":green_check_mark:"
    TRAY = ":outbox_tray:"
    HANDLE_CYCLE = ":recycle:"
    HANDLE_DISARM = ":large_yellow_circle:"
    UNHANDLED = ":red_circle:"
    UNKNOWN = ":question:"


class SlackError(Exception):
    # Unfortunately SlackApiErrors can't be serialized to JSON, to celery complains heavily
    # if an exception is ever raised (channel not found, for instance).
    pass


def post_to_slack(message, channel="hds-test", client=None):
    if TOKEN:
        if client is None:
            client = WebClient(token=TOKEN)
        try:
            if isinstance(message, Mapping):
                client.chat_postMessage(**message)
            else:
                client.chat_postMessage(text=message, channel=channel)
        except SlackApiError as e:
            ASYNC_ERROR_COUNTER.labels(
                "post_to_slack", "SlackApiError", e.response["error"]
            ).inc()
            raise SlackError(e.response["error"])
        return "Posted to slack"

    ASYNC_ERROR_COUNTER.labels("post_to_slack", "none", "no_token").inc()
    return "No slack token"


def upload_content(
    filename, title, content, channel="hds-test", msg="ASSET MANIFEST", client=None
):
    if TOKEN:
        if client is None:
            client = WebClient(token=TOKEN)
        try:
            file = client.files_upload(
                title=title,
                filename=filename,
                content=content,
            )
            file_url = file.get("file").get("permalink")
            msg = f"{msg}: {file_url}"
            post_to_slack(msg, channel, client=client)
        except SlackApiError as e:
            ASYNC_ERROR_COUNTER.labels(
                "upload_file", "SlackApiError", e.response["error"]
            ).inc()
            raise SlackError(e.response["error"])
        return "Posted to slack"

    ASYNC_ERROR_COUNTER.labels("upload_file", "none", "no_token").inc()
    return "No slack token"


def upload_file(filename, title, file, channel="hds-test", msg="", client=None):
    if TOKEN:
        if client is None:
            client = WebClient(token=TOKEN)
        try:
            file = client.files_upload(
                title=title,
                filename=filename,
                file=file,
            )
            file_url = file.get("file").get("permalink")
            msg = f"{msg}: {file_url}"
            post_to_slack(msg, channel, client=client)
        except SlackApiError as e:
            ASYNC_ERROR_COUNTER.labels(
                "upload_file", "SlackApiError", e.response["error"]
            ).inc()
            raise SlackError(e.response["error"])
        return "Posted to slack"

    ASYNC_ERROR_COUNTER.labels("upload_file", "none", "no_token").inc()
    return "No slack token"
