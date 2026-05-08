const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSc95R0vPbKHLP9kP4MkCxsTVxk0aHTw4iCqlEHNb-Aa6RSWNQ/viewform';

const q=(s)=>document.querySelector(s);const qa=(s)=>Array.from(document.querySelectorAll(s));
const f=(n,d=2)=>Number.isFinite(n)?n.toFixed(d):'-';

function showPage(id){qa('.page').forEach(p=>p.classList.remove('active'));q(`#${id}`)?.classList.add('active');window.scrollTo(0,0);} 
qa('[data-nav-target]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.navTarget)));
qa('[data-nav-home]').forEach(b=>b.addEventListener('click',()=>showPage('home-page')));

function calcDc(){
  const rows=+q('#rack-rows').value, perRow=+q('#racks-per-row').value, kwRack=+q('#kw-per-rack').value;
  const L=+q('#room-length').value,W=+q('#room-width').value,H=+q('#room-height').value,people=+q('#people-count').value;
  const upsF=+q('#ups-factor').value,pdF=+q('#power-dist-factor').value,lightD=+q('#lighting-density').value;
  const v=+q('#dc-voltage').value,pf=+q('#dc-pf').value;
  const racks=rows*perRow,it=racks*kwRack,ups=it*upsF,pd=it*pdF,light=L*W*lightD/1000,peopleKw=people*0.13;
  const total=it+ups+pd+light+peopleKw,cooling=total-it,pue=it>0?total/it:0,current=(total*1000)/(Math.sqrt(3)*v*Math.max(pf,0.01));
  q('#dc-result').textContent=`總機櫃數: ${f(racks,0)}
IT 負載: ${f(it)} kW
總用電: ${f(total)} kW
冷卻需求: ${f(cooling)} kW
PUE: ${f(pue,3)}
估算三相電流: ${f(current)} A`;
  q('#dc-suggest').textContent=`建議配置：
- 冷卻主機總容量至少 ${f(cooling*1.15)} kW（含15%餘裕）
- 建議 N+1 CRAC/CRAH 佈局
- 高熱通道建議封閉並做熱點監測`;
  const pct=(x)=>total>0?Math.round(x/total*100):0;
  q('#dc-chart').textContent=`比例圖（%）
IT ${pct(it)} | UPS ${pct(ups)} | 配電 ${pct(pd)} | 照明 ${pct(light)} | 人員 ${pct(peopleKw)}`;
}
['rack-rows','racks-per-row','kw-per-rack','room-length','room-width','room-height','people-count','ups-factor','power-dist-factor','lighting-density','dc-voltage','dc-pf'].forEach(id=>q('#'+id).addEventListener('input',calcDc));
calcDc();

function bindSimple(idVal,idUnit,idResult,a,b){const run=()=>{const x=+q(idVal).value;if(!Number.isFinite(x)){q(idResult).textContent='-';return;}q(idResult).textContent=q(idUnit).value===a?b(x):b(x,true)};q(idVal).addEventListener('input',run);q(idUnit).addEventListener('change',run)}
bindSimple('#temp-value','#temp-unit','#temp-result','C',(x,rev)=>rev?`${f((x-32)*5/9)} °C`:`${f(x*9/5+32)} °F`);
bindSimple('#airflow-value','#airflow-unit','#airflow-result','CFM',(x,rev)=>rev?`${f(x/1.699)} CFM`:`${f(x*1.699)} CMH`);
bindSimple('#pressure-value','#pressure-unit','#pressure-result','Pa',(x,rev)=>rev?`${f(x/1000)} kPa`:`${f(x*1000)} Pa`);

q('[data-feedback-google]')?.addEventListener('click',()=>window.open(formUrl,'_blank','noopener'));
q('[data-feedback-email]')?.addEventListener('click',()=>{
  const subject='HVAC Unit Converter 意見回饋';
  const body=`留言：\n\n聯絡方式：\n\n使用裝置：\n${navigator.userAgent}`;
  window.location.href=`mailto:chttwm@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
