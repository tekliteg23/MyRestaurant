// ================= CONFIG =================

// Localhost for development
// const API = "http://localhost:5000";

// Production Render API
const API = "https://restaurant-backend-umgr.onrender.com";

// ================= STATE =================
let allMenu = [];
let filteredMenu = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentOrderId = null;

// ================= GET USER =================
function getUser() {

  return JSON.parse(
    localStorage.getItem("user")
  );
}

// ================= GET TOKEN =================
function getToken() {

  return localStorage.getItem(
    "token"
  );
}

// ================= AUTH HEADERS =================
function authHeaders() {

  return {
    "Content-Type": "application/json",

    Authorization:
      `Bearer ${getToken()}`
  };
}

// ================= CHECK LOGIN =================
function isLoggedIn() {

  return !!getToken();
}

// ================= ORDER NOW =================
function redirectToLogin() {

  const user = getUser();

  if (!user || !getToken()) {

    localStorage.setItem(
      "redirectAfterLogin",
      "order.html"
    );

    window.location.href =
      "login.html";

    return;
  }

  window.location.href =
    "order.html";
}

// ================= LOGOUT =================
function logout() {

  localStorage.removeItem("user");

  localStorage.removeItem("cart");

  localStorage.removeItem("token");

  window.location.href =
    "login.html";
}

// ================= LOAD MENU =================
async function loadMenu() {

  try {

    const response = await fetch(
      `${API}/api/menu`
    );

    const data =
      await response.json();

    if (!response.ok) {

      console.error(
        data.message
      );

      return;
    }

    allMenu = data;

    filteredMenu = data;

    renderMenu(filteredMenu);

  } catch (error) {

    console.error(
      "Load Menu Error:",
      error
    );
  }
}

// ================= RENDER MENU =================
function renderMenu(menu) {

  const container =
    document.getElementById(
      "menu-container"
    );

  if (!container) return;

  if (menu.length === 0) {

    container.innerHTML =
      "<p>No menu items found</p>";

    return;
  }

  container.innerHTML =
    menu.map(item => `

      <div class="menu-card">

        <img
          src="${
            item.image
              ? API + item.image
              : 'https://via.placeholder.com/300'
          }"
          alt="${item.name}"
          class="menu-image"
        >

        <h3>${item.name}</h3>

        <p class="price">
          ${item.price} ETB
        </p>

        <p class="category">
          ${item.category}
        </p>

        <button
          onclick="addToCart(${item.id})"
        >
          Add To Cart
        </button>

      </div>

    `).join("");
}

// ================= SEARCH MENU =================
function searchMenu() {

  const search =
    document.getElementById(
      "search"
    )?.value.toLowerCase();

  filteredMenu =
    allMenu.filter(item =>
      item.name
        .toLowerCase()
        .includes(search)
    );

  renderMenu(filteredMenu);
}

// ================= FILTER MENU =================
function filterMenu() {

  const category =
    document.getElementById(
      "categoryFilter"
    )?.value;

  if (!category) {

    filteredMenu = allMenu;

  } else {

    filteredMenu =
      allMenu.filter(
        item =>
          item.category === category
      );
  }

  renderMenu(filteredMenu);
}

// ================= ADD TO CART =================
function addToCart(id) {

  if (!isLoggedIn()) {

    localStorage.setItem(
      "redirectAfterLogin",
      "order.html"
    );

    window.location.href =
      "login.html";

    return;
  }

  const item =
    allMenu.find(
      m => m.id === id
    );

  if (!item) return;

  const existing =
    cart.find(
      c => c.id === id
    );

  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({

      id: item.id,

      name: item.name,

      price: item.price,

      image: item.image,

      quantity: 1
    });
  }

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  renderCart();

  showToast(
    "✅ Item added to cart"
  );
}

// ================= CLEAR CART =================
function clearCart() {

  cart = [];

  localStorage.removeItem("cart");

  renderCart();

  showToast(
    "Cart cleared"
  );
}

// ================= REMOVE FROM CART =================
function removeFromCart(id) {

  cart = cart.filter(
    item => item.id !== id
  );

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  renderCart();
}

// ================= RENDER CART =================
function renderCart() {

  const cartDiv =
    document.getElementById("cart");

  const totalSpan =
    document.getElementById(
      "cartTotal"
    );

  if (!cartDiv || !totalSpan)
    return;

  if (cart.length === 0) {

    cartDiv.innerHTML = `
      <p class="empty-cart">
        🛒 No items yet
      </p>
    `;

    totalSpan.innerText = "0";

    return;
  }

  let total = 0;

  cartDiv.innerHTML =
    cart.map(item => {

      total +=
        item.price * item.quantity;

      return `

        <div class="cart-item">

          <img
            src="${API}${item.image}"
            width="60"
          >

          <div>

            <h4>${item.name}</h4>

            <p>
              ${item.quantity}
              ×
              ${item.price} ETB
            </p>

          </div>

          <button
            onclick="removeFromCart(${item.id})"
          >
            ❌
          </button>

        </div>

      `;
    }).join("");

  totalSpan.innerText = total;
}

// ================= PLACE ORDER =================
async function placeOrder() {

  try {

    if (cart.length === 0) {

      showToast(
        "Cart is empty"
      );

      return;
    }

    const user = getUser();

    if (!user || !getToken()) {

      localStorage.setItem(
        "redirectAfterLogin",
        "order.html"
      );

      window.location.href =
        "login.html";

      return;
    }

    const items =
      cart.map(item => ({

        menu_id: item.id,

        quantity: item.quantity
      }));

    const response = await fetch(
      `${API}/api/orders`,
      {
        method: "POST",

        headers: authHeaders(),

        body: JSON.stringify({

          customer_name:
            user.name,

          items
        })
      }
    );

    const data =
      await response.json();

    if (!response.ok) {

      showToast(
        data.message ||
        "Order failed"
      );

      return;
    }

    currentOrderId =
      data.order_id;

    showToast(
      "✅ Order placed successfully"
    );

    cart = [];

    localStorage.removeItem(
      "cart"
    );

    renderCart();

    loadMyOrders();

  } catch (error) {

    console.error(
      "Place Order Error:",
      error
    );

    showToast(
      "Failed to place order"
    );
  }
}

