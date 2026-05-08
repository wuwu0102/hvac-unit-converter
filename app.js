const q=(s)=>document.querySelector(s);const qa=(s)=>Array.from(document.querySelectorAll(s));
const f=(n,d=2)=>Number.isFinite(n)?n.toFixed(d):'-';

const TOOL_REGISTRY={
feedback:{
  title:'意見回饋',
  subtitle:'回報問題與建議。',
  render:()=>`
    <div class='result-box'>
      <p>若使用中遇到問題或有功能建議，歡迎透過下列方式回饋。</p>
      <div class='grid two'>
        <button id='feedbackGoogleForm' class='entry' type='button'>
          <b>Google Form 回饋</b>
          <small>開啟正式回饋表單</small>
        </button>
        <button id='feedbackEmail' class='entry' type='button'>
          <b>Email 備援回饋</b>
          <small>使用 Email 回報問題</small>
        </button>
      </div>
      <p class='muted'>提醒：若要回報畫面問題，請附上截圖與操作步驟，會更快協助排查。</p>
    </div>
  `,
  init:initFeedbackTool
}
};

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
  q('#dc-result').textContent=`總機櫃數: ${f(racks,0)}\nIT 負載: ${f(it)} kW\n總用電: ${f(total)} kW\n冷卻需求: ${f(cooling)} kW\nPUE: ${f(pue,3)}\n估算三相電流: ${f(current)} A`;
  q('#dc-suggest').textContent=`建議配置：\n- 冷卻主機總容量至少 ${f(cooling*1.15)} kW（含15%餘裕）\n- 建議 N+1 CRAC/CRAH 佈局\n- 高熱通道建議封閉並做熱點監測`;
}
['rack-rows','racks-per-row','kw-per-rack','room-length','room-width','room-height','people-count','ups-factor','power-dist-factor','lighting-density','dc-voltage','dc-pf'].forEach(id=>q('#'+id).addEventListener('input',calcDc));
calcDc();

function bindSimple(idVal,idUnit,idResult,a,b){const run=()=>{const x=+q(idVal).value;if(!Number.isFinite(x)){q(idResult).textContent='-';return;}q(idResult).textContent=q(idUnit).value===a?b(x):b(x,true)};q(idVal).addEventListener('input',run);q(idUnit).addEventListener('change',run)}
bindSimple('#temp-value','#temp-unit','#temp-result','C',(x,rev)=>rev?`${f((x-32)*5/9)} °C`:`${f(x*9/5+32)} °F`);
bindSimple('#airflow-value','#airflow-unit','#airflow-result','CFM',(x,rev)=>rev?`${f(x/1.699)} CFM`:`${f(x*1.699)} CMH`);
bindSimple('#pressure-value','#pressure-unit','#pressure-result','Pa',(x,rev)=>rev?`${f(x/1000)} kPa`:`${f(x*1000)} Pa`);

function initFeedbackTool(){
  const googleButton = document.getElementById('feedbackGoogleForm');
  const emailButton = document.getElementById('feedbackEmail');
  const FORMAL_GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc95R0vPbKHLP9kP4MkCxsTVxk0aHTw4iCqlEHNb-Aa6RSWNQ/viewform';

  if (googleButton) {
    googleButton.addEventListener('click', () => {
      window.open(FORMAL_GOOGLE_FORM_URL, '_blank', 'noopener');
    });
  }

  if (emailButton) {
    emailButton.addEventListener('click', () => {
      const subject = encodeURIComponent('HVAC Unit Converter 意見回饋');
      const body = encodeURIComponent([
        '留言：',
        '',
        '聯絡方式：',
        '',
        '使用裝置：',
        navigator.userAgent
      ].join('\n'));
      window.location.href = `mailto:chttwm@gmail.com?subject=${subject}&body=${body}`;
    });
  }
}

const feedbackRoot=q('#feedback-content');
if(feedbackRoot){feedbackRoot.innerHTML=TOOL_REGISTRY.feedback.render();TOOL_REGISTRY.feedback.init();}
