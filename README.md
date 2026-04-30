# HVAC Unit Converter V0.19

HVAC 單位轉換工具（中文優先、手機版優先）。

## 功能列表
- 空調能力轉換（RT / kW / kcal/h / BTU/h）
- 溫度轉換（C ↔ F）
- 流量轉換（CFM / CMH / m3/s / L/s / LPM / CMM）
- 壓力轉換（Pa / kPa / mmAq / bar / psi / N/m2）
- 面積轉換
- 流速轉換（m/s / ft/s / mm/s / cm/s）
- 流量對應管徑
- 壓差估算流量（設備修正）
- 電力模組
  - 電力單位換算（W / kW / MW / HP）
  - 三相電力估算（kVA / kW）
  - 單相電力估算（kVA / kW）
  - 電流估算（A）

## 電力模組說明
- 電力模組僅包含 W、kW、MW、HP。
- RT、kcal/h、BTU/h、冷凍噸屬於冷量 / 空調能力，不列入電力模組。

## 開發（legacy-web）
直接開啟 `legacy-web/index.html` 即可使用。

## CI / 發佈狀態
- Web 版本目前可正常使用，透過 GitHub Pages 部署。
- Android APK 可由 GitHub Actions 的 `Build Android APK` workflow artifact 下載。
- iOS TestFlight / App Store release 目前暫停，待 Mac / Xcode / code signing 環境準備完成後再重新啟用。

## 部署網址
- 正式版（Production）：
  - https://wuwu0102.github.io/hvac-unit-converter/
- 測試版（Staging）：
  - https://wuwu0102.github.io/hvac-unit-converter/dev/

## 開發流程
1. 新功能先在 `develop` branch 開發。
2. 推送後由 `Deploy Flutter Web Staging` 自動部署到測試版網址。
3. 測試版確認正常後，再將 `develop` merge 到 `main`。
4. `main` 永遠維持穩定正式版，由 `Deploy Flutter Web Production` 部署到 root。

## iOS CI 說明
- `iOS Build Only Manual` workflow 僅支援手動觸發（`workflow_dispatch`）。
- iOS 上架仍需 Mac / Xcode / code signing，GitHub Actions 目前只做手動測試用途。


## Mobile App 打包方式
1. 安裝相依套件：`npm install`
2. 建立 Web 輸出：`npm run build`
3. 同步 Capacitor 專案：`npx cap sync`
4. 開啟 iOS 專案：`npx cap open ios`
5. 開啟 Android 專案：`npx cap open android`

### 平台需求
- iOS 打包與上架需要 Mac / Xcode。
- Android 打包與上架需要 Android Studio。

## Mobile App 打包準備
- 目前 **web app 仍是主要可運行版本**，既有網頁功能與換算邏輯維持不變。
- iOS / Android 版本規劃使用 Capacitor 將現有 web app 包裝成原生 app。
- 由於目前線上執行環境遇到 npm registry `403`，原生專案產生請在本機或可正常使用 npm 的環境執行。

### 本機建議步驟（可連 npm）
1. `npm install`
2. `npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android --save`
3. `npm run build`
4. `npx cap add ios`
5. `npx cap add android`
6. `npx cap sync`
7. `npx cap open ios`
8. `npx cap open android`


## GitHub 自動產生 iOS / Android 專案包
- GitHub Actions 產生 mobile artifacts 時會在 runner 暫時重建 ios/android 專案，不會把產物提交回 repo。
1. 到 GitHub 專案的 **Actions** 分頁。
2. 選擇 **Build Mobile Project Artifacts** workflow。
3. 點擊 **Run workflow** 手動觸發。
4. workflow 完成後下載 artifact：`hvac-ios-project.zip`（以及 `hvac-android-project.zip`）。
5. 在 Mac 解壓縮後開啟 `ios/App/App.xcworkspace`。
6. 在 Xcode 設定 Team / Signing。
7. 使用 Xcode Archive，並上傳到 App Store Connect。

