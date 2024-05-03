import json, io, tempfile
import matplotlib.pyplot as plt
from django.contrib.auth.models import User
from django.utils.timezone import datetime, timedelta
from structlog import get_logger

from common.celery import monitored_shared_task
from notifications.slack import upload_file, upload_content, post_to_slack
from .insights import create_traceback_groups, create_bar_chart
from .models import AFTException, AFTExceptionCode, AFTExceptionCodeManifest
from .serializers import AFTExceptionCodeSerializer
from .vars import MAX_NUM_TRACEBACKS

logger = get_logger(__name__)

@monitored_shared_task
def update_exception_codes(manifest_id, user_id):
    manifest_inst = AFTExceptionCodeManifest.objects.get(id=manifest_id)
    user = User.objects.get(id=user_id)

    for data in manifest_inst.manifest:
        try:
            code = AFTExceptionCode.objects.get(code=data["code"])
            ser_data = {
                "modifiedBy": user.id,
                "lastModified": datetime.now(),
                "manifest": manifest_id,
                **data,
            }
            serializer = AFTExceptionCodeSerializer(code, data=ser_data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
            code = AFTExceptionCode.objects.get(code=data["code"])
        except AFTExceptionCode.DoesNotExist:
            ser_data = {
                "created": datetime.now(),
                "manifest": manifest_id,
                **data
            }
            serializer = AFTExceptionCodeSerializer(data=ser_data)
            if serializer.is_valid(raise_exception=True):
                serializer.save(creator=user)

@monitored_shared_task
def traceback_breakdown_task(subtitle, lookback_days=7, code=0, channel="hds-test", emulator=False, **params):
    end_dt = datetime.now()
    start_dt = end_dt - timedelta(days=int(lookback_days))

    try:
        excs = AFTException.objects.filter(
            timestamp__gte=start_dt,
            timestamp__lte=end_dt,
            code__code=code,
            report__harvester__is_emulator=emulator,
            **params,
        ).values("id", "timestamp", "traceback", "code__code", "report__report__data__sysmon_report__emu_info__agent_label")
        if len(excs) == 0:
            return post_to_slack(f"No exceptions found for the given code ({code}) and lookback period.", channel)
        if len(excs) > MAX_NUM_TRACEBACKS:
            return post_to_slack("Too many exceptions to process, aborting.", channel)
        groups = create_traceback_groups(excs)
        groups["params"] = {
            **params,
            "code": code,
        }
        fig = create_bar_chart(groups)
        buf = io.BytesIO()
        fig.savefig(buf, format="png")
        tmpf = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        with open(tmpf.name, "wb") as f:
            f.write(buf.getvalue())
        r1 = upload_file(
            filename=f"tb_breakdown_{code}_{datetime.now()}.png",
            title=f"Traceback Breakdown",
            file=tmpf.name,
            channel=channel,
            msg=f"Traceback Breakdown Chart\n\t{subtitle}\n\tCode {code}\n\t{start_dt} - {end_dt}\n",
        )
        r2 = upload_content(
            filename=f"tb_breakdown_{code}_{datetime.now()}.json",
            title=f"Traceback Breakdown JSON",
            content=json.dumps(groups, indent=4),
            channel=channel,
            msg=f"Traceback Breakdown JSON\n\t{subtitle}\n\tCode {code}\n\t{start_dt} - {end_dt}\n",
        )
        return [r1, r2]
    except Exception as e:
        logger.error(f"Error in traceback_breakdown_task: {e}")
        raise