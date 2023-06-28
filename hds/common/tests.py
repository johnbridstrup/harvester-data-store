import json
import logging
import os
import random
import string
import unittest
import uuid
import shutil
from collections import defaultdict
from pprint import pprint
from time import time
from unittest.mock import MagicMock

from django.contrib.auth.models import User
from django.urls import reverse
from django.conf import settings
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase
from rest_framework.test import APIClient

from common.viewsets import CreateModelViewSet, ReportModelViewSet
from common.models import UserProfile
from common.serializers.userserializer import UserSerializer
from common.utils import (
    build_frontend_url,
    merge_nested_dict,
    get_url_permissions,
)
from common.viewsets import CreateModelViewSet
from hds.roles import RoleChoices, ROLES
from hds.urls import urlpatterns
from exceptions.models import AFTExceptionCode
from event.models import Event
from harvester.models import Fruit, Harvester
from location.models import Distributor, Location
from s3file.serializers import S3FileSerializer


# Disable logging in unit tests
logging.disable(level=logging.CRITICAL)


def get_endpoint(urlpattern):
    try:
        return urlpattern.pattern._route
    except:
        return str(urlpattern.pattern)


def compare_patterns(keys, urls):
    ignore = ['', 'admin/', 'api/v1/openapi', 'api/v1/users/', 'prometheus/', '^media/(?P<path>.*)$', '^static/(?P<path>.*)$']
    return all(['/' + u in keys if u not in ignore else True for u in urls])


