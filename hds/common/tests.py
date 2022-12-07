import json, os
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User, Permission
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from .serializers.userserializer import UserSerializer
from .models import UserProfile
from hds.urls import urlpatterns
from common.models import UserProfile
from exceptions.models import AFTExceptionCode
from harvester.models import Fruit, Harvester
from location.models import Distributor, Location
from s3file.serializers import S3FileSerializer
from .utils import build_frontend_url
import logging


# Disable logging in unit tests
logging.disable(level=logging.CRITICAL)

USERS_URL = reverse('users:user-list')

CHANGE_PASSWORD_URL = reverse('users:change_password')

UNAUTHORIZED_CREATE_MSG = 'Unable to authorize user for create action'

UNAUTHORIZED_UPDATE_MSG = 'Unable to authorize user for update action'


def create_user(username, password, **kwargs):
    user = User.objects.create_user(
        username=username,
        password=password,
        **kwargs
        )
    UserProfile.objects.create(user=user)
    return user


def detail_url(user_id):
    return reverse("users:user-detail", args=[user_id])


def get_endpoint(urlpattern):
    return urlpattern.pattern._route

def compare_patterns(keys, urls):
    ignore = ['admin/', 'api/v1/openapi', 'api/v1/users/', 'prometheus/']
    return all(['/' + u in keys if u not in ignore else True for u in urls])


class HDSAPITestBase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(username='test_user')
        self.user_profile = UserProfile.objects.create(user=self.user, slack_id="fake-id")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.api_base_url = '/api/v1'

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

        return test_objects

    def update_user_permissions_all(self, model):
        content_type = ContentType.objects.get_for_model(model)
        model_perm = Permission.objects.filter(content_type=content_type)
        for perm in model_perm:
            # Give test user all permissions
            self.user.user_permissions.add(perm)
        self.user = User.objects.get(id=1)

    def _setup_s3file(self):
        event_json_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'test_data/test_file_event.json')
        with open(event_json_path, 'r') as f:
            self.s3event = json.load(f)
            # SQS client sends the event as a string in the 'Body' key
            self.s3event = {'Body': json.dumps(self.s3event)}

        self.bucket, self.key = S3FileSerializer.get_bucket_key(self.s3event)
        self.filetype, self.uuid = S3FileSerializer.get_filetype_uuid(self.key)

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

    def create_s3file(self):
        resp = self.client.post(
            f"{self.api_base_url}/s3files/",
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
    
    def _post_error_report(self, load=True):
        if load:
            self._load_report_data()
        resp = self.client.post(f'{self.api_base_url}/errorreports/', self.data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        return resp.json()

    def _post_autodiag_report(self, load=True):
        if load:
            self._load_autodiag_report()
        resp = self.client.post(f'{self.api_base_url}/autodiagnostics/', self.ad_data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        return resp.json()

    def test_frontend_url(self):
        url = build_frontend_url('test_endpoint', 1)

        self.assertEqual(url, "http://localhost:3000/test_endpoint/1/")

class OpenApiTest(HDSAPITestBase):
    """ Test OpenAPI Schema Generation """

    def test_get_schema(self):
        """ create fruit and assert it exists """
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
