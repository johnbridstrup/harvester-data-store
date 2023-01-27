from common.celery import monitored_shared_task
from .models import AFTExceptionCode, AFTExceptionCodeManifest
from .serializers import AFTExceptionCodeSerializer

from django.contrib.auth.models import User
from django.utils.timezone import datetime


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
            
            