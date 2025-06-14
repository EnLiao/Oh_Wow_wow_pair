import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';

// 加載專案根目錄的 .env
dotenv.config({ path: '../.env' });

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
