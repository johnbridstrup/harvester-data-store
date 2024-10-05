from io import BytesIO
from PIL import Image, ExifTags
from common.celery import monitored_shared_task
from common.fileloader import get_client
from common.S3Event import S3EventObject
from notifications.slack import post_to_slack, upload_file
from .models import ChatbotLog
import tempfile
import os
import json
import structlog


logger = structlog.get_logger(__name__)


def _fmt_msg(message, log: ChatbotLog):
    harv_id = log.harvester.harv_id
    return f"Harvester {harv_id}: {message}"


def _send_img_to_slack(image_data, log: ChatbotLog):
    img = Image.open(BytesIO(image_data))

    metadata = {}
    if img.format == "PNG":
        # For PNG files, metadata is stored in text chunks
        metadata = {
            k: v
            for k, v in img.info.items()
            if k not in ["interlace", "gamma", "dpi", "transparency", "aspect"]
        }
    elif img.format == "JPEG":
        # For JPEG files, metadata is stored in EXIF
        if hasattr(img, "_getexif"):
            exif = img._getexif()
            if exif:
                image_description = exif.get(ExifTags.Base.ImageDescription)
                if image_description:
                    try:
                        metadata = json.loads(image_description)
                    except json.JSONDecodeError:
                        metadata = {"message": image_description}

    message = _fmt_msg(metadata.get("message", "No Message"), log)
    channels = metadata.get("channels", ["hds-test"])
    log.channels = channels
    log.save()
    # Create a temporary file
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_file:
        img.save(temp_file, format="PNG")
        temp_file_path = temp_file.name

    success = True
    for channel in channels:
        try:
            with open(temp_file_path, "rb") as file:
                upload_file(
                    filename="image.png",
                    title="Uploaded Image",
                    file=file,
                    channel=channel,
                    msg=message,
                )
        except Exception as e:
            logger.error(
                f"Failed to upload image to Slack",
                channel=channel,
                message=message,
                error=str(e),
            )
            success = False

    # Clean up the temporary file
    os.unlink(temp_file_path)

    if success:
        log.processed = True
        log.save()
    return success


def _send_msg_to_slack(message_json, log: ChatbotLog):
    channels = message_json.get("channels", ["hds-test"])
    message = _fmt_msg(message_json.get("message", "No Message"), log)
    log.channels = channels
    log.save()

    success = True
    for channel in channels:
        try:
            post_to_slack(message, channel)
        except Exception as e:
            logger.error(
                "Failed to send message to Slack",
                channel=channel,
                message=message,
                error=str(e),
            )
            success = False

    if success:
        log.processed = True
        log.save()
    return success


@monitored_shared_task
def send_to_slack(log_id: int):
    log = ChatbotLog.objects.get(id=log_id)
    s3_event = S3EventObject(log.s3event)
    loader = get_client()
    if log.type == ChatbotLog.ChatbotLogType.IMAGE:
        image_data = loader.download_raw_from_event(s3_event.event)
        success = _send_img_to_slack(image_data, log)
    elif log.type == ChatbotLog.ChatbotLogType.MESSAGE:
        message = loader.download_json_from_event(s3_event.event)
        if (
            message.get("type", ChatbotLog.TextMessageType.INFO)
            == ChatbotLog.TextMessageType.INFO
        ):
            log.subtype = ChatbotLog.TextMessageType.INFO
            log.save()
            success = _send_msg_to_slack(message, log)
        elif (
            message.get("type", ChatbotLog.TextMessageType.INFO)
            == ChatbotLog.TextMessageType.WARNING
        ):
            log.subtype = ChatbotLog.TextMessageType.WARNING
            log.save()
            success = _send_msg_to_slack(message, log)
        else:
            raise ValueError(f"Invalid message type: {message.get('type')}")
    else:
        raise ValueError(f"Invalid log type: {log.type}")
    if success:
        log.processed = True
        log.save()
        return "Success"
    return "Failed"
