from celery import shared_task
from django.contrib.auth.models import User
from django.utils import timezone

from harvester.models import Harvester

from .models import HarvesterAssetReport, HarvesterAssetType, HarvesterAsset


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
