const fs=require('fs');const assert=require('assert');const vm=require('vm');
const index=fs.readFileSync('index.html','utf8');const app=fs.readFileSync('app.js','utf8');
const context={window:{}};vm.runInNewContext(fs.readFileSync('src/data/pipeSizes.js','utf8'),context);const pipe=context.window.PipeSizes;
['機房 / 資料中心整合估算','換氣量計算','冷負載估算','水管管徑建議','壓差估算流量','kW 估算電流','溫度換算','流量換算','壓力換算','流速換算','電力單位換算','意見回饋'].forEach(t=>assert(index.includes(t)));
assert(index.includes('./src/data/pipeSizes.js'));assert(index.indexOf('./src/data/pipeSizes.js')<index.indexOf('./app.js?v=20260509-prod-promote'));
assert(pipe&&typeof pipe.getRecommendedPipeForFlow==='function');assert(pipe.getRecommendedPipeForFlow(5000,3).pipe.a==='200A');
assert(app.includes('1FAIpQLSc95R0vPbKHLP9kP4MkCxsTVxk0aHTw4iCqlEHNb-Aa6RSWNQ'));assert(!app.includes('rawVelocity>3')&&!app.includes('displayFlowLpm='));
console.log('smoke ok');
