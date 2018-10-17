const htmlConfig = require("./json/htmlConfig.json");

module.exports = {
    getByPageName(pageName){
        pageName = pageName.replace(/\//g, ".");
        let config = htmlConfig[pageName];
        if(config == null || !(config instanceof Object) || 
                Object.keys(config).length <=0 ){
            console.warn(`未找到 ${pageName} 页面相关的配置，请检查htmlConfig.json`);
        }
        return config;
    }
}