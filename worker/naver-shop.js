// 환율타이밍 · 국내 최저가 검색 프록시 (Cloudflare Workers)
// 네이버 쇼핑 검색 API 키를 브라우저에 노출하지 않으려고 이 서버를 거쳐요.
// Cloudflare 대시보드 → Workers → 이 코드를 붙여 넣고, Settings → Variables에 비밀값 두 개를 넣어요:
//   NAVER_ID     = 네이버 개발자센터 Client ID
//   NAVER_SECRET = 네이버 개발자센터 Client Secret
// (선택) ALLOWED_ORIGINS = https://happyboy412.github.io  (쉼표로 여러 개)
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "https://happyboy412.github.io").split(",").map(s => s.trim());
    const cors = {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0],
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Vary": "Origin"
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (url.pathname !== "/shop") return json({ error: "not found" }, cors, 404);
    if (allowed.length && origin && !allowed.includes(origin)) return json({ error: "origin not allowed" }, cors, 403);

    const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
    if (q.length < 2) return json({ items: [] }, cors);

    // 같은 검색어는 6시간 캐시 (API 호출 수 절약)
    const cache = caches.default;
    const key = new Request("https://cache.local/shop?q=" + encodeURIComponent(q));
    const hit = await cache.match(key);
    if (hit) return new Response(hit.body, { status: hit.status, headers: { ...Object.fromEntries(hit.headers), ...cors } });

    const api = "https://openapi.naver.com/v1/search/shop.json?display=10&sort=sim&exclude=used:rental&query=" + encodeURIComponent(q);
    const res = await fetch(api, { headers: { "X-Naver-Client-Id": env.NAVER_ID, "X-Naver-Client-Secret": env.NAVER_SECRET } });
    if (!res.ok) return json({ error: "naver " + res.status, items: [] }, cors, 502);
    const d = await res.json();
    const items = (d.items || []).map(i => ({
      title: String(i.title || "").replace(/<[^>]+>/g, ""),
      price: Number(i.lprice) || 0,
      mall: i.mallName || "",
      link: i.link || "",
      brand: i.brand || "",
      category: [i.category1, i.category2, i.category3].filter(Boolean).join(" > ")
    })).filter(i => i.price > 0);

    const out = json({ items, at: new Date().toISOString() }, { ...cors, "Cache-Control": "public, max-age=21600" });
    ctx.waitUntil(cache.put(key, out.clone()));
    return out;
  }
};
function json(obj, headers, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...headers } });
}
