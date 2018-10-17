<template>
    <div>
        <div class="top">
            <div class="log" @click="go('')">
                APopups-Gallery
            </div>
            <div class="menu">
                <a href="changelog.html">Changelog</a>
            </div>
            <p><b>for mobile.</b></p>
        </div>
    </div>
</template>

<script>
import { go } from "@/js/locationUtil";

export default {
    props: ['title'],
    methods: {
        go
    }
}
</script>

<style lang="scss" scoped>
    .top {
        padding: 1rem 1rem;
        max-width: 1200px;
        margin: auto;
        .log {
            font-weight: bold;
            font-size: 2rem;
            float: left;
            width: 75%;
        }
        p {
            color: rgb(221, 60, 60);
            padding: 1rem 0;
            padding-top: 2rem;
        }
        .menu {
            float: right;
            text-decoration: underline;
            width: 25%;
            font-size: 1.3rem;
            text-align: right;
        }
    }
</style>
