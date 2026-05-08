const home = document.getElementById('home')
const tool = document.getElementById('tool')
const groupA = document.querySelector('[data-group="A"]')

const tools = [
  { id: 'dc', title: '機房 / 資料中心整合估算' },
  { id: 'feedback', title: '意見回饋' }
]

function panel(title, body) {
  return `\n    <h2>${title}</h2>\n    ${body}\n    <p><button class="btn" data-back>返回首頁</button></p>\n  `
}

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

const toolRegistry = {
  dc:{title:'機房 / 資料中心整合估算',render:()=>panel('機房 / 資料中心整合估算',`\n    <div class="field"><label>IT 負載 (kW)</label><input id="it-load" type="number" value="100"></div>\n    <div class="field"><label>UPS 發熱係數</label><input id="ups-factor" type="number" step="0.01" value="0.08"></div>\n    <div class="field"><label>PUE</label><input id="pue" type="number" step="0.01" value="1.5"></div>\n    <ul class="mobile-result-list"><li>僅做快速估算用途</li></ul>\n  `)},
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
}

function renderHome() {
  groupA.innerHTML = tools.map(t => `<button class="btn" data-tool="${t.id}">${t.title}</button>`).join('')
  home.classList.add('active')
  tool.classList.remove('active')
  tool.innerHTML = ''
}

function openTool(id) {
  const item = toolRegistry[id]
  if (!item) return
  tool.innerHTML = item.render()
  if (typeof item.init === 'function') item.init()
  home.classList.remove('active')
  tool.classList.add('active')
}

document.addEventListener('click', (e) => {
  const t = e.target
  if (!(t instanceof HTMLElement)) return
  if (t.dataset.tool) openTool(t.dataset.tool)
  if (t.hasAttribute('data-back')) renderHome()
})

renderHome()
