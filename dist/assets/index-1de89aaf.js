(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function o(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(e){if(e.ep)return;e.ep=!0;const n=o(e);fetch(e.href,n)}})();const p=[{id:1,name:"Arabica Gayo Premium",price:85e3,unit:"200g",description:"Notes: Fruity, Nutty, Dark Chocolate. Biji kopi single origin dari dataran tinggi Gayo.",image:"https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop"},{id:2,name:"Robusta Dampit",price:45e3,unit:"250g",description:"Notes: Bold, Earthy, Chocolate. Cocok untuk kopi tubruk atau campuran espresso.",image:"https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=600&auto=format&fit=crop"},{id:3,name:"Kopi Susu Gula Aren (Literan)",price:75e3,unit:"1 Liter",description:"Signature es kopi susu kami dalam kemasan 1 liter, tahan 3 hari di kulkas.",image:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=600&auto=format&fit=crop"},{id:4,name:"Cold Brew Konsentrat",price:9e4,unit:"500ml",description:"Konsentrat cold brew 100% Arabica. Tinggal tambah air atau susu.",image:"https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop"}];let c={};const d=t=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(t),f=document.getElementById("product-grid"),v=document.getElementById("cart-badge"),I=document.getElementById("open-cart-btn"),k=document.getElementById("close-cart-btn"),L=document.getElementById("cart-drawer"),y=document.getElementById("cart-drawer-overlay"),u=document.getElementById("cart-items"),B=document.getElementById("cart-total-price"),h=document.getElementById("floating-checkout"),$=document.getElementById("floating-cart-count"),C=document.getElementById("floating-total-price"),w=document.getElementById("open-cart-floating-btn"),T=document.getElementById("checkout-btn");function q(){f.innerHTML="",p.forEach(t=>{const a=document.createElement("div");a.className="product-card glass",a.innerHTML=`
      <div class="product-image-container">
        <img src="${t.image}" loading="lazy" alt="${t.name}" class="product-image" />
      </div>
      <div class="product-info">
        <h4 class="product-name">${t.name}</h4>
        <p class="product-unit">${t.unit}</p>
        <p class="product-desc">${t.description}</p>
        <div class="product-footer">
          <span class="product-price">${d(t.price)}</span>
          <button class="add-to-cart-btn" data-id="${t.id}">Tambah</button>
        </div>
      </div>
    `,f.appendChild(a)}),document.querySelectorAll(".add-to-cart-btn").forEach(t=>{t.addEventListener("click",a=>{const o=parseInt(a.target.getAttribute("data-id"));b(o)})})}function b(t){c[t]?c[t]+=1:c[t]=1,g()}function A(t){c[t]&&(c[t]-=1,c[t]<=0&&delete c[t]),g()}function g(){const t=Object.keys(c);let a=0,o=0;u.innerHTML="",t.length===0?u.innerHTML='<div class="empty-cart-message">Keranjang Anda masih kosong.</div>':t.forEach(r=>{const e=parseInt(r),n=p.find(l=>l.id===e),i=c[e];a+=i,o+=n.price*i;const s=document.createElement("div");s.className="cart-item",s.innerHTML=`
        <img src="${n.image}" alt="${n.name}" class="cart-item-image">
        <div class="cart-item-details">
          <h5 class="cart-item-title">${n.name}</h5>
          <div class="cart-item-price">${d(n.price)}</div>
          <div class="cart-item-controls">
            <button class="qty-btn minus-btn" data-id="${e}">-</button>
            <span class="qty-val">${i}</span>
            <button class="qty-btn plus-btn" data-id="${e}">+</button>
          </div>
        </div>
      `,u.appendChild(s)}),v.textContent=a,B.textContent=d(o),a>0?(h.classList.add("visible"),$.textContent=`${a} Item`,C.textContent=d(o)):h.classList.remove("visible"),document.querySelectorAll(".minus-btn").forEach(r=>{r.addEventListener("click",e=>{A(parseInt(e.target.getAttribute("data-id")))})}),document.querySelectorAll(".plus-btn").forEach(r=>{r.addEventListener("click",e=>{b(parseInt(e.target.getAttribute("data-id")))})})}function m(){L.classList.toggle("open"),y.classList.toggle("open")}I.addEventListener("click",m);k.addEventListener("click",m);y.addEventListener("click",m);w.addEventListener("click",m);const P="6281234567890";T.addEventListener("click",()=>{const t=Object.keys(c);if(t.length===0)return;let a=0,o=`Halo admin Kopi Lokal Nusantara, saya ingin memesan:

`;t.forEach(n=>{const i=parseInt(n),s=p.find(E=>E.id===i),l=c[i];a+=s.price*l,o+=`- ${s.name} (${s.unit}) x ${l} = ${d(s.price*l)}
`}),o+=`
*Total Tagihan: ${d(a)}*
`,o+=`
Mohon informasi ongkos kirim dan total pembayarannya. Terima kasih!`;const r=encodeURIComponent(o),e=`https://api.whatsapp.com/send/?phone=${P}&text=${r}&type=phone_number&app_absent=0`;window.open(e,"_blank")});q();g();
