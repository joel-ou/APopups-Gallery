efore starting
Before using, you need to know about vuejs and vue's single-file component development
Getting started
Step1: install by npm
`npm install apopups-gallery`

Step2: import gallery vue component
`import gallery from "popups-gallery";`

Step3: Add to vuejs components
`components: { gallery }`

Step4: useing gallery component on your vue page
`<gallery :imageDatas="imageDatas" :index="0" :show="isShow" @onClose="isShow=false"></gallery>`
