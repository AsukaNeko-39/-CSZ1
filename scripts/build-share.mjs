import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(root,'dist');
const frontend=path.join(output,'public');
const staging=path.resolve(root,'.share-build');
const key=Buffer.from(process.env.SHARE_DATA_KEY || '', 'base64');
if(key.length !== 32) throw new Error('SHARE_DATA_KEY is required for share builds');
if(output !== path.join(root,'dist') || staging !== path.join(root,'.share-build')) throw new Error('Unsafe output paths');
if(!await fs.stat(path.join(frontend,'index.html')).then(x=>x.isFile()).catch(()=>false)) throw new Error('Run vite build before packaging');
const files=await fs.readdir(frontend,{recursive:true,withFileTypes:true});
await fs.mkdir(path.join(staging,'client','_sealed'),{recursive:true});
await fs.mkdir(path.join(staging,'server'),{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ico':'image/x-icon'};
const manifest={};
for(const file of files){
  if(!file.isFile()) continue;
  const source=path.join(file.parentPath,file.name);
  const relative=path.relative(frontend,source).replaceAll('\\','/');
  if(relative.startsWith('__manus__/') || relative.startsWith('.') || relative.endsWith('.map')) continue;
  let plain=await fs.readFile(source);
  if(relative === 'index.html') plain=Buffer.from(plain.toString('utf8').replace('<head>','<head><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer">'));
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  const encrypted=Buffer.concat([iv,cipher.update(plain),cipher.final(),cipher.getAuthTag()]);
  const name=crypto.createHash('sha256').update(relative).digest('hex')+'.bin';
  await fs.writeFile(path.join(staging,'client','_sealed',name),encrypted);
  manifest['/'+relative]={sealed:'/_sealed/'+name,type:mime[path.extname(relative)] || 'application/octet-stream'};
}
const worker=(await fs.readFile(path.join(root,'scripts','share-worker.mjs'),'utf8')).replace('__FILE_MANIFEST__',JSON.stringify(manifest));
await fs.writeFile(path.join(staging,'server','index.js'),worker);
await fs.writeFile(path.join(staging,'client','_headers'),'/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  Referrer-Policy: no-referrer\n');
// Replace only the verified generated build directory, never source or user materials.
await fs.rm(output,{recursive:true,force:true});
await fs.rename(staging,output);
console.log(`Encrypted share build ready: ${Object.keys(manifest).length} resources; no plaintext frontend in dist.`);
