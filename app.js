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

const toolRegistry = {
  dc:{title:'機房 / 資料中心整合估算',render:()=>panel('機房 / 資料中心整合估算',`\n    <div class="field"><label>IT 負載 (kW)</label><input id="it-load" type="number" value="100"></div>\n    <div class="field"><label>UPS 發熱係數</label><input id="ups-factor" type="number" step="0.01" value="0.08"></div>\n    <div class="field"><label>PUE</label><input id="pue" type="number" step="0.01" value="1.5"></div>\n    <ul class="mobile-result-list"><li>僅做快速估算用途</li></ul>\n  `)},
  feedback:{title:'意見回饋',render:()=>panel('意見回饋',`\n    <p><a href="https://docs.google.com/forms/d/e/1FAIpQLSc95R0vPbKHLP9kP4MkCxsTVxk0aHTw4iCqlEHNb-Aa6RSWNQ/viewform" target="_blank" rel="noopener">Google Form 回饋表單</a></p>\n    <p><a href="mailto:chttwm@gmail.com?subject=HVAC%20Unit%20Converter%20%E6%84%8F%E8%A6%8B%E5%9B%9E%E9%A5%8B">chttwm@gmail.com</a></p>\n  `)}
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
