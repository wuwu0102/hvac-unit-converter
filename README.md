# HVAC Unit Converter

HVAC 單位轉換與工程估算工具（Web 版）。

## 主要功能
- 溫度、流量、壓力、流速、電力單位換算
- 冷負載估算
- 換氣量估算
- 水管管徑建議
- 壓差估算流量
- 機房 / 資料中心整合估算
- 意見回饋頁面（Google Form / Email）

## 開發與本機執行
1. 安裝相依套件：`npm install`
2. 執行建置檢查：`npm run build`
3. 直接以靜態伺服器開啟專案根目錄（或直接開啟 `index.html`）

## CI / Workflow（Web Only）
目前僅保留 Web 相關流程：
- `Web Build Check`：在 push / pull request 時執行 `npm install|ci` 與 `npm run build`。
- 其他既有部署/同步 workflow 若存在，僅處理 Web 檔案同步，不包含 Android / iOS 建置。

## 部署
- Production: https://wuwu0102.github.io/hvac-unit-converter/
