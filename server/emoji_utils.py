#!/usr/bin/env python
"""
表情符號處理工具函數
用於處理聊天消息中的自定義表情符號
"""

import re

def process_custom_emojis(message):
    """
    處理消息中的自定義表情符號
    
    Args:
        message (str): 原始消息文本
        
    Returns:
        str: 處理後的消息，表情符號標記被替換為HTML img標籤
    """
    if not message:
        return message
    
    # 使用正則表達式找到所有表情符號標記
    emoji_pattern = r':([^:]+):'
    matches = list(re.finditer(emoji_pattern, message))
    
    if not matches:
        return message
    
    # 動態導入以避免Django設置問題
    try:
        from chat.models import CustomEmoji
        # 獲取所有自定義表情符號
        emojis = CustomEmoji.objects.all()
        emoji_dict = {emoji.name: emoji for emoji in emojis}
    except ImportError:
        # 如果無法導入模型，返回原始消息
        return message
    
    # 從後往前替換，避免位置偏移問題
    processed_message = message
    for match in reversed(matches):
        emoji_name = match.group(1)
        start_pos = match.start()
        end_pos = match.end()
        
        if emoji_name in emoji_dict:
            emoji = emoji_dict[emoji_name]
            # 生成表情符號的HTML標籤
            emoji_html = f'<img src="{emoji.image.url}" alt="{emoji_name}" class="custom-emoji" style="width: 24px; height: 24px; vertical-align: middle;">'
            processed_message = processed_message[:start_pos] + emoji_html + processed_message[end_pos:]
    
    return processed_message

def extract_emoji_names(message):
    """
    從消息中提取所有表情符號名稱
    
    Args:
        message (str): 消息文本
        
    Returns:
        list: 表情符號名稱列表
    """
    if not message:
        return []
    
    emoji_pattern = r':([^:]+):'
    matches = re.findall(emoji_pattern, message)
    return matches

def validate_emoji_exists(emoji_name):
    """
    驗證表情符號是否存在
    
    Args:
        emoji_name (str): 表情符號名稱
        
    Returns:
        bool: 表情符號是否存在
    """
    try:
        from chat.models import CustomEmoji
        return CustomEmoji.objects.filter(name=emoji_name).exists()
    except ImportError:
        return False

# 測試函數
if __name__ == "__main__":
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

    # 現在可以安全地導入模型
    from chat.models import CustomEmoji

    # 測試消息
    test_messages = [
        ":omuba: 你好",
        ":omuba::omuba:",
        "連續表情 :omuba::omuba::omuba: 測試",
        "混合 :omuba: 文本 :omuba::omuba:",
        "沒有表情符號",
        ":不存在:"
    ]

    print("=== 表情符號處理工具測試 ===")
    for msg in test_messages:
        processed = process_custom_emojis(msg)
        emoji_names = extract_emoji_names(msg)
        print(f"原始: {msg}")
        print(f"提取的表情符號: {emoji_names}")
        print(f"處理後: {processed}")
        print("-" * 50)
