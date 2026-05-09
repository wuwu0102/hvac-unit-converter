const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc95R0vPbKHLP9kP4MkCxsTVxk0aHTw4iCqlEHNb-Aa6RSWNQ/viewform';
const FEEDBACK_MAILTO = 'mailto:chttwm@gmail.com?subject=HVAC%20Unit%20Converter%20%E6%84%8F%E8%A6%8B%E5%9B%9E%E9%A5%8B';

function initNav() {
  const pages = document.querySelectorAll('.page');
  const home = document.getElementById('home-page');
  document.querySelectorAll('[data-nav-target]').forEach((btn) => btn.addEventListener('click', () => {
    pages.forEach((p) => p.classList.remove('active'));
    document.getElementById(btn.dataset.navTarget)?.classList.add('active');
  }));
  document.querySelectorAll('[data-nav-home]').forEach((btn) => btn.addEventListener('click', () => {
    pages.forEach((p) => p.classList.remove('active'));
    home?.classList.add('active');
  }));
}

function initPipeSuggestTool() {
  const input = document.querySelector('[data-role="pipe-flow"]');
  const output = document.querySelector('[data-role="pipe-result"]');
  if (!input || !output || !window.PipeSizes) return;
  function render() {
    const lpm = Number(input.value);
    if (!Number.isFinite(lpm) || lpm <= 0) { output.textContent = '-'; return; }
    const rec = window.PipeSizes.getRecommendedPipeForFlow(lpm, 3);
    if (!rec) {
      output.textContent = '超過 400A 表內最大管徑，請進一步工程設計。';
      return;
    }
    output.innerText = `建議管徑：${rec.pipe.a}\n建議流速：約 ${rec.velocity.toFixed(1)} m/s\n3 m/s 僅作為設計選管建議值，實際設計仍需依現場條件複核。`;
  }
  input.addEventListener('input', render);
  render();
}

function initDpFlowTool() {
  const m = document.querySelector('[data-role="dp-measured"]');
  const mu = document.querySelector('[data-role="dp-measured-unit"]');
  const ps = document.querySelector('[data-role="dp-pipe-size"]');
  const rf = document.querySelector('[data-role="dp-ref-flow"]');
  const rl = document.querySelector('[data-role="dp-ref-loss"]');
  const rlu = document.querySelector('[data-role="dp-ref-loss-unit"]');
  const out = document.querySelector('[data-role="dp-result"]');
  const warn = document.querySelector('[data-role="dp-warning"]');
  if (!m || !mu || !ps || !rf || !rl || !rlu || !out || !window.PipeSizes) return;
  const toPa = { kPa: 1000, mAq: 9806.65, bar: 100000, psi: 6894.76 };
  window.PipeSizes.PIPE_SIZES.forEach((p) => { const o = document.createElement('option'); o.value = p.a; o.textContent = p.a; ps.appendChild(o); });
  function area(mm){const d=mm/1000; return Math.PI*d*d/4;}
  function render(){
    const measured = Number(m.value), refFlow = Number(rf.value), refLoss = Number(rl.value);
    if (![measured,refFlow,refLoss].every((n)=>Number.isFinite(n)&&n>0)) { out.textContent='-'; warn.textContent=''; return; }
    const measuredPa = measured * toPa[mu.value], refPa = refLoss * toPa[rlu.value];
    const rawFlowLpm = refFlow * Math.sqrt(measuredPa / refPa);
    out.textContent = `預估流量（LPM）：${rawFlowLpm.toFixed(1)}`;
    const pipe = window.PipeSizes.PIPE_SIZES.find((p)=>p.a===ps.value);
    const velocity = (rawFlowLpm/60000)/area(pipe.innerDiameterMm);
    warn.textContent = velocity > 3 ? '提醒：推估流速偏高，請確認壓差單位、量測點、管徑與設備特性。' : '';
  }
  [m,mu,ps,rf,rl,rlu].forEach((el)=>{el.addEventListener('input',render);el.addEventListener('change',render);});
}

function initFeedbackTool() {
  document.querySelector('[data-feedback-google]')?.addEventListener('click', () => window.open(FEEDBACK_FORM_URL, '_blank', 'noopener'));
  document.querySelector('[data-feedback-email]')?.addEventListener('click', () => { window.location.href = FEEDBACK_MAILTO; });
}

document.addEventListener('DOMContentLoaded', () => { initNav(); initPipeSuggestTool(); initDpFlowTool(); initFeedbackTool(); });
