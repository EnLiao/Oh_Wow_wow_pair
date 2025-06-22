from django.core.management.base import BaseCommand
from core.models import Follow, Doll
from chat.models import ChatRoom
from django.db import transaction
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = '為所有已經互相關注但尚未有聊天室的娃娃組自動建立聊天室'

    def handle(self, *args, **options):
        count = 0
        # 找出所有互相關注的娃娃對
        follows = Follow.objects.all()
        checked_pairs = set()
        for follow in follows:
            a = follow.from_doll_id
            b = follow.to_doll_id
            print(f"檢查娃娃對: {a.id}({a.username}) <-> {b.id}({b.username})")
            if a.id == b.id:
                print("跳過自己和自己")
                continue
            pair = tuple(sorted([a.id, b.id]))
            if pair in checked_pairs:
                print(f"跳過重複 pair: {pair}")
                continue
            checked_pairs.add(pair)
            if Follow.objects.filter(from_doll_id=b, to_doll_id=a).exists():
                print(f"互相關注: {a.id} <-> {b.id}")
                # 檢查聊天室是否已存在
                if not ChatRoom.objects.filter(doll1=a, doll2=b).exists() and not ChatRoom.objects.filter(doll1=b, doll2=a).exists():
                    with transaction.atomic():
                        ChatRoom.objects.create(doll1=a, doll2=b)
                        print(f"建立聊天室: {a.name} <-> {b.name}")
                        count += 1
                else:
                    print(f"聊天室已存在: {a.name} <-> {b.name}")
            else:
                print(f"不是互相關注: {a.id} <-> {b.id}")
        self.stdout.write(self.style.SUCCESS(f'已自動建立 {count} 組聊天室'))
