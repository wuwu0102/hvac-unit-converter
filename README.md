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

## iOS CI（GitHub Actions）

目前使用簡化 iOS pipeline：

1. `flutter pub get`
2. `flutter build ios --release --no-codesign`
3. `xcodebuild archive`（`CODE_SIGN_STYLE=Automatic`、`DEVELOPMENT_TEAM=77LPMPBV88`）

Workflow 檔案：`.github/workflows/ios-release.yml`。

> 這個流程只負責驗證 iOS build 與 archive，不包含 TestFlight 上傳步驟。
