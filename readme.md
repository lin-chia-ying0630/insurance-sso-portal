# 保險業務統一入口

本專案是「新契約」與「保全」的 SSO 統一入口。使用者只在公司身分服務登入一次，入口依後端授權顯示可用系統，不在前端重複判斷角色。

## 入口系統

| 系統 | 用途 | 授權 Key | 網址設定 |
| --- | --- | --- | --- |
| 新契約 | 要保資料、契約建立與進度查詢 | `NEW_CONTRACT` | `VITE_NEW_CONTRACT_URL` |
| 保全 | 保單查詢、保全變更與覆核 | `POLICY_SERVICE` | `VITE_POLICY_SERVICE_URL` |

## SSO 契約

| 項目 | 契約 |
| --- | --- |
| 登入狀態 | 入口啟動時以 `GET /api/auth/me` 查詢，並傳送 HttpOnly SSO Cookie |
| 未登入 | API 回覆 `401`，畫面顯示「使用 SSO 登入」 |
| 登入 | 導向 `VITE_SSO_LOGIN_URL`，並附上 `returnUrl` |
| 登出 | 導向 `VITE_SSO_LOGOUT_URL`，由身分服務清除 Session |
| 授權 | `user.applicationKeys` 是可進入系統的唯一來源 |
| 密碼 | 入口不顯示密碼欄位、不接收密碼、不寫入 Web Storage |

`GET /api/auth/me` 成功回應範例：

```json
{
  "authenticated": true,
  "user": {
    "userId": "maker01",
    "displayName": "王小明",
    "department": "保單服務部",
    "applicationKeys": ["NEW_CONTRACT", "POLICY_SERVICE"]
  }
}
```

## 本機開發

```bash
cp .env.example .env.development.local
npm install
npm run dev
```

本機尚未連接 SSO 時，可在 `.env.development.local` 設定 `VITE_DEV_SSO_USER=maker01` 與 `VITE_DEV_SSO_NAME=王小明`。這份檔案只由 Vite development mode 載入，Vitest 與生產建置不會用它略過 SSO。手機從區網連入時，兩個子系統網址不可使用 `localhost`，應設為電腦區網 IP。

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 啟動 `http://localhost:5174` |
| `npm run test:unit` | 驗證未登入與授權過濾 |
| `npm run build` | 執行 TypeScript 檢查與生產建置 |

## Docker 啟動

```bash
docker compose up -d --build
docker compose ps
```

入口啟動後使用 `http://localhost:5174` 或同一區網的 `http://<電腦 IP>:5174`。Docker 對外固定使用 `5174`，容器內 Nginx 使用非 root `8080`。

| 設定 | 預設值 | 用途 |
| --- | --- | --- |
| `SSO_UPSTREAM` | `http://host.docker.internal:8083` | Nginx 將 `/api/*` 代理到真實 SSO 後端 |
| Host Port | `5174` | 電腦與手機使用的統一入口 Port |
| Health check | `/health` | Docker 每 10 秒檢查 Nginx 是否正常 |

如 SSO 不在本機 `8083`，啟動前設定：

```bash
SSO_UPSTREAM=https://sso.example.internal docker compose up -d --build
```

Docker 是 production mode，不會載入 `.env.development.local` 的模擬使用者；若 SSO 後端未啟動，網頁會明確顯示無法確認登入狀態。

## 畫面規範

| 項目 | 規範 |
| --- | --- |
| 語系 | 繁體中文 `zh-TW` |
| 主色 | 藍綠 `#0f766e`，與保全專案一致 |
| 卡片 | 桌面雙欄大卡片，行動裝置改為單欄 |
| 狀態 | Loading、未登入、無授權、API 錯誤都有明確畫面 |
| 無障礙 | 語意化標題、鍵盤可操作連結、reduced motion |

## 邊界

本次不建立資料庫、Entity 或 Migration；使用者身分、Session、角色與系統授權一律由 SSO/後端裁決。正式串接時尚需由身分平台提供上述 API 與 Cookie 安全設定。
