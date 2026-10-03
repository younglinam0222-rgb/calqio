import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), origin='https://www.calqio.com';
const langs=['ko','en','ja','zh','ar'];
const files=['index.html','about.html','contact.html','privacy.html',...langs.flatMap(l=>fs.readdirSync(l).filter(f=>f.endsWith('.html')).map(f=>l+'/'+f))];
const urls=[...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);
const exists=url=>{const p=new URL(url,origin).pathname;return [p+'.html',p+'/index.html'].some(f=>fs.existsSync(path.join(root,f)));};
const pages=files.map(file=>{
 const s=fs.readFileSync(file,'utf8'), url=origin+'/'+file.replace(/\/index\.html$/,'').replace(/\.html$/,'');
 const canonical=s.match(/rel="canonical"\s+href="([^"]+)"/)?.[1];
 const links=[...s.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
 const broken=links.filter(x=>!x.startsWith('#')&&!/^(mailto:|javascript:|https?:|\/\/)/.test(x)).map(x=>new URL(x,url).href).filter(x=>!/[.](css|ico|xml|txt|png|svg|webp)(?:$|\?)/.test(x)&&!exists(x));
 const alternate=[...s.matchAll(/hreflang="([^"]+)"\s+href="([^"]+)"/g)].map(m=>({lang:m[1],url:m[2],exists:exists(m[2])}));
 const text=s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
 return {file,url,canonical,inSitemap:urls.includes(url),title:s.match(/<title>(.*?)<\/title>/s)?.[1],textCharacters:text.length,headings:[...s.matchAll(/<h[123][^>]*>(.*?)<\/h[123]>/gs)].map(x=>x[1].replace(/<[^>]*>/g,'')),broken:[...new Set(broken)],alternate};
});
fs.mkdirSync('internal',{recursive:true});
fs.writeFileSync('internal/site-audit.json',JSON.stringify({date:'2026-10-03',pages,sitemapMissing:urls.filter(u=>!exists(u))},null,2));
console.log(JSON.stringify({pages:pages.length,broken:pages.filter(p=>p.broken.length).map(p=>({file:p.file,links:p.broken})),canonicalMismatch:pages.filter(p=>p.file!=='index.html'&&p.canonical!==p.url).map(p=>p.file),sitemapMissing:urls.filter(u=>!exists(u))},null,2));
