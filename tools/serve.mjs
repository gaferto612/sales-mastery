import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png'};
http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  const relative=pathname==='/'?'index.html':pathname.replace(/^\/+/,'');
  const file=path.resolve(relative);
  if(!file.startsWith(process.cwd())){response.writeHead(403).end();return}
  fs.readFile(file,(error,data)=>{
    if(error){response.writeHead(404).end('Not found');return}
    response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
    response.end(data);
  });
}).listen(8765,'127.0.0.1');
