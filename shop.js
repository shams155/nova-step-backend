const products=[...document.querySelectorAll('.shop-card')].map(card=>({
 id:card.dataset.id,name:card.dataset.name,category:card.dataset.category,price:Number(card.dataset.price),
 priceText:card.querySelector('strong').textContent,image:card.querySelector('img').src
}));
let cart=JSON.parse(localStorage.getItem('novaCart')||'[]');
let wishlist=JSON.parse(localStorage.getItem('novaWishlist')||'[]');
const toast=document.getElementById('toast');
function money(n){return 'Rs. '+n.toLocaleString('en-PK')}
function save(){localStorage.setItem('novaCart',JSON.stringify(cart));localStorage.setItem('novaWishlist',JSON.stringify(wishlist))}
function showToast(t){toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1700)}
function renderCart(){
 document.getElementById('cartCount').textContent=cart.reduce((s,p)=>s+(p.qty||1),0);
 const box=document.getElementById('cartItems');
 box.innerHTML=cart.length?cart.map((p,i)=>`<div class="cart-row">
  <img src="${p.image}" alt="${p.name}"><div class="cart-product-info"><h4>${p.name}</h4><p>${money(p.price)}${p.size?' • Size '+p.size:''}</p>
  <div class="qty-controls"><button onclick="changeQty(${i},-1)">−</button><span>${p.qty||1}</span><button onclick="changeQty(${i},1)">+</button></div></div>
  <button class="remove-item" onclick="removeCart(${i})">×</button></div>`).join(''):'<p class="empty-cart">Your cart is empty.</p>';
 document.getElementById('cartTotal').textContent=money(cart.reduce((s,p)=>s+p.price*(p.qty||1),0));
}
window.changeQty=(i,delta)=>{cart[i].qty=Math.max(1,(cart[i].qty||1)+delta);save();renderCart()}
window.removeCart=i=>{cart.splice(i,1);save();renderCart();showToast('Removed from cart')}
function renderWishlist(){
 const box=document.getElementById('wishItems');
 if(!box)return;
 const items=products.filter(p=>wishlist.includes(p.id));
 box.innerHTML=items.length?items.map(p=>`<div class="wish-row"><img src="${p.image}" alt="${p.name}"><div><a href="product.html?id=${p.id}">${p.name}</a><p>${money(p.price)}</p></div><button onclick="removeWish('${p.id}')">×</button></div>`).join(''):'<p class="empty-cart">No favorites yet.</p>';
 document.getElementById('wishCount').textContent=items.length;
 document.querySelectorAll('.wish-heart').forEach(b=>{if(wishlist.includes(b.dataset.id))b.classList.add('active');b.textContent=wishlist.includes(b.dataset.id)?'♥':'♡'});
}
window.removeWish=id=>{wishlist=wishlist.filter(x=>x!==id);save();renderWishlist()}
function toggleWish(id){
 if(wishlist.includes(id)) wishlist=wishlist.filter(x=>x!==id); else wishlist.push(id);
 save();renderWishlist();showToast(wishlist.includes(id)?'Added to wishlist':'Removed from wishlist');
}
document.querySelectorAll('.shop-card').forEach(card=>{
 const pic=card.querySelector('.pic');
 const id=card.dataset.id;
 const b=document.createElement('button');b.className='wish-heart';b.dataset.id=id;b.type='button';b.title='Add to wishlist';b.textContent=wishlist.includes(id)?'♥':'♡';
 b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleWish(id)});pic.appendChild(b);
});
document.querySelectorAll('.add').forEach(btn=>btn.addEventListener('click',()=>{
 const p=products.find(x=>x.id===btn.dataset.product);const same=cart.find(x=>x.id===p.id&&!x.size);
 if(same)same.qty=(same.qty||1)+1;else cart.push({...p,qty:1});
 save();renderCart();document.getElementById('cartPanel').classList.add('open');showToast(p.name+' added to cart');
}));
document.querySelectorAll('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
 const f=btn.dataset.filter;document.querySelectorAll('.shop-card').forEach(c=>c.classList.toggle('hidden',f!=='all'&&c.dataset.category!==f));
}));
const params=new URLSearchParams(location.search),initial=params.get('category');if(initial)document.querySelector(`[data-filter="${initial}"]`)?.click();
document.getElementById('cartPanel').classList.remove('open');
document.querySelector('.cart-btn')?.addEventListener('click',()=>{renderCart();document.getElementById('cartPanel').classList.add('open')});
document.getElementById('closeCart').addEventListener('click',()=>document.getElementById('cartPanel').classList.remove('open'));
document.getElementById('checkoutBtn').addEventListener('click',()=>{if(cart.length)location.href='checkout.html';else showToast('Your cart is empty')});
document.querySelector('.search-btn')?.addEventListener('click',()=>document.getElementById('searchModal').classList.add('open'));
document.getElementById('closeSearch')?.addEventListener('click',()=>document.getElementById('searchModal').classList.remove('open'));
document.getElementById('searchInput')?.addEventListener('input',e=>{const q=e.target.value.toLowerCase();const m=products.filter(p=>(p.name+' '+p.category).toLowerCase().includes(q));document.getElementById('searchResults').innerHTML=m.map(p=>`<div class="search-result"><span><a href="product.html?id=${p.id}">${p.name}</a></span><strong>${p.priceText}</strong></div>`).join('')||'<p style="font-size:11px;color:#888">No shoes found.</p>'});
document.querySelector('.wishlist-btn')?.addEventListener('click',()=>{renderWishlist();document.getElementById('wishPanel').classList.add('open')});
document.getElementById('closeWish')?.addEventListener('click',()=>document.getElementById('wishPanel').classList.remove('open'));
renderCart();renderWishlist();
