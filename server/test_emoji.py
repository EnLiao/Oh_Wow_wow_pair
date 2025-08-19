#!/usr/bin/env python

import os
import sys
import django
from pathlib import Path

# 添加Django項目到Python路徑
project_path = Path(__file__).resolve().parent
sys.path.insert(0, str(project_path))

# 設置Django環境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wowpair.settings')
django.setup()

from chat.models import CustomEmoji

# 測試自定義表情符號處理
def test_emoji_processing():
    print("=== 測試自定義表情符號處理 ===")
    
    # 獲取所有自定義表情符號
    emojis = CustomEmoji.objects.all()
    print(f"找到 {emojis.count()} 個自定義表情符號:")
    for emoji in emojis:
        print(f"  - {emoji.name} (所有者: {emoji.owner})")
        print(f"    圖片URL: {emoji.image.url}")
        print(f"    完整路徑: http://localhost:8000{emoji.image.url}")
    
    # 模擬消息處理
    test_message = ":omuba: 你好 :omuba:"
    print(f"\n測試消息: {test_message}")
    
    import re
    emoji_pattern = r':([^:]+):'
    matches = re.findall(emoji_pattern, test_message)
    print(f"找到的表情符號標記: {matches}")
    
    for match in matches:
        emoji = emojis.filter(name=match).first()
        if emoji:
            print(f"  匹配成功: {match} -> {emoji.image.url}")
        else:
            print(f"  未找到匹配: {match}")

if __name__ == "__main__":
    test_emoji_processing()
