const FEEDBACK_FORM_URL='https://docs.google.com/forms/d/e/1FAIpQLSc95R0vPbKHLP9kP4MkCxsTVxk0aHTw4iCqlEHNb-Aa6RSWNQ/viewform';
const FEEDBACK_MAILTO='mailto:chttwm@gmail.com?subject=HVAC%20Unit%20Converter%20%E6%84%8F%E8%A6%8B%E5%9B%9E%E9%A5%8B';
const $=(s,r=document)=>r.querySelector(s);
const panel=(title,inner)=>`<article class="card"><h2>${title}</h2>${inner}</article>`;

function buildPieSection(title, items, wrapClass, pieClass) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const stops = [];
  let acc = 0;
  items.forEach(i => {
    const start = (acc / total) * 100;
    acc += i.value;
    const end = (acc / total) * 100;
    stops.push(`${i.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`);
  });
  return `<section class="dc-section dc-chart"><h4>${title}</h4><div class="${wrapClass}"><div class="${pieClass}" style="background:conic-gradient(${stops.join(',')})"></div><div class="pie-legend">${items.map(i=>`<div><span class="dot" style="background:${i.color}"></span>${i.label}：${i.value.toFixed(2)} kW</div>`).join('')}</div></div></section>`;
}

const toolRegistry=[
{id:'dc',name:'資料中心整合估算',render:()=>panel('資料中心整合估算',`
<div class='grid'>
<div class='field'><label>排數</label><input id='dc-rows' type='number' value='4'></div>
<div class='field'><label>每排機櫃數</label><input id='dc-racks-per-row' type='number' value='10'></div>
<div class='field'><label>每櫃功率 kW</label><input id='dc-kw-per-rack' type='number' value='5'></div>
<div class='field'><label>機房長度</label><input id='dc-length' type='number' value='20'></div>
<div class='field'><label>機房寬度</label><input id='dc-width' type='number' value='12'></div>
<div class='field'><label>機房高度</label><input id='dc-height' type='number' value='4'></div>
<div class='field'><label>長寬高單位</label><select id='dc-dim-unit'><option value='m'>m</option><option value='ft'>ft</option></select></div>
<div class='field'><label>人員數</label><input id='dc-people' type='number' value='8'></div>
<div class='field'><label>UPS 發熱係數</label><input id='dc-ups-heat' type='number' step='0.01' value='0.08'></div>
<div class='field'><label>配電系統發熱係數</label><input id='dc-pd-heat' type='number' step='0.01' value='0.04'></div>
<div class='field'><label>照明密度 W/m²</label><input id='dc-lighting-density' type='number' value='12'></div>
<div class='field'><label>其他用電比例</label><input id='dc-other-ratio' type='number' step='0.01' value='0.06'></div>
<div class='field'><label>電壓 V</label><input id='dc-voltage' type='number' value='380'></div>
<div class='field'><label>功率因數 PF</label><input id='dc-pf' type='number' step='0.01' value='0.92'></div>
</div><div class='result' id='dc-result'>-</div>`)} ,
{id:'pipe',name:'水管管徑建議',render:()=>panel('水管管徑建議',`<div class='field'><label>流量 (LPM)</label><input id='pipe-flow' type='number' value='5000'></div><div class='result' id='pipe-result'>-</div>`)},
{id:'dp',name:'壓差估算流量',render:()=>panel('壓差估算流量',`<div class='grid'><div class='field'><label>量測壓差 kPa</label><input id='dp-measured' type='number' value='20'></div><div class='field'><label>參考流量 LPM</label><input id='dp-ref-flow' type='number' value='300'></div><div class='field'><label>參考壓差 kPa</label><input id='dp-ref-loss' type='number' value='30'></div><div class='field'><label>管徑</label><select id='dp-pipe'></select></div></div><div class='result' id='dp-result'>-</div><p id='dp-warning'></p>`)} ,
{id:'feedback',name:'feedback',render:()=>panel('feedback',`<button id='fb-google'>Google Form</button><button id='fb-email'>Email</button>`)},
];
function renderHome(){return `<section class='page active' id='home'><h1>HVAC Unit Converter Web V1.1</h1><div class='menu-grid'>${toolRegistry.map(t=>`<button class='menu-button' data-tool='${t.id}'>${t.name}</button>`).join('')}</div></section>`}
function openTool(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));$(`#page-${id}`).classList.add('active')}
function renderMobileResultCards(){}
function initDataCenterLoadTool(){const r=()=>{const rows=+$('#dc-rows').value,rpr=+$('#dc-racks-per-row').value,kw=+$('#dc-kw-per-rack').value;const it=rows*rpr*kw;const unit=$('#dc-dim-unit').value==='ft'?0.3048:1;const l=+$('#dc-length').value*unit,w=+$('#dc-width').value*unit,h=+$('#dc-height').value*unit;const area=l*w;const volume=area*h;const ups=it*+$('#dc-ups-heat').value,pd=it*+$('#dc-pd-heat').value,light=area*+$('#dc-lighting-density').value/1000,other=it*+$('#dc-other-ratio').value;const people=+$('#dc-people').value*0.12;const cooling=ups+pd+light+other+people;const total=it+cooling;const pue=total/it;const i=(total*1000)/(Math.sqrt(3)*+$('#dc-voltage').value*+$('#dc-pf').value);
const heatItems=[{label:'IT',value:it,color:'#2563eb'},{label:'UPS',value:ups,color:'#16a34a'},{label:'配電',value:pd,color:'#f59e0b'},{label:'照明',value:light,color:'#9333ea'},{label:'人員/其他',value:other+people,color:'#ef4444'}];
const powerItems=[{label:'IT',value:it,color:'#2563eb'},{label:'空調總用電組成',value:cooling,color:'#0ea5e9'}];
$('#dc-result').innerHTML=`<section class='dc-section dc-space'><h4>A. 機房空間</h4><p>面積 ${area.toFixed(2)} m²，體積 ${volume.toFixed(2)} m³。</p></section>
<section class='dc-section dc-heat'><h4>B. 散熱評估</h4><p>IT ${it.toFixed(2)} kW，UPS ${ups.toFixed(2)} kW，配電 ${pd.toFixed(2)} kW，照明 ${light.toFixed(2)} kW，人員 ${people.toFixed(2)} kW。</p></section>
<section class='dc-section dc-power'><h4>C. 預估用電容量 / NFB 估算</h4><p>總負載 ${total.toFixed(2)} kW，線電流 ${i.toFixed(2)} A，NFB / 幹線建議依 125% 餘裕選型。</p></section>
<section class='dc-section dc-power-summary'><h4>C-1. 總用電分析</h4><p>IT 用電 ${it.toFixed(2)} kW，空調總用電組成 ${cooling.toFixed(2)} kW，總用電 ${total.toFixed(2)} kW。</p></section>
<section class='dc-section dc-advice'><h4>D. 建議配置</h4><p>建議採用 N+1 冷卻、熱通道封閉與分區送風策略。</p></section>
${buildPieSection('E. 散熱比例圖',heatItems,'heat-pie-wrap','heat-pie')}
${buildPieSection('F. 總用電比例圖',powerItems,'heat-pie-wrap','heat-pie')}
<section class='dc-section dc-pue'><h4>G. 理論 PUE</h4><p>理論 PUE 初估：${pue.toFixed(3)}</p></section>`;};['#dc-rows','#dc-racks-per-row','#dc-kw-per-rack','#dc-length','#dc-width','#dc-height','#dc-dim-unit','#dc-people','#dc-ups-heat','#dc-pd-heat','#dc-lighting-density','#dc-other-ratio','#dc-voltage','#dc-pf'].forEach(id=>$(id).addEventListener('input',r));r();}
const initDcSharedTool=initDataCenterLoadTool;
function initPipeSuggestTool(){const r=()=>{const rec=window.PipeSizes.getRecommendedPipeForFlow(+$('#pipe-flow').value,3);$('#pipe-result').textContent=rec?`建議管徑：${rec.pipe.a}`:'超過 400A';};$('#pipe-flow').addEventListener('input',r);r();}
function initDpFlowTool(){window.PipeSizes.PIPE_SIZES.forEach(p=>$('#dp-pipe').insertAdjacentHTML('beforeend',`<option value='${p.a}'>${p.a}</option>`));const area=mm=>Math.PI*(mm/1000)**2/4;const r=()=>{const rawFlowLpm=+$('#dp-ref-flow').value*Math.sqrt(+$('#dp-measured').value/+$('#dp-ref-loss').value);$('#dp-result').textContent=`預估流量（LPM）：${rawFlowLpm.toFixed(1)}`;const pipe=window.PipeSizes.PIPE_SIZES.find(p=>p.a===$('#dp-pipe').value);const vel=(rawFlowLpm/60000)/area(pipe.innerDiameterMm);$('#dp-warning').textContent=vel>3?'警告：流速偏高，請檢核。':'提醒：壓差換算僅供估算，請以現場量測確認。';};['#dp-measured','#dp-ref-flow','#dp-ref-loss','#dp-pipe'].forEach(id=>$(id).addEventListener('input',r));r();}
function initFeedbackTool(){$('#fb-google').onclick=()=>window.open(FEEDBACK_FORM_URL,'_blank','noopener');$('#fb-email').onclick=()=>window.location.href=FEEDBACK_MAILTO;}
function initNav(){document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>openTool(b.dataset.tool));document.querySelectorAll('[data-nav-home]').forEach(b=>b.onclick=()=>openTool('home'));}
(function bootstrap(){const app=$('#app');app.innerHTML=renderHome()+toolRegistry.map(t=>`<section class='page' id='page-${t.id}'><button class='back-btn' data-nav-home>返回首頁</button>${t.render()}</section>`).join('');document.getElementById('home').id='page-home';initNav();initPipeSuggestTool();initDpFlowTool();initDataCenterLoadTool();initFeedbackTool();renderMobileResultCards();})();
