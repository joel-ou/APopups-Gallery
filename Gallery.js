/**
 * APopups-Gallery 1.1.0 beta
 * Author: joel.ou
 * Mail: 8019893@qq.com
 * Date: 2018年9月01日
 * License: MIT
 * Github: https://github.com/joel-ou/APopups-Gallery
 * Demo: https://joel-ou.github.io/APopupsGalleryDemo/
 */
import Hammer from "hammerjs";

/**
 * 配置
 */
const DEFAULT_OPTIONS = {
    /**
     * 最大缩放比例
     */
    maxScale: 3,
    /**
     * 最小缩放比例
     */
    minScale: 0,
    /**
     * 下拉关闭的触发的阀值，百分比，0-1
     */
    closeThreshold: 0.1
};
/**
 * 常量
 */
const AXIS_SYMBOL = ['x', 'y'];

/**
 * gallery类，主要手势处理，数值计算，以及动作限制，不做DOM操作。
 */
export default class Gallery {
    /**
     * @param {Element} touchArea 
     * @param {Object} options 自定义配置
     */
    constructor(touchArea, options){
        /**
         * 触摸交互区域
         */
        this.touchArea = touchArea;
        /**
         * 配置参数
         */
        this.options = {};
        /**
         * images load states
         */
        this.imageLoadState = [];

        Object.assign(this.options, DEFAULT_OPTIONS, options);
        /**
         * 实例化手势计算器
         */
        this.calculator = new GestureCalculator(this.touchArea, this.options);

        this.singleTapWaitingId;

        this.init();
    }

    init(){
        if(this.manager){
            return;
        }
        this.manager = new Hammer.Manager(this.touchArea);
        this.manager.add(new Hammer.Pan({threshold: 0, pointers: 0}));
        this.manager.add(new Hammer.Pinch({ threshold: 0.05 })).recognizeWith(this.manager.get('pan'));
        this.manager.add(new Hammer.Swipe()).recognizeWith(this.manager.get('pan'));
        this.manager.add(new Hammer.Tap({event:'doubletap', taps: 2}));
        this.manager.add(new Hammer.Tap({event:'tap'}));
    }

    /**
     * 绑定手势事件
     * @param {String} eventName 需要绑定的事件名称
     * @param {Function} callback 
     */
    on(eventName, callback){
        let proxy = this.events[eventName];
        if(!proxy){
            throw Error(`unknown event '${eventName}'`);
        }
        this.events.callbacks[eventName] = callback;
        proxy.call(this);
    }

    updateImageIndex(newIndex){
        this.calculator.curImgIndex = newIndex;
    }

    setImagesNumber(number){
        this.calculator.imagesNumber = number;
        this.calculator.initValues();
        this.imageLoadState = new Array(number);
    }

    setImageLoaded(index){
        this.imageLoadState[index] = true;
    }

    trigger(eventName, e){
        let eventFunc = this.events.functions[eventName];
        let callback = this.events.callbacks[eventName];
        return eventFunc.call(this, (result)=>{
            e.preventDefault();
            return callback({result, e});
        }, e);
    }

    correct(){
        return {
            correct: this.calculator.correct().correct, 
            scale: this.calculator.get('scale'), 
            slide: this.calculator.get('slide')
        };
    }

    resetGallery(){
        this.calculator.initValues();
        this.calculator.curImgIndex = 0;
        this.imageLoadState = [];
    }

    imageIsLoaded(){
        // const el = this.touchArea.childNodes[this.calculator.curImgIndex];
        // const x = Number.parseInt(el.naturalWidth);
        // const y = Number.parseInt(el.naturalHeight);
        // return x>0&&y>0;
        // const size = this.calculator.getImgSize()
        // return size.x>0&&size.y>0;
        return this.imageLoadState[this.calculator.curImgIndex];
    }

    doClose(){
        this.events.callbacks['close']({close:true});
        this.resetGallery();
    }
}

const fn = Gallery.prototype;

/**
 * events
 */
