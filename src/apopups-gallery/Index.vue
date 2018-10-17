<template>
    <div ref="view" v-show="visible">
        <WrapVue :noTransition="wrapNoTransition" :opacity="wrapOpacity" :showWrap="showWrap" @onCloseWrap="onClose">
            <div @dragstart='$event.preventDefault();' ref="mediaRef" class="media-content">
                    <img :id="imageIds[index]" :style="`${index===imageAttr.index?imageAttr.style:otherImgStyle(index)}; ${transition.img.duration>0?`transition-duration: ${transition.img.duration}s`:''};`" 
                        :class="[`img-transition-${transition.img.timing}`]" :ref="'imgRefs'+index" 
                        :key="index" v-for="(item, index) in mediaDatas" 
                        :src="item" v-if="isCreated(index)" @load="imgLoaded(index, $event)" 
                        alt="image load failed"/>
                    <img v-show="isLoading" style="z-index: 1; width: 1rem; height: 1rem;" src="./loading.gif">
            </div>
            <div :style="{opacity:gbOpacity}" v-show="gbOpacity >= 0" class="gallery-bar">
                <slot name="galleryBar">
                    <ul>
                        <li @click="gallery.doClose();"><img style="height:1.5rem;width:1.5rem;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAERSURBVGhD7ZlBDoMwDAS5lGv/2kf2WYCNshIHiEKINw7ySKgo1N6dc6YgCIL3sa7rJ73SaZYti77Lsvzl+aUjGpqp2dohHdUBCfndYcpoVorV3HoZGZyPEoAhc5QAqcuc/nKPs4WKpYxZJlPGPIshw8jYsQyiSQCLQLoEaBncTQK0KNBdAjwp4kYC1BRyJwHuFHMrAUoKupcAuaLDSICrwme4lQAlMu4lQE5mGAnlFSI5CeBepkQCuJW5ktDz3Lc07oOSou5l7hR0K1NTzJ3Mk0JuZFoU6S7TskA3GYtguoxlIE2GEWSewZAAZllMCdA8U2bfc60gg+Nf9ABdoIuYEkAzm0gAWTT+ZWgQBIEjpmkDLkjTj6GOoUkAAAAASUVORK5CYII="></li>
                        <li>{{imageAttr.index+1}}/{{mediaDatas.length}}</li>
                        <!-- <li ref="text">保存</li> -->
                    </ul>
                </slot>
            </div>
        </WrapVue>
    </div>
</template>
<script>
import WrapVue from './Wrap.vue';
import Gallery from "./Gallery";
import { Transition, TransitionData } from "./Transition";
import { lock } from "./Locker";

