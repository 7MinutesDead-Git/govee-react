import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    build: {
        outDir: 'build' // Changed output folder, like in CRA
    },
    plugins: [
        react(),
        viteTsconfigPaths()
    ]
})
