import json, os, uuid
from time import time
from pprint import pprint
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from common.viewsets import CreateModelViewSet, ReportModelViewSet
from django.contrib.auth.models import User, Permission
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from .serializers.userserializer import UserSerializer
from .models import UserProfile
from .utils import merge_nested_dict
from common.viewsets import CreateModelViewSet
from common.utils import get_url_permissions
from hds.roles import RoleChoices, ROLES
from hds.urls import urlpatterns
from exceptions.models import AFTExceptionCode
from event.models import Event
from harvester.models import Fruit, Harvester
from location.models import Distributor, Location
from s3file.serializers import S3FileSerializer
from .utils import build_frontend_url
from collections import defaultdict
import logging
import unittest
from unittest.mock import MagicMock


# Disable logging in unit tests
logging.disable(level=logging.CRITICAL)

USERS_URL = reverse('users:user-list')

CHANGE_PASSWORD_URL = reverse('users:change_password')

UNAUTHORIZED_CREATE_MSG = 'Unable to authorize user for create action'

UNAUTHORIZED_UPDATE_MSG = 'Unable to authorize user for update action'


def create_user(username, password, profile_kwargs = {}, **kwargs):
    user = User.objects.create_user(
        username=username,
        password=password,
        **kwargs
        )
    UserProfile.objects.create(user=user, **profile_kwargs)
    return user


def detail_url(user_id):
    return reverse("users:user-detail", args=[user_id])


def get_endpoint(urlpattern):
    try:
        return urlpattern.pattern._route
    except:
        return str(urlpattern.pattern)

def compare_patterns(keys, urls):
    ignore = ['admin/', 'api/v1/openapi', 'api/v1/users/', 'prometheus/', '^media/(?P<path>.*)$', '^static/(?P<path>.*)$']
    return all(['/' + u in keys if u not in ignore else True for u in urls])


