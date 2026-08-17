const menuBtn=document.getElementById("menuBtn");
const nav=document.getElementById("nav");
const toast=document.getElementById("toast");
const cartPanel=document.getElementById("cartPanel");
const wishPanel=document.getElementById("wishPanel");
const searchModal=document.getElementById("searchModal");

menuBtn?.addEventListener("click",()=>{
  nav.classList.toggle("open");
  menuBtn.textContent=nav.classList.contains("open")?"✕":"☰";
});
document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));

const products=[...document.querySelectorAll(".card")].map((card,index)=>({
  id:index,
  name:card.dataset.name || card.querySelector("h3").textContent.trim(),
  category:card.dataset.category || "all",
  price:card.querySelector("strong").textContent.trim(),
  image:card.querySelector("img").src
}));

let cart=[];
let wishlist=[];

function showToast(message){
  toast.textContent=message;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),1800);
}
function priceNumber(value){return Number(value.replace(/[^0-9]/g,""))||0}
function money(n){return "Rs. "+n.toLocaleString("en-PK")}

function renderCart(){
  const box=document.getElementById("cartItems");
  if(!cart.length){
    box.innerHTML='<p style="color:#888;font-size:11px;padding:25px 0">Your cart is empty. Add a pair you like.</p>';
  }else{
    box.innerHTML=cart.map((item,i)=>`
      <div class="cart-row">
        <img src="${item.image}" alt="">
        <div><h4>${item.name}</h4><p>${item.price}</p></div>
        <button class="remove-item" onclick="removeCart(${i})">×</button>
      </div>`).join("");
  }
  document.getElementById("cartTotal").textContent=money(cart.reduce((sum,x)=>sum+priceNumber(x.price),0));
  document.getElementById("cartCount").textContent=cart.length;
}
window.removeCart=function(i){
  cart.splice(i,1); renderCart(); showToast("Removed from cart");
}

function renderWishlist(){
  const box=document.getElementById("wishItems");
  box.innerHTML=wishlist.length ? wishlist.map((item,i)=>`
    <div class="wish-row">
      <img src="${item.image}" alt="">
      <div><h4>${item.name}</h4><p>${item.price}</p></div>
      <button class="remove-item" onclick="removeWish(${i})">×</button>
    </div>`).join("") :
    '<p style="color:#888;font-size:11px;padding:25px 0">Your wishlist is empty.</p>';
  document.getElementById("wishCount").textContent=wishlist.length;
}
window.removeWish=function(i){
  wishlist.splice(i,1); renderWishlist(); showToast("Removed from wishlist");
}

document.querySelectorAll(".add").forEach((button,index)=>{
  button.addEventListener("click",()=>{
    const product=products[index];
    cart.push(product);
    renderCart();
    cartPanel.classList.add("open");
    showToast(product.name+" added to cart");
  });
});

document.querySelectorAll(".card").forEach((card,index)=>{
  const heart=document.createElement("button");
  heart.className="wish-card-btn";
  heart.textContent="♡";
  heart.title="Add to wishlist";
  Object.assign(heart.style,{position:"absolute",right:"10px",top:"10px",zIndex:"3",border:"0",background:"#fff",width:"32px",height:"32px",borderRadius:"50%",cursor:"pointer",fontSize:"18px"});
  card.querySelector(".pic").appendChild(heart);
  heart.addEventListener("click",(e)=>{
    e.stopPropagation();
    const product=products[index];
    const exists=wishlist.some(x=>x.id===product.id);
    if(!exists){wishlist.push(product);heart.textContent="♥";showToast(product.name+" saved to wishlist");}
    else{wishlist=wishlist.filter(x=>x.id!==product.id);heart.textContent="♡";showToast("Removed from wishlist");}
    renderWishlist();
  });
});

document.querySelectorAll(".filter-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const filter=btn.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".card").forEach(card=>{
      card.classList.toggle("hidden",filter!=="all" && card.dataset.category!==filter);
    });
    document.getElementById("products").scrollIntoView({behavior:"smooth"});
  });
});
document.querySelector('.filter-btn[data-filter="all"]')?.classList.add("active");

document.querySelectorAll("[data-jump-filter]").forEach(link=>{
  link.addEventListener("click",()=>{
    const filter=link.dataset.jumpFilter;
    const btn=document.querySelector(`.filter-btn[data-filter="${filter}"]`);
    btn?.click();
  });
});

document.querySelector(".search-btn")?.addEventListener("click",()=>{
  searchModal.classList.add("open");
  setTimeout(()=>document.getElementById("searchInput").focus(),100);
});
document.getElementById("closeSearch")?.addEventListener("click",()=>searchModal.classList.remove("open"));
searchModal?.addEventListener("click",e=>{if(e.target===searchModal)searchModal.classList.remove("open")});

document.getElementById("searchInput")?.addEventListener("input",e=>{
  const q=e.target.value.toLowerCase().trim();
  const matches=products.filter(p=>p.name.toLowerCase().includes(q)||p.category.includes(q));
  document.getElementById("searchResults").innerHTML=q
    ? (matches.length ? matches.map(p=>`<div class="search-result"><span>${p.name}</span><strong>${p.price}</strong></div>`).join("") : '<p style="font-size:11px;color:#888">No shoes found.</p>')
    : '<p style="font-size:11px;color:#888">Try “sneaker”, “formal” or “Chelsea”.</p>';
});

document.querySelector(".cart-btn")?.addEventListener("click",()=>{renderCart();cartPanel.classList.add("open")});
document.getElementById("closeCart")?.addEventListener("click",()=>cartPanel.classList.remove("open"));
document.querySelector(".wishlist-btn")?.addEventListener("click",()=>{renderWishlist();wishPanel.classList.add("open")});
document.getElementById("closeWish")?.addEventListener("click",()=>wishPanel.classList.remove("open"));

document.querySelector(".account-btn")?.addEventListener("click",()=>{
  showToast("Account section coming next");
});

document.getElementById("checkoutBtn")?.addEventListener("click",()=>{
  if(!cart.length){showToast("Add a shoe to your cart first");return;}
  showToast("Checkout demo ready — next we can add customer details");
});

document.getElementById("newsletter")?.addEventListener("submit",e=>{
  e.preventDefault();
  showToast("Thank you for subscribing to NOVA STEP!");
  e.target.reset();
});

renderCart();
renderWishlist();
