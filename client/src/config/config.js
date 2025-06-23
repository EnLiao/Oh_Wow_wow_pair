// 環境配置文件

const isDevelopment = process.env.NODE_ENV === 'development';

export const config = {
  // API 基礎 URL
  API_BASE_URL: isDevelopment 
    ? 'http://localhost:8000' 
    : window.location.origin,
    
  // WebSocket 基礎 URL  
  WS_BASE_URL: isDevelopment 
    ? 'ws://localhost:8001' 
    : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
    
  // 其他配置
  MAX_RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY: 5000,
  MESSAGE_LOAD_TIMEOUT: 100
};
