import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";
export default defineConfig(({ mode }) => {
    const { VITE_APP_PORT, VITE_APP_OPEN, VITE_APP_API, VITE_APP_API_TARGET, VITE_BASE_URL } = loadEnv(mode, process.cwd());
    return {
        base: VITE_BASE_URL,
        plugins: [
            react()
        ],
        resolve: {
            alias: {
                "@": path.resolve("./src")
            },
        },
        // 服务器配置
        server: {
            host: '0.0.0.0',
            port: Number(VITE_APP_PORT),
            strictPort: true, // 端口被占用直接退出
            open: Boolean(VITE_APP_OPEN), // 在开发服务器启动时自动在浏览器中打开应用程序
            proxy: {
                [VITE_APP_API]: {
                    target: VITE_APP_API_TARGET,
                    changeOrigin: true, // 跨域配置
                    rewrite: (path) => path.replace(new RegExp(VITE_APP_API), '')
                }
            }
        },
    };
});
