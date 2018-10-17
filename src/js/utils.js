import {consts} from "./common";
import {go} from "./locationUtil";
import axios from "axios";

const RE = (()=>{
    let result = {
        isBrowser: false,
        isNodeJS: false
    }
    result.isBrowser = typeof window !== "undefined";
    result.isNodeJS = typeof global !== "undefined";
    return result;
})();

export function isIOS(){
    if(RE.isBrowser){
        let userAgent = window.navigator.userAgent;
        return userAgent.indexOf("iPhone") > -1;
    }
}
const isSafari = ()=>{
    if(RE.isBrowser){
        let userAgent = window.navigator.userAgent;
        return userAgent.indexOf("AppleWebKit") > -1;
    }
}

export const dateUtil = {
    toAgoDate(dateStr){
        const date = new Date(dateStr).getTime();
        const now = new Date().getTime();
        const cal = (now-date)/1000;
        const d = parseInt(cal/60/60/24);//天
        if(d >= 1){
            return `${d}天前`;
        }
        const h = parseInt(cal/60/60); //小时
        if(h >= 1){
            return `${h}小时前`;
        }
        const m = parseInt(cal/60%60); //分钟
        if(m >= 1){
            return `${m}分前`;
        }
        const s = parseInt(cal%60); //秒
        if(s >= 1){
            return `${s}秒前`;
        }
        return '';
    },
    toDateObj(dateStr){
        let date = dateStr.split(" ");
        let time = date[1].split(":");
        date = date[0].split("-");
        const dateObj = new Date();
        dateObj.setFullYear(date[0]);
        dateObj.setMonth(parseInt(date[1])-1);
        dateObj.setDate(date[2]);
        dateObj.setHours(time[0]);
        dateObj.setMinutes(time[1]);
        dateObj.setSeconds(time[2]);
        return dateObj;
    }
}

/**
 * ajax相关功能
 */
axios.defaults.baseURL = `${consts.baseUri}`;
/**
 * 请求拦截
 */
axios.interceptors.request.use(function (config) {
    return config;
}, function (error) {
    return Promise.reject(error);
});
/**
 * 响应拦截
 */
axios.interceptors.response.use(function (response) {
    /**
     * 检测是否需要登录，如果需要登录则跳转到登录页去!
     */
    if(response.data && response.data['notLogged']){
        let backUri = `${location.pathname}${location.search}`;
        go('login.html', {backUri: btoa(backUri)});
        return;
    }
    return response;
}, function (error) {
    return Promise.reject(error);
});
export const ajax = {
    /**
     * ajax-post请求
     * @param params
     * @returns Promise<Any>
     */
    post(url, params){
        return axios.post(url, params).then(res=>{
            return res;
        });
    },    
    /**
     * ajax-get请求
     * @param params
     * @returns Promise<Any>
     */
    get(url, params){
        return axios.get(url, params).then(res=>{
            return res;
        });
    }
}