<template>
    <div class="root">
        <top></top>
        <div class="content">
        </div>
        <div class="doc">
            <h1>Changelog</h1>
            <h3>2018-10-16  v1.1.0</h3>
            <ol>
                <li>
                    <b style="color: red;">A new feature has been added !</b>
                    <p>Viewing long images will now automatically zoom in to the maximum width and will automatically scroll to the top</p>
                    <p>&nbsp;</p>
                    <p><a href="javascript:;" @click="go('#index=1')">Demo</a></p>
                </li>
                <li>Picture switching animation speed up</li>
                <li>Hand gestures have a better lock mechanism</li>
                <li>Slowed down the double-tap animation</li>
                <li>Maximum zoom is affected by the natural size of the image</li>
                <li>Fixed bugs</li>
            </ol>
        </div>
        <bottom></bottom>
    </div>
</template>
<script>
import top from "@/components/Top.vue";
import bottom from "@/components/Bottom.vue";
import { go } from "@/js/locationUtil";

export default {
    name: "App",
    components: {
        top, bottom
    },
    data () {
        return {
        }
    },
    methods: {
        go
    },
    computed: {
    }
}
</script>
<style lang="scss">
    @import 'common.scss';
    .root {
        height: 100%;
        width: 100%;
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
        min-height: 70%;
        background-color: white;
        padding: 1rem 1rem;
        margin: auto;
        h3 {
            color: blue;
        }
        ol {
            list-style-type: decimal;
            padding: 0rem 1rem;
            display: block;
            li {
                margin-bottom: 1rem;
            }
        }
    }
</style>