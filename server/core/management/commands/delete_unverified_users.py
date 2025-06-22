from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Delete users who have not verified their email within 1 minute after registration.'

    def handle(self, *args, **options):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        now = timezone.now()
        one_minute_ago = now - timedelta(minutes=1)
        # 假設 User 有 date_joined 欄位
        unverified_users = User.objects.filter(is_active=False, date_joined__lt=one_minute_ago)
        count = unverified_users.count()
        unverified_users.delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {count} unverified users.'))
