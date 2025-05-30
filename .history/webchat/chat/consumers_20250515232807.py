import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = 'test'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        table_number = text_data_json.get('table_number', '番号がありません。')

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'table_number': table_number
            }
        )

    def chat_message(self, event):
        message = event['message']
        table_number = event['table_number']

        self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message,
            'table_number': table_number
        }))
