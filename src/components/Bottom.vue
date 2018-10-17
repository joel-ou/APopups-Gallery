<template>
    <div>
        <div class="bootom">
            License: MIT <a href="https://github.com/joel-ou/APopups-Gallery" style="margin-left: 2rem;">Github</a> <a href="mailto:8019893@qq.com" style="margin-left: 2rem;">8019893@qq.com</a>
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
    .bootom {
        padding: 2rem;
        text-align: center;
    }
</style>
