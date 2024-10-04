from common.tests import HDSAPITestBase
from .models import ChatbotLog


class ChatbotLogTestCase(HDSAPITestBase):
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

    def post_chatbot_log(self, type="message", data="None"):
        harv_id = self.test_objects["harvester"].harv_id
        if type == "message":
            evt, _, _ = self.create_s3event(
                f"prefix/hv-{harv_id:03d}/message.json", tag_uuid=True
            )
        elif type == "image":
            evt, _, _ = self.create_s3event(
                f"prefix/hv-{harv_id:03d}/image.jpg", tag_uuid=True
            )
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
