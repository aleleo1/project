import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';

export default defineConfig([
  // Main build
  {
    input: 'src/index.ts',
    external: ['solid-js', 'solid-js/web', 'd3-scale'], // Fixed: changed 'd3' to 'd3-scale'
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named'
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm'
      }
    ],
    plugins: [
      nodeResolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      }),
      babel({
        extensions: ['.ts', '.tsx'],
        babelHelpers: 'bundled',
        exclude: 'node_modules/**', // Add this to avoid processing node_modules
        presets: [
          ['babel-preset-solid', { generate: 'dom', hydratable: false }], // Moved first
          ['@babel/preset-typescript', { onlyRemoveTypeImports: true }],
          ['@babel/preset-env', { targets: { node: '14' } }]
        ]
      }),
      typescript({
        tsconfig: './tsconfig.json',
        noEmitOnError: true,
        declaration: false, // Add this since you're using dts plugin for declarations
        declarationMap: false
      })
    ]
  },
  // Types build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm'
    },
    plugins: [dts()],
    external: ['solid-js', 'solid-js/web', 'd3-scale'] // Fixed here too
  }
]);