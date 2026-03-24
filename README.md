# 寶藏解鎖（Treasure Code Quest）

給小朋友用的「輸入密碼一起解鎖寶箱」小網頁（手機/iPad 觸控友善）。

## 主要頁面
- 遊玩頁：`#/play`
- 管理頁：`#/admin`（無 PIN、直接開放）

## 本機開發
```bash
npm install
npm run dev
```

## 建置與預覽
```bash
npm run build
npm run preview
```

> Windows 小提醒：如果你使用很新的 Node（例如 v24），在某些環境下 `vite build` 可能會出現原生崩潰。
> 建議使用 Node 20（本專案 GitHub Actions 也是用 Node 20）或 Node 22 LTS。

## 資料保存
- 管理員設定、密碼組合、解鎖進度都存在 `localStorage`

## 兌換卡圖片（固定檔名）
- 兌換卡圖片固定使用 [public/reward-card-art.png](public/reward-card-art.png)
- 想換圖：直接用你的 PNG 覆蓋同名檔案，不需要改程式碼

## GitHub Pages 部署
- Push 到 `main` 會觸發 GitHub Actions，將 `dist/` 部署到 GitHub Pages
- Repo Settings → Pages → Build and deployment 選擇 GitHub Actions
