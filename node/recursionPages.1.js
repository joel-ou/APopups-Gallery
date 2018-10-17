const fs = require("fs");
const path  = require("path");
const PageEntity  = require("./pageEntity");

let srcDir = path.resolve('src');
let pagesDir = path.join(srcDir, 'pages');

function isDirectory(file){
    return fs.statSync(file).isDirectory();
}
function recursionFiles(pageArray, dir, fileNameParam){
    let curDir = dir==null||dir==""?pagesDir:dir;
    let files = fs.readdirSync(curDir);
    for(let file of files){
        let nextDir = path.join(curDir, file);
        if(isDirectory(nextDir)){
            let fileName = `${fileNameParam?`${fileNameParam}/`:''}${file}`;
            recursionFiles(pageArray, nextDir, fileName);
            continue;
        }
        let pageEntiry = new PageEntity(fileNameParam, path.join(fileNameParam, file));
        //加载html的json配置
        let htmlConfigPath = path.join(curDir, "htmlConfig.json");
        let templateFilePath = path.join(curDir, "template.html");
        if(fs.existsSync(templateFilePath)){
            htmlConfigPath.template = templateFilePath;
        }
        if(fs.existsSync(htmlConfigPath)){
            pageEntiry.htmlConfigJson = require(htmlConfigPath);
        }
        pageArray.push(pageEntiry);
    }
}

module.exports = {
    getPageArray(){
        let pageArray = [];
        recursionFiles(pageArray, "", "");
        return pageArray;
    }
}