class HDSAPITestBase(APITestCase):
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

    def _setup_basic(self):
        test_objects = {}
        test_objects["fruit"] = self.create_fruit_object('strawberry')
        test_objects["distributor"] = self.create_distributor_object('test_distrib')
        test_objects["location"] = self.create_location_object(**{
            "distributor": test_objects["distributor"],
            "ranch": "Ranch A",
            "country": "US",
            "region": "California",
            'creator': self.user
        })
        test_objects["harvester"] = self.create_harvester_object(**{
            'harv_id': 11,
            'fruit': test_objects["fruit"],
            'location': test_objects["location"],
            'name': 'Harvester 1',
            'creator': self.user
        })
        test_objects["code"] = AFTExceptionCode.objects.create(**{
            'code': 0,
            'name': 'AFTBaseException',
            'msg': 'test message',
            'team': 'aft',
            'cycle': False,
            'creator': self.user
        })
        test_objects["dummy_report"] = {
            "timestamp": time(),
            "UUID": Event.generate_uuid(),
            "serial_number": test_objects["harvester"].harv_id,
            "data": {"hello": "there"}
        }

        return test_objects

    def update_user_permissions_all(self, model):
        content_type = ContentType.objects.get_for_model(model)
        model_perm = Permission.objects.filter(content_type=content_type)
        for perm in model_perm:
            # Give test user all permissions
            self.user.user_permissions.add(perm)
        self.user = User.objects.get(id=1)

    def create_fruit_object(self, name):
        return Fruit.objects.create(name=name, creator=self.user)

    def create_distributor_object(self, name):
        return Distributor.objects.create(name=name, creator=self.user)

    def create_location_object(self, distributor, ranch, country, region, creator):
        return Location.objects.create(**{
            "distributor": distributor,
            "ranch": ranch,
            "country": country,
            "region": region,
            'creator': creator
        })

    def create_harvester_object(self, harv_id, fruit, location, name, creator):
        return Harvester.objects.create(**{
            'harv_id': harv_id,
            'fruit': fruit,
            'location': location,
            'name': name,
            'creator': creator
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
    def create_s3event(key, has_uuid=False):
        if not has_uuid:
            UUID = str(uuid.uuid1())
            full_key = f"{key}_{UUID}"
        else:
            full_key = key
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

    def create_s3file(self, key, has_uuid=False, endpoint="s3files"):
        self.s3event, self.filetype, self.uuid = self.create_s3event(key, has_uuid=has_uuid)
        resp = self.client.post(
            f"{self.api_base_url}/{endpoint}/",
            data=self.s3event,
            format='json'
        )
        return resp

    def _load_report_data(self):
        report_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'test_data/report.json')
        with open(report_path, 'rb') as f:
            self.data = json.load(f)
    
    def _load_autodiag_report(self):
        report_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'test_data/autodiag_report.json')
        with open(report_path, 'rb') as f:
            self.ad_data = json.load(f)

    def _load_asset_report(self):
        report_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'test_data/serialnums.json')
        with open(report_path, 'rb') as f:
            self.asset_data = json.load(f)
    
    def _post_error_report(self, load=True):
        if load:
            self._load_report_data()
        resp = self.client.post(f'{self.api_base_url}/errorreports/', self.data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        return resp.json()

    def _post_autodiag_report(self, load=True, resp_status=status.HTTP_201_CREATED):
        if load:
            self._load_autodiag_report()
        resp = self.client.post(f'{self.api_base_url}/autodiagnostics/', self.ad_data, format='json')
        self.assertEqual(resp.status_code, resp_status)
        return resp.json()

    @property
    def logpath(self):
        return os.path.join(os.path.abspath(os.path.dirname(__file__)), 'test_data/20230131131250_010_03_robot.log')

    @property
    def canpath(self):
        return os.path.join(os.path.abspath(os.path.dirname(__file__)), 'test_data/20230131131250_010_03_CAN.dump')

    def test_frontend_url(self):
        url = build_frontend_url('test_endpoint', 1)

        self.assertEqual(url, "http://localhost:3000/test_endpoint/1/")


class RolesTest(HDSAPITestBase):
    IGNORE = ["/api/v1/sessclip/0/mock/"]  # We really need to stop using this sessclip endpoint anyway...

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
        return super().setUp()

    def test_non_superuser_cannot_create_user(self):
        """
        Test non superuser cannot add new users.

        Raises validation error
        """
        self.user.is_superuser = False
        self.user.save()
        res = self.client.post(USERS_URL, self.payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            res.json()["errors"]["detail"][0],
            UNAUTHORIZED_CREATE_MSG
        )

    def test_non_superuser_cannot_update_user(self):
        """
        Test non superuser and cannot update user profile.

        Raise validation error
        """
        self.user.is_superuser = False
        self.user.save()
        user = create_user(username='aftuser', password='testpass123')
        self.payload.update({'username': user.username})
        self.payload.pop('password')
        url = detail_url(user.id)
        res = self.client.patch(url, self.payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            res.json()["errors"]["detail"][0],
            UNAUTHORIZED_UPDATE_MSG
        )

    def test_create_user_successfully(self):
        """Test creating new user."""
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.save()
        self.user.refresh_from_db()
        res = self.client.post(USERS_URL, self.payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username=self.payload['username'])
        self.assertEqual(user.email, self.payload['email'])

    def test_retrieve_user_successfully(self):
        """Test retrieve new user successfully"""
        user = create_user(username='aftuser', password='testpass123')
        serializer = UserSerializer(user).data
        res = self.client.get(detail_url(user.id))

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
        user = create_user(username='aftuser', password='testpass123')
        self.payload.update({'username': user.username})
        self.payload.pop('password')
        url = detail_url(user.id)
        res = self.client.patch(url, self.payload, format='json')
        user.refresh_from_db()

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(user.first_name, self.payload['first_name'])

    def test_self_can_update_user_profile(self):
        """Test self can update his/her user profle."""
        self.payload.update({'username': self.user.username})
        url = detail_url(self.user.id)
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
        res = self.client.post(CHANGE_PASSWORD_URL, self.payload, format='json')
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
