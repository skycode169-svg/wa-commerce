import './style.css';
import Papa from 'papaparse';

// --- GOOGLE SHEETS CONFIG ---
// Ganti ID ini dengan ID Google Spreadsheet Anda yang sudah "Publish to Web" (sebagai CSV)
const GOOGLE_SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv`;

// --- MOCK DATA FALLBACK ---
const mockProducts = [
  {
    id: 1,
    name: 'Mukena Silk Premium (Khaki)',
    price: 350000,
    unit: '1 Set',
    description: "Mukena dengan bahan silk premium yang adem, jatuh, dan tidak menerawang. Sudah termasuk pouch cantik.",
    image: '/images/mukena_silk_khaki.png'
  },
  {
    id: 2,
    name: 'Dress Busui Friendly (Sage)',
    price: 225000,
    unit: '1 Pcs',
    description: "Dress panjang elegan warna sage green, menggunakan bahan jatuh. Dilengkapi kancing depan khusus busui.",
    image: '/images/dress_busui_sage.png'
  },
  {
    id: 3,
    name: 'Skincare Halal Glowing Set',
    price: 180000,
    unit: '1 Paket',
    description: "Rangkaian skincare komplit bersertifikat Halal. Cocok untuk mencerahkan dan aman untuk kulit sensitif.",
    image: '/images/skincare_halal_set.png'
  },
  {
    id: 4,
    name: 'Madu Yaman Royal 500g',
    price: 120000,
    unit: '500g',
    description: "Madu liar murni 100% dari Yaman. Dipercaya ampuh sebagai booster stamina dan imunitas alami keluarga.",
    image: '/images/madu_yaman_royal.png'
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
          <input type="text" class="note-input" data-id="${id}" placeholder="Request (ex: Ukuran L, Jenis Kulit)" value="${note}" />
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

  // Calculate Infaq (2.5% of total price)
  const infaqAmount = Math.floor(totalPrice * 0.025);
  const grandTotal = totalPrice + infaqAmount;

  // Update Counters & Totals
  cartBadge.textContent = totalItems;
  cartTotalPriceEl.textContent = formatRupiah(grandTotal);
  
  // Inject Infaq specific text below total price using a span
  const existingInfaqSpan = document.getElementById('infaq-info');
  if(existingInfaqSpan) {
    existingInfaqSpan.textContent = `(Termasuk Infaq Otomatis 2.5%: ${formatRupiah(infaqAmount)})`;
  } else {
    // Attempting to append text below total, the DOM structure of index.html dictates it's next to checkout btn.
    // For simplicity, we just set the total price element to include this
    cartTotalPriceEl.innerHTML = `${formatRupiah(grandTotal)} <br><span style="font-size: 0.75rem; font-weight: 400; color: var(--color-text-muted); display: block; margin-top: 0.25rem;">(Termasuk Infaq 2.5%: ${formatRupiah(infaqAmount)} ke Yayasan Kebaikan Bersama)</span>`;
  }
  
  // Floating Mobile Cart
  if (totalItems > 0) {
    floatingCheckout.classList.add('visible');
    floatingCartCount.textContent = `${totalItems} Item`;
    floatingTotalPrice.textContent = formatRupiah(grandTotal);
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


// --- CONFIGURATION ---
const WHATSAPP_NUMBER = '6281234567890'; // Ganti dengan nomor WhatsApp Anda
const STORE_NAME = 'Azzahra Modest';

// --- WHATSAPP CHECKOUT ---
checkoutBtn.addEventListener('click', () => {
    const cartIds = Object.keys(cart);
    if(cartIds.length === 0) return;

    let totalItems = 0;
    let totalPrice = 0;
    
    let text = `Halo admin ${STORE_NAME}, saya ingin memesan:\n\n`;

    cartIds.forEach(idAsStr => {
      const id = parseInt(idAsStr);
      const product = products.find(p => p.id === id);
      const qty = cart[id];
      const note = cartNotes[id] ? ` (Catatan: ${cartNotes[id]})` : '';

      totalItems += qty;
      totalPrice += product.price * qty;

      text += `- ${product.name} ${note} (${product.unit}) x ${qty} = ${formatRupiah(product.price * qty)}\n`;
    });

    const infaqAmount = Math.floor(totalPrice * 0.025);
    const grandTotal = totalPrice + infaqAmount;

    text += `\n*Subtotal:* ${formatRupiah(totalPrice)}\n`;
    text += `*Infaq (2.5%):* ${formatRupiah(infaqAmount)}\n`;
    text += `*Total Tagihan: ${formatRupiah(grandTotal)}*\n\n`;
    text += `Mohon info ongkir dan nomor rekening ya min. Terima kasih! 🙏`;

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