fn.events = {
    /**
     * 滑动事件
     * @param {Function} callback {distance:[x,y], org} 
     * org 是 hammerjs的事件对象
     */
    slide(){
        this.manager.on('panstart panmove', e=> {
            if(!this.imageIsLoaded()){
                return;
            }
            this.trigger('slide', e);
        });
    },
    /**
     * 捏的手势事件
     * @param {Function} callback 
     */
    pinch(){
        this.manager.on('pinchstart pinchmove', e=> {
            if(!this.imageIsLoaded()){
                return;
            }
            this.trigger('pinch', e);
        });
    },
    swipe(){
        this.manager.on('swipe', e=>{
            this.trigger('swipe', e);
        });
    },
    doubletap(){
        this.manager.on('doubletap', e=>{
            if(!this.imageIsLoaded()){
                return;
            }
            this.trigger('doubletap', e);
        });
    },
    tap(){
        this.manager.on('tap', e=>{
            this.trigger('tap', e);
        });
    },
    actionend(){
        this.manager.on('pinchcancel pinchend', e=>{
            if(!this.imageIsLoaded()){
                return;
            }
            this.trigger('actionend', e);
        });
        this.manager.on('pancancel panend', e=>{
            if(!this.imageIsLoaded()){
                return;
            }
            if(!this.trigger('close', e)){
                return;
            }
            this.trigger('actionend', e);
        });
    },
    close(){
    }
}

/**
 * 事件所对应的处理方法。分开的好处是可以随意触发对应的事件方法。
 */
fn.events.functions = {};
Object.assign(fn.events.functions, {
    /**
     * 滑动事件方法
     * @param {Object} callback 
     * @param {Object} e 
     */
    slide(callback, e){
        if(this.isLock){return;}
        const isStart = e.type==='panstart';
        if(isStart && this.calculator.get('scale') === 1){
            this.slideDirection = Math.abs(e.deltaX)>Math.abs(e.deltaY)?'x':'y';
        }
        this.calculator.slide((this.slideDirection||'x')==='x'?e.deltaX:0, (this.slideDirection||'y')==='y'?e.deltaY:0, isStart);
        callback({slide:this.calculator.get('slide'), bound: this.calculator.checkBound(null, null, true)});
    },
    /**
     * 捏的事件方法
     * @param {Object} callback 
     * @param {Object} e 
     */
    pinch(callback, e){
        this.slideDirection = '';
        const isStart = e.type==='pinchstart';
        if(isStart){this.calculator.position(e.center);}
        this.calculator.zoom(Number.parseFloat(e.scale), isStart);
        callback({lastActionData: this.calculator.getLastActionData('scale'), scale: this.calculator.get('scale'), 
            slide: this.calculator.get('slide'), maxScale: this.calculator.scaleActMaxVal});
    },
    /**
     * 快速滑动的事件方法
     * @param {Object} callback 
     * @param {Object} e 
     */
    swipe(callback, e){
        let slideStartDataX = this.calculator.getLastActionData('slide').x;
        let boundX = this.calculator.checkBound(null, {x: slideStartDataX+e.deltaX, y:0}, true).x;
        if(!this.calculator.switchThreshold(e.deltaX) && boundX.isOver && Math.abs(e.deltaX) <= Math.abs(boundX.number)){
            let direction;
            if(e.direction === Hammer.DIRECTION_LEFT){
                direction = 'next';
            }else if(e.direction === Hammer.DIRECTION_RIGHT){
                direction = 'previous';
            }
            let switchObj = this.calculator.switch(direction||false, direction);
            switchObj.isImageLoaded = this.imageIsLoaded();
            callback({switchObj}, e);
            return;
        }
        if(!this.imageIsLoaded()){
            return;
        }
        let deltaTime = e.deltaTime;
        let scale = this.calculator.get('scale');
        if(deltaTime > 200 || scale <= 1){
            return;
        }
        let isOverBound = this.calculator.swipe(e.deltaX, e.deltaY, deltaTime);
        callback({slide: this.calculator.get('slide'), isOverBound}, e);
    },
    /**
     * 双击的事件方法
     * @param {Object} callback 
     * @param {Object} e 
     */
    doubletap(callback, e){
        this.slideDirection = '';
        if(this.singleTapWaitingId){
            clearTimeout(this.singleTapWaitingId);
            this.singleTapWaitingId = null;
        }
        const scale = this.calculator.get('scale');
        if(scale < 3){
            this.calculator.position(e.center);
            this.calculator.zoom((3-scale)+1, true);
            this.calculator.correct(3);
        } else {
            this.calculator.initValues();
        }
        callback({scale: this.calculator.get('scale'), slide: this.calculator.get('slide')});
    },
    tap(callback, e){
        this.singleTapWaitingId = setTimeout(() => {
            if(!this.singleTapWaitingId){return;}
            this.singleTapWaitingId = null;
            callback({});
        }, 200);
    },
    /**
     * 持续动作结束的事件方法，适用于滑动，捏动作的结束事件。
     * @param {Object} callback 
     * @param {Object} e 
     */
    actionend(callback, e){
        if(this.isLock){
            return;
        }
        this.isLock = true;
        setTimeout(() => {
            this.isLock = false;
        }, 200);
        if(this.calculator.getLastActionData('scale') <= 1 && this.calculator.get('scale') < 1 && this.calculator.scaleActMaxVal <= 1){
            this.doClose();
            return;
        }
        this.calculator.scaleActMaxVal = 0;
        const before = this.calculator.get('slide').slice();
        const result = this.calculator.correct();
        let switchObj = {switch: false};
        if((e.type === 'pancancel' || e.type === 'panend') && e.pointers.length == 1 && result.bound 
            && result.bound.x.isOver && Math.abs(e.deltaX) <= Math.abs(result.bound.x.number)){
            let direction = before.x>0?'previous':'next';
            let isSwitch = this.calculator.switchThreshold(result.bound.x.number);
            switchObj = this.calculator.switch(isSwitch, direction);
        }
        callback({
            slide: this.calculator.get('slide'),
            scale: this.calculator.get('scale'),
            correct: result.correct,
            switchObj
        });
    },
    /**
     * 相册关闭事件方法
     * @param {Object} callback 
     * @param {Object} e  
     */
    close(callback, e){
        const slideY = this.calculator.get('slide').y;
        const bound = this.calculator.checkBound(null, null, true).y;
        const touchAreaSize = this.calculator.getTouchAreaSize().y||window.innerHeight;
        const closeThreshold = this.options.closeThreshold;
        if(this.calculator.get('scale') >=1 && bound.isOver && Math.abs(bound.number) >= (touchAreaSize*closeThreshold) && slideY > 0 && 
            e.deltaY <= Math.abs(bound.number)){
            this.doClose();
            return false;
        }
        return true;
    }
});
/**
 * 用于存放所有事件的回调函数
 */
