import './style.css';
import Papa from 'papaparse';

// --- GOOGLE SHEETS CONFIG ---
// Ganti ID ini dengan ID Google Spreadsheet Anda yang sudah "Publish to Web" (sebagai CSV)
const GOOGLE_SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv`;

// --- DATA ---
const mockProducts = [
  {
    id: 1,
    name: "Arabica Gayo Premium",
    price: 85000,
    unit: "200g",
    description: "Notes: Fruity, Nutty, Dark Chocolate. Biji kopi single origin dari dataran tinggi Gayo.",
    image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Robusta Dampit",
    price: 45000,
    unit: "250g",
    description: "Notes: Bold, Earthy, Chocolate. Cocok untuk kopi tubruk atau campuran espresso.",
    image: "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Kopi Susu Gula Aren (Literan)",
    price: 75000,
    unit: "1 Liter",
    description: "Signature es kopi susu kami dalam kemasan 1 liter, tahan 3 hari di kulkas.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Cold Brew Konsentrat",
    price: 90000,
    unit: "500ml",
    description: "Konsentrat cold brew 100% Arabica. Tinggal tambah air atau susu.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop"
  }
];

let products = [];

// --- STATE ---
const CART_STORAGE_KEY = 'wa_commerce_cart';
const NOTES_STORAGE_KEY = 'wa_commerce_notes';
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || {}; // cart as key-value based on id
let cartNotes = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY)) || {}; // notes as key-value based on id

// --- UTILS ---
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
};

// --- DOM ELEMENTS ---
const productGrid = document.getElementById('product-grid');
const cartBadge = document.getElementById('cart-badge');
const openCartBtn = document.getElementById('open-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPriceEl = document.getElementById('cart-total-price');
const floatingCheckout = document.getElementById('floating-checkout');
const floatingCartCount = document.getElementById('floating-cart-count');
const floatingTotalPrice = document.getElementById('floating-total-price');
const openCartFloatingBtn = document.getElementById('open-cart-floating-btn');
const checkoutBtn = document.getElementById('checkout-btn');

// --- RENDER PRODUCTS ---
function renderProducts() {
  productGrid.innerHTML = '';
  
  if (products.length === 0) {
    productGrid.innerHTML = '<div class="empty-state">Belum ada produk yang dimuat.</div>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card glass';
    card.innerHTML = `
      <div class="product-image-container">
        <img src="${product.image}" loading="lazy" alt="${product.name}" class="product-image" />
      </div>
      <div class="product-info">
        <h4 class="product-name">${product.name}</h4>
        <p class="product-unit">${product.unit}</p>
        <p class="product-desc">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatRupiah(product.price)}</span>
          <button class="add-to-cart-btn" data-id="${product.id}">Tambah</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });

  // Attach event listeners
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      addToCart(id);
    });
  });
}

// --- CART LOGIC ---
function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(cartNotes));
}

function addToCart(id) {
  if (cart[id]) {
    cart[id] += 1;
  } else {
    cart[id] = 1;
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  if (cart[id]) {
    cart[id] -= 1;
    if (cart[id] <= 0) {
      delete cart[id];
    }
  }
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const cartIds = Object.keys(cart);
  let totalItems = 0;
  let totalPrice = 0;

  cartItemsContainer.innerHTML = '';

  if (cartIds.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart-message">Keranjang Anda masih kosong.</div>';
  } else {
    cartIds.forEach(idAsStr => {
      const id = parseInt(idAsStr);
      const product = products.find(p => p.id === id);
      const qty = cart[id];
      const note = cartNotes[id] || '';
      
      totalItems += qty;
      totalPrice += product.price * qty;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="cart-item-image">
        <div class="cart-item-details">
          <h5 class="cart-item-title">${product.name}</h5>
          <div class="cart-item-price">${formatRupiah(product.price)}</div>
          <input type="text" class="note-input" data-id="${id}" placeholder="Catatan (opsional: less sugar, dll)" value="${note}" />
          <div class="cart-item-controls">
            <button class="qty-btn minus-btn" data-id="${id}">-</button>
            <span class="qty-val">${qty}</span>
            <button class="qty-btn plus-btn" data-id="${id}">+</button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

  }

  // Update Counters & Totals
  cartBadge.textContent = totalItems;
  cartTotalPriceEl.textContent = formatRupiah(totalPrice);
  
  // Floating Mobile Cart
  if (totalItems > 0) {
    floatingCheckout.classList.add('visible');
    floatingCartCount.textContent = `${totalItems} Item`;
    floatingTotalPrice.textContent = formatRupiah(totalPrice);
  } else {
    floatingCheckout.classList.remove('visible');
  }

  // Attach event listeners to new qty buttons
  document.querySelectorAll('.minus-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      removeFromCart(parseInt(e.target.getAttribute('data-id')));
    });
  });
  document.querySelectorAll('.plus-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      addToCart(parseInt(e.target.getAttribute('data-id')));
    });
  });
  
  // Attach event listener for notes
  document.querySelectorAll('.note-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      cartNotes[id] = e.target.value;
      saveCart();
    });
  });
}

