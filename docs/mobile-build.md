# Mobile Build Guide (Capacitor)

## Web 版不受影響

- 既有 GitHub Pages Web 版仍使用原本的網站檔案與流程，不改來源到 `dist-mobile/`。
- `npm run build` 維持原本靜態檢查用途。
- Capacitor App 僅使用 `dist-mobile/` 作為行動 App 內嵌網頁內容。

## GitHub Actions：Mobile Build

專案新增獨立的 **Mobile Build** workflow，不影響原本的 Web Build Check。

- Android job 會產生 debug APK。
- iOS job 先做專案與 workspace 檢查，不做簽章與 archive。

### 下載 Android 測試 APK

1. 到 GitHub Actions 的 **Mobile Build** workflow run。
2. 在 Artifacts 下載 `android-debug-apk`。
3. 解壓後取得 `app-debug.apk` 安裝測試。

## iOS 本機測試

iOS 需要 Mac + Xcode：

1. 執行 `npm run mobile:sync`（或 `npm run mobile:sync:ios`）。
2. 用 Xcode 開啟 `ios/App/App.xcworkspace`。
3. 選擇模擬器或實機進行測試。

## Web 更新後同步到 App

每次 Web 內容更新後，請重新同步：

```bash
npm run mobile:sync
```

此指令會先重建 `dist-mobile/`，再同步到 Android / iOS 專案。

## Android APK 下載方式

- GitHub → Actions → Android APK Build → 最新成功紀錄 → Artifacts → hvac-unit-converter-android-debug-apk
- 下載後解壓縮取得 app-debug.apk
- APK 只能安裝在 Android 手機，iPhone 不能安裝 APK

