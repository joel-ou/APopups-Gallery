<template>
    <div class="wrap">
        <div :class="['cover', {'transition': !noTransition}]" :style="{'background-color': backgroundColor}" @click="close">
        </div>
        <div :class="['container', position?position:'center']">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    created(){
    },
    props: ['showWrap', 'position', 'opacity', 'noTransition'],
    data(){
        const defaultBkColorHide = 'rgba(0, 0, 0, 0)';
        return {
            backgroundColor: defaultBkColorHide, 
            defaultBkColorShow: `rgba(0, 0, 0, ${this.opacity?this.opacity:0.5})`, 
            defaultBkColorHide
        }
    },
    methods: {
        close(){
            /**
             * 将关闭的控制权交由引用者
             */
            this.$emit('onCloseWrap');
        }
    },
    watch: {
        showWrap(val){
            /**
             * 该方法用于显示wrap和隐藏wrap的动画操作
             */
            if(val){
                this.backgroundColor = this.defaultBkColorShow;
            }else{
                this.backgroundColor = this.defaultBkColorHide;
            }
        },
        opacity(val){
            if(this.showWrap){
                this.backgroundColor = `rgba(0, 0, 0, ${val?val:0.5})`;
            }
        }
    }
}
</script>
<style lang="scss" scoped>
    .wrap {
        .cover {
            z-index: 100;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            &.transition {
                transition: background-color 0.3s;
            }
        }
        .container {
            width: 100%;
            position: fixed;
            z-index: 101;
            top: 0;
        }
    }
</style>