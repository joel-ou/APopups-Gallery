const merge = require("webpack-merge");
const common = require("./webpack.config.js");
const path  = require("path");

module.exports = env => {
  return merge(common(env), {
    devtool: 'inline-source-map',
    devServer: {
      contentBase: path.resolve(__dirname, 'dist'),
      port: 80,
      host: "127.0.0.1"
    },
    mode: "development"
  });
}