fn.events.callbacks = {};

/**
 * 计算器父类。
 */
class Calculator {
    
    constructor(touchArea, options){
        this.touchArea = touchArea;
        //用户配置信息
        this.options = options;
        //图片的当前索引
        this.curImgIndex = 0;
        //图片总数
        this.imagesNumber = 0;

        //计算数据
        this.datas = {
            slide: {
                x: 0,
                y: 0,
                slice: function(){
                    return {x: this.x, y: this.y};
                },
                init: function(){
                    this.x = 0;
                    this.y = 0;
                }
            },
            scale: 1,
            lastScale: 1,
            lastActionDatas: {
                slide: {
                    x: 0,
                    y: 0
                },
                scale: 1
            },
            track: null
        };
    }

    /**
     * 舍入，保留指定的位数，默认保留2位小数
     * @param {Number} num 
     * @param {Number} scale 保留的位数
     */
    static round(num, scale){
        num = num instanceof Number?val:Number.parseFloat(num);
        if(Number.isNaN(num)){
            throw new Error(`${num} 不是有效的数值！`);
        }
        return Number.parseFloat(num.toFixed(scale||2));
    }

    /**
     * 获取手势触碰区域的尺寸
     */
    getTouchAreaSize(){
        const size = {};
        size.x = this.touchArea.clientWidth;
        size.y = this.touchArea.clientHeight;
        return size;
    }

    /**
     * 获取图片当前的尺寸
     * @param {Number} zoomScale 需要缩放的比例 
     * @returns {Array} 返回一个数组，{x, y}
     */
    getImgSize(zoomScale){
        const size = {};
        const el = this.touchArea.childNodes[this.curImgIndex];
        size.x = Number.parseInt(el.clientWidth*(zoomScale||1));
        size.y = Number.parseInt(el.clientHeight*(zoomScale||1));
        return size;
    }
    
    /**
     * 检查是否已经越过了边界
     * @param {Number} zoomScale 
     * @param {Array} slideArray 在还没有更新dom之前的计算
     * @param {Boolean} noDifference 是否需要减去图片与边界的差值
     */
    checkBound(zoomScale, slideArray, noDifference){
        const slide = slideArray||this.get('slide');
        /**
         * 越过的数值
         */
        let resultObj = {};
        this.eachAxis((axis)=>{
            let zoomUp = this.getBound(axis, zoomScale);
            let slideVal = Math.abs(slide[axis]);
            let overNum = zoomUp-slideVal;
            overNum = noDifference?overNum-this.getImageSizeDiffVal(axis, zoomScale):overNum;
            resultObj[axis] = {
                isOver: overNum<0,
                number: overNum
            }
        });
        return resultObj;
    }