const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;
export default {
    props: ['show', 'title', 'mediaDatas', 'index'],
    components: {
        WrapVue
    },
    mounted(){
        let gallery = new Gallery(this.$refs.mediaRef, this.mediaDatas);
        gallery.updateImageIndex(0);
        let centerVal = null;
        gallery.on('pinch', obj=>{
            let result = obj.result;
            this.renderer(this.zoom(result.scale), result.slide, 0);
            if(result.lastActionData <= 1 && result.maxScale <= 1){
                this.wrapOpacity = (result.scale-0.5)/0.5;
                this.wrapNoTransition = true;
            }
        });
        gallery.on('slide', obj=>{
            let result = obj.result;
            let slide = result.slide;
            let slideX = slide.x;
            let curSlideX = this.imageAttr.translateX;
            let diff = slideX-curSlideX;
            if(result.bound.x.isOver && obj.e.pointers.length === 1){
                this.imageAttr.next.translate += diff;
                this.imageAttr.previous.translate += diff;
            }
            let boundY = result.bound.y;
            if(boundY.isOver && slide.y > 0 && obj.e.pointers.length === 1){
                const touchArea = this.getTouchAreaSize();
                this.wrapOpacity = 1-(Math.abs(boundY.number)/(touchArea.x/2));
                this.wrapNoTransition = true;
            }
            this.renderer(null, slide, 0);
        });
        gallery.on('actionend', obj=>{
            let result = obj.result;
            let switched = this.imageSwitch(result.switchObj);
            if(!switched && result.correct){
                setTimeout(() => {
                    if(this.isSwitching || this.isSwipeing){return;}
                    this.renderer(this.zoom(result.scale), result.slide, 200);
                    this.resetOtherImgAttr(200);
                }, 30);
            }
            this.wrapNoTransition = false;
            this.wrapOpacity = 1;
        });
        gallery.on('doubletap', obj=>{
            let result = obj.result;
            this.renderer(this.zoom(result.scale), result.slide, 300);
        });
        gallery.on('tap', obj=>{
            if(this.gbOpacity===1){
                this.gbOpacity = 0;
                setTimeout(() => {
                    this.gbOpacity = -1;
                }, 310);
            } else {
                this.gbOpacity = 1;
            }
        });
        gallery.on('swipe', obj=>{
            let result = obj.result;
            if(result.switchObj && result.switchObj.switch){
                this.isSwitching = true;
                this.imageSwitch(result.switchObj);
                return;
            }
            let slide = result.slide;
            if(slide){
                this.isSwipeing = true;
                slide = slide.slice();
                this.resetOtherImgAttr(200);
                this.doImgTransition(()=>{
                    this.translate = slide;
                    this.imageAttr.style = this.buildImageStyle({x: this.imageAttr.width, y: this.imageAttr.height}, slide);
                }, 'ease-out').then(()=>{
                    this.isSwipeing = false;
                    if(!result.isOverBound){
                        return;
                    }
                    let correctResult = this.gallery.correct();
                    if(correctResult.correct){
                        this.renderer(null, correctResult.slide, 100);
                    }
                }).finally(()=>{
                    // this.isSwipeing = false;
                });
            }
        });
        gallery.on('close', obj=>{
            this.wrapNoTransition = false;
            this.onClose();
        });
        this.gallery = gallery;
    },
    data(){
        return {
            showWrap: false,
            isLoading: false,
            wrapNoTransition: false,
            wrapOpacity: 1,
            //内部标志，用于实现动画效果
            visible: false,
            gbOpacity: 0, 
            window: window,
            gallery: null,
            transition: {
                img: {
                    enable: false,
                    timerId: null,
                    timing: 'none',
                    duration: null
                }
            },
            imageAttr: {
                show: false,
                index: -1,
                width: 0,
                height: 0,
                scale: 1,
                translate: {x: 0, y:0},
                translateX: 0,
                translateY: 0,
                sizes: {},
                next: {
                    translate: windowWidth+40
                },
                previous: {
                    translate: 0-windowWidth-40
                },
                other: {
                    translate: 2*windowWidth
                },
                created: [],
                style: `transform: translate(0px, 0px); width: 0; height: 0;`
            },
            imageIds: []
        };
    },
    methods: {
        onClose(){
            return new Promise((reslove, reject)=>{
                this.$emit('onClose');
                setTimeout(() => {
                    reslove();
                }, 310);
            });
        },
        imgLoaded(index, event){
            let imgEl = event.target;
            if(imgEl.id !== this.imageIds[index]){
                return;
            }
            if(this.imageAttr.index === index){
                this.isLoading = false;
            }
            let height = imgEl.naturalHeight;
            let width = imgEl.naturalWidth;
            const touchArea = this.getTouchAreaSize();
            let ratioX = touchArea.x/width;
            let ratioY = touchArea.y/height;
            let ratio = 1;
            // if((height > innerHeight && windowWidth > innerHeight) 
            //     || (height < innerHeight && height > width && (height-windowWidth) > width)
            //     || (height > width && (height-width) > width)){
            let isLongPicture = false;
            if(height > width && (height-width) > width){
                ratio = width*ratioY>touchArea.x?ratioX:ratioY;
                isLongPicture = !(width*ratioY>touchArea.x);
            }else{
                ratio = height*ratioX>touchArea.y?ratioY:ratioX;
                isLongPicture = height*ratioX>touchArea.y;
            }
            width *= ratio;
            height *= ratio;
            const imageSize = [Math.round(width), Math.round(height), isLongPicture];
            this.imageAttr.sizes[index] = imageSize;
            if(index === this.imageAttr.index){
                this.showImage(true, index).then(()=>{
                    this.gallery.setImageLoaded(index, imageSize, isLongPicture);
                    this.gallery.imageShowed(index, isLongPicture);
                });
            }else{
                this.gallery.setImageLoaded(index, imageSize, isLongPicture);
            }
        },
        doImgTransition(func, timing='linear', duration=0.3){
            return new Promise((reslove, reject)=>{
                this.transition.img.timing = timing;
                this.transition.img.duration = duration;
                this.transition.img.enable = true;
                if(func && func instanceof Function){
                    func();
                }
                this.transition.img.timerId = setTimeout(() => {
                    this.transition.img.timing = 'none';
                    this.transition.img.duration = null;
                    this.transition.img.enable = false;
                    reslove();
                }, duration*1000);
            });
        },
        debug(info){
            this.$refs.text.innerHTML = info;
        },
        resetOtherImgAttr(duration){
            let tsData = new TransitionData(duration>=0?duration:300);
            const touchArea = this.getTouchAreaSize();
            tsData.add('previous', (0-touchArea.x-40)-this.imageAttr.previous.translate);
            tsData.add('next', (touchArea.x+40)-this.imageAttr.next.translate);
            new Transition((datas)=>{
                datas.forEach(data=>{
                    this.imageAttr[data.type].translate += data.number;
                });
            }).excute(tsData);
        },
        showImage(bool, index, duration=200){
            return new Promise((resolve, reject)=>{
                if(bool){
                    this.imageAttr.index = index;
                    let size = this.imageAttr.sizes[index];
                    setTimeout(() => {
                        this.translate = {x:0, y:0};
                        if(size && duration > 0){
                            this.zoom(0, true);
                            this.imageAttr.style = this.buildImageStyle({x: 0, y: 0}, this.translate);
                            this.renderer({x: size[0], y: size[1]}, null, duration).end(()=>{
                                resolve();
                            });
                        } else {
                            size = size||[0, 0];
                            this.zoom(1, true);
                            this.imageAttr.style = this.buildImageStyle({x: size[0], y: size[1]}, this.translate);
                            resolve();
                        }
                    }, 10);
                } else {
                    let size = this.imageAttr.sizes[this.imageAttr.index];
                    this.renderer({x: 0-this.imageAttr.width, y: 0-this.imageAttr.height}, null, size?duration:0).end(()=>{
                        this.resetOtherImgAttr();
                        this.translate = {x: 0, y: 0};
                        this.imageAttr.index = -1;
                        resolve();
                    });
                }
            });
        },
        isCreated(index){
            if(this.imageAttr.index === -1){return}
            let created = this.imageAttr.created;
            if(created[index]){return true;}
            if(index === this.imageAttr.index 
                || index === this.imageAttr.index+1
                || index === this.imageAttr.index-1){
                return created[index] = true;
            }
            return false;
        },
        imageSwitch(switchObj){
            if(!switchObj.switch){
                return false;
            }
            this.doImgTransition(()=>{
                switchObj.next?this.imageAttr.index++:this.imageAttr.index--;
                this.imageAttr.scale = 1;
                this.imageAttr.translateX = 0;
                this.imageAttr.translateY = 0;
                this.showImage(true, this.imageAttr.index, 0);
                this.gallery.updateImageIndex(this.imageAttr.index);
                const touchArea = this.getTouchAreaSize();
                this.imageAttr.previous.translate = 0-touchArea.x-40;
                this.imageAttr.next.translate = touchArea.x+40;
            }, 'ease-out', 0.2).then(()=>{
                const size = this.getImageSize();
                if(size){
                    this.gallery.imageShowed(this.imageAttr.index, size[2]);
                }
                this.isSwitching = false;
            });
            return true;
        },
        renderer(size, slide, duration){
            let tsDatas = new TransitionData(duration);
            if(size && !Number.isNaN(size.x)){
                tsDatas.add('width', size.x);
            }
            if(size && !Number.isNaN(size.y)){
                tsDatas.add('height', size.y);
            }
            if(slide && !Number.isNaN(slide.x) && slide.x !== this.imageAttr.translateX){
                tsDatas.add('translateX', slide.x-this.imageAttr.translateX);
            }
            if(slide && !Number.isNaN(slide.y) && slide.y !== this.imageAttr.translateY){
                tsDatas.add('translateY', slide.y-this.imageAttr.translateY);
            }
            return new Transition(datas=>{
                datas.forEach(dataObj=>{
                    this.imageAttr[dataObj.type] = Number.parseFloat((this.imageAttr[dataObj.type]+dataObj.number).toFixed(2));
                });
                this.imageAttr.style = this.buildImageStyle({x: this.imageAttr.width, y: this.imageAttr.height}, 
                    {x: this.imageAttr.translateX, y: this.imageAttr.translateY});
            }).excute(tsDatas);
        },
        otherImgStyle(index){
            let translate = this.imageAttr.index+1===index?this.imageAttr.next.translate:
                            index>this.imageAttr.index?this.imageAttr.other.translate:
                            this.imageAttr.index-1===index?this.imageAttr.previous.translate:null;
            let imgSize = this.imageAttr.sizes[index]||[0, 0];
            return this.buildImageStyle({x: imgSize[0], y: imgSize[1]}, {x: translate, y: 0});
        },
        buildImageStyle(size, translate){
            return `transform: translate(${translate.x}px, ${translate.y}px); width: ${size.x}px; height: ${size.y}px;`;
        },
        zoom(scale, assign=false){
            this.imageAttr.scale = scale;
            let size = this.imageAttr.sizes[this.imageAttr.index]||[0, 0];
            let x = size[0]*scale;
            let y = size[1]*scale;
            if(assign){
                this.imageAttr.width = x;
                this.imageAttr.height = y;
            }
            return {x: x-this.imageAttr.width, y: y-this.imageAttr.height};
        },
        getTouchAreaSize(){
            const touchAreaX = this.$refs.mediaRef.clientWidth||windowWidth;
            const touchAreaY = this.$refs.mediaRef.clientHeight||windowHeight;
            return {x: touchAreaX, y: touchAreaY};
        },
        imageIsLoaded(){
            let size = this.getImageSize();
            return size !== null && typeof size !== 'undefined' && size instanceof Array;
        },
        getImageSize(index=this.imageAttr.index){
            return this.imageAttr.sizes[index];
        }
    },
    computed: {
        translate: {
            set(newVal){
                this.imageAttr.translateX = Number.parseFloat(newVal.x.toFixed(2));
                this.imageAttr.translateY = Number.parseFloat(newVal.y.toFixed(2));
            },
            get(){
                return this.imageAttr.translate;
            }
        }
    },
    watch: {
        show(val){
            if(val){
                this.visible = val;
                /**
                 * 此次等待是为了等待dialog显示后再显示wrap
                 */
                setTimeout(() => {
                    this.showWrap = val;
                    setTimeout(() => {
                        //先等Wrap的动画执行到一半的时候再显示内容块
                        // this.showImage(true, this.index||0);
                        this.imageAttr.index = this.index||0;
                        this.gallery.updateImageIndex(this.imageAttr.index);
                        this.gbOpacity = 1;
                    }, 150);
                }, 150);
            } else {
                this.isLoading = false;
                this.showWrap = false;
                this.gbOpacity = 0;
                this.imageAttr.scale = 1;
                this.showImage(false).then(()=>{
                    this.imageAttr.sizes = {};
                });
                setTimeout(() => {
                    this.visible = false;
                }, 310);
            }
        },
        /**
         * 监听缩放比率，然后调整图片大小
         */
        // 'imageAttr.scale': function(newVal, oldVal) {
        //     if(newVal === oldVal || newVal <= 0){
        //         return;
        //     }
        //     this.imageAttr.width = Number.parseInt(this.imageAttr.sizes[this.imageAttr.index][0]*newVal);
        //     this.imageAttr.height = Number.parseInt(this.imageAttr.sizes[this.imageAttr.index][1]*newVal);
        // },
        'imageAttr.index': function(val){
            if(this.imageAttr.sizes[val]){
                this.isLoading = false;
                return;
            }
            this.isLoading = true;
        },
        mediaDatas(datas){
            let length = datas.length;
            this.imageAttr.created = new Array(length);
            this.imageAttr.length = length;
            this.imageAttr.sizes = {};
            this.imageIds = new Array(datas.length);
            this.mediaDatas.forEach((value, index) => {
                this.imageIds[index] = `${Date.now()}_${index}`;
            });
            this.gallery.setImagesNumber(length);
        }
    }
}
</script>

<style lang="scss" scoped>
    .media-content {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: nowrap;
        overflow: hidden;
        height: 100%;
        width: 100%;
        margin: auto;
        img {
            height: 0%;
            width: 0%;
            display: block;
            position: absolute;
            &.width-ratio {
                height: auto;
                width: 100%;
            }
            &.height-ratio {
                height: 100%;
                width: auto;
            }
            &.img-transition-linear {
                transition: width 0.3s, height 0.3s, transform 0.3s;
                transition-timing-function: linear;
            }
            &.img-transition-ease-out {
                transition: width 0.3s, height 0.3s, transform 0.3s;
                transition-timing-function: ease-out;
            }
        }
    }
    .gallery-bar {
        transition: opacity 0.3s;
        position: fixed;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        width: 100%;
        font-size: 1.3rem;
        padding-bottom: constant(safe-area-inset-bottom);
        padding-bottom: env(safe-area-inset-bottom);
        ul li {
            padding: 1rem;
        }
    }
</style>
<style>
    .wrap .container {
        height: 100%;
    }
</style>
