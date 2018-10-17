<template>
    <div>
        <top></top>
        <div class="content">
            <div class="image-list">
                <img src="@/imgs/thumbnail-1.jpg" @click="showGallery(0)">
                <p style="color:red;">Tap this picture</p>
                <p><a href="https://github.com/joel-ou/APopups-Gallery" style="text-decoration: underline;">Star me if you like</a></p>
            </div>
            <gallery :mediaDatas='galleryDatas' :index="index" :show="isShow" @onClose="isShow=false"></gallery>
        </div>
        <div class="doc">
            <div class="warning">
                <h2>Before starting</h2>
                Before using, you need to know about <span style="color:red;">vuejs</span> and <span style="color:red;">vue's single-file component</span> development
                <p style="color:red;">
                    *It is still under testing. Do not use it in production environment
                </p>
                <p style="color:red;">
                    *** Try not to use it on PC, It's for mobile
                </p>
            </div>
            <div class="getting-started">
                <a href="javascript:;" id="start" class="title-h3">#Getting started</a>
                <h4>Step1: install by npm</h4>
                <p>
                    <pre><code>npm install apopups-gallery -S</code></pre>
                </p>
                <h4>Step2: import gallery vue component</h4>
                <p>
                    <pre><code>import gallery from "apopups-gallery";<br/></code></pre>
                </p>
                <h4>Step3: Add to vuejs components</h4>
                <p>
                    <pre><code>components: { gallery }<br/></code></pre>
                </p>
                <h4>Step4: useing gallery component on your vue page</h4>
                <p>
                    <pre><code>&#60;gallery :imageDatas="imageDatas" :index="0" :show="isShow" @onClose="isShow=false">&#60;/gallery></code></pre>
                </p>
                <a href="javascript:;" id="parameter" class="title-h3">#Parameter:</a>
                <table>
                    <thead>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Description</th>
                    </thead>
                    <tbody>
                        <tr>
                            <td>imageDatas</td>
                            <td>array</td>
                            <td>true</td>
                            <td>The images you want to show</td>
                        </tr>
                        <tr>
                            <td>index</td>
                            <td>number</td>
                            <td>false</td>
                            <td>The index of the images shown starts at 0. <span style="color:red;">defualt: 0</span></td>
                        </tr>
                        <tr>
                            <td>show</td>
                            <td>boolean</td>
                            <td>true</td>
                            <td>Display and close flags</td>
                        </tr>
                        <tr>
                            <td>onClose</td>
                            <td>function</td>
                            <td>true</td>
                            <td>You must change the show value to false inside the function</td>
                        </tr>
                    </tbody>
                </table>
                <a href="javascript:;" id="slots" class="title-h3">#Slots</a>
                <p><b>galleryBar</b> : Customize your own bottom action bar in the gallery</p>
            </div>
        </div>
        <bottom></bottom>
    </div>
</template>
<script>
import gallery from "@/components/apopups-gallery";
import top from "@/components/Top.vue";
import bottom from "@/components/Bottom.vue";

export default {
    name: "App",
    components: {
        gallery, top, bottom
    },
    mounted(){
        const hash = location.hash;
        if(hash){
            let array = hash.replace('#', '').split('=');
            if(array[0] === 'index'){
                this.showGallery(Number.parseInt(array[1]));
            }
        }
    },
    data () {
        return {
            imageData: [[
                require(`@/imgs/animal-3.jpg`),
                require(`@/imgs/long.jpg`),
                require(`@/imgs/animal-1.jpg`),
                require(`@/imgs/animal-2.jpg`),
                require(`@/imgs/person-2.jpg`),
                require(`@/imgs/person-1.jpg`),
                require(`@/imgs/1.jpg`),
                require(`@/imgs/2.jpg`),
                require(`@/imgs/3.jpg`),
                require(`@/imgs/4.jpg`)
            ],[
            ]],
            galleryDatas: [],
            isShow: false,
            index:0
        }
    },
    methods: {
        showGallery(index){
            this.galleryDatas = this.imageData[0];
            this.index = index;
            this.isShow = true;
        }
    },
    computed: {
    }
}
</script>
<style lang="scss">
    @import 'common.scss';
    .top {
        padding: 1rem 1rem;
        max-width: 1200px;
        margin: auto;
        .log {
            font-weight: bold;
            font-size: 2rem;
        }
        p {
            color: rgb(221, 60, 60);
            padding: 1rem 0;
        }
        .menu {
            float: right;
            text-decoration: underline;
        }
    }
    .content {
        .image-list{
            margin: auto;
            border-bottom: 0.1rem solid #c5c5c50a;
            text-align: center;
            .image-div {
                margin: 1rem 0;
                max-height: 20rem;
                overflow: hidden;
                img {
                    display: block;
                    width: 100%;
                }
            }
        }
    }
    .doc {
        max-width: 1200px;
        background-color: white;
        padding: 1rem 1rem;
        margin: auto;
        pre {
            background-color: rgb(228, 228, 228);
            overflow: auto;
            padding: 1rem;
            -webkit-overflow-scrolling: touch;
        }
        table {
            width: 100%;
            td {
                &:nth-of-type(2), &:nth-of-type(3) {
                    text-align: center;
                }
                &:nth-of-type(1) {
                    font-weight: bold;
                }
            }
        }
    }
    .bootom {
        padding: 2rem;
        text-align: center;
    }
    @mixin title() {
        font-weight: bold;
        padding: 0.5rem 0;
        display: block;
    }
    .title-h2 {
        font-size: 1.5rem;
        @include title;
    }
    .title-h3 {
        font-size: 1.3rem;
        @include title;
    }
    .getting-started {
        margin-top: 1rem;
    }
</style>
