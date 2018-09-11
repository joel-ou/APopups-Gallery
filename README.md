APopups-Gallery
Current version: 1.0.0 beta


<h2>Before starting</h2>
Before using, you need to know about vuejs and vue's single-file component development

<h2>Getting started</h2>
<h3>Step1: install by npm</h3>
`npm install popups-gallery-vue`

<h3>Step2: import gallery vue component</h3>
`import gallery from "popups-gallery";`

<h3>Step3: Add to vuejs components</h3>
`components: { gallery }`

<h3>Step4: useing gallery component on your vue page</h3>
`<gallery :imageDatas="imageDatas" :index="0" :show="isShow" @onClose="isShow=false"></gallery>`
