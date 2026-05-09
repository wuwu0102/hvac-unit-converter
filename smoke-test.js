const fs=require('fs');const assert=require('assert');const vm=require('vm');
const app=fs.readFileSync('app.js','utf8');
[
'機房長度','UPS 發熱係數','配電系統發熱係數','照明密度','其他用電比例',
'理論 PUE','空調總用電','建議配置','initDcSharedTool','initDataCenterLoadTool','renderMobileResultCards'
].forEach(t=>assert(app.includes(t),`missing ${t}`));
const tools=['資料中心整合估算','換氣量','冷負載估算','水管管徑建議','壓差估算流量','kW估算電流','溫度換算','流量換算','壓力換算','流速換算','電力單位換算','feedback'];
tools.forEach(t=>assert(app.includes(t),`missing tool ${t}`));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('src/data/pipeSizes.js','utf8'),ctx);
assert(ctx.window.PipeSizes.getRecommendedPipeForFlow(5000,3).pipe.a==='200A','5000 LPM should map to 200A');
assert(!app.includes('rawFlowLpm = flow'),'should not overwrite rawFlowLpm');
assert(app.includes('警告：流速偏高'),'must warn only for high velocity');
assert(app.includes('1FAIpQLSc95R0vPbKHLP9kP4MkCxsTVxk0aHTw4iCqlEHNb-Aa6RSWNQ'));
assert(app.includes('chttwm@gmail.com'));
console.log('smoke ok');