    /**
     * 取得指定轴的边界值
     * @param {String} axis 
     * @param {Number} zoomScale 
     */
    getBound(axis, zoomScale){
        const touchAreaSize = this.getTouchAreaSize();
        const imgSize = this.getImgSize(zoomScale);
        let elSize = imgSize[axis];
        let zoomUp = (elSize-touchAreaSize[axis])/2;
        return zoomUp;
    }

    /**
     * 纠正图片脱离窗口边界的情况
     * Correct the image's departure from the window boundary
     */
    correct(scaleV){
        let scale = this.get('scale');

        /**
         * 如果scale小于1那么slide和scale的值变为初始化值
         * if the scale < 1, then the values of slide&scale become initialization values
         */
        if(scale <= 1){
            const bound = this.checkBound();
            this.initValues();
            return {correct:true, bound};
        }
        
        /**
         * 如果图片缩放大于3，那么就还原为3
         */
        let flag = false;
        let maxScale = this.options.maxScale;
        const zoomScale = scale>maxScale?maxScale/scale:null;
        if(scale > maxScale){
            this.zoom(zoomScale, true);
            flag = true;
        }
        
        /**
         * 纠正图片的位置
         */
        const slide = this.get('slide');
        const checked = this.checkBound(scaleV||zoomScale);
        const newSlideVal = {x: 0, y:0};
        const resultArray = this.eachAxis((axis)=>{
            const result = checked[axis];
            if(!result.isOver || (result.isOver && result.number === 0)){return false;}
            const diffVal = this.getImageSizeDiffVal(axis, scaleV||zoomScale);
            newSlideVal[axis] = (slide[axis]<0?Math.abs(result.number)+diffVal:result.number+Math.abs(diffVal));
            return true;
        });
        this.addSlide(newSlideVal.x, newSlideVal.y);
        flag = flag||resultArray.x||resultArray.y;
        return {correct: flag, bound: checked};
    }
    
    eachAxis(func){
        const result = {};
        AXIS_SYMBOL.forEach((axis, index)=>{
            result[axis] = func(axis, index);
        });
        return result;
    }

    /**
     * 计算图片与边界的差值
     * @param {String} axis 
     * @param {Number} zoomScale 
     */
    getImageSizeDiffVal(axis, zoomScale){
        axis = axis||'x';
        const imgSize = this.getImgSize(zoomScale);
        const touchAreaSize = this.getTouchAreaSize();
        return imgSize[axis]>touchAreaSize[axis]?0:(imgSize[axis]-touchAreaSize[axis])/2;
    }
}

Object.assign(Calculator.prototype, {
    initValues(){
        this.datas.scale = 1;
        this.datas.lastScale = 1;
        this.datas.slide.init();
    },
    addSlide(x, y){
        x = x||0;
        y = y||0;
        this.datas.slide.x = Calculator.round(this.datas.slide.x+x);
        this.datas.slide.y = Calculator.round(this.datas.slide.y+y);
    },
    addScale(scale){
        this.datas.lastScale = this.datas.scale;
        this.datas.scale = Calculator.round(this.datas.scale+scale);
    },
    get(key){
        let result = this.datas[key];
        console.assert(result, `没有找到 ${key} 相关的数据！`);
        return result;
    },
    setLastActionData(key, val){
        let check = this.datas.lastActionDatas[key];
        if(!check){
            console.error(`设置 ${key} 为 ${val} 失败！不存在 ${key} 相关的动作数据!`);
            return;
        }
        this.datas.lastActionDatas[key] = val;
    },
    getLastActionData(key){
        let result = this.datas.lastActionDatas[key];
        console.assert(result, `没有找到 ${key} 相关的动作数据数据！`);
        return result;
    }
});

/**
 * pinch相关的计算方法
 */
class GestureCalculator extends Calculator {

    constructor(touchArea, options){
        super(touchArea, options);
        //触碰点位置信息
        this.positionVal = {x: 0, y: 0};
        //每次移动的开始值
        this.slideStartVal = {x: 0, y: 0};
        //每次缩放的开始值
        this.pinchStartVal = 0;
        //用于锁定切换
        this.switchLocked = false;

        this.compensation = 0;

        this.scaleActMaxVal = 0;
    }

