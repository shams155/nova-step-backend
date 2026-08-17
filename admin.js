let orders=[];
let activeFilter="all",search="";

const money=n=>"Rs. "+Number(n||0).toLocaleString("en-PK");

async function loadOrders(){
  try{
    const r=await fetch("/api/orders");
    const data=await r.json();
    if(!r.ok)throw new Error(data.error);
    orders=data.orders||[];
    render();
  }catch(e){
    document.getElementById("ordersBody").innerHTML=`<tr><td colspan="7">Backend connection failed. Start the server with <b>npm start</b>.</td></tr>`;
  }
}
function filtered(){
  return orders.filter(o=>{
    const statusOk=activeFilter==="all"||o.status===activeFilter;
    const q=search.toLowerCase();
    const text=[o.id,o.name,o.phone,o.city,o.address].join(" ").toLowerCase();
    return statusOk&&(!q||text.includes(q));
  });
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function render(){
  document.getElementById("statOrders").textContent=orders.length;
  document.getElementById("statSales").textContent=money(orders.reduce((a,o)=>a+Number(o.total||0),0));
  document.getElementById("statPending").textContent=orders.filter(o=>o.status==="Pending").length;
  document.getElementById("statDelivered").textContent=orders.filter(o=>o.status==="Delivered").length;

  const rows=filtered();
  document.getElementById("orderCountLabel").textContent=rows.length+" order"+(rows.length===1?"":"s");
  document.getElementById("noOrders").classList.toggle("hidden",rows.length!==0);
  document.getElementById("ordersBody").innerHTML=rows.map(o=>{
    const itemCount=o.items.reduce((a,p)=>a+(p.qty||1),0);
    const date=new Date(o.createdAt).toLocaleString("en-PK",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
    return `<tr>
      <td><strong>${escapeHtml(o.id)}</strong></td>
      <td><strong>${escapeHtml(o.name)}</strong><small>${escapeHtml(o.phone)}</small></td>
      <td>${itemCount} item${itemCount===1?"":"s"}</td>
      <td><strong>${money(o.total)}</strong></td>
      <td><select class="status-select status-${o.status.toLowerCase()}" data-status="${o.id}">
        ${["Pending","Processing","Shipped","Delivered"].map(x=>`<option ${o.status===x?"selected":""}>${x}</option>`).join("")}
      </select></td>
      <td>${date}</td>
      <td><button class="view-order" data-view="${o.id}">VIEW</button></td>
    </tr>`;
  }).join("");

  document.querySelectorAll("[data-status]").forEach(el=>el.addEventListener("change",async()=>{
    try{
      const r=await fetch("/api/orders/"+encodeURIComponent(el.dataset.status),{
        method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:el.value})
      });
      if(!r.ok)throw new Error();
      await loadOrders();showToast("Order status updated");
    }catch{showToast("Could not update order")}
  }));
  document.querySelectorAll("[data-view]").forEach(el=>el.addEventListener("click",()=>openOrder(el.dataset.view)));
}
function openOrder(id){
  const o=orders.find(x=>x.id===id);if(!o)return;
  document.getElementById("modalOrderId").textContent=o.id;
  document.getElementById("modalContent").innerHTML=`
    <div class="customer-box"><strong>${escapeHtml(o.name)}</strong><span>${escapeHtml(o.phone)}</span><span>${escapeHtml(o.address)}, ${escapeHtml(o.city)} ${escapeHtml(o.postal||"")}</span><span>Payment: Cash on Delivery</span></div>
    <h3>Products</h3>
    ${o.items.map(p=>`<div class="modal-item"><img src="${p.image}"><div><strong>${escapeHtml(p.name)}</strong><span>Size ${escapeHtml(p.size||"N/A")} · Qty ${p.qty||1}</span></div><b>${money(p.price*(p.qty||1))}</b></div>`).join("")}
    <div class="modal-total"><span>Total</span><strong>${money(o.total)}</strong></div>
    <button class="delete-order" id="deleteThisOrder">DELETE THIS ORDER</button>`;
  document.getElementById("orderModal").classList.add("show");
  document.getElementById("deleteThisOrder").addEventListener("click",async()=>{
    if(!confirm("Delete this order?"))return;
    const r=await fetch("/api/orders/"+encodeURIComponent(id),{method:"DELETE"});
    if(r.ok){closeOrder();await loadOrders();showToast("Order deleted")}
  });
}
function closeOrder(){document.getElementById("orderModal").classList.remove("show")}
function showToast(t){
  let el=document.getElementById("adminToast");
  if(!el){el=document.createElement("div");el.id="adminToast";document.body.appendChild(el)}
  el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1600);
}
document.getElementById("closeOrder").addEventListener("click",closeOrder);
document.getElementById("orderModal").addEventListener("click",e=>{if(e.target.id==="orderModal")closeOrder()});
document.getElementById("orderSearch").addEventListener("input",e=>{search=e.target.value;render()});
document.querySelectorAll(".status-filter").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".status-filter").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");activeFilter=b.dataset.filter;render();
}));
document.getElementById("clearOrders").addEventListener("click",async()=>{
  if(!orders.length){showToast("No orders to clear");return}
  if(!confirm("Delete all saved orders?"))return;
  for(const o of orders)await fetch("/api/orders/"+encodeURIComponent(o.id),{method:"DELETE"});
  await loadOrders();showToast("All orders cleared");
});
function clock(){document.getElementById("adminClock").textContent=new Date().toLocaleString("en-PK",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
clock();setInterval(clock,1000);loadOrders();
