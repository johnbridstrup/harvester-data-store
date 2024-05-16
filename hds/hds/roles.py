from django.db import models
from rest_framework_roles.roles import is_user, is_admin, is_anon


class RoleChoices(models.TextChoices):
    SUPPORT = "support"  # Can access most resources and modify some
    DEVELOPER = "developer"  # Can access most resources and modify a larger set
    MANAGER = "manager"  # Can access all resources, create users, deploy code, etc...
    SQS = "sqs"  # Can create reports and files
    JENKINS = "jenkins"  # Can create certain reports and access certain data
    BEATBOX = "beatbox"  # Can do only exactly what it needs to run tests


def is_role(role):
    def is_role_choice(request, view):
        return is_user(request, view) and request.user.profile.role == role

    return is_role_choice


# This roles have stacking privileges hence the nesting
def is_manager(request, view):
    return any([x(request, view) for x in [is_admin, is_role(RoleChoices.MANAGER)]])


def is_dev(request, view):
    return any([x(request, view) for x in [is_manager, is_role(RoleChoices.DEVELOPER)]])


def is_support(request, view):
    return any([x(request, view) for x in [is_dev, is_role(RoleChoices.SUPPORT)]])


# These roles will have explicitly defined privileges
def is_sqs(request, view):
    return is_role(RoleChoices.SQS)(request, view)


def is_jenkins(request, view):
    return is_role(RoleChoices.JENKINS)(request, view)


def is_beatbox(request, view):
    return is_role(RoleChoices.BEATBOX)(request, view)


ROLES = {
    "admin": is_admin,
    "manager": is_manager,
    "developer": is_dev,
    "support": is_support,
    "sqs": is_sqs,
    "jenkins": is_jenkins,
    "beatbox": is_beatbox,
    "user": is_user,
    "anon": is_anon,
}
