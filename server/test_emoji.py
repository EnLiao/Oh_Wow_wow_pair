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
    
    # 模擬消息處理函數
    def process_message_with_emojis(message):
        import re
        print(f"\n處理消息: {message}")
        
        # 使用正則表達式找到所有表情符號標記
        emoji_pattern = r':([^:]+):'
        matches = list(re.finditer(emoji_pattern, message))
        print(f"找到的表情符號標記位置: {[(m.group(1), m.start(), m.end()) for m in matches]}")
        
        # 從後往前替換，避免位置偏移問題
        processed_message = message
        for match in reversed(matches):
            emoji_name = match.group(1)
            start_pos = match.start()
            end_pos = match.end()
            
            emoji = emojis.filter(name=emoji_name).first()
            if emoji:
                # 這裡可以替換為實際的表情符號圖片標籤或URL
                emoji_replacement = f"<img src='{emoji.image.url}' alt='{emoji_name}' class='custom-emoji'>"
                processed_message = processed_message[:start_pos] + emoji_replacement + processed_message[end_pos:]
                print(f"  匹配成功: {emoji_name} -> {emoji.image.url}")
            else:
                print(f"  未找到匹配: {emoji_name}")
        
        return processed_message
    
    # 測試不同的消息格式
    test_messages = [
        ":omuba: 你好 :omuba:",
        ":omuba::omuba:",
        "連續表情符號 :omuba::omuba::omuba: 測試",
        "混合文本 :omuba: 和 :omuba::omuba: 表情符號",
        "沒有表情符號的消息",
        ":不存在的表情:"
    ]
    
    for test_message in test_messages:
        processed = process_message_with_emojis(test_message)
        print(f"原始: {test_message}")
        print(f"處理後: {processed}")
        print("-" * 50)

if __name__ == "__main__":
    test_emoji_processing()
