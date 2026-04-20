import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // Docker 환경에서 파일 변경 감지를 위해 필수!
    },
    host: true, // Docker 컨테이너 외부(브라우저)에서 접속 허용
    strictPort: true,
    port: 5173, // Vite 기본 포트 고정
server: {
      watch: {
        usePolling: true, 
      },
      host: true, 
      strictPort: true,
      port: 5173, 
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        clientPort: 80, 
      },
      proxy: {
        "/api": {
          target: "http://backend:3000", // 도커 네트워크 상의 백엔드 서비스명
          changeOrigin: true,
        },
      },
    },
  },
})