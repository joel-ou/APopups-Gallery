import { consts } from "./common";

export const go = (url, params)=>{
    url = consts.baseUri+url;
    if(params){
        url += '?';
    }
    for(let name in params){
        url += url.endsWith('?')?'':'&';
        url += `${name}=${params[name]}`;
    }
    location = url;
}

export const get = (key, defaultVal)=>{
    let search = location.search;
    search = search.substr(1);
    let params = search.split('&');
    const map = new Map();
    for(let param of params){
        if(param === ""){
            continue;
        }
        const array = param.split('=');
        map.set(array[0], array[1]);
    }
    if(key){
        let val = map.get(key);
        return val?val:defaultVal;
    }
    return map;
}