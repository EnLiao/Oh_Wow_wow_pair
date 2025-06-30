from django.core.management.base import BaseCommand
from chat.models import Sticker
from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageFont
import io
import os

class Command(BaseCommand):
    help = '創建預設的官方貼圖'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='刪除現有貼圖並重新創建',
        )

    def handle(self, *args, **options):
        if options['reset']:
            Sticker.objects.filter(is_official=True).delete()
            self.stdout.write(self.style.WARNING('已刪除現有官方貼圖'))

        # 預設貼圖資料（包含實際的表情符號）
        default_stickers = [
            {'name': '開心笑臉', 'category': 'emotion', 'emoji': '😊'},
            {'name': '大笑', 'category': 'emotion', 'emoji': '😂'},
            {'name': '愛心眼', 'category': 'emotion', 'emoji': '😍'},
            {'name': '眨眼', 'category': 'emotion', 'emoji': '😉'},
            {'name': '傷心', 'category': 'emotion', 'emoji': '😢'},
            {'name': '生氣', 'category': 'emotion', 'emoji': '😡'},
            {'name': '驚訝', 'category': 'emotion', 'emoji': '😲'},
            {'name': '思考', 'category': 'emotion', 'emoji': '🤔'},
            {'name': '愛心', 'category': 'symbol', 'emoji': '❤️'},
            {'name': '讚', 'category': 'gesture', 'emoji': '👍'},
            {'name': '讚爆', 'category': 'gesture', 'emoji': '👏'},
            {'name': '拜託', 'category': 'gesture', 'emoji': '🙏'},
            {'name': '波浪', 'category': 'gesture', 'emoji': '👋'},
            {'name': 'OK手勢', 'category': 'gesture', 'emoji': '👌'},
            {'name': '勝利', 'category': 'gesture', 'emoji': '✌️'},
            {'name': '貓咪', 'category': 'animal', 'emoji': '🐱'},
            {'name': '狗狗', 'category': 'animal', 'emoji': '🐶'},
            {'name': '熊熊', 'category': 'animal', 'emoji': '🐻'},
            {'name': '兔子', 'category': 'animal', 'emoji': '🐰'},
            {'name': '火焰', 'category': 'symbol', 'emoji': '🔥'},
            {'name': '閃電', 'category': 'symbol', 'emoji': '⚡'},
            {'name': '星星', 'category': 'symbol', 'emoji': '⭐'},
            {'name': '彩虹', 'category': 'symbol', 'emoji': '🌈'},
            {'name': '太陽', 'category': 'weather', 'emoji': '☀️'},
            {'name': '月亮', 'category': 'weather', 'emoji': '🌙'},
        ]

        created_count = 0
        for sticker_data in default_stickers:
            # 檢查是否已存在
            if not Sticker.objects.filter(
                name=sticker_data['name'], 
                is_official=True
            ).exists():
                try:
                    # 創建表情符號圖片
                    image_content = self.create_emoji_image(sticker_data['emoji'])
                    
                    sticker = Sticker.objects.create(
                        name=sticker_data['name'],
                        category=sticker_data['category'],
                        is_official=True
                    )
                    
                    # 保存圖片
                    filename = f"{sticker_data['name'].replace(' ', '_')}.png"
                    sticker.image.save(filename, ContentFile(image_content), save=True)
                    
                    created_count += 1
                    self.stdout.write(f"✓ 已創建貼圖: {sticker_data['name']}")
                    
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"✗ 創建貼圖失敗 {sticker_data['name']}: {e}")
                    )

        if created_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'成功創建了 {created_count} 個官方貼圖')
            )
        else:
            self.stdout.write(
                self.style.WARNING('沒有創建新的貼圖（可能已存在）')
            )

        # 顯示當前貼圖統計
        total_stickers = Sticker.objects.count()
        official_stickers = Sticker.objects.filter(is_official=True).count()
        
        self.stdout.write(f"\n貼圖統計:")
        self.stdout.write(f"  總貼圖數: {total_stickers}")
        self.stdout.write(f"  官方貼圖: {official_stickers}")
        self.stdout.write(f"  用戶貼圖: {total_stickers - official_stickers}")

    def create_emoji_image(self, emoji):
        """創建表情符號圖片"""
        try:
            # 創建 128x128 的圖片
            size = 128
            img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
            draw = ImageDraw.Draw(img)
            
            # 嘗試使用系統字體渲染表情符號
            try:
                # 在 macOS 上嘗試使用 Apple Color Emoji 字體
                font_paths = [
                    '/System/Library/Fonts/Apple Color Emoji.ttc',
                    '/Library/Fonts/Apple Color Emoji.ttc',
                    '/System/Library/Fonts/Helvetica.ttc'
                ]
                
                font = None
                for font_path in font_paths:
                    if os.path.exists(font_path):
                        try:
                            font = ImageFont.truetype(font_path, 80)
                            break
                        except:
                            continue
                
                if font is None:
                    font = ImageFont.load_default()
                
                # 計算文字位置
                bbox = draw.textbbox((0, 0), emoji, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                x = (size - text_width) // 2
                y = (size - text_height) // 2
                
                # 繪製表情符號
                draw.text((x, y), emoji, font=font, fill=(0, 0, 0, 255))
                
            except Exception as e:
                # 如果字體渲染失敗，創建一個簡單的彩色方塊
                colors = {
                    '😊': (255, 220, 93),   # 黃色
                    '😂': (255, 220, 93),   # 黃色
                    '😍': (255, 182, 193),  # 粉色
                    '❤️': (255, 69, 58),    # 紅色
                    '👍': (255, 220, 93),   # 黃色
                    '🔥': (255, 69, 58),    # 紅色
                    '⭐': (255, 204, 0),    # 金色
                }
                color = colors.get(emoji, (100, 149, 237))  # 預設藍色
                draw.ellipse([10, 10, size-10, size-10], fill=color)
                # 在中間繪製字母
                letter = emoji[0] if emoji else '?'
                draw.text((size//2-10, size//2-15), letter, fill=(255, 255, 255), font=font)
            
            # 轉換為 bytes
            img_io = io.BytesIO()
            img.save(img_io, format='PNG')
            img_io.seek(0)
            return img_io.read()
            
        except Exception as e:
            # 如果所有方法都失敗，創建一個簡單的彩色方塊
            img = Image.new('RGB', (128, 128), (100, 149, 237))
            img_io = io.BytesIO()
            img.save(img_io, format='PNG')
            img_io.seek(0)
            return img_io.read()
