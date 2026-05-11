# Mobile Build Guide (Capacitor)

## 保持 Web 版不受影響

- 既有 Web 版（GitHub Pages）仍然使用專案根目錄的靜態網站檔案（例如 `index.html`、`app.js`、`styles.css`）。
- `npm run build` 行為維持原樣，只做靜態檢查，不做 bundling。
- Capacitor App 使用 `dist-mobile/` 作為 App 內嵌網頁來源，**不會**改變 GitHub Pages 的來源。

## App 打包流程

```bash
npm install
npm run mobile:sync
npm run mobile:android
npm run mobile:ios
```

## 開啟原生專案

- Android：使用 Android Studio 開啟 `android/`。
- iOS：使用 Xcode 開啟 `ios/`。

## Web 更新後如何同步到 App

每次 Web 版更新後，只要重新執行：

```bash
npm run mobile:sync
```

此指令會先重新產生 `dist-mobile/`，再同步到 iOS / Android 專案。