// --- DRAWER TOGGLE ---
function toggleDrawer() {
  cartDrawer.classList.toggle('open');
  cartDrawerOverlay.classList.toggle('open');
}

openCartBtn.addEventListener('click', toggleDrawer);
closeCartBtn.addEventListener('click', toggleDrawer);
cartDrawerOverlay.addEventListener('click', toggleDrawer);
openCartFloatingBtn.addEventListener('click', toggleDrawer);


// --- WHATSAPP CHECKOUT ---
const WHATSAPP_NUMBER = "6281234567890"; // Ganti dengan nomor asli

checkoutBtn.addEventListener('click', () => {
    const cartIds = Object.keys(cart);
    if(cartIds.length === 0) return;

    let totalItems = 0;
    let totalPrice = 0;
    
    let text = "Halo admin Kopi Lokal Nusantara, saya ingin memesan:\n\n";

    cartIds.forEach(idAsStr => {
      const id = parseInt(idAsStr);
      const product = products.find(p => p.id === id);
      const qty = cart[id];
      const note = cartNotes[id] ? ` (Catatan: ${cartNotes[id]})` : '';

      totalItems += qty;
      totalPrice += product.price * qty;

      text += `- ${product.name} ${note} (${product.unit}) x ${qty} = ${formatRupiah(product.price * qty)}\n`;
    });

    text += `\n*Total Tagihan: ${formatRupiah(totalPrice)}*\n`;
    text += `\nMohon informasi ongkos kirim dan total pembayarannya. Terima kasih!`;

    const encodedText = encodeURIComponent(text);
    const waUrl = `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodedText}&type=phone_number&app_absent=0`;
    
    // Open WA in new tab
    window.open(waUrl, '_blank');
});

// --- DATA FETCH LOGIC ---
async function initData() {
  if (GOOGLE_SHEET_ID === 'YOUR_GOOGLE_SHEET_ID' || !GOOGLE_SHEET_ID) {
    console.warn("Google Sheet ID belum disetting. Menggunakan Mock Data.");
    products = mockProducts;
    renderProducts();
    updateCartUI();
    return;
  }

  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error("Gagal mengambil data dari Google Sheets.");
    const csvText = await response.text();
    
    Papa.parse(csvText, {
      header: true, // Asumsikan baris pertama adalah header: id,name,price,unit,description,image
      skipEmptyLines: true,
      complete: function(results) {
        // Map data CSV dari string ke format object yang benar
        products = results.data.map(row => ({
          id: parseInt(row.id) || Date.now() + Math.random(),
          name: row.name || "Produk Tanpa Nama",
          price: parseInt(row.price) || 0,
          unit: row.unit || "-",
          description: row.description || "",
          image: row.image || "https://via.placeholder.com/300"
        }));
        
        renderProducts();
        updateCartUI();
      },
      error: function(error) {
        console.error("Error parsing CSV:", error);
        products = mockProducts;
        renderProducts();
        updateCartUI();
      }
    });

  } catch (err) {
    console.error(err);
    products = mockProducts;
    renderProducts();
    updateCartUI();
  }
}

// --- INIT ---
initData();
