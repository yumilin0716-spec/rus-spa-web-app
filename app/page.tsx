"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  brand: string;
  name: string;
  area: "臉部" | "身體";
  type: "清潔" | "保養" | "防護" | "按摩";
  purpose: string;
  skin: string;
  expiry: string;
  stock: number;
  image: string;
  tone: string;
};

const products: Product[] = [
  { id: 1, brand: "SKEYNDOR", name: "玫瑰金萃澈凝眼霜", area: "臉部", type: "保養", purpose: "眼周修護、細紋保養", skin: "乾性・熟齡肌", expiry: "2028.04", stock: 6, tone: "rose", image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=85" },
  { id: 2, brand: "THALGO", name: "次元酸淨亮凝膠", area: "臉部", type: "清潔", purpose: "代謝角質、淨亮膚色", skin: "混合・油性肌", expiry: "2027.08", stock: 4, tone: "sand", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85" },
  { id: 3, brand: "MARY COHR", name: "植萃透白 2 和 1 強效精華", area: "臉部", type: "保養", purpose: "提亮、均勻膚色", skin: "暗沉・一般肌", expiry: "2027.10", stock: 3, tone: "pearl", image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=85" },
  { id: 4, brand: "SKEYNDOR", name: "全防護輕感防曬乳 SPF50+", area: "臉部", type: "防護", purpose: "日間防護、防曬", skin: "各種膚質", expiry: "2028.06", stock: 8, tone: "sun", image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=900&q=85" },
  { id: 5, brand: "THALGO", name: "海洋更新活膚霜", area: "臉部", type: "按摩", purpose: "滋養、按摩修護", skin: "乾性・缺水肌", expiry: "2028.01", stock: 5, tone: "cocoa", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85" },
  { id: 6, brand: "MARY COHR", name: "植萃新肌美體乳", area: "身體", type: "保養", purpose: "柔嫩、潤澤肌膚", skin: "乾燥・一般肌", expiry: "2027.03", stock: 2, tone: "blush", image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=85" },
  { id: 7, brand: "ALQVIMIA", name: "煉金術曲線輕盈精油", area: "身體", type: "按摩", purpose: "身體按摩、緊緻保養", skin: "各種膚質", expiry: "2027.01", stock: 2, tone: "amber", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85" },
  { id: 8, brand: "SKEYNDOR", name: "菊精萃潔膚乳", area: "臉部", type: "清潔", purpose: "卸妝、溫和潔顏", skin: "敏感・乾性肌", expiry: "2028.09", stock: 7, tone: "cream", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85" },
];

const sheetCsvUrl = "/api/products";
const fallbackImages = products.map((product) => product.image);

function parseCsvRow(line: string) {
  const cells: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) { value += '"'; index += 1; continue; }
    if (character === '"') { quoted = !quoted; continue; }
    if (character === "," && !quoted) { cells.push(value); value = ""; continue; }
    value += character;
  }
  cells.push(value);
  return cells;
}

function parseSheetProducts(csv: string): Product[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvRow(lines[0]);
  return lines.slice(1).map((line, index) => {
    const cells = parseCsvRow(line);
    const row = Object.fromEntries(headers.map((header, headerIndex) => [header, cells[headerIndex] ?? ""]));
    const category = String(row["分類"] ?? "");
    const [areaLabel, typeLabel] = category.split("｜");
    const area = areaLabel?.includes("身體") ? "身體" : "臉部";
    const type: Product["type"] = typeLabel?.includes("清潔") ? "清潔" : typeLabel?.includes("防護") || String(row["主要用途"] ?? "").includes("防曬") ? "防護" : typeLabel?.includes("按摩") ? "按摩" : "保養";
    const stock = Number.parseInt(String(row["現貨庫存"] ?? ""), 10);
    const expiry = String(row["最早效期"] ?? "").trim().replaceAll("/", ".");
    return {
      id: index + 1,
      brand: String(row["品牌"] ?? "待確認").trim() || "待確認",
      name: String(row["商品名稱"] ?? "未命名商品").trim() || "未命名商品",
      area,
      type,
      purpose: String(row["主要用途"] ?? "").trim() || "待補登用途",
      skin: String(row["適合肌膚"] ?? "").trim() || "待補登",
      expiry: expiry || "待補登",
      stock: Number.isNaN(stock) ? 0 : stock,
      image: String(row["商品圖片URL"] ?? "").trim() || fallbackImages[index % fallbackImages.length],
      tone: area === "身體" ? "blush" : type === "清潔" ? "sand" : type === "防護" ? "sun" : type === "按摩" ? "cocoa" : "rose",
    };
  });
}

const filters = ["全部", "臉部", "身體", "清潔", "保養", "防護", "按摩", "2027 到期"] as const;
type Filter = (typeof filters)[number];

export default function Home() {
  const [filter, setFilter] = useState<Filter>("全部");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState(products);
  const [sheetSynced, setSheetSynced] = useState(false);

  useEffect(() => {
    fetch(sheetCsvUrl)
      .then((response) => { if (!response.ok) throw new Error("sheet unavailable"); return response.text(); })
      .then((csv) => { const synced = parseSheetProducts(csv); if (synced.length) { setCatalogProducts(synced); setSheetSynced(true); } })
      .catch(() => setSheetSynced(false));
  }, []);

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalogProducts.filter((product) => {
      const matchesFilter = filter === "全部" || (filter === "2027 到期" ? product.expiry.startsWith("2027") : product.area === filter || product.type === filter);
      const matchesQuery = !needle || `${product.brand} ${product.name} ${product.purpose}`.toLowerCase().includes(needle);
      return matchesFilter && matchesQuery;
    });
  }, [catalogProducts, filter, query]);

  const chooseArea = (area: "臉部" | "身體") => {
    setFilter(area);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Ru's SPA 首頁">RU&apos;S <span>SPA</span></a>
        <nav aria-label="主要導覽"><a href="#catalog">庫存選品</a><a href="#guide">選品方式</a><a href="#expiry">效期提醒</a></nav>
        <button className="menu-button" onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}>瀏覽商品 <span>↗</span></button>
      </header>

      <section className="areas" id="guide">
        <div className="section-heading"><p className="eyebrow">START WITH YOUR RITUAL</p><h2>從照護部位，開始挑選</h2><p>用最直覺的方式，找到今天的保養節奏。</p></div>
        <div className="area-grid">
          <button className="area-card face" onClick={() => chooseArea("臉部")}><span>01</span><div><p>FACE CARE</p><h3>臉部保養</h3><small>清潔 ・ 保養 ・ 防護</small></div><b>探索 <i>→</i></b></button>
          <button className="area-card body" onClick={() => chooseArea("身體")}><span>02</span><div><p>BODY CARE</p><h3>身體保養</h3><small>清潔 ・ 保養 ・ 按摩</small></div><b>探索 <i>→</i></b></button>
        </div>
      </section>

      <section className="catalog" id="catalog">
        <div className="catalog-head"><div><p className="eyebrow">THE CURRENT EDIT</p><h2>庫存選品</h2></div><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋品牌或品名" /></label></div>
        <div className="filter-row" aria-label="商品篩選">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <p className="result-count">顯示 {visibleProducts.length} 項商品 <span>・資料來源：商品主檔{sheetSynced ? "（已同步）" : "（展示資料）"}</span></p>
        <div className="product-grid">
          {visibleProducts.map((product) => <article className="product-card" key={product.id}>
            <div className={`product-image ${product.tone}`}><img src={product.image} alt="" /><div className="image-wash"></div>{product.expiry.startsWith("2027") && <span className="expiry-flag">2027 到期</span>}<span className="area-tag">{product.area}</span></div>
            <div className="product-info"><p>{product.brand}</p><h3>{product.name}</h3><div className="product-meta"><span>{product.type}</span><span>{product.purpose}</span></div><dl><div><dt>適合肌膚</dt><dd>{product.skin}</dd></div><div><dt>最早效期</dt><dd>{product.expiry}</dd></div></dl><footer><span>現貨 <b>{product.stock}</b></span><button onClick={() => setNotice(true)} aria-label={`查看 ${product.name} 詳情`}>＋</button></footer></div>
          </article>)}
        </div>
        {visibleProducts.length === 0 && <div className="empty-state">沒有符合的商品，試試其他分類或搜尋字詞。</div>}
      </section>

      <section className="expiry" id="expiry"><div><p className="eyebrow">A GENTLE REMINDER</p><h2>2027 年到期<br /><em>優先留意</em></h2><p>這些品項以柔和杏橘標記，方便優先安排銷售、使用或補貨決策。</p></div><div className="expiry-list">{catalogProducts.filter((product) => product.expiry.startsWith("2027")).map((product) => <div key={product.id}><span>{product.expiry}</span><p><b>{product.brand}</b>{product.name}</p><small>{product.area}・{product.type}</small></div>)}</div></section>

      <section className="sheet-callout"><p className="eyebrow">NEXT STEP</p><h2>Google Sheet 會是<br />你的後台商品主檔。</h2><p>下一步將把現有的「商品主檔」串接進來；未來更改庫存、效期或圖片網址，網站就能同步更新。</p><button onClick={() => setNotice(true)}>了解串接規劃 <span>↗</span></button></section>
      <footer className="site-footer"><a className="brand" href="#top">RU&apos;S <span>SPA</span></a><p>BEAUTY INVENTORY, MADE CALM.</p><span>© 2026 Ru&apos;s SPA</span></footer>

      {notice && <div className="toast" role="status">第一版展示完成。下一步會串接商品主檔與真實產品圖片。<button onClick={() => setNotice(false)}>×</button></div>}
    </main>
  );
}
