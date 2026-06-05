import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
    base: './',
    plugins: [
        vue(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        modulePreload: false,
        rollupOptions: {
            input: path.resolve(__dirname, 'src/main.ts'),
            output: {
                entryFileNames: 'assets/index.js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: (assetInfo) => {
                    const name = assetInfo.name ?? '';
                    if (name.endsWith('.css'))
                        return 'assets/style.css';
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
});
