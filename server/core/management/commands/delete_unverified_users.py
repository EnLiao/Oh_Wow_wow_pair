from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Delete users who have not verified their email within 1 minute after registration.'

    def handle(self, *args, **options):
        now = timezone.now()
        one_minute_ago = now - timedelta(minutes=1)
        # 假設 User 有 date_joined 欄位
        unverified_users = User.objects.filter(is_active=False, date_joined__lt=one_minute_ago)
        count = unverified_users.count()
        unverified_users.delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {count} unverified users.'))