class HDSAPITestBase(APITestCase):
    BASE_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), "test_data")

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(username='test_user')
        self.set_admin()
        self.user_profile = UserProfile.objects.create(
            user=self.user,
            slack_id="fake-id",
            role=RoleChoices.MANAGER
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.api_base_url = '/api/v1'
        self.setup_urls()
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

    def create_new_user_client(self, role=None):
        chars = string.ascii_letters + string.digits
        username = ''.join(random.choice(chars) for _ in range(10))
        if role is None:
            role = RoleChoices.MANAGER
        user = User.objects.create(username=username)
        UserProfile.objects.create(
            user=user,
            slack_id="another-fake-id",
            role=role,
        )
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        return client, user

    def set_admin(self):
        self.user.is_superuser = True
        self.user.save()

    def set_user_role(self, role):
        """set test user role.

        Sets superuser to False as well

        Args:
            role (models.TextChoices.Choice): The role to set
        """
        self.user.is_superuser = False
        self.user.save()
        self.user.profile.role = role.value
        self.user.profile.save()

    def set_user_support(self):
        self.set_user_role(RoleChoices.SUPPORT)

    def set_user_developer(self):
        self.set_user_role(RoleChoices.DEVELOPER)

    def set_user_manager(self):
        self.set_user_role(RoleChoices.MANAGER)

    def set_user_jenkins(self):
        self.set_user_role(RoleChoices.JENKINS)

    def set_user_beatbox(self):
        self.set_user_role(RoleChoices.BEATBOX)

    def setup_basic(self):
        self.test_objects = {}
        self.test_objects["fruit"] = self.create_fruit_object('strawberry')
        self.test_objects["distributor"] = self.create_distributor_object('test_distrib')
        self.test_objects["location"] = self.create_location_object(**{
            "distributor": self.test_objects["distributor"],
            "ranch": "Ranch A",
            "country": "US",
            "region": "California",
            'creator': self.user
        })
        self.test_objects["harvester"] = self.create_harvester_object(**{
            'harv_id': 11,
            'fruit': self.test_objects["fruit"],
            'location': self.test_objects["location"],
            'name': 'Harvester 1',
            'creator': self.user
        })
        self.test_objects["code"] = AFTExceptionCode.objects.create(**{
            'code': 0,
            'name': 'AFTBaseException',
            'msg': 'test message',
            'team': 'aft',
            'cycle': False,
            'creator': self.user
        })
        self.test_objects["dummy_report"] = {
            "timestamp": time(),
            "UUID": Event.generate_uuid(),
            "serial_number": self.test_objects["harvester"].harv_id,
            "data": {"hello": "there"}
        }

    def setup_urls(self):
        # Users
        self.user_url = reverse('users:user-list')
        self.user_detail_url = lambda id_: reverse("users:user-detail", args=[id_])
        self.change_pwd_url = reverse('users:change_password')


        # Autodiag
        self.ad_url = reverse("autodiagnostics-list")
        self.ad_det_url = lambda id_: reverse("autodiagnostics-detail", args=[id_])

        self.ad_run_url = reverse("autodiagnosticsrun-list")
        self.ad_run_det_url = lambda id_: reverse("autodiagnosticsrun-detail", args=[id_])

        # Assets
        self.asset_url = reverse("harvassets-list")
        self.asset_det_url = lambda id_: reverse("harvassets-detail", args=[id_])

        self.assetrep_url = reverse("harvassetreport-list")
        self.assetrep_det_url = lambda id_: reverse("harvassetreport-detail", args=[id_])

        # Configs
        self.config_url = reverse("configreports-list")
        self.config_det_url = lambda id_: reverse("configreports-list", args=[id_])

        # Emustats
        self.emustats_url = reverse("emustatsreports-list")
        self.emustats_det_url = lambda id_: reverse("emustatsreports-detail", args=[id_])

        # Error report
        self.error_url = reverse("errorreport-list")
        self.error_det_url = lambda id_: reverse("errorreport-detail", args=[id_])

        # Exceptions
        self.code_manif_url = reverse("codemanifest-list")
        self.code_manif_det_url = lambda id_: reverse("codemanifest-detail", args=[id_])

        self.exc_url = reverse("exception-list")
        self.exc_det_url = lambda id_: reverse("exception-detail", args=[id_])

        self.exc_code_url = reverse("exceptioncode-list")
        self.exc_code_det_url = lambda id_: reverse("exceptioncode-detail", args=[id_])

        # Event/Picksession
        self.event_url = reverse("event-list")
        self.event_det_url = lambda id_: reverse("event-detail", args=[id_])

        self.picksess_url = reverse("picksession-list")
        self.picksess_det_url = lambda id_: reverse("picksession-detail", args=[id_])

        # Grip Report
        self.griprep_url = reverse("gripreports-list")
        self.griprep_det_url = lambda id_: reverse("gripreports-detail", args=[id_])

        # Harvester
        self.harv_url = reverse("harvester-list")
        self.harv_det_url = lambda id_: reverse("harvester-detail", args=[id_])

        self.fruit_url = reverse("fruit-list")
        self.fruit_det_url = lambda id_: reverse("fruit-detail", args=[id_])

        # HarvDeploy
        self.release_url = reverse("harvcoderelease-list")
        self.release_det_url = lambda id_: reverse("harvcoderelease-detail", args=[id_])

        self.version_url = reverse("harvcodeversion-list")
        self.version_det_url = lambda id_: reverse("harvcodeversion-detail", args=[id_])

        # HarvJobs

        self.jobtype_url = reverse("jobtype-list")
        self.jobtype_det_url = lambda id_: reverse("jobtype-detail", args=[id_])

        self.jobschema_url = reverse("jobschema-list")
        self.jobschema_det_url = lambda id_: reverse("jobschema-detail", args=[id_])

        self.jobs_url = reverse("job-list")
        self.job_det_urls = lambda id_: reverse("job-detail", args=[id_])
        self.reschedule_url = lambda id_ : reverse("job-reschedule", args=[id_])

        self.jobresults_url = reverse("jobresults-list")
        self.jobresults_det_url = lambda id_: reverse("jobresults-detail", args=[id_])

        # Migrations
        self.migr_url = reverse("hdsmigrations-list")

        # Location
        self.distr_url = reverse("distributor-list")
        self.distr_det_url = lambda id_: reverse("distributor-detail", args=[id_])

        self.loc_url = reverse("location-list")
        self.loc_det_url = lambda id_: reverse("location-detail", args=[id_])

        # Logparser
        self.log_session_url = reverse("logsession-list")
        self.log_session_det_url = lambda _id : reverse(
          "logsession-detail", args=[_id]
        )
        self.log_file_url = reverse("logfile-list")
        self.log_file_det_url = lambda _id : reverse(
          "logfile-detail", args=[_id]
        )
        self.log_video_url = reverse("logvideo-list")
        self.log_video_det_url = lambda _id: reverse(
          "logvideo-detail",args=[_id]
        )

        # Notification
        self.notif_url = reverse("notification-list")
        self.notif_det_url = lambda id_: reverse("notification-detail", args=[id_])

        # S3File
        self.s3file_url = reverse("s3file-list")
        self.s3file_det_url = lambda id_: reverse("s3file-detail", args=[id_])

        self.sesscl_url = reverse("sessclip-list")
        self.sesscl_det_url = lambda id_: reverse("sessclip-detail", args=[id_])

    def create_fruit_object(self, name=None):
        name = name or "strawberry"
        return Fruit.objects.create(name=name, creator=self.user)

    def create_distributor_object(self, name=None):
        name = name or "test"
        return Distributor.objects.create(name=name, creator=self.user)

    def create_location_object(self, distributor=None, ranch=None, country=None, region=None, creator=None):
        distributor = distributor or self.create_distributor_object()
        ranch = ranch or "test ranch"
        country = country or "USA"
        region = region or "Philadelphia"
        creator = creator or self.user
        return Location.objects.create(**{
            "distributor": distributor,
            "ranch": ranch,
            "country": country,
            "region": region,
            'creator': creator
        })

    def create_harvester_object(self, harv_id, fruit=None, location=None, name=None, creator=None, is_emu=False):
        creator = None or self.user
        fruit = fruit or self.create_fruit_object()
        location = location or self.create_location_object()
        name = name or "test-harv"
        creator = creator or self.user

        return Harvester.objects.create(**{
            'harv_id': harv_id,
            'fruit': fruit,
            'location': location,
            'name': name,
            'creator': creator,
            'is_emulator': is_emu,
        })

    def create_exception_code_object(self, code, name, msg, team, cycle, creator):
        return AFTExceptionCode.objects.create(**{
            'code': code,
            'name': name,
            'msg': msg,
            'team': team,
            'cycle': cycle,
            'creator': creator
        })

    @staticmethod
    def create_s3event(key, tag_uuid=False):
        if tag_uuid:
            full_key = key
        else:
            UUID = str(uuid.uuid1())
            full_key = f"{key}_{UUID}"
        event = {
            "Records":[{
                    "s3":{
                        "bucket":{
                            "name":"test-bucket"
                        },
                        "object":{"key": full_key}
                    }
                }]
            }

        return {"Body": json.dumps(event)}, *S3FileSerializer.get_filetype_uuid(full_key)

    def create_s3file(self, key, endpoint, has_uuid=False):
        self.s3event, self.filetype, self.uuid = self.create_s3event(key, tag_uuid=has_uuid)
        resp = self.client.post(
            endpoint,
            data=self.s3event,
            format='json'
        )
        return resp

    def create_user(self, username, password, profile_kwargs = {}, **kwargs):
            user = User.objects.create_user(
            username=username,
            password=password,
            **kwargs
            )
            UserProfile.objects.create(user=user, **profile_kwargs)
            return user

    def _load_report(self, relpath):
        fpath = os.path.join(self.BASE_PATH, relpath)
        with open(fpath, 'rb') as f:
            d = json.load(f)
        return d

    def load_error_report(self):
        self.data = self._load_report('report.json')

    def load_config_data(self):
        self.conf_data = self._load_report('configs-report_002_1675256694.218969.json')

    def load_autodiag_report(self):
        self.ad_data = self._load_report('autodiag_report.json')

    def load_asset_report(self):
        self.asset_data = self._load_report('serialnums.json')

    def load_picksess_report(self):
        self.picksess_data = self._load_report('picksess.json')

    def load_emustats_report(self):
        self.emustats_data = self._load_report('emustats.json')

    def post_emustats_report(self, load=True):
        if load:
            self.load_emustats_report()
        resp = self.client.post(self.emustats_url, self.emustats_data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.json())
        return resp.json()

    def post_error_report(self, load=True):
        if load:
            self.load_error_report()
        resp = self.client.post(self.error_url, self.data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.json())
        return resp.json()

    def post_autodiag_report(self, load=True, resp_status=status.HTTP_201_CREATED):
        if load:
            self.load_autodiag_report()
        resp = self.client.post(self.ad_url, self.ad_data, format='json')
        self.assertEqual(resp.status_code, resp_status)
        return resp.json()

    def post_picksess_report(self, load=True, resp_status=status.HTTP_202_ACCEPTED):
        if load:
            self.load_picksess_report()
        fpath = os.path.join(self.BASE_PATH, "picksess.json")
        event = self.create_s3event(key=fpath, tag_uuid=True)[0]
        resp = self.client.post(self.griprep_url, event, format='json')
        self.assertEqual(resp.status_code, resp_status, msg=resp.json())
        return resp.json()

    @property
    def logpath(self):
        return os.path.join(self.BASE_PATH, '20230614134221_013_00_harvester.log')

    @property
    def canpath(self):
        return os.path.join(self.BASE_PATH, '20230131131250_010_03_CAN.dump')

    def tearDown(self):
        shutil.rmtree(settings.MEDIA_ROOT)
        return super().tearDown()


class OpenApiTest(HDSAPITestBase):
    """ Test OpenAPI Schema Generation """

    def test_get_schema(self):
        resp = self.client.get(f'{self.api_base_url}/openapi')
        data = resp.data
        keys = list(data['paths'].keys())
        endpoints = [get_endpoint(p) for p in urlpatterns]

        assert compare_patterns(keys, endpoints)

        assert data['info']['title'] == "Harvester Data Store"


class PrometheusTest(HDSAPITestBase):
    """ Test Prometheus Endpoint """

    def test_get_prometheus(self):
        """ create fruit and assert it exists """
        resp = self.client.get('/metrics')
        assert resp.status_code == 200


class ManageUserTest(HDSAPITestBase):
    """Test User Management APIs."""

    def setUp(self):
        self.payload = {
            'username': 'afttest',
            'first_name': 'Aft',
            'last_name': 'Aft',
            'email': 'aft@aft.aft',
            'password': 'password',
            'profile': {
                'slack_id': 'slack@aft.aft'
            }
        }
        self.unauthorized_create_msg = 'Unable to authorize user for create action'
        self.unauthorized_update_msg = 'Unable to authorize user for update action'
        return super().setUp()

    def test_non_superuser_cannot_create_user(self):
        """
        Test non superuser cannot add new users.

        Raises validation error
        """
        self.user.is_superuser = False
        self.user.save()
        res = self.client.post(self.user_url, self.payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            res.json()["errors"]["detail"][0],
            self.unauthorized_create_msg
        )

    def test_non_superuser_cannot_update_user(self):
        """
        Test non superuser and cannot update user profile.

        Raise validation error
        """
        self.user.is_superuser = False
        self.user.save()
        user = self.create_user(username='aftuser', password='testpass123')
        self.payload.update({'username': user.username})
        self.payload.pop('password')
        url = self.user_detail_url(user.id)
        res = self.client.patch(url, self.payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            res.json()["errors"]["detail"][0],
            self.unauthorized_update_msg
        )

    def test_create_user_successfully(self):
        """Test creating new user."""
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.save()
        self.user.refresh_from_db()
        res = self.client.post(self.user_url, self.payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username=self.payload['username'])
        self.assertEqual(user.email, self.payload['email'])

    def test_retrieve_user_successfully(self):
        """Test retrieve new user successfully"""
        user = self.create_user(username='aftuser', password='testpass123')
        serializer = UserSerializer(user).data
        res = self.client.get(self.user_detail_url(user.id))

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(
            res.json()['data']['first_name'],
            serializer.get('first_name')
        )

    def test_update_user_detail_successfully(self):
        """Test updating user detail."""
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.save()
        self.user.refresh_from_db()
        user = self.create_user(username='aftuser', password='testpass123')
        self.payload.update({'username': user.username})
        self.payload.pop('password')
        url = self.user_detail_url(user.id)
        res = self.client.patch(url, self.payload, format='json')
        user.refresh_from_db()

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(user.first_name, self.payload['first_name'])

    def test_self_can_update_user_profile(self):
        """Test self can update his/her user profle."""
        self.payload.update({'username': self.user.username})
        url = self.user_detail_url(self.user.id)
        res = self.client.patch(url, self.payload, format='json')
        self.user.refresh_from_db()

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.email, self.payload['email'])

    def test_user_can_change_password(self):
        """Test user can change password."""
        og_user_password = "ogpasswd123"
        self.user.set_password(og_user_password)
        self.user.save()
        self.user.refresh_from_db()
        self.payload.update({
            'username': self.user.username,
            'new_password': 'newpasswordtobeupdated',
            'current_password': og_user_password,
        })
        res = self.client.post(self.change_pwd_url, self.payload, format='json')
        self.user.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(self.user.check_password(self.payload['new_password']))


