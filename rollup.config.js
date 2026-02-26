import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';
import pkg from './package.json';

dotenv.config();

const envVars = {
  'process.env.API_DOMAIN_PROD': JSON.stringify(process.env.API_DOMAIN_PROD),
  'process.env.API_DOMAIN_QA': JSON.stringify(process.env.API_DOMAIN_QA),
  'process.env.API_DOMAIN_PREPROD': JSON.stringify(process.env.API_DOMAIN_PREPROD),
  'process.env.API_DOMAIN_SANDBOX': JSON.stringify(process.env.API_DOMAIN_SANDBOX),
  'process.env.PAYMENT_APP_DOMAIN_PROD': JSON.stringify(process.env.PAYMENT_APP_DOMAIN_PROD),
  'process.env.PAYMENT_APP_DOMAIN_QA': JSON.stringify(process.env.PAYMENT_APP_DOMAIN_QA),
  'process.env.PAYMENT_APP_DOMAIN_PREPROD': JSON.stringify(process.env.PAYMENT_APP_DOMAIN_PREPROD),
  'process.env.PAYMENT_APP_DOMAIN_SANDBOX': JSON.stringify(process.env.PAYMENT_APP_DOMAIN_SANDBOX),
  'process.env.APP_DOMAIN_PROD': JSON.stringify(process.env.APP_DOMAIN_PROD),
  'process.env.APP_DOMAIN_QA': JSON.stringify(process.env.APP_DOMAIN_QA),
  'process.env.APP_DOMAIN_PREPROD': JSON.stringify(process.env.APP_DOMAIN_PREPROD),
  'process.env.APP_DOMAIN_SANDBOX': JSON.stringify(process.env.APP_DOMAIN_SANDBOX),
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'process.env.SDK_VERSION': JSON.stringify(pkg.version),
};

const commonPlugins = [
  replace({
    preventAssignment: true,
    values: envVars,
  }),
  resolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    clean: true,
    useTsconfigDeclarationDir: true,
  }),
];

const versionBanner = `/*! @rocketfuel/client v${pkg.version} | (c) Rocketfuel | MIT License */`;
const filePath = JSON.parse(envVars['process.env.NODE_ENV']) == 'production' ? 'dist': 'dist-qa';
console.debug("🚀 ~ filePath:", filePath)
export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        dir: filePath,
        format: 'cjs',
        exports: 'named',
        entryFileNames: 'index.cjs.js',
        chunkFileNames: '[name]-[hash].cjs.js',
        manualChunks: (id) => {
          if (id.includes('features/payin')) return 'payin';
          if (id.includes('features/zkp')) return 'zkp';
          return null;
        },
      },
      {
        dir: filePath,
        format: 'esm',
        exports: 'named',
        entryFileNames: 'index.esm.js',
        chunkFileNames: '[name]-[hash].esm.js',
        manualChunks: (id) => {
          if (id.includes('features/payin')) return 'payin';
          if (id.includes('features/zkp')) return 'zkp';
          return null;
        },
      },
    ],
    external: ['crypto-js'],
    plugins: [...commonPlugins],
  },
  {
    input: 'src/standalone.ts',
    preserveEntrySignatures: false,
    output: {
      file: `${filePath}/rkfl-transact-client.min.js`,
      format: 'iife',
      name: 'RkflPlugin',
      banner: versionBanner,
      inlineDynamicImports: true,
      plugins: [terser()],
    },
    plugins: [...commonPlugins],
  },
]);
