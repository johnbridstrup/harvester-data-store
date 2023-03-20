import json
from datetime import datetime
from collections import defaultdict

from common.celery import monitored_shared_task
from notifications.slack import upload_file

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
                }
            )
            continue
        report[f"Harvester {asset.harvester.harv_id}"][asset.asset.name].append(
            {
                "serial number": asset.serial_number,
                "index": asset.index,
            }
        )
    
    # defaultdict is not serializable
    for k, v in report.items():
        report[k] = dict(v)
    return dict(report)

@monitored_shared_task
def send_asset_manifest():
    report = compile_asset_report()
    r = upload_file(
        filename=f"asset_manifest_{datetime.now()}.txt",
        title="Asset Manifest",
        content=json.dumps(report, indent=4)
    )
    return r
