---
name: insurance-sso-portal
description: 維護新契約與保全的 SSO 統一入口，適用於入口卡片、登入狀態、系統授權、跳轉網址或畫面風格變更。
---

# SSO 統一入口維護規則

1. 修改前先核對 SSO `GET /api/auth/me` 回應與環境變數，不在前端自行推算角色或授權。
2. 入口不接收、記憶或記錄密碼；登入與登出只導向 SSO。
3. 系統顯示以 `applicationKeys` 為唯一準則，系統 URL 由 `VITE_*_URL` 提供。
4. 新增系統時，同步完成型別、卡片 metadata、環境範例、授權測試與 README 對照表。
5. 保持繁體中文、藍綠主色、白色工作卡與一致字型；行動裝置必須可單手滾動、鍵盤操作。
6. Loading、`401`、無系統授權與 API 錯誤不得使用同一個模糊狀態。
7. 完成前執行 `npm run test:unit` 與 `npm run build`；串接正式 SSO 後再驗證 Cookie、返回網址、登出與兩個子系統的單一簽入。
8. 本機模擬身分只能放在 `.env.development.local`；不得放在共用 `.env`，避免污染 Vitest 或 production mode。
9. Docker 使用 Nginx 非 root `8080`、Host `5174` 與 `/health`；`/api` 只透過 `SSO_UPSTREAM` 代理，不得在 production image 加入假登入。
