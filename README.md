# QCA with R — 互動式教材

根據 Alrik Thiem 與 Adrian Duşa 的《*Qualitative Comparative Analysis with R*》（Springer, 2013）整理的**互動式中英對照學習網站**。

純靜態網站（HTML / CSS / 原生 JavaScript），無需建置工具，可直接部署到 GitHub Pages。

## 目前進度

| 章節 | 標題 | 狀態 |
|------|------|------|
| Ch.1 | 緒論 Introduction | ✅ 已完成 |
| Ch.2 | R 語言入門 Introduction to R | ✅ 已完成 |
| Ch.3 | 清晰集 csQCA | ✅ 已完成 |
| Ch.4 | 模糊集 fsQCA | ✅ 已完成 |
| Ch.5 | QCA 延伸（mvQCA / tQCA） | ✅ 已完成 |

## 延伸教材：《重新設計社會科學研究》（Ragin, 2008）

位於 [`ragin/`](ragin/)，線上網址：<https://gary2686.github.io/QCA-R-Material/ragin/>

根據 Charles C. Ragin《*Redesigning Social Inquiry: Fuzzy Sets and Beyond*》（University of Chicago Press, 2008；中譯本《重新設計社會科學研究》，杜運周等譯，2019）整理的**繁體中文互動教材**，對象為 QCA 初學者。

| 頁面 | 內容 |
|------|------|
| `ragin/index.html` | 本書首頁（四篇 11 章導覽、閱讀進度 ✔） |
| `ragin/ch0.html` | 導讀：兩種研究範式的七組對比 |
| `ragin/ch1.html`–`ch3.html` | 第一篇 集合關係與相關關係 |
| `ragin/ch4.html`–`ch5.html` | 第二篇 校準與測量 |
| `ragin/ch6.html`–`ch7.html` | 第三篇 條件組態與「自」變數 |
| `ragin/ch8.html`–`ch11.html` | 第四篇 因果複雜性分析與淨效應分析 |
| `ragin/css/ragin.css`、`ragin/js/ragin.js` | 本書共用樣式與互動（測驗、XY 圖、校準／一致性計算） |
| `ragin/NOTES.md` | 製作筆記（流程、規格、待辦） |

每章包含：學習目標、白話講解、互動元件、fsQCA／R 實作、本章重點、名詞對照（繁中／簡中譯本／英文）、自我測驗。

## 互動元件（QCA with R）

第 2 章包含四個可即時操作的小工具：

- **迷你 R 主控台**：輸入基本算術／`sum`／`prod`／`sqrt`／`seq`／`rep` 等運算式即時看輸出。
- **集合運算 Venn 圖**：`union` / `intersect` / `setdiff` / `setequal`。
- **模糊隸屬度計算器**：拖曳滑桿示範 `pmin`（AND）、`pmax`（OR）、`1-x`（NOT）。
- **真值表產生器**：k = 3 條件、切換運算式看 outcome value。

## 檔案結構

```
qca-r-tutorial/
├── index.html            # 首頁 / 章節目錄
├── css/style.css         # 設計系統（含深色模式）
├── js/main.js            # 互動元件邏輯
├── chapters/
│   ├── ch1.html          # 第 1 章：緒論
│   ├── ch2.html          # 第 2 章：R 語言入門（含 4 個互動元件）
│   ├── ch3.html          # 第 3 章：清晰集 csQCA
│   ├── ch4.html          # 第 4 章：模糊集 fsQCA
│   └── ch5.html          # 第 5 章：QCA 延伸（mvQCA / tQCA）
├── .nojekyll             # 讓 GitHub Pages 原樣提供檔案
└── README.md
```

## 本機預覽

直接用瀏覽器開啟 `index.html` 即可；或起一個簡易伺服器：

```bash
python -m http.server 8000
# 開 http://localhost:8000
```

## 部署到 GitHub Pages

推送後，到 repo 的 **Settings → Pages**，將 Source 設為 `main` 分支的根目錄（`/root`），即可取得公開網址。

## 著作權

本網站為學習用途的**概念整理與重新詮釋**，文字說明與圖示皆為原創，未重製原書內容。原著版權屬 Springer 與作者所有。

- 原書：Thiem, A., & Duşa, A. (2013). *Qualitative Comparative Analysis with R: A User's Guide*. Springer.
- QCA 資源：[COMPASSS](https://www.compasss.org)
