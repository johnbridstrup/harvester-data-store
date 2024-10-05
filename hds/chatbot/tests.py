from common.tests import HDSAPITestBase, HDSTestAttributes
from .models import ChatbotLog


class ChatbotLogTestCase(HDSAPITestBase, HDSTestAttributes):
    TEST_MSG_FNAME = "message.json"
    TEST_IMG_FNAME = "image.jpg"

    def _save_test_message(self, msg_type="INFO", harv_id=11):
        msg = {
            "type": msg_type,
            "message": "Test message",
            "channels": ["a-test-channel"],
        }
        self.msg_relpath = f"hv-{harv_id:03d}/{self.TEST_MSG_FNAME}"
        self.msgpath = self._write_report(self.msg_relpath, msg)

    def setUp(self):
        super().setUp()
        self.setup_basic()
        self.setup_urls()
        self.load_config_data()
        self.create_harvester_object(
            0,
            fruit=self.test_objects["fruit"],
            location=self.test_objects["location"],
        )
        self._save_test_message(harv_id=self.test_objects["harvester"].harv_id)
        self.img_relpath = f"hv-{self.test_objects['harvester'].harv_id:03d}/{self.TEST_IMG_FNAME}"
        self.img_meta = {
            "robot_id": 1,
            "message": "Test image",
            "channels": ["a-test-channel"],
        }
        self.imgpath = self._create_test_image(
            self.img_relpath, metadata=self.img_meta
        )

    def tearDown(self):
        self._delete_file(self.msg_relpath)
        self._delete_file(self.img_relpath)

    def post_chatbot_log(self, type="message", data="None"):
        if type == "message":
            evt, _, _ = self.create_s3event(self.msgpath, tag_uuid=True)
        elif type == "image":
            evt, _, _ = self.create_s3event(self.imgpath, tag_uuid=True)
        else:
            raise ValueError(f"Invalid type: {type}")

        r = self.client.post(self.chatbot_url, data=evt, format="json")
        return r

    def test_basic(self):
        r1 = self.post_chatbot_log()
        self.assertEqual(r1.status_code, 201)
        self.assertEqual(ChatbotLog.objects.count(), 1)
        r2 = self.post_chatbot_log(type="image")
        self.assertEqual(r2.status_code, 201)
        self.assertEqual(ChatbotLog.objects.count(), 2)

        msg_log = ChatbotLog.objects.get(type=ChatbotLog.ChatbotLogType.MESSAGE)
        img_log = ChatbotLog.objects.get(type=ChatbotLog.ChatbotLogType.IMAGE)
        self.assertEqual(msg_log.harvester, self.test_objects["harvester"])
        self.assertEqual(img_log.harvester, self.test_objects["harvester"])
        self.assertEqual(msg_log.type, ChatbotLog.ChatbotLogType.MESSAGE)
        self.assertEqual(img_log.type, ChatbotLog.ChatbotLogType.IMAGE)

        self.assertEqual(msg_log.channels, ["a-test-channel"])
        self.assertEqual(img_log.channels, ["a-test-channel"])
        self.assertEqual(msg_log.processed, True)
        self.assertEqual(img_log.processed, True)
