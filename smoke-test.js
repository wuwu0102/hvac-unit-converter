const fs=require('fs');const assert=require('assert');const vm=require('vm');
const app=fs.readFileSync('app.js','utf8');
[
'A. 機房空間','B. 散熱評估','C. 預估用電容量 / NFB 估算','C-1. 總用電分析','D. 建議配置','E. 散熱比例圖','F. 總用電比例圖','G. 理論 PUE','buildPieSection','heat-pie-wrap','pie-legend',
'dc-section','dc-space','dc-heat','dc-power','dc-power-summary','dc-advice','dc-chart','dc-pue','空調總用電組成','NFB / 幹線','理論 PUE 初估'
].forEach(t=>assert(app.includes(t),`missing ${t}`));
['空間：','散熱：','用電：','圖表：IT','PUE：理論 PUE'].forEach(t=>assert(!app.includes(t),`must not include summary pattern ${t}`));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('src/data/pipeSizes.js','utf8'),ctx);
assert(ctx.window.PipeSizes.getRecommendedPipeForFlow(5000,3).pipe.a==='200A','5000 LPM should map to 200A');
assert(!app.includes('rawFlowLpm = 2.5')&&!app.includes('rawFlowLpm = 3'),'must not overwrite rawFlowLpm by velocity constants');
assert(app.includes('警告：流速偏高'),'must keep warning');
assert(app.includes('1FAIpQLSc95R0vPbKHLP9kP4MkCxsTVxk0aHTw4iCqlEHNb-Aa6RSWNQ'));
assert(app.includes('chttwm@gmail.com'));
console.log('smoke ok');
