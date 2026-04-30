# HVAC Unit Converter

這是 HVAC 專用單位轉換工具，提供空調能力、溫度、風量、壓力與電力相關換算，並支援三相/單相估算與電流估算。

## Web 版
- GitHub Pages: https://wuwu0102.github.io/hvac-unit-converter/
- 舊版靜態網頁保留於 `legacy-web/`，避免破壞既有頁面。

## Flutter App 開發
```bash
flutter pub get
flutter analyze
flutter run
```

## Mac 開 iOS
1. 在 Mac 安裝 Xcode。
2. 開啟 `ios/Runner.xcworkspace`。
3. 以 Simulator 或實機執行（目前可不簽章 build 測試）。

## Android APK build
```bash
flutter build apk --debug
```
GitHub Actions 亦提供手動執行 APK workflow。

## iOS 上架前準備
上架前仍需要 Apple Developer Account 與 Xcode signing 設定。
