import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/zhuyanlin-shangou/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 超过 800KB 才提示（字体本身就大，不用每次警告）
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // 手动分包：把大型第三方库单独拆出来，改动业务代码不会让用户重新下载这些
        manualChunks: {
          'vendor-react':  ['react', 'react-dom'],
          'vendor-gsap':   ['gsap'],
          'vendor-ui':     ['@headlessui/react', 'lucide-react'],
          'vendor-jszip':  ['jszip'],
          'vendor-ogl':    ['ogl'],      // Aurora WebGL，懒加载后独立 chunk
        },
      },
    },
  },
})
