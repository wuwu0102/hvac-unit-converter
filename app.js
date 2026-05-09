const FEEDBACK_FORM_URL='https://docs.google.com/forms/d/e/1FAIpQLSc95R0vPbKHLP9kP4MkCxsTVxk0aHTw4iCqlEHNb-Aa6RSWNQ/viewform';
const FEEDBACK_MAILTO='mailto:chttwm@gmail.com?subject=HVAC%20Unit%20Converter%20%E6%84%8F%E8%A6%8B%E5%9B%9E%E9%A5%8B';
const $=(s,r=document)=>r.querySelector(s);
const panel=(title,inner)=>`<article class="card"><h2>${title}</h2>${inner}</article>`;

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
</div>
<div class='result'><h3>結果區</h3>
<div id='dc-space'>空間：-</div>
<div id='dc-thermal'>散熱：-</div>
<div id='dc-power'>用電：-</div>
<div id='dc-suggest'>建議：-</div>
<div id='dc-chart'>圖表：-</div>
<div id='dc-pue'>PUE：-</div>
</div>`)} ,
{id:'vent',name:'換氣量',render:()=>panel('換氣量',`<div class='grid'><div class='field'><label>空間體積 m³</label><input id='vent-volume' type='number' value='300'></div><div class='field'><label>換氣次數 ACH</label><input id='vent-ach' type='number' value='8'></div></div><div class='result' id='vent-result'>-</div>`)},
{id:'cool',name:'冷負載估算',render:()=>panel('冷負載估算',`<div class='grid'><div class='field'><label>面積 m²</label><input id='cool-area' type='number' value='200'></div><div class='field'><label>冷負載密度 W/m²</label><input id='cool-density' type='number' value='140'></div></div><div class='result' id='cool-result'>-</div>`)},
{id:'pipe',name:'水管管徑建議',render:()=>panel('水管管徑建議',`<div class='field'><label>流量 (LPM)</label><input id='pipe-flow' type='number' value='5000'></div><div class='result' id='pipe-result'>-</div>`)},
{id:'dp',name:'壓差估算流量',render:()=>panel('壓差估算流量',`<div class='grid'><div class='field'><label>量測壓差 kPa</label><input id='dp-measured' type='number' value='20'></div><div class='field'><label>參考流量 LPM</label><input id='dp-ref-flow' type='number' value='300'></div><div class='field'><label>參考壓差 kPa</label><input id='dp-ref-loss' type='number' value='30'></div><div class='field'><label>管徑</label><select id='dp-pipe'></select></div></div><div class='result' id='dp-result'>-</div><p id='dp-warning'></p>`)},
{id:'kwi',name:'kW估算電流',render:()=>panel('kW估算電流',`<div class='grid'><div class='field'><label>功率(kW)</label><input id='kwi-p' type='number' value='10'></div><div class='field'><label>電壓(V)</label><input id='kwi-v' type='number' value='380'></div><div class='field'><label>PF</label><input id='kwi-pf' type='number' value='0.9'></div></div><div class='result' id='kwi-result'>-</div>`)},
{id:'temp',name:'溫度換算',render:()=>panel('溫度換算',`<input id='temp-in' type='number' value='0'><select id='temp-unit'><option value='C'>°C</option><option value='F'>°F</option></select><div class='result' id='temp-result'></div>`)},
{id:'flow',name:'流量換算',render:()=>panel('流量換算',`<input id='flow-in' type='number' value='1'><select id='flow-unit'><option value='LPS'>L/s</option><option value='LPM'>L/min</option></select><div class='result' id='flow-result'></div>`)},
{id:'pressure',name:'壓力換算',render:()=>panel('壓力換算',`<input id='pr-in' type='number' value='1'><select id='pr-unit'><option value='kPa'>kPa</option><option value='Pa'>Pa</option></select><div class='result' id='pr-result'></div>`)},
{id:'velocity',name:'流速換算',render:()=>panel('流速換算',`<input id='vel-in' type='number' value='1'><select id='vel-unit'><option value='ms'>m/s</option><option value='kmh'>km/h</option></select><div class='result' id='vel-result'></div>`)},
{id:'power',name:'電力單位換算',render:()=>panel('電力單位換算',`<input id='pow-in' type='number' value='1'><select id='pow-unit'><option value='kW'>kW</option><option value='RT'>RT</option></select><div class='result' id='pow-result'></div>`)},
{id:'feedback',name:'feedback',render:()=>panel('feedback',`<button id='fb-google'>Google Form</button><button id='fb-email'>Email</button>`)},
];
function renderHome(){return `<section class='page active' id='home'><h1>HVAC Unit Converter Web V1.1</h1><div class='menu-grid'>${toolRegistry.map(t=>`<button class='menu-button' data-tool='${t.id}'>${t.name}</button>`).join('')}</div></section>`}
function openTool(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));$(`#page-${id}`).classList.add('active')}
function renderMobileResultCards(){}
function bindConverter(input,unit,out,fn){const r=()=>out.textContent=fn(Number(input.value),unit.value);[input,unit].forEach(el=>{el.addEventListener('input',r);el.addEventListener('change',r)});r()}
function initTempTool(){bindConverter($('#temp-in'),$('#temp-unit'),$('#temp-result'),(v,u)=>u==='C'?`${v}°C = ${(v*9/5+32).toFixed(1)}°F`:`${v}°F = ${((v-32)*5/9).toFixed(1)}°C`)}
function initFlowTool(){bindConverter($('#flow-in'),$('#flow-unit'),$('#flow-result'),(v,u)=>u==='LPS'?`${v} L/s = ${(v*60).toFixed(1)} L/min`:`${v} L/min = ${(v/60).toFixed(3)} L/s`)}
function initPressureTool(){bindConverter($('#pr-in'),$('#pr-unit'),$('#pr-result'),(v,u)=>u==='kPa'?`${v} kPa = ${(v*1000).toFixed(0)} Pa`:`${v} Pa = ${(v/1000).toFixed(3)} kPa`)}
function initVelocityTool(){bindConverter($('#vel-in'),$('#vel-unit'),$('#vel-result'),(v,u)=>u==='ms'?`${v} m/s = ${(v*3.6).toFixed(2)} km/h`:`${v} km/h = ${(v/3.6).toFixed(3)} m/s`)}
function initPowerUnitTool(){bindConverter($('#pow-in'),$('#pow-unit'),$('#pow-result'),(v,u)=>u==='kW'?`${v} kW = ${(v/3.517).toFixed(3)} RT`:`${v} RT = ${(v*3.517).toFixed(3)} kW`)}
function initKwiTool(){const r=()=>{$('#kwi-result').textContent=`預估電流：${((+$('#kwi-p').value*1000)/(Math.sqrt(3)*+$('#kwi-v').value*+$('#kwi-pf').value)).toFixed(2)} A`;};['#kwi-p','#kwi-v','#kwi-pf'].forEach(id=>$(id).addEventListener('input',r));r();}
function initVentilationTool(){const r=()=>$('#vent-result').textContent=`換氣量：${(+$('#vent-volume').value*+$('#vent-ach').value).toFixed(1)} m³/h`;['#vent-volume','#vent-ach'].forEach(id=>$(id).addEventListener('input',r));r();}
function initCoolingLoadTool(){const r=()=>$('#cool-result').textContent=`冷負載：${(+$('#cool-area').value*+$('#cool-density').value/1000).toFixed(2)} kW`;['#cool-area','#cool-density'].forEach(id=>$(id).addEventListener('input',r));r();}
function initDataCenterLoadTool(){const r=()=>{const rows=+$('#dc-rows').value,rpr=+$('#dc-racks-per-row').value,kw=+$('#dc-kw-per-rack').value;const it=rows*rpr*kw;const unit=$('#dc-dim-unit').value==='ft'?0.3048:1;const l=+$('#dc-length').value*unit,w=+$('#dc-width').value*unit,h=+$('#dc-height').value*unit;const area=l*w;const volume=area*h;const ups=it*+$('#dc-ups-heat').value,pd=it*+$('#dc-pd-heat').value,light=area*+$('#dc-lighting-density').value/1000,other=it*+$('#dc-other-ratio').value;const people=+$('#dc-people').value*0.12;const total=it+ups+pd+light+other+people;const pue=total/it;const acPower=total-it;$('#dc-space').textContent=`空間：${area.toFixed(1)} m² / ${volume.toFixed(1)} m³`;$('#dc-thermal').textContent=`散熱：IT ${it.toFixed(1)} + UPS ${ups.toFixed(1)} + 配電 ${pd.toFixed(1)} + 照明 ${light.toFixed(1)} + 人員 ${people.toFixed(1)} kW`;$('#dc-power').textContent=`用電：IT ${it.toFixed(1)} kW，空調總用電 ${acPower.toFixed(1)} kW`;$('#dc-suggest').textContent=`建議配置：N+1 冷卻、熱通道封閉，理論 PUE ${pue.toFixed(3)}`;$('#dc-chart').textContent=`圖表：IT ${((it/total)*100).toFixed(1)}%、非IT ${((1-it/total)*100).toFixed(1)}%`;$('#dc-pue').textContent=`PUE：理論 PUE ${pue.toFixed(3)}`;};['#dc-rows','#dc-racks-per-row','#dc-kw-per-rack','#dc-length','#dc-width','#dc-height','#dc-dim-unit','#dc-people','#dc-ups-heat','#dc-pd-heat','#dc-lighting-density','#dc-other-ratio','#dc-voltage','#dc-pf'].forEach(id=>$(id).addEventListener('input',r));r();}
const initDcSharedTool=initDataCenterLoadTool;
function initPipeSuggestTool(){const r=()=>{const rec=window.PipeSizes.getRecommendedPipeForFlow(+$('#pipe-flow').value,3);$('#pipe-result').textContent=rec?`建議管徑：${rec.pipe.a}`:'超過 400A';};$('#pipe-flow').addEventListener('input',r);r();}
function initDpFlowTool(){window.PipeSizes.PIPE_SIZES.forEach(p=>$('#dp-pipe').insertAdjacentHTML('beforeend',`<option value='${p.a}'>${p.a}</option>`));const area=mm=>Math.PI*(mm/1000)**2/4;const r=()=>{const rawFlowLpm=+$('#dp-ref-flow').value*Math.sqrt(+$('#dp-measured').value/+$('#dp-ref-loss').value);$('#dp-result').textContent=`預估流量（LPM）：${rawFlowLpm.toFixed(1)}`;const pipe=window.PipeSizes.PIPE_SIZES.find(p=>p.a===$('#dp-pipe').value);const vel=(rawFlowLpm/60000)/area(pipe.innerDiameterMm);$('#dp-warning').textContent=vel>3?'警告：流速偏高，請檢核。':'';};['#dp-measured','#dp-ref-flow','#dp-ref-loss','#dp-pipe'].forEach(id=>$(id).addEventListener('input',r));r();}
function initFeedbackTool(){$('#fb-google').onclick=()=>window.open(FEEDBACK_FORM_URL,'_blank','noopener');$('#fb-email').onclick=()=>window.location.href=FEEDBACK_MAILTO;}
function initNav(){document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>openTool(b.dataset.tool));document.querySelectorAll('[data-nav-home]').forEach(b=>b.onclick=()=>openTool('home'));}
(function bootstrap(){const app=$('#app');app.innerHTML=renderHome()+toolRegistry.map(t=>`<section class='page' id='page-${t.id}'><button class='back-btn' data-nav-home>返回首頁</button>${t.render()}</section>`).join('');document.getElementById('home').id='page-home';initNav();initTempTool();initFlowTool();initPressureTool();initVelocityTool();initPowerUnitTool();initKwiTool();initPipeSuggestTool();initDpFlowTool();initVentilationTool();initCoolingLoadTool();initDataCenterLoadTool();initFeedbackTool();renderMobileResultCards();})();
