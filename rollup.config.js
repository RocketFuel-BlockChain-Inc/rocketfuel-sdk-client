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

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.cjs', format: 'cjs' },
      { file: 'dist/index.esm.js', format: 'esm' },
    ],
    external: ['crypto-js'],
    plugins: [...commonPlugins],
  },
  {
    input: 'src/standalone.ts',
    output: {
      file: 'dist/sdk.min.js',
      format: 'iife',
      name: 'RkflPlugin',
      banner: versionBanner,
      globals: {
        'crypto-js': 'CryptoJS',
      },
      plugins: [terser()],
    },
    external: ['crypto-js'],
    plugins: [...commonPlugins],
  },
]);
