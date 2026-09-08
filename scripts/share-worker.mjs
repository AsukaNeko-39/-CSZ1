const manifest = __FILE_MANIFEST__;
const cookieName = '__Host-agri-view';
const secureHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

async function tokenMatches(token, expectedHash) {
  if (!token || token.length !== 43 || !expectedHash) return false;
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)));
  const expected = Uint8Array.from(expectedHash.match(/.{2}/g) || [], byte => parseInt(byte, 16));
  if (expected.length !== hash.length) return false;
  let difference = 0;
  for (let i = 0; i < hash.length; i++) difference |= hash[i] ^ expected[i];
  return difference === 0;
}

function cookieToken(request) {
  const pairs = (request.headers.get('Cookie') || '').split(';').map(pair => pair.trim());
  return pairs.find(pair => pair.startsWith(cookieName + '='))?.slice(cookieName.length + 1) || '';
}

function message(text, status) {
  return new Response(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>访问提示</title><body style="margin:0;background:#f7f3e9;color:#5b4827;font-family:system-ui;display:grid;place-content:center;min-height:100vh;padding:0 24px;box-sizing:border-box"><main style="max-width:460px"><h1 style="font-size:24px">请使用完整的分享链接</h1><p style="font-size:15px;line-height:1.9">${text}</p></main></body></html>`, {status,headers:{...secureHeaders,'Content-Type':'text/html; charset=utf-8'}});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n',{headers:{...secureHeaders,'Content-Type':'text/plain'}});
    if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405,headers:{...secureHeaders,Allow:'GET, HEAD'}});
    if (!env.SHARE_LINK_TOKEN_HASH || !env.SHARE_DATA_KEY || !env.ASSETS) return message('网站暂时不可用，请稍后重试。',503);

    if (url.searchParams.has('access')) {
      const token=url.searchParams.get('access');
      if (!await tokenMatches(token,env.SHARE_LINK_TOKEN_HASH)) return message('此链接无效。请向分享人获取完整的访问链接。',403);
      return new Response(null,{status:303,headers:{...secureHeaders,Location:'/', 'Set-Cookie':`${cookieName}=${token}; Path=/; Max-Age=86400; Secure; HttpOnly; SameSite=Lax`}});
    }
    const token = cookieToken(request);
    if (!await tokenMatches(token,env.SHARE_LINK_TOKEN_HASH)) return message('本页面仅向持有分享链接的访客开放。请向分享人获取完整链接后再打开。',403);
    if (url.pathname === '/__share-link') return Response.json({url:`${url.origin}/?access=${encodeURIComponent(token)}`},{headers:secureHeaders});

    let pathname;
    try { pathname=decodeURIComponent(url.pathname); } catch {return new Response('Not found',{status:404,headers:secureHeaders});}
    const item=manifest[pathname === '/' ? '/index.html' : pathname];
    if (!item) return new Response('Not found',{status:404,headers:secureHeaders});
    const assetURL=new URL(item.sealed,url.origin);
    const sealed=await env.ASSETS.fetch(new Request(assetURL,{method:'GET'}));
    if (!sealed.ok) return message('资源暂时无法加载，请稍后重试。',502);
    try {
      const bytes=new Uint8Array(await sealed.arrayBuffer());
      const key=await crypto.subtle.importKey('raw',Uint8Array.from(atob(env.SHARE_DATA_KEY),c=>c.charCodeAt(0)),{name:'AES-GCM'},false,['decrypt']);
      const body=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},key,bytes.slice(12));
      return new Response(request.method === 'HEAD' ? null : body,{headers:{...secureHeaders,'Content-Type':item.type,'Content-Length':String(body.byteLength)}});
    } catch {return message('资源暂时无法加载，请稍后重试。',502);}
  }
};
