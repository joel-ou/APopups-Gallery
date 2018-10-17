const merge = require("webpack-merge");
const common = require("./webpack.config.js");
const webpack = require("webpack");

module.exports = env => {
  return merge(common(env), {
    devtool: 'source-map',
    plugins: [
      new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')})
    ],
    mode: "production"
  });
}