/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'prompt',
            includeAssets: ['apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'NutriVision',
                short_name: 'NutriVision',
                description: 'Contador de calorías con IA para análisis de alimentos',
                start_url: '/',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#16a34a',
                lang: 'en',
                scope: '/',
                orientation: 'portrait',
                icons: [
                    { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                    { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    },
});
