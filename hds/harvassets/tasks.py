import json
import tempfile
from datetime import datetime
from collections import defaultdict
from celery import shared_task
from django.contrib.auth.models import User
from django.utils import timezone

from harvester.models import Harvester
from notifications.slack import upload_file

from .models import HarvesterAssetReport, HarvesterAssetType, HarvesterAsset
from .serializers import HarvesterAssetSerializer


@shared_task
def extract_assets(report_id, user_id, harv_pk):
    report_obj = HarvesterAssetReport.objects.get(id=report_id)
    user = User.objects.get(id=user_id)
    harv = Harvester.objects.get(id=harv_pk)
    asset_list = report_obj.report["data"]
    
    # First, clear the harvesters existing assets
    try:
        exist_assests = harv.assets.all()
        for exist_asset_obj in exist_assests:
            exist_asset_obj.harvester = None
            exist_asset_obj.save()
    except AttributeError:
        pass

    for asset in asset_list:
        asset_type = asset.pop("asset")
        serial_number = asset.pop("asset-tag")
        asset["serial_number"] = serial_number
        index = asset["index"]
        version = asset.get("version", None)
        try:
            asset_type_obj = HarvesterAssetType.objects.get(name=asset_type)
        except HarvesterAssetType.DoesNotExist:
            # create asset type and asset, then continue loop
            asset_type_obj = HarvesterAssetType.objects.create(creator=user, name=asset_type)
            HarvesterAsset.objects.create(**asset, creator=user, asset=asset_type_obj, harvester=harv)
            continue

        # check if asset exists and update, otherwise create it
        try:
            asset_obj = HarvesterAsset.objects.get(asset=asset_type_obj, serial_number=serial_number)
            asset_obj.harvester = harv
            asset_obj.index = index
            asset_obj.version = version
            asset_obj.lastModified = timezone.now()
            asset_obj.modifiedBy = user
            asset_obj.save()
        
        except HarvesterAsset.DoesNotExist:
            HarvesterAsset.objects.create(**asset, creator=user, asset=asset_type_obj, harvester=harv)
    
    # All report information is extracted. Delete the report.
    report_obj.delete()

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

@shared_task
def send_asset_manifest():
    report = compile_asset_report()
    r = upload_file(
        filename=f"asset_manifest_{datetime.now()}.txt",
        title="Asset Manifest",
        content=json.dumps(report, indent=4)
    )
    return r