    /**
     * 滑动计算方法
     * @param {*} x 
     * @param {*} y 
     * @param {*} isStart 
     */
    slide(x, y, isStart){
        let args = arguments;
        let distance = [0, 0];
        if(isStart){this.setLastActionData('slide', this.get('slide').slice());}
        this.eachAxis((axis, index)=>{
            let startVal = this.slideStartVal[axis];
            let newVal = args[index];
            if(isStart){
                distance[index] = startVal==newVal||Math.abs(newVal)>Math.abs(startVal)?newVal-startVal:newVal;
            }else{
                distance[index] = newVal-startVal;
            }
        });
        this.slideStartVal = {x, y};
        return this.addSlide.apply(this, distance);
    }

    /**
     * 定位当前手指触碰的位置，用于在缩放时候始终保以手指所在位置来缩放
     * @param {*} center 
     */
    position(center){
        this.eachAxis((axis)=>{
            const taSize = this.getTouchAreaSize();
            const axisSize = taSize[axis]/2;
            let curAxisSize = axisSize+this.get('slide')[axis];
            let centerVal = center[axis];
            let scale = this.get('scale');
            let cal = (curAxisSize-centerVal)/scale;
            this.positionVal[axis] = Calculator.round(cal);
        });
    }

    /**
     * 在缩放的同时进行移动，用于保持图片始终处于 position() 所定位的位置
     */
    move(){
        let curScale = this.get('scale');
        let scale = curScale-this.get('lastScale');
        this.addSlide(this.positionVal.x*scale, this.positionVal.y*scale);
    }

    /**
     * 进行缩放计算
     * @param {*} scale 
     * @param {*} isStart 
     */
    zoom(scale, isStart){
        const old = this.get('scale');
        let maxScale = this.options.maxScale;
        // scale -= this.compensation;
        // if((scale < 1 && old < 0.5) || (scale > 1 && old > maxScale+1)){
        //     this.compensation = old-maxScale;
        //     return;
        // }
        let distance = (scale-1);
        if(isStart){
            this.setLastActionData('scale', old);
            this.baseScale = old;
        }else{
            distance = distance-this.pinchStartVal;
        }
        if(scale > this.scaleActMaxVal){this.scaleActMaxVal=scale;}
        this.pinchStartVal = (scale-1);
        this.addScale(scale>=1?distance:(this.baseScale*scale)-old);
        this.move();
    }
    
    /**
     * 切换图片计算
     * @param {*} isSwitch 
     * @param {*} direction 
     */
    switch(isSwitch, direction){
        if(!isSwitch || this.switchLocked){
            return {switch: false};
        }
        this.switchLocked = true;
        setTimeout(() => {
            this.switchLocked = false;
        }, 150);
        let next = isSwitch&&direction==='next';
        let previous = isSwitch&&direction==='previous';
        isSwitch = next&&this.curImgIndex+1<this.imagesNumber;
        isSwitch = isSwitch||(previous&&this.curImgIndex>0);
        if(isSwitch){
            this.initValues();
        }
        return {switch: isSwitch, next, previous};
    }

    /**
     * 图片切换的所需的阀值
     * @param {*} slide 
     */
    switchThreshold(slide){
        slide = Math.abs(slide||this.get('slide').x);
        let diffVal = this.getImageSizeDiffVal();
        slide = slide-Math.abs(diffVal);
        slide = slide<0?0:slide;
        return slide>=this.getTouchAreaSize().x/4;
    }

    /**
     * 快速滑动的计算方法
     * @param {*} x 
     * @param {*} y 
     * @param {*} deltaTime 
     */
    swipe(x, y, deltaTime){
        let slide = this.get('slide').slice();
        const rate = 1+(1-(deltaTime/200));
        let newSlide = {x: x*rate, y: y*rate};
        let isOverBound = this.eachAxis((axis)=>{
            let bound = this.getBound(axis);
            bound = bound<=0?0:bound;
            if(Math.abs(slide[axis]) < bound){
                if(Math.abs(slide[axis])+Math.abs(newSlide[axis]) > bound){
                    let cal = bound-Math.abs(slide[axis])+30;
                    newSlide[axis] = newSlide[axis]<0?0-cal:cal;
                    return true;
                }
                return false;
            } else {
                newSlide[axis] = 0;
                return false;
            }
        });
        this.addSlide(newSlide.x, newSlide.y);
        return isOverBound.x||isOverBound.y;
    }
}