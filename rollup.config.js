import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/sdk.min.js',
    format: 'iife',
    name: 'RkflPlugin',
    plugins: [terser()],
    globals: {
      'crypto-js': 'CryptoJS',
    }
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      clean: true,
    }),
    terser(),
  ],
};
