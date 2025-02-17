import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/ai-coding-prompt-builder/', // 保持base配置不变
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    }
})