class TestUtils(unittest.TestCase):
    def test_frontend_url(self):
        url = build_frontend_url('test_endpoint', 1)

        self.assertEqual(url, "http://localhost:3000/test_endpoint/1/")

    def test_merge_nested_basic(self):
        d1 = {"1": "1", "2": {"3": "3", "4": "4"}, "6": "6"}
        d2 = {"1": "11", "2": {"3": "3", "4": "44", "5": "5"}}

        exp = {"1": "11", "2": {"3": "3", "4": "44", "5": "5"}, "6": "6"}

        self.assertDictEqual(merge_nested_dict(d1, d2), exp)

    def test_merge_nested_overwrite_none(self):
        d1 = {"1": "1", "2": {"3": "3", "4": "4"}, "6": "6"}
        d2 = {"1": "11", "2": None}

        exp = {"1": "11", "2": {}, "6": "6"}

        self.assertDictEqual(merge_nested_dict(d1, d2, overwrite_none=True), exp)

    def test_merged_nested_mismatched_schema(self):
        d1 = {"1": "1", "2": {"3": "3", "4": "4"}, "6": "6"}
        d2 = {"1": "11", "2": {"3": "3", "4": "44", "5": "5"}, "6": {"7": "7"}}

        exp = {"1": "11", "2": {"3": "3", "4": "44", "5": "5"}, "6": {"7": "7"}}

        self.assertDictEqual(merge_nested_dict(d1, d2), exp)


