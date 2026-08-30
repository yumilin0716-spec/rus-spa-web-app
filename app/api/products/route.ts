const sheetCsvUrl = "https://docs.google.com/spreadsheets/d/1doU5zaFEl9Aftnrd0STLt_zHcthDEu_VW9aoi4TZ4QA/gviz/tq?tqx=out:csv&sheet=%E5%95%86%E5%93%81%E4%B8%BB%E6%AA%94";

export async function GET() {
  try {
    const response = await fetch(sheetCsvUrl, { headers: { Accept: "text/csv" } });
    if (!response.ok) return new Response("Unable to read 商品主檔", { status: 502 });
    return new Response(await response.text(), {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Unable to read 商品主檔", { status: 502 });
  }
}