// ================= CONFIRM ORDER =================
async function confirmMyOrder(orderId) {

  try {

    const response = await fetch(
      `${API}/api/orders/${orderId}/confirm`,
      {
        method: "PUT",

        headers: authHeaders()
      }
    );

    const data =
      await response.json();

    if (!response.ok) {

      showToast(
        data.message
      );

      return;
    }

    showToast(
      data.message
    );

    loadMyOrders();

  } catch (error) {

    console.error(error);

    showToast(
      "Server error"
    );
  }
}

// ================= LOAD MY ORDERS =================
async function loadMyOrders() {

  try {

    const response = await fetch(
      `${API}/api/orders/my-orders`,
      {
        headers: authHeaders()
      }
    );

    const data =
      await response.json();

    if (!response.ok) {

      showToast(
        data.message ||
        "Failed to load orders"
      );

      return;
    }

    const section =
      document.getElementById(
        "myOrdersSection"
      );

    const container =
      document.getElementById(
        "myOrdersContainer"
      );

    if (!container || !section)
      return;

    section.style.display =
      "block";

    if (data.length === 0) {

      container.innerHTML = `
        <p>No orders found</p>
      `;

      return;
    }

    const groupedOrders = {};

    data.forEach(item => {

      if (!groupedOrders[item.id]) {

        groupedOrders[item.id] = {

          id: item.id,

          total: item.total,

          status: item.status,

          order_date:
            item.order_date,

          items: []
        };
      }

      groupedOrders[item.id]
        .items.push({

          name: item.item_name,

          quantity:
            item.quantity,

          image: item.image,

          price: item.price
        });
    });

    let html = "";

    Object.values(
      groupedOrders
    ).forEach(order => {

      html += `

        <div class="order-card">

          <div class="order-top">

            <h3>
              Order #${order.id}
            </h3>

            <span class="status ${order.status}">
              ${order.status}
            </span>

          </div>

          <p>
            📅
            ${new Date(
              order.order_date
            ).toLocaleString()}
          </p>

          <div class="order-items">
      `;

      order.items.forEach(item => {

        html += `

          <div class="order-item">

            <img
              src="${API}${item.image}"
              width="70"
            >

            <div>

              <h4>${item.name}</h4>

              <p>
                ${item.quantity}
                ×
                ${item.price} ETB
              </p>

            </div>

          </div>

        `;
      });

      html += `

          </div>

          <h3>
            Total:
            ${order.total} ETB
          </h3>

        </div>
      `;
    });

    container.innerHTML = html;

  } catch (error) {

    console.error(error);

    showToast(
      "Error loading orders"
    );
  }
}

// ================= PAYMENT =================
async function payNow() {

  try {

    const user = getUser();

    if (!user || !getToken()) {

      alert(
        "Please login first"
      );

      window.location.href =
        "login.html";

      return;
    }

    if (cart.length === 0) {

      alert(
        "Cart is empty"
      );

      return;
    }

    let total = 0;

    cart.forEach(item => {

      total +=
        item.price *
        item.quantity;
    });

    const orderItems =
      cart.map(item => ({

        menu_id: item.id,

        quantity:
          item.quantity
      }));

    const response = await fetch(
      `${API}/api/payment/initialize`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          amount: total,

          email: user.email,

          first_name:
            user.name,

          last_name:
            "Customer",

          items: orderItems
        })
      }
    );

    const data =
      await response.json();

    if (!response.ok) {

      alert(
        data.message ||
        "Payment failed"
      );

      return;
    }

    window.location.href =
      data.checkout_url;

  } catch (error) {

    console.error(error);

    alert("Payment failed");
  }
}

// ================= TOAST =================
function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  if (!toast) {

    alert(message);

    return;
  }

  toast.innerText = message;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

  }, 3000);
}

// ================= UPDATE NAVBAR =================
function updateNavbar() {

  const user = getUser();

  const loginLink =
    document.getElementById(
      "loginLink"
    );

  const registerLink =
    document.getElementById(
      "registerLink"
    );

  const logoutLink =
    document.getElementById(
      "logoutLink"
    );

  const dashboardLink =
    document.getElementById(
      "dashboardLink"
    );

  if (user) {

    if (loginLink)
      loginLink.style.display =
        "none";

    if (registerLink)
      registerLink.style.display =
        "none";

    if (logoutLink)
      logoutLink.style.display =
        "inline-block";

    if (
      dashboardLink &&
      user.role === "admin"
    ) {

      dashboardLink.style.display =
        "inline-block";
    }

  } else {

    if (logoutLink)
      logoutLink.style.display =
        "none";

    if (dashboardLink)
      dashboardLink.style.display =
        "none";
  }
}

// ================= GO HOME =================
function goHome() {

  window.location.href =
    "index.html";
}

// ================= GO DASHBOARD =================
function goDashboard() {

  const user = getUser();

  if (!user) return;

  if (user.role === "admin") {

    window.location.href =
      "dashboard.html";

  } else {

    window.location.href =
      "index.html";
  }
}

// ================= INIT =================
document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateNavbar();

    loadMenu();

    renderCart();
  }
);