let cart=JSON.parse(localStorage.getItem("novaCart")||"[]");
const money=n=>"Rs. "+Number(n||0).toLocaleString("en-PK");
document.getElementById("cartCount").textContent=cart.reduce((a,p)=>a+(p.qty||1),0);

const empty=document.getElementById("emptyCheckout");
const content=document.getElementById("checkoutContent");

if(!cart.length){
  empty.classList.remove("hidden");
  content.classList.add("hidden");
}else{
  const summary=document.getElementById("summaryItems");
  summary.innerHTML=cart.map(p=>`
    <div class="summary-item">
      <img src="${p.image}" alt="${p.name}">
      <div><h4>${p.name}</h4><p>${p.size?"Size "+p.size:"Standard"} · Qty ${p.qty||1}</p></div>
      <strong>${money(p.price*(p.qty||1))}</strong>
    </div>`).join("");
  const total=cart.reduce((sum,p)=>sum+p.price*(p.qty||1),0);
  document.getElementById("subtotal").textContent=money(total);
  document.getElementById("grandTotal").textContent=money(total);
}

document.getElementById("orderForm")?.addEventListener("submit",async e=>{
  e.preventDefault();
  if(!cart.length)return;

  const button=e.target.querySelector(".place-order");
  button.disabled=true; button.textContent="PLACING ORDER...";

  const order={
    name:document.getElementById("fullName").value.trim(),
    phone:document.getElementById("phone").value.trim(),
    address:document.getElementById("address").value.trim(),
    city:document.getElementById("city").value.trim(),
    postal:document.getElementById("postal").value.trim(),
    items:cart,
    total:cart.reduce((a,p)=>a+p.price*(p.qty||1),0)
  };

  try{
    const response=await fetch("/api/orders",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(order)
    });
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||"Could not place order.");

    document.getElementById("orderNumber").textContent="Order Number: "+result.order.id;
    document.getElementById("successModal").classList.add("show");
    localStorage.removeItem("novaCart");
    localStorage.setItem("novaLastOrder",JSON.stringify(result.order));
  }catch(err){
    alert("Order save nahi ho saka. Make sure the NOVA STEP server is running.\n\n"+err.message);
    button.disabled=false; button.textContent="PLACE ORDER →";
  }
});

document.getElementById("continueShopping").addEventListener("click",()=>location.href="shop.html");

document.getElementById("whatsappOrder")?.addEventListener("click",()=>{
  const form=document.getElementById("orderForm");
  if(!form.reportValidity())return;
  const phone="923001234567"; // Change to your business WhatsApp number.
  const name=document.getElementById("fullName").value;
  const customerPhone=document.getElementById("phone").value;
  const address=document.getElementById("address").value;
  const city=document.getElementById("city").value;
  const total=cart.reduce((a,p)=>a+p.price*(p.qty||1),0);
  const lines=cart.map(p=>`• ${p.name} | Size ${p.size||"N/A"} | Qty ${p.qty||1} | ${money(p.price*(p.qty||1))}`).join("\n");
  const message=`NOVA STEP — New Order\n\nCustomer: ${name}\nPhone: ${customerPhone}\nAddress: ${address}\nCity: ${city}\n\nOrder:\n${lines}\n\nTotal: ${money(total)}\nPayment: Cash on Delivery`;
  window.open("https://wa.me/"+phone+"?text="+encodeURIComponent(message),"_blank");
});
