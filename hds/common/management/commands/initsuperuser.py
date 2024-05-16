from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
import os


class Command(BaseCommand):
    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "aft")
        User = get_user_model()

        if not User.objects.filter(username=username).exists():
            print(f"Creating superuser {username}")
            email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
            pwd = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

            User.objects.create_superuser(username=username, email=email, password=pwd)
        else:
            print(f"Username {username} exists")
