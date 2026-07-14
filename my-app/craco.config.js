// js/my-app/craco.config.js

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const fs = require('fs');
const path = require('path');

class CopyToAssetsPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('CopyToAssetsPlugin', () => {
      const buildPath = compiler.options.output.path;
      const jsSrc = path.join(buildPath, 'js/app_bundle.js');
      const cssSrc = path.join(buildPath, 'css/app_bundle.css');
      const jsDest = path.resolve(__dirname, '../assets/js/app_bundle.js');
      const cssDest = path.resolve(__dirname, '../assets/css/app_bundle.css');
      
      if (!fs.existsSync(path.dirname(jsDest))) fs.mkdirSync(path.dirname(jsDest), { recursive: true });
      if (!fs.existsSync(path.dirname(cssDest))) fs.mkdirSync(path.dirname(cssDest), { recursive: true });
      
      if (fs.existsSync(jsSrc)) fs.copyFileSync(jsSrc, jsDest);
      if (fs.existsSync(cssSrc)) fs.copyFileSync(cssSrc, cssDest);
    });
  }
}

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      if (env === "production") {
        webpackConfig.optimization.splitChunks = false;
        webpackConfig.optimization.runtimeChunk = false;

        webpackConfig.output.filename = "js/app_bundle.js";
        webpackConfig.output.chunkFilename = "js/[name].chunk.js";

        const miniCssExtractPlugin = webpackConfig.plugins.find(
          (plugin) => plugin instanceof MiniCssExtractPlugin
        );
        if (miniCssExtractPlugin) {
          miniCssExtractPlugin.options.filename = "css/app_bundle.css";
          miniCssExtractPlugin.options.chunkFilename = "css/[name].chunk.css";
        }
        
        webpackConfig.plugins.push(new CopyToAssetsPlugin());
      }
      return webpackConfig;
    },
  },
};
