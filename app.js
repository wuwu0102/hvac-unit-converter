const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSc95R0vPbKHLP9kP4MkCxsTVxk0aHTw4iCqlEHNb-Aa6RSWNQ/viewform';

function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');}
document.querySelectorAll('[data-nav-target]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.navTarget)));
document.querySelectorAll('[data-nav-home]').forEach(b=>b.addEventListener('click',()=>showPage('home-page')));

function f(n){return Number.isFinite(n)?n.toFixed(2):'-';}
function bindSimple(tool,conv){const v=document.querySelector(`[data-tool="${tool}"][data-role="value"]`);const u=document.querySelector(`[data-tool="${tool}"][data-role="unit"]`);const r=document.querySelector(`[data-tool="${tool}"][data-role="result"]`);if(!v)return;const run=()=>{const x=Number(v.value);if(!Number.isFinite(x)){r.textContent='-';return;}r.textContent=conv(x,u.value)};v.addEventListener('input',run);u.addEventListener('change',run);}
bindSimple('temp',(x,u)=>u==='C'?`${f(x*9/5+32)} °F`:`${f((x-32)*5/9)} °C`);
bindSimple('airflow',(x,u)=>u==='CFM'?`${f(x*1.699)} CMH`:`${f(x/1.699)} CFM`);
bindSimple('pressure',(x,u)=>u==='kPa'?`${f(x*1000)} Pa`:`${f(x/1000)} kPa`);
bindSimple('velocity',(x,u)=>u==='m/s'?`${f(x*3.281)} ft/s`:`${f(x/3.281)} m/s`);
bindSimple('power',(x,u)=>u==='kW'?`${f(x*1000)} W`:`${f(x/1000)} kW`);

function bind(id,fn){const el=document.getElementById(id);if(el)el.addEventListener('input',fn);} 
const recalcCurrent=()=>{const kw=Number(document.getElementById('kw').value),v=Number(document.getElementById('volt').value);document.getElementById('current-result').textContent=(kw>0&&v>0)?`${f((kw*1000)/(1.732*v*0.85))} A`:'-';};bind('kw',recalcCurrent);bind('volt',recalcCurrent);
const recalcDc=()=>{const it=Number(document.getElementById('it-load').value),p=Number(document.getElementById('pue').value);document.getElementById('dc-result').textContent=(it>0&&p>0)?`總用電 ${f(it*p)} kW，冷卻需求約 ${f(it*(p-1))} kW`:'-';};bind('it-load',recalcDc);bind('pue',recalcDc);
const recalcVent=()=>{const v=Number(document.getElementById('room-volume').value),a=Number(document.getElementById('ach').value);document.getElementById('vent-result').textContent=(v>0&&a>0)?`需求風量 ${f(v*a)} CMH`:'-';};bind('room-volume',recalcVent);bind('ach',recalcVent);
const recalcLoad=()=>{const c=Number(document.getElementById('airflow-cmh').value),t=Number(document.getElementById('delta-t').value);document.getElementById('load-result').textContent=(c>0&&t>0)?`冷負載約 ${f(1.2*c*t/3024)} RT`:'-';};bind('airflow-cmh',recalcLoad);bind('delta-t',recalcLoad);
const recalcPipe=()=>{const lpm=Number(document.getElementById('pipe-flow').value);if(!(lpm>0)){document.getElementById('pipe-result').textContent='-';return;}const m3s=lpm/60000;const c=(window.PIPE_SIZES||[]).map(p=>({p,v:m3s/(Math.PI*((p.innerDiameterMm/1000)**2)/4)})).find(x=>x.v<=3);document.getElementById('pipe-result').textContent=c?`${c.p.a} / ${c.p.inchDn}，流速 ${f(c.v)} m/s`:'超出表內範圍';};bind('pipe-flow',recalcPipe);
const recalcDp=()=>{const dp=Number(document.getElementById('dp-kpa').value),rdp=Number(document.getElementById('dp-ref').value),rf=Number(document.getElementById('dp-ref-flow').value);document.getElementById('dp-result').textContent=(dp>0&&rdp>0&&rf>0)?`${f(rf*Math.sqrt(dp/rdp))} LPM`:'-';};bind('dp-kpa',recalcDp);bind('dp-ref',recalcDp);bind('dp-ref-flow',recalcDp);

function initFeedbackTool(){
  document.querySelector('[data-feedback-google]')?.addEventListener('click',()=>window.open(formUrl,'_blank','noopener'));
  document.querySelector('[data-feedback-email]')?.addEventListener('click',()=>{
    const subject='HVAC Unit Converter 意見回饋';
    const body=`留言：\n\n聯絡方式：\n\n使用裝置：\n${navigator.userAgent}`;
    window.location.href=`mailto:chttwm@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
initFeedbackTool();
