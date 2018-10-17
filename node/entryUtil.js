const fs = require("fs");
const path  = require("path");
const PageEntity  = require("./pageEntity");
const glob = require("glob");
const htmlConfigUtil = require("./htmlConfigUtil");

let srcDir = path.resolve('src');
let pagesDir = path.join(srcDir, 'pages');

function isDirectory(file){
    return fs.statSync(file).isDirectory();
}
function recursionFiles(){
    let pageArray = [];
    let files = glob.sync(`${path.join(srcDir, 'pages', '**', '*.js')}`);
    for(let file of files){
        let entiryName = file.substring(pagesDir.length+1, file.lastIndexOf("/"));
        let pageEntiry = new PageEntity(entiryName, file);
        let curDir = file.substring(0, file.lastIndexOf(path.sep));
        //如果在模块路径下找不到template.html，那么就使用defaultTemplate.html
        let templateFilePath = path.join(curDir, "template.html");
        if(fs.existsSync(templateFilePath)){
            htmlConfigPath.template = templateFilePath;
        }
        //加载html的json配置
        let htmlConfig = htmlConfigUtil.getByPageName(entiryName);
        if(htmlConfig != null){
            pageEntiry.htmlConfig = htmlConfig;
        }
        pageArray.push(pageEntiry);
    }
    return pageArray;
}

module.exports = {
    getPageArray(){
        return recursionFiles();
    }
}