import { defineConfig } from "cypress";
const codeCoverageTask = require('@bahmutov/cypress-code-coverage/plugin')

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
      webpackConfig: {
        mode: 'development',
        devtool: false,
        module: {
          rules: [
            {
              test: /\.(ts|tsx|js|jsx)$/,
              exclude: /node_modules|\.cy\.(ts|tsx|js|jsx)$/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [
                    '@babel/preset-env',
                    '@babel/preset-typescript',
                    'next/babel'
                  ],
                  plugins: [
                    'transform-class-properties',
                    'istanbul',
                  ],
                },
              },
            },
          ],
        },
      },
    },

    setupNodeEvents(on, config) {
      return Object.assign({}, config, codeCoverageTask(on, config));
    },
  },
});
