from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Create sample stickers for testing'

    def handle(self, *args, **options):
        from ...models import Sticker
        # 建立一些示範貼圖（沒有實際圖片檔案，只是資料結構）
        sample_stickers = [
            {'name': '開心', 'category': 'emotions'},
            {'name': '難過', 'category': 'emotions'},
            {'name': '生氣', 'category': 'emotions'},
            {'name': '愛心', 'category': 'love'},
            {'name': '破碎的心', 'category': 'love'},
            {'name': '讚', 'category': 'reactions'},
            {'name': 'OK', 'category': 'reactions'},
        ]
        for sticker_data in sample_stickers:
            sticker, created = Sticker.objects.get_or_create(
                name=sticker_data['name'],
                defaults={
                    'category': sticker_data['category'],
                    'is_official': True
                }
            )
            if created:
                self.stdout.write(f'建立貼圖: {sticker.name}')
            else:
                self.stdout.write(f'貼圖已存在: {sticker.name}')
        self.stdout.write(self.style.SUCCESS('貼圖建立完成！'))
