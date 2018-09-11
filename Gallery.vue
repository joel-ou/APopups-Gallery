<template>
    <div ref="view" v-show="visible">
        <WrapVue :noTransition="wrapNoTransition" :opacity="wrapOpacity" :showWrap="showWrap" @onCloseWrap="onClose">
            <div @dragstart='$event.preventDefault();' ref="mediaRef" class="media-content">
                    <img :style="index===imageAttr.index?imageAttr.style:otherImgStyle(index)" 
                        :class="[{'img-transition': transition.img.enable}]" :ref="'imgRefs'+index" 
                        :key="index" v-for="(item, index) in mediaDatas" 
                        :src="item" v-if="isCreated(index)" @load="imgLoaded(index, $event)"/>
            </div>
            <div :style="{opacity:gbOpacity}" v-show="gbOpacity" class="gallery-bar">
                <ul>
                    <li @click="onClose"><img style="height:1.5rem;width:1.5rem;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAERSURBVGhD7ZlBDoMwDAS5lGv/2kf2WYCNshIHiEKINw7ySKgo1N6dc6YgCIL3sa7rJ73SaZYti77Lsvzl+aUjGpqp2dohHdUBCfndYcpoVorV3HoZGZyPEoAhc5QAqcuc/nKPs4WKpYxZJlPGPIshw8jYsQyiSQCLQLoEaBncTQK0KNBdAjwp4kYC1BRyJwHuFHMrAUoKupcAuaLDSICrwme4lQAlMu4lQE5mGAnlFSI5CeBepkQCuJW5ktDz3Lc07oOSou5l7hR0K1NTzJ3Mk0JuZFoU6S7TskA3GYtguoxlIE2GEWSewZAAZllMCdA8U2bfc60gg+Nf9ABdoIuYEkAzm0gAWTT+ZWgQBIEjpmkDLkjTj6GOoUkAAAAASUVORK5CYII="></li>
                    <li>{{imageAttr.index+1}}/{{mediaDatas.length}}</li>
                    <!-- <li ref="text">保存</li> -->
                </ul>
            </div>
        </WrapVue>
    </div>
</template>
<script>
import WrapVue from './Wrap.vue';
import Gallery from "./Gallery";

