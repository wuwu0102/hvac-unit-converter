# HVAC Unit Converter V0.14

HVAC 單位轉換工具，已整理為 **Flutter 跨平台專案**，可共用同一套程式碼支援：
- Flutter Web
- Android
- iOS

## 功能列表
- 溫度轉換（C ↔ F）
- 流量轉換（CFM / CMH / m3/s / L/s / LPM / CMM）
- 壓力轉換（Pa / kPa / mmAq / bar / psi / N/m2）
- 流速轉換（m/s / ft/s / mm/s / cm/s）
- 流量對應管徑
- 壓差估算流量（設備修正）

## 平台說明
- Web 版本可由 GitHub Pages 預覽。
- Android / iOS 可用同一個 Flutter 專案後續打包。

## 開發
```bash
flutter pub get
flutter analyze
flutter run -d chrome
```

## Web 打包
```bash
flutter build web --base-href /hvac-unit-converter/
```
