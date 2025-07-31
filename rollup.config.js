import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import vue from 'rollup-plugin-vue';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { defineConfig } from 'rollup';

const commonPlugins = [
  resolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    clean: true,
    useTsconfigDeclarationDir: true,
  }),
];

export default defineConfig([
  // ✅ Plain JS SDK (IIFE)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/sdk.min.js',
      format: 'iife',
      name: 'RkflPlugin',
      globals: {
        'crypto-js': 'CryptoJS',
      },
      plugins: [terser()],
    },
    external: ['crypto-js'],
    plugins: [...commonPlugins, terser()],
  },

  // ✅ React SDK (ESM)
  {
    input: 'src/react.tsx',
    output: {
      file: 'dist/react-sdk.js',
      format: 'esm',
    },
    external: ['react'],
    plugins: [...commonPlugins],
  },

  // ✅ Vue SDK (ESM)
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
