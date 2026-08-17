const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");

const mime = {
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".svg":"image/svg+xml",
  ".ico":"image/x-icon"
};

function readOrders(){
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE,"utf8")); }
  catch { return []; }
}
function writeOrders(orders){
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders,null,2));
}
function send(res,status,data,type="application/json; charset=utf-8"){
  res.writeHead(status,{"Content-Type":type,"Access-Control-Allow-Origin":"*"});
  res.end(type.startsWith("application/json") ? JSON.stringify(data) : data);
}
function body(req){
  return new Promise((resolve,reject)=>{
    let raw="";
    req.on("data",chunk=>raw+=chunk);
    req.on("end",()=>{try{resolve(raw?JSON.parse(raw):{})}catch(e){reject(e)}});
    req.on("error",reject);
  });
}

const server=http.createServer(async (req,res)=>{
  const url=new URL(req.url,`http://localhost:${PORT}`);
  const method=req.method;

  if(method==="OPTIONS"){
    res.writeHead(204,{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,PATCH,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type"});
    return res.end();
  }

  try{
    // API: get all orders
    if(method==="GET" && url.pathname==="/api/orders"){
      return send(res,200,{orders:readOrders()});
    }

    // API: create order
    if(method==="POST" && url.pathname==="/api/orders"){
      const data=await body(req);
      if(!data.name || !data.phone || !data.address || !data.city || !Array.isArray(data.items) || !data.items.length){
        return send(res,400,{error:"Missing required order information."});
      }
      const orders=readOrders();
      const order={
        id:"NS-"+crypto.randomBytes(3).toString("hex").toUpperCase(),
        name:String(data.name), phone:String(data.phone), address:String(data.address),
        city:String(data.city), postal:String(data.postal||""),
        payment:"Cash on Delivery",
        items:data.items,
        total:Number(data.total||0),
        status:"Pending",
        createdAt:new Date().toISOString()
      };
      orders.unshift(order);
      writeOrders(orders);
      return send(res,201,{order});
    }

    // API: update order status
    const statusMatch=url.pathname.match(/^\/api\/orders\/([^/]+)$/);
    if(statusMatch && method==="PATCH"){
      const id=decodeURIComponent(statusMatch[1]);
      const data=await body(req);
      const allowed=["Pending","Processing","Shipped","Delivered"];
      if(!allowed.includes(data.status)) return send(res,400,{error:"Invalid status."});
      const orders=readOrders();
      const order=orders.find(o=>o.id===id);
      if(!order)return send(res,404,{error:"Order not found."});
      order.status=data.status;
      writeOrders(orders);
      return send(res,200,{order});
    }

    if(statusMatch && method==="DELETE"){
      const id=decodeURIComponent(statusMatch[1]);
      const orders=readOrders();
      const next=orders.filter(o=>o.id!==id);
      if(next.length===orders.length)return send(res,404,{error:"Order not found."});
      writeOrders(next);
      return send(res,200,{success:true});
    }

    // Static files
    let filePath=url.pathname==="/" ? path.join(ROOT,"index.html") : path.join(ROOT,url.pathname.replace(/^\/+/,""));
    filePath=path.normalize(filePath);
    if(!filePath.startsWith(ROOT)) return send(res,403,{error:"Forbidden"});
    if(fs.existsSync(filePath) && fs.statSync(filePath).isFile()){
      const ext=path.extname(filePath).toLowerCase();
      const type=mime[ext]||"application/octet-stream";
      res.writeHead(200,{"Content-Type":type});
      return fs.createReadStream(filePath).pipe(res);
    }
    send(res,404,{error:"Not found"});
  }catch(err){
    console.error(err);
    send(res,500,{error:"Server error"});
  }
});

server.listen(PORT,()=>console.log(`NOVA STEP server running at http://localhost:${PORT}`));
