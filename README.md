Demo: https://joel-ou.github.io/APopupsGalleryDemo/
# *It is still under test. Do not use it in production environment
*&&&*** Try not to use it on PC, It's for mobile

## Before starting
Before using, you need to know about vuejs and vue's single-file component development
<p></p>

## Getting started

### Step1: install by npm
`npm install apopups-gallery -S`

### Step2: import gallery vue component
`import gallery from "apopups-gallery";`

### Step3: Add to vuejs components
`components: { gallery }`

### Step4: useing gallery component on your vue page
`<gallery :imageDatas="imageDatas" :index="0" :show="isShow" @onClose="isShow=false"></gallery>`


### More info:
see here https://joel-ou.github.io/APopupsGalleryDemo/
