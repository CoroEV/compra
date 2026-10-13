/* Service worker: permite instalar la app y abrirla aunque haya poca cobertura */
var V="cm-v1",SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(SHELL)}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
  var r=e.request;if(r.method!=="GET")return;
  var u=new URL(r.url);
  /* nunca interceptar la base de datos ni el inicio de sesión */
  if(/firestore\.googleapis\.com|identitytoolkit|securetoken|googleapis\.com\/(identitytoolkit|v1)|accounts\.google|apis\.google\.com|firebaseapp\.com\/__\//.test(u.href))return;
  if(u.origin===location.origin){
    /* red primero (para recibir actualizaciones), caché si no hay conexión */
    e.respondWith(fetch(r).then(function(res){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)});return res}).catch(function(){return caches.match(r).then(function(m){return m||caches.match("index.html")})}));
  }else if(/gstatic\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com/.test(u.host)){
    e.respondWith(caches.open(V).then(function(c){return c.match(r).then(function(m){var f=fetch(r).then(function(res){c.put(r,res.clone());return res}).catch(function(){return m});return m||f})}));
  }
});
