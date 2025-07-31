import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import vue from 'rollup-plugin-vue';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const commonPlugins = [
  resolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    clean: true,
    useTsconfigDeclarationDir: true,
  }),
];

// Export Rollup config for multiple builds
export default defineConfig([
  // ✅ 1. IIFE Build for browser (Global usage via <script>)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/sdk.min.js',
      format: 'iife',
      name: 'RkflPlugin', // Becomes window.RkflPlugin
      globals: {
        'crypto-js': 'CryptoJS',
      },
      plugins: [terser()],
    },
    external: ['crypto-js'],
    plugins: [...commonPlugins],
  },

  // ✅ 2. React ESM Build
  {
    input: 'src/react.tsx',
    output: {
      file: 'dist/react-sdk.js',
      format: 'esm',
    },
    external: ['react'],
    plugins: [...commonPlugins],
  },

  // ✅ 3. Vue ESM Build
  {
    input: 'src/vue.ts',
    output: {
      file: 'dist/vue-sdk.js',
      format: 'esm',
    },
    external: ['vue'],
    plugins: [...commonPlugins, vue()],
  },
]);
