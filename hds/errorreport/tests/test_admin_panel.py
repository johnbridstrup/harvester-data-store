from django.test import TestCase, Client
from django.contrib.auth.models import User


class TestAdminPanel(TestCase):
    def create_user(self):
        self.username = "test_admin"
        self.password = User.objects.make_random_password()
        user, created = User.objects.get_or_create(username=self.username)
        user.set_password(self.password)
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()
        self.user = user

    def test_admin_panel(self):
        self.create_user()
        client = Client()
        client.login(username=self.username, password=self.password)
        admin_pages = [
            "/admin/",
            # put all the admin pages for your models in here.
            "/admin/auth/",
            "/admin/auth/group/",
            "/admin/auth/group/add/",
            "/admin/auth/user/",
            "/admin/auth/user/add/",
            "/admin/password_change/"
        ]
        for page in admin_pages:
            resp = client.get(page)
            assert resp.status_code == 200
            assert b"<!DOCTYPE html" in resp.content


# class ErrorReportTest(TestCase):
#     @classmethod
#     def setUpTestData(cls):
#         cls.creator = User.objects.create(id=1, username='test_user')
#         cls.distributor = Distributor.objects.create(creator=cls.creator, name='Distributor 1')
#         cls.location = Location.objects.create(
#                   creator=cls.creator, distributor=cls.distributor,
#                   ranch="Ranch A", country="USA", region="California")
#         cls.harvester = Harvester.objects.create(
#                     creator=cls.creator, fruit=Fruit.objects.create(creator=cls.creator, name='Apple'),
#                     harv_id=1001, location=cls.location, name="Harvester 1")
#         cls.report = {
#             "error": {
#                 "code": 401,
#                 "errors": [
#                     {
#                         "domain": "global",
#                         "reason": "required",
#                         "message": "Login Required",
#                         "location": "Authorization",
#                         "locationType": "header"
#                     }
#                 ],
#                 "message": "Login Required"
#             }
#         }       

#     def test_create_errorreport(self):
#         """ create errorreport and assert it exists """
#         ErrorReport.objects.create(
#                     creator=self.creator, reportTime=timezone.now(),
#                     location=self.location, harvester=self.harvester, report=self.report)

#         errorreport = ErrorReport.objects.get(id=1)
#         self.assertEqual(errorreport.id, 1)
#         self.assertEqual(errorreport.report, self.report)
#         self.assertEqual(errorreport.creator, self.creator)