class TestRoles(HDSAPITestBase):
    IGNORE = ["/api/v1/sessclip/0/mock/"]  # We really need to stop using this sessclip endpoint anyway...

    def test_create_model_perms(self):
        class TestView(CreateModelViewSet):
            view_permissions_update = {
                'create': {
                    RoleChoices.SUPPORT: True
                }
            }

        exp = merge_nested_dict(CreateModelViewSet.view_permissions, TestView.view_permissions_update)

        self.assertDictEqual(exp, TestView().view_permissions)

    def test_report_model_perms(self):
        class TestView(ReportModelViewSet):
            view_permissions_update = {
                'create': {
                    RoleChoices.SUPPORT: True
                }
            }

        exp = merge_nested_dict(ReportModelViewSet.view_permissions, TestView.view_permissions_update)

        self.assertDictEqual(exp, TestView().view_permissions)

    def test_role_matrix(self):
        """Test forbidden/allowed endpoints per role.

        This is a fairly confusing test. The idea is get the permissions matrix and test every
        endpoint with every role, knowing whether we should expect a 403 response or another
        response. "Another" response may or may not be 2XX since we will not be sending any
        correctly formatted data, so we only check for 403/not-403.
        """

        # We will be checking for actions without permissions defined as well as
        # for broken permissions.
        raise_for_undefined_perm = False
        no_permissions_defined = defaultdict(list)
        raise_for_broken_perm = False
        broken_permissions = defaultdict(dict)

        url_permissions = get_url_permissions(urlpatterns)
        for url, methods, permissions, view in url_permissions:
            if url in self.IGNORE:
                continue
            for http_method, action in methods.copy().items():
                if http_method not in view().http_method_names:
                    # Some views don't allow certain methods at all.
                    # drf-roles doesn't know this.
                    continue
                if action not in permissions:
                    # There are no permissions set for this action
                    raise_for_undefined_perm = True
                    no_permissions_defined[view.__name__].append(action)
                    continue

                kwargs = {}
                if http_method in ["post", "put", "patch"]:
                    # send some empty data so client.{post,put,patch} doesn't complain
                    kwargs = {"data": {}, "format": "json"}

                # Get the appropriate request method
                requester = getattr(self.client, http_method)

                # Loop through all roles + admin
                for role in list(RoleChoices) + ['admin']:
                    if role == 'admin':
                        self.set_admin()
                    else:
                        self.set_user_role(role)

                    response = requester(url, **kwargs)
                    request = response.wsgi_request
                    setattr(request, "data", MagicMock()) # whitelist method requires data in the request
                    for allowed_role, condition in permissions[action].items():
                        # Go through permission dict for this action, check if role allowed.
                        is_allowed = ROLES[allowed_role]
                        if callable(condition):
                            # There are special conditions in some views
                            allowed = is_allowed(request, view) and condition(request, view)
                        else:
                            allowed = is_allowed(request, view)
                        if allowed:
                            # Only one role needs permission
                            break
                    # Check allowed vs 403
                    if (
                        (allowed and response.status_code == status.HTTP_403_FORBIDDEN) or
                        (response.status_code != status.HTTP_403_FORBIDDEN and not allowed)
                    ):
                        raise_for_broken_perm = True
                        broken_permissions[(view.__name__, action)][role] = {
                            "expected_403": not allowed,
                            "received": response.status_code,
                        }

        if raise_for_broken_perm:
            print("\nBROKEN PERMISSIONS")
            pprint(dict(broken_permissions), indent=4)
        if raise_for_undefined_perm:
            print("\nSOME METHODS DON'T HAVE PERMISSIONS DEFINED")
            pprint(dict(no_permissions_defined), indent=4)
        if any([raise_for_undefined_perm, raise_for_broken_perm]):
            assert False, "Role permissions are not properly set."
