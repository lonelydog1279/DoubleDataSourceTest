import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({mode}) => {
    const isUseDevMode = mode === 'development';
    const env = loadEnv(mode, process.cwd())

    return {
        plugins: [
            vue(),
            qiankun('vue-qiankun-element', {
                useDevMode: isUseDevMode
            })
        ],
        sourcemap: isUseDevMode,
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src')
            }
        },
        server: {
            port: 5173,
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        },
        // 从环境变量读取 base URL
        base: env.VITE_BASE_URL || '/dual-datasource-test/',
        build: {
            // chunk 大小警告阈值
            chunkSizeWarningLimit: 800,

            rollupOptions: {
                output: {
                    // 手动分割 chunk，将大型依赖单独打包
                    manualChunks: {
                        // Vue 核心库
                        'vue-vendor': ['vue', 'vue-router'],
                        // Element Plus 单独打包
                        'element-plus': ['element-plus'],
                        // 工具库
                        'utils': ['axios']
                    },
                    // 自定义文件名格式
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    entryFileNames: 'assets/js/[name]-[hash].js',
                    assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
                }
            }
        }
    }
})