const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;
export default {
    props: ['show', 'title', 'mediaDatas', 'index'],
    components: {
        WrapVue
    },
    mounted(){
        let gallery = new Gallery(this.$refs.mediaRef, this.mediaDatas);
        gallery.updateImageIndex(this.index||0);
        let centerVal = null;
        gallery.on('pinch', obj=>{
            let result = obj.result;
            this.zoom(result.scale);
            this.translate = result.slide;
            this.renderer();
            if(result.lastActionData <= 1){
                this.wrapOpacity = (result.scale-0.5)/0.5;
                this.wrapNoTransition = true;
            }
            // this.debug(JSON.stringify(result));
        });
        gallery.on('slide', obj=>{
            let result = obj.result;
            let slide = result.slide;
            let slideX = slide.x;
            let curSlideX = this.translate.x;
            let diff = slideX-curSlideX;
            if(result.bound.x.isOver && obj.e.pointers.length === 1){
                this.imageAttr.next.translate += diff;
                this.imageAttr.previous.translate += diff;
            }
            this.translate = slide;
            let boundY = result.bound.y;
            if(boundY.isOver && slide.y > 0){
                const touchArea = this.getTouchAreaSize();
                this.wrapOpacity = 1-(Math.abs(boundY.number)/((touchArea.x||windowHeight)/2));
                this.wrapNoTransition = true;
            }
            this.renderer();
            // this.debug(JSON.stringify(result)+'_'+obj.e.pointers.length);
        });
        gallery.on('actionend', obj=>{
            let result = obj.result;
            let switched = this.imageSwitch(result.switchObj);
            if(!switched && result.correct){
                this.imageAttrReset(result.scale, result.slide);
            }
            this.wrapNoTransition = false;
            this.wrapOpacity = 1;
        });
        gallery.on('doubletap', obj=>{
            let result = obj.result;
            this.doImgTransition(()=>{
                this.zoom(result.scale);
                this.translate = result.slide;
                this.renderer();
            });
        });
        gallery.on('swipe', obj=>{
            let result = obj.result;
            if(result.switchObj){
                this.imageSwitch(result.switchObj);
                return;
            }
            let slide = result.slide;
            if(slide){
                slide = slide.slice();
                this.doImgTransition(()=>{
                    this.translate = slide;
                    this.renderer();
                }).then(()=>{
                    let result = this.gallery.correct();
                    if(result.correct){
                        this.doImgTransition(()=>{
                            this.translate = result.slide;
                            this.renderer();
                        });
                    }
                });
            }
        });
        gallery.on('close', obj=>{
            this.wrapNoTransition = false;
            this.onClose().then(()=>{
                this.imageAttrReset(0);
            });
        });
        this.gallery = gallery;
    },
    data(){
        let imageIndex = this.index||0;
        return {
            showWrap: false,
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
                    timerId: null
                }
            },
            imageAttr: {
                show: false,
                index: imageIndex,
                width: 0,
                height: 0,
                scale: 1,
                translate: {x: 0, y:0},
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
            }
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
            let height = imgEl.naturalHeight;
            let width = imgEl.naturalWidth;
            const touchArea = this.getTouchAreaSize();
            let ratioX = touchArea.x/width;
            let ratioY = touchArea.y/height;
            let ratio = 1;
            // if((height > innerHeight && windowWidth > innerHeight) 
            //     || (height < innerHeight && height > width && (height-windowWidth) > width)
            //     || (height > width && (height-width) > width)){
            if(height > width && (height-width) > width){
                ratio = width*ratioY>touchArea.x?ratioX:ratioY;
            }else{
                ratio = height*ratioX>touchArea.y?ratioY:ratioX;
            }
            width *= ratio;
            height *= ratio;
            this.imageAttr.sizes[index] = [Math.round(width), Math.round(height)];
            if(index === this.imageAttr.index){
                this.showImage(true, index);
            }
        },
        doImgTransition(func){
            return new Promise((reslove, reject)=>{
                clearTimeout(this.transition.img.timerId);
                this.transition.img.enable = true;
                if(func && func instanceof Function){
                    func();
                }
                this.transition.img.timerId = setTimeout(() => {
                    this.transition.img.enable = false;
                    reslove();
                }, 310);
            });
        },
        debug(info){
            this.$refs.text.innerHTML = info;
        },
        getImgSize(index, attr){
            if (this.imageAttr.index === index) {
                return this.imageAttr[attr]+'px';
            }
            let size = this.imageAttr.sizes[index];
            if(size){
                return size[attr==='width'?0:1]+'px';
            }
            return 0;
        },
        imageAttrReset(scale, slide){
            return this.doImgTransition(()=>{
                this.zoom(scale>=0?scale:1);
                this.translate = slide||{x:0,y:0};
                this.nextIamgeReset();
                this.renderer();
            });
        },
        nextIamgeReset(){
            const touchArea = this.getTouchAreaSize();
            this.imageAttr.previous.translate = 0-touchArea.x-40;
            this.imageAttr.next.translate = touchArea.x+40;
        },
        showImage(bool, index){
            let size = this.imageAttr.sizes[index];
            if(bool && size){
                this.imageAttr.index = index;
                setTimeout(() => {
                    this.doImgTransition(()=>{
                        this.imageAttr.width = size[0];
                        this.imageAttr.height = size[1];
                        this.renderer();
                    });
                }, 10);
            }
            if(!bool){
                this.doImgTransition(()=>{
                    this.imageAttr.width = 0;
                    this.imageAttr.height = 0;
                    this.renderer();
                }).then(()=>{
                    this.imageAttr.index = -1;
                });
            }
        },
        isCreated(index){
            let created = this.imageAttr.created;
            if(created[index]){return true;}
            if(index===this.imageAttr.index ||index===this.imageAttr.index+1 
                ||index===this.imageAttr.index+2 ||index===this.imageAttr.index-1){
                return created[index] = true;
            }
            return false;
        },
        imageSwitch(switchObj){
            if(!switchObj.switch){
                return false;
            }
            switchObj.next?this.imageAttr.index++:this.imageAttr.index--;
            let curImgSize = this.imageAttr.sizes[this.imageAttr.index];
            this.imageAttr.width = curImgSize[0];
            this.imageAttr.height = curImgSize[1];
            this.gallery.updateImageIndex(this.imageAttr.index);
            this.imageAttrReset();
            return true;
        },
        renderer(){
            let translate = this.imageAttr.translate;
            let width = this.imageAttr.width;
            let height = this.imageAttr.height;
            this.imageAttr.style = `transform: translate(${translate.x}px, ${translate.y}px); width: ${width}px; height: ${height}px;`;
        },
        otherImgStyle(index){
            let translate = this.imageAttr.index+1===index?this.imageAttr.next.translate:
                            index>this.imageAttr.index?this.imageAttr.other.translate:
                            this.imageAttr.index-1===index?this.imageAttr.previous.translate:null;
            let width = this.getImgSize(index, 'width'); 
            let height = this.getImgSize(index, 'height');
            return `transform: translate(${translate}px); width: ${width}; height: ${height};`;
        },
        zoom(scale){
            if(this.imageAttr.scale === scale){return;}
            this.imageAttr.scale = scale;
            this.imageAttr.width = Number.parseInt(this.imageAttr.sizes[this.imageAttr.index][0]*scale);
            this.imageAttr.height = Number.parseInt(this.imageAttr.sizes[this.imageAttr.index][1]*scale);
        },
        getTouchAreaSize(){
            const touchAreaX = this.$refs.mediaRef.clientWidth;
            const touchAreaY = this.$refs.mediaRef.clientHeight;
            return {x: touchAreaX, y: touchAreaY};
        }
    },
    computed: {
        translate: {
            set(newVal){
                this.imageAttr.translate.x = newVal.x;
                this.imageAttr.translate.y = newVal.y;
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
                        this.showImage(true, this.index||0);
                        this.gbOpacity = 1;
                    }, 150);
                    this.nextIamgeReset();
                }, 150);
            } else {
                this.showWrap = false;
                this.gbOpacity = 0;
                this.showImage(false);
                setTimeout(() => {
                    this.visible = false;
                    this.imageAttr.index = 0;
                }, 310);
            }
        },
        /**
         * 监听缩放比率，然后调整图片大小
         */
        'imageAttr.scale': function(newVal, oldVal) {
            if(newVal === oldVal || newVal <= 0){
                return;
            }
            this.imageAttr.width = Number.parseInt(this.imageAttr.sizes[this.imageAttr.index][0]*newVal);
            this.imageAttr.height = Number.parseInt(this.imageAttr.sizes[this.imageAttr.index][1]*newVal);
        },
        mediaDatas(datas){
            let length = datas.length;
            this.imageAttr.length = length;
            this.imageAttr.created = new Array(length);
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
            &.img-transition {
                transition: width 0.3s, height 0.3s, transform 0.3s;
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
