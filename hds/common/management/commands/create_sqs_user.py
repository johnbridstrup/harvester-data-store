from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token
import os

class Command(BaseCommand):
    def handle(self, *args, **options):
        User = get_user_model()

        if not User.objects.filter(username="sqs").exists():
            print(f"Creating sqs user")
            email = "john@advanced.farm"
            pwd = os.environ.get("SQS_USER_PASSWORD", "test")

            User.objects.create_user(
                username="sqs",
                email=email,
                password=pwd
            )
        
        user = User.objects.get(username='sqs')
        token, created = Token.objects.get_or_create(user=user)
        with open(".sqstoken", "w") as f:
            f.write(f"export SQS_TOKEN={token.key}")