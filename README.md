https://github.com/joel-ou/APopups-Gallery


# *It is still under test. Do not use it in production environment

## APopups-Gallery
Current version: 1.0.0 beta

## Before starting
Before using, you need to know about vuejs and vue's single-file component development
<p></p>

## Getting started
### Step1: install by npm
`npm install apopups-gallery`

### Step2: import gallery vue component
`import gallery from "apopups-gallery";`

### Step3: Add to vuejs components
`components: { gallery }`

### Step4: useing gallery component on your vue page
`<gallery :imageDatas="imageDatas" :index="0" :show="isShow" @onClose="isShow=false"></gallery>`
