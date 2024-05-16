import json
from datetime import datetime
from django.core.paginator import Paginator
from collections import defaultdict

from common.celery import monitored_shared_task
from notifications.slack import upload_content

from .metrics import HarvAssetMonitor
from .models import HarvesterAsset
from .serializers import HarvesterAssetReportSerializer


@monitored_shared_task
def extract_assets(report_id):
    HarvesterAssetReportSerializer.extract_report(report_id)


def compile_asset_report():
    report = defaultdict(lambda: defaultdict(list))
    assets = HarvesterAsset.objects.all()
    for asset in assets:
        if asset.harvester is None:
            report["unused"][asset.asset.name].append(
                {
                    "serial number": asset.serial_number,
                    "index": asset.index,
                    "rev": asset.version or "",
                }
            )
            continue
        report[f"Harvester {asset.harvester.harv_id}"][asset.asset.name].append(
            {
                "serial number": asset.serial_number,
                "index": asset.index,
                "rev": asset.version or "",
            }
        )

    # defaultdict is not serializable
    for k, v in report.items():
        report[k] = dict(v)
    return dict(report)


@monitored_shared_task
def send_asset_manifest(channel="hds-test"):
    report = compile_asset_report()
    r = upload_content(
        filename=f"asset_manifest_{datetime.now()}.txt",
        title="Asset Manifest",
        content=json.dumps(report, indent=4),
        channel=channel,
    )
    return r


@monitored_shared_task
def clear_asset_gauges():
    HarvAssetMonitor.clear()


@monitored_shared_task
def refresh_asset_gauges(clear=False):
    """Loop through all assets and set their gauges.

    Args:
        clear (bool, optional): Flag to remove all gauges prior to update. Defaults to False.
    """
    if clear:
        clear_asset_gauges()

    assets = HarvesterAsset.objects.all()
    paginator = Paginator(assets, 50)
    for page in range(1, paginator.num_pages + 1):
        for asset in paginator.page(page).object_list:
            HarvAssetMonitor.set_gauges(asset)
