// 簡單的對稱加密工具，使用 Web Crypto API
// 實際專案中建議使用更安全的 E2EE 方案如 Signal Protocol

class ChatCrypto {
    constructor() {
        this.keyCache = new Map();
    }

    // 生成聊天室金鑰
    async generateRoomKey(roomId) {
        if (this.keyCache.has(roomId)) {
            return this.keyCache.get(roomId);
        }

        const key = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );

        this.keyCache.set(roomId, key);
        return key;
    }

    // 加密訊息
    async encryptMessage(message, roomId) {
        try {
            const key = await this.generateRoomKey(roomId);
            const encoder = new TextEncoder();
            const data = encoder.encode(message);
            
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            
            const encrypted = await window.crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: iv,
                },
                key,
                data
            );

            // 將 IV 和加密資料組合
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);

            // 轉換為 base64
            return btoa(String.fromCharCode(...combined));
        } catch (error) {
            console.error('加密失敗:', error);
            return message; // 失敗時回傳原文
        }
    }

    // 解密訊息
    async decryptMessage(encryptedMessage, roomId) {
        try {
            const key = await this.generateRoomKey(roomId);
            
            // 從 base64 轉回
            const combined = new Uint8Array(atob(encryptedMessage).split('').map(c => c.charCodeAt(0)));
            
            // 分離 IV 和加密資料
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);

            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv,
                },
                key,
                encrypted
            );

            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('解密失敗:', error);
            return '[加密訊息]'; // 解密失敗顯示占位符
        }
    }

    // 清除金鑰（登出時）
    clearKeys() {
        this.keyCache.clear();
    }
}

export default ChatCrypto;
