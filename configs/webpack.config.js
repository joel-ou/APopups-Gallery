const path  = require("path");
const CleanWebpackPlugin  = require("clean-webpack-plugin");
const HtmlWebpackPlugin  = require("html-webpack-plugin");
const recursionPages = require("./../node/entryUtil");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

var rootDir = path.join(__dirname, '..');
var srcDir = path.join(__dirname, '..', 'src');
var distDir = path.join(__dirname, '..', 'dist');

let entry = {};
let entryHtmlPlugins = [];
let pageEntitys = recursionPages.getPageArray();
for(let curEntity of pageEntitys){
  entry[curEntity.entiryName] = curEntity.entiryFile;
  let htmlConfig = curEntity.htmlConfig;
  entryHtmlPlugins.push(new HtmlWebpackPlugin(Object.assign({
    filename: `${curEntity.entiryName}.html`,
    template: path.join(srcDir, 'defaultHtmlTemp.html'),
    chunks: [curEntity.entiryName]
  }, htmlConfig)));
}

let resolve = {
  extensions: ['.js', '.vue', '.json'],
  alias: {
    'vue$': 'vue/dist/vue.runtime.esm.js',
    '@': srcDir,
    '@icons': path.join(srcDir, 'imgs', 'icons')
  },
  symlinks: false
}

let rules = [];
const include = [srcDir, path.resolve(rootDir, 'node_modules')];
rules.push({test: /\.js$/, include, loader: 'babel-loader'});
rules.push({test: /\.vue$/, include, loader: 'vue-loader'});
rules.push({test: /\.css$/, include, use: ['vue-style-loader', 'css-loader']});
rules.push({test: /\.scss$/, include, use: ['vue-style-loader', 'css-loader', 
  {
    loader:'sass-loader',options: {
      includePaths: [path.join(srcDir, 'css')]
    }
  }
]});
rules.push({
  test: /\.(png|jpg|gif)$/, 
  include, 
  use: [{loader: 'url-loader', options: {limit: 8192, outputPath: 'imgs/'}}], 
});

let plugins = [];
plugins = plugins.concat(entryHtmlPlugins);
plugins.push(new VueLoaderPlugin());

module.exports = env => {
  distDir = distDir;
  rootDir = rootDir;
  plugins.push(new CopyWebpackPlugin([{ from: path.join(srcDir, 'imgs/favicon.ico'), to: path.join(distDir, 'favicon.ico') }]));
  if(!env || !env.dontClean){
    plugins.push(new CleanWebpackPlugin([distDir], {root: rootDir}));
  }
  return {
    context: path.join(srcDir, 'pages'),
    entry,
    output: {
      filename: 'js/[name].[chunkhash].js',
      chunkFilename: 'js/[id].[chunkhash].js',
      path: distDir,
      publicPath: env&&env.product?"/APopupsGalleryDemo/":"/dist/"
    },
    resolve,
    plugins,
    module: {rules}
  }
};