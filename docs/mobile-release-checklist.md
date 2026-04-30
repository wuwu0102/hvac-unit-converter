# HVAC Unit Converter 行動版上架準備檢查清單

## 本次 PR 範圍（安全優先）
- 本次 PR 以「不破壞既有 web app」為最高優先，未修改核心換算公式與主要 UI。
- 已加入 Capacitor 設定檔（`capacitor.config.ts`）與上架流程文件，作為後續原生打包準備。
- 目前執行環境遇到 npm registry `403`，因此本次**不強制生成**真正 `ios/`、`android/` 原生專案內容。

## iOS 上架需求
- Mac
- Xcode
- Apple Developer Program
- Bundle ID：`com.wuwu0102.hvacunitconverter`

## Android 上架需求
- Android Studio
- Google Play Console
- release keystore
- AAB（Android App Bundle）

## 建議在本機（可正常連 npm）執行完整指令
```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android --save
npm run build
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios
npx cap open android
```

## 注意事項
- CI 目前僅檢查 web build，避免因 npm registry 限制造成 Capacitor 指令失敗。
- iOS 真正上架仍需 Mac + Xcode + Apple Developer Program。
- Android 上架仍需 Google Play Console 與正式簽章流程。
