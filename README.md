# HVAC Unit Converter V0.18

HVAC 單位轉換工具（中文優先、手機版優先）。

## 功能列表
- 溫度轉換（C ↔ F）
- 流量轉換（CFM / CMH / m3/s / L/s / LPM / CMM）
- 壓力轉換（Pa / kPa / mmAq / bar / psi / N/m2）
- 冷凍能力轉換（RT / kW / BTU/h）
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
- RT、BTU/h、冷凍噸屬於冷量，不列入電力模組。

## 開發（legacy-web）
直接開啟 `legacy-web/index.html` 即可使用。

## TestFlight / App Store Connect（GitHub Actions）

上傳 TestFlight 前，請先在 GitHub Repository Secrets 設定以下變數：

- `KEYCHAIN_PASSWORD`
- `BUILD_CERTIFICATE_BASE64`
- `P12_PASSWORD`
- `BUILD_PROVISION_PROFILE_BASE64`
- `ASC_KEY_ID`
- `ASC_ISSUER_ID`
- `ASC_PRIVATE_KEY`

### Secrets 說明
- `BUILD_CERTIFICATE_BASE64`：Apple Distribution certificate 匯出的 `.p12` 檔案內容經 base64 後的字串。
- `BUILD_PROVISION_PROFILE_BASE64`：App Store provisioning profile 內容經 base64 後的字串。
- `ASC_PRIVATE_KEY`：App Store Connect API key 的 `.p8` 內容。
- `ASC_KEY_ID` 與 `ASC_ISSUER_ID`：來自 App Store Connect 的 API Keys 頁面。

### CI 工作流程
- `.github/workflows/ios_build.yml`：使用 `HVACConverteriOS` scheme 進行 iPhone Simulator no-signing build（`CODE_SIGNING_ALLOWED=NO`）。
- `.github/workflows/testflight.yml`：在 `main` branch push 或手動觸發時，建立 archive、export IPA 並上傳到 TestFlight。

> 注意：目前 repository 尚未包含 `HVACConverter.xcodeproj` 與 iOS Swift 原始碼；CI workflow 已先依目標參數配置，待 iOS 專案檔加入後即可執行完整流程。

## iOS Build

This project supports iOS build via GitHub Actions.
