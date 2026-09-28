const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.ics':'text/calendar'};

http.createServer((req,res) => {
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.resolve(root, requested);
  if(!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){
    res.writeHead(404); res.end('No encontrado'); return;
  }
  res.writeHead(200, {'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream','Cache-Control':'no-cache'});
  fs.createReadStream(file).pipe(res);
}).listen(5199,'0.0.0.0',() => console.log('Vista móvil: http://192.168.1.5:5199'));
