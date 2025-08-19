#!/usr/bin/env python
"""
測試客戶端表情符號處理邏輯
"""

import re

def simulate_emoji_processing(message, custom_emojis):
    """模擬客戶端的表情符號處理邏輯"""
    print(f"處理消息: {message}")
    
    # 檢查訊息中是否包含自定義表情符號標記（格式：:emoji_name:）
    customEmojiRegex = r':([^:]+):'
    matches = list(re.finditer(customEmojiRegex, message))
    
    if matches:
        # 創建處理後的消息內容，將自定義表情符號替換為HTML標籤
        processed_message = message
        replacements = []
        
        # 收集所有需要替換的表情符號
        for match in matches:
            full_match = match.group(0)
            emoji_name = match.group(1)
            
            # 查找對應的自定義表情符號
            custom_emoji = next((e for e in custom_emojis if e['name'] == emoji_name), None)
            if custom_emoji:
                replacements.append({
                    'original': full_match,
                    'replacement': f'<img src="{custom_emoji["image"]}" alt="{emoji_name}" class="custom-emoji-inline" data-emoji-id="{custom_emoji["id"]}" style="width: 24px; height: 24px; vertical-align: middle;">'
                })
        
        # 從後往前進行替換，避免位置偏移
        for i in range(len(matches) - 1, -1, -1):
            match = matches[i]
            full_match = match.group(0)
            replacement_data = next((r for r in replacements if r['original'] == full_match), None)
            if replacement_data:
                start = match.start()
                end = match.end()
                processed_message = processed_message[:start] + replacement_data['replacement'] + processed_message[end:]
        
        print(f"處理後: {processed_message}")
        return processed_message
    else:
        print(f"無表情符號，保持原樣: {message}")
        return message

if __name__ == "__main__":
    # 模擬自定義表情符號數據
    custom_emojis = [
        {
            'id': 1,
            'name': 'omuba',
            'image': '/media/custom_emojis/89D7AB20-AE6D-4351-A098-659E96F92842.JPG'
        }
    ]
    
    # 測試消息
    test_messages = [
        ":omuba: 你好",
        ":omuba::omuba:",
        "連續表情 :omuba::omuba::omuba: 測試",
        "混合 :omuba: 文本 :omuba::omuba:",
        "沒有表情符號",
        ":不存在:"
    ]
    
    print("=== 客戶端表情符號處理邏輯測試 ===")
    for msg in test_messages:
        simulate_emoji_processing(msg, custom_emojis)
        print("-" * 50)
