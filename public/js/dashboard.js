// ================= 🔐 AUTH SETUP =================
//const API_BASE = "http://localhost:5000";

const API_BASE ="https://restaurant-backend-umgr.onrender.com";

let user = null;

try {

  user = JSON.parse(
    localStorage.getItem("user")
  );

} catch (e) {

  user = null;
}

// ✅ GET TOKEN SAFELY
const token =
  localStorage.getItem("token");

// ================= PAGE PROTECTION =================
if (!token || !user) {
  window.location.href = "login.html";
}

// ================= GLOBAL STATE =================
let editId = null;
let currentType = "";
let chart = null;
let menuData = [];

// ================= INIT =================
window.onload = async () => {
  showUser();

  // ✅ Admin-only pages
  if (user.role === "admin") {
    await loadSummary();
    await loadChart();
    await loadMenu();
  } else {
    // Hide admin buttons for customers
    document.getElementById("ordersBtn")?.remove();
    document.getElementById("ingredientsBtn")?.remove();
    document.getElementById("expensesBtn")?.remove();

    // Customer view
    document.getElementById("content").innerHTML = `
      <h2>Welcome ${user.name}</h2>
      <p>You are logged in successfully.</p>
    `;
  }
};

// ================= SHOW USER =================
function showUser() {
  const el = document.getElementById("welcome");

  if (el && user) {
    el.innerText = `Welcome, ${user.name} (${user.role})`;
  }
}

// ================= AUTH FETCH =================
async function authFetch(url, options = {}) {

  try {

    const response = await fetch(
      `${API_BASE}${url}`,
      {
        ...options,

        headers: {

          Authorization:
            `Bearer ${token}`,

          ...(options.body instanceof FormData
            ? {}
            : {
                "Content-Type":
                  "application/json"
              }),
        },
      }
    );

    // ✅ HANDLE LOGIN EXPIRATION
    if (
      response.status === 401 ||
      response.status === 403
    ) {

      alert(
        "Session expired. Please login again."
      );

      logout();

      return null;
    }

    // ✅ SAFE JSON
    const data =
      await response.json();

    return data;

  } catch (error) {

    console.error(
      "AUTH FETCH ERROR:",
      error
    );

    alert(
      "Network error"
    );

    return null;
  }
}

// ================= SUMMARY =================
async function loadSummary() {
  const data = await authFetch("/api/dashboard/summary");

  if (!data) return;

  document.getElementById("revenue").innerText =
    data.revenue || 0;

  document.getElementById("expenses").innerText =
    data.expenses || 0;

  document.getElementById("ingredients").innerText =
    data.ingredients || 0;

  document.getElementById("profit").innerText =
    data.profit || 0;
}

// ================= CHART =================
async function loadChart() {
  const data = await authFetch("/api/dashboard/monthly-profit");

  if (!data) return;

  const ctx = document.getElementById("profitChart");

  if (!ctx) return;

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "bar",

    data: {
      labels: data.map(d => d.month),

      datasets: [
        {
          label: "Monthly Profit",
          data: data.map(d => d.profit),
        },
      ],
    },
  });
}

// ================= PROFIT PAGE =================
function loadProfit() {
  document.getElementById("content").innerHTML = `
    <h2>📈 Profit Overview</h2>

    <p>Profit = Revenue - Expenses - Ingredients</p>

    <p>See chart below for monthly performance.</p>
  `;
}

// ================= MENU =================
async function loadMenu() {
  currentType = "menu";

  const data = await authFetch("/api/menu");

  if (!data) return;

  menuData = data;

  renderMenuTable(data);
}

// ================= RENDER MENU =================
function renderMenuTable(data) {

  let html = `
    <h2>🍔 Menu Items</h2>

    <div style="margin-bottom:15px;">

      <select id="filterCategory" onchange="filterMenu()">

        <option value="">
          All Categories
        </option>

        <option value="foods">
          🍽 Foods
        </option>

        <option value="cool drinks">
          🥤 Cool Drinks
        </option>

        <option value="hot drinks">
          ☕ Hot Drinks
        </option>

      </select>

      <button onclick="openModal()">
        ➕ Add Menu
      </button>

    </div>

    <table border="1" width="100%" cellpadding="10">

      <tr>
        <th>Image</th>
        <th>Name</th>
        <th>Category</th>
        <th>Price</th>
        <th>Actions</th>
      </tr>
  `;

  data.forEach(item => {

    html += `
      <tr>

        <td>
          <img 
            src="${item.image ? API_BASE + item.image : ''}" 
            width="70"
            height="70"
            style="object-fit:cover;border-radius:6px;"
          >
        </td>

        <td>${item.name}</td>

        <td>${item.category}</td>

        <td>${item.price} ETB</td>

        <td>

          <button
            onclick="openModalSafe('${encodeURIComponent(JSON.stringify(item))}')"
          >
            ✏️ Edit
          </button>

          <button onclick="deleteItem(${item.id})">
            🗑 Delete
          </button>

        </td>

      </tr>
    `;
  });

  html += `</table>`;

  document.getElementById("content").innerHTML = html;
}

// ================= FILTER MENU =================
function filterMenu() {

  const selected =
    document.getElementById("filterCategory").value;

  if (!selected) {
    renderMenuTable(menuData);
    return;
  }

  const filtered =
    menuData.filter(item => item.category === selected);

  renderMenuTable(filtered);
}

// ================= LOAD INGREDIENTS =================
async function loadIngredients() {

  currentType = "ingredient";

  const data = await authFetch("/api/ingredients");

  if (!data) return;

  let html = `
    <h2>🥕 Ingredients</h2>

    <button onclick="openModal()">
      ➕ Add Ingredient
    </button>

    <table border="1" width="100%" cellpadding="10">

      <tr>
        <th>Name</th>
        <th>Qty</th>
        <th>Unit</th>
        <th>Unit Price</th>
        <th>Total</th>
        <th>Action</th>
      </tr>
  `;

  data.forEach(i => {

    html += `
      <tr>

        <td>${i.name}</td>
        <td>${i.quantity}</td>
        <td>${i.unit}</td>
        <td>${i.unit_price}</td>
        <td>${i.total_value}</td>

        <td>

          <button
            onclick="openModalSafe('${encodeURIComponent(JSON.stringify(i))}')"
          >
            ✏️
          </button>

          <button onclick="deleteItem(${i.id})">
            🗑
          </button>

        </td>

      </tr>
    `;
  });

  html += "</table>";

  document.getElementById("content").innerHTML = html;
}

// ================= LOAD EXPENSES =================
async function loadExpenses() {

  currentType = "expense";

  const data = await authFetch("/api/expenses");

  if (!data) return;

  let html = `
    <h2>💸 Expenses</h2>

    <button onclick="openModal()">
      ➕ Add Expense
    </button>

    <table border="1" width="100%" cellpadding="10">

      <tr>
        <th>Category</th>
        <th>Amount</th>
        <th>Date</th>
        <th>Action</th>
      </tr>
  `;

  data.forEach(e => {

    html += `
      <tr>

        <td>${e.category}</td>
        <td>${e.amount}</td>
        <td>${e.expense_date}</td>

        <td>

          <button
            onclick="openModalSafe('${encodeURIComponent(JSON.stringify(e))}')"
          >
            ✏️
          </button>

          <button onclick="deleteItem(${e.id})">
            🗑
          </button>

        </td>

      </tr>
    `;
  });

  html += "</table>";

  document.getElementById("content").innerHTML = html;
}

// ================= LOAD ORDERS =================

async function loadOrders() {

  currentType = "order";

  const data = await authFetch("/api/orders");

  if (!data || !Array.isArray(data)) {
    alert("Failed to load orders");
    return;
  }

  // ================= GROUP ORDERS =================
  const groupedOrders = {};

  data.forEach(row => {

    // CREATE ORDER OBJECT
    if (!groupedOrders[row.id]) {

      groupedOrders[row.id] = {
        id: row.id,
        customer_name: row.customer_name || "Unknown",
        total: row.total || 0,
        status: row.status || "pending",
        order_date: row.order_date || "",
        items: []
      };
    }

    // ADD ITEMS
    groupedOrders[row.id].items.push({
      item_name: row.item_name,
      quantity: row.quantity
    });
  });

  // CONVERT OBJECT TO ARRAY
  const orders = Object.values(groupedOrders);

  // ================= HTML =================
  let html = `
    <h2>📦 Orders</h2>

    <table border="1" width="100%" cellpadding="10">

      <tr>
        <th>Order ID</th>
        <th>Customer</th>
        <th>Items</th>
        <th>Total</th>
        <th>Status</th>
        <th>Date</th>
      </tr>
  `;

  orders.forEach(order => {

    // FORMAT ITEMS
    const itemsHTML = order.items.map(item => `
      <div>
        ${item.item_name} × ${item.quantity}
      </div>
    `).join("");

    html += `
      <tr>

        <td>
          #${order.id}
        </td>

        <td>
          ${order.customer_name}
        </td>

        <td>
          ${itemsHTML}
        </td>

        <td>
          ${order.total} ETB
        </td>

        <td>

          <select id="status-${order.id}">

            <option value="pending"
              ${order.status === "pending" ? "selected" : ""}
            >
              Pending
            </option>

            <option value="preparing"
              ${order.status === "preparing" ? "selected" : ""}
            >
              Preparing
            </option>

            <option value="completed"
              ${order.status === "completed" ? "selected" : ""}
            >
              Completed
            </option>

            <option value="cancelled"
              ${order.status === "cancelled" ? "selected" : ""}
            >
              Cancelled
            </option>

            <option value="delivered"
              ${order.status === "delivered" ? "selected" : ""}
            >
              Delivered
            </option>

          </select>

          <button onclick="confirmStatus(${order.id})">
            ✔ Update
          </button>

        </td>

        <td>
          ${new Date(order.order_date).toLocaleString()}
        </td>

      </tr>
    `;
  });

  html += `</table>`;

  document.getElementById("content").innerHTML = html;
}

// ================= UPDATE ORDER STATUS =================
async function updateStatus(id, status) {

  const data = await authFetch(`/api/orders/${id}`, {
    method: "PUT",

    body: JSON.stringify({
      status
    }),
  });

  if (data) {
    alert("✅ Order status updated");
    loadOrders();
  }
}

// ================= CONFIRM STATUS =================
async function confirmStatus(id) {

  const select =
    document.getElementById(`status-${id}`);

  const status = select.value;

  await updateStatus(id, status);
}

// ================= CUSTOMER CONFIRM =================
async function confirmMyOrder(id) {

  try {

    const res = await fetch(
      `${API_BASE}/api/orders/${id}/confirm`,
      {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (res.ok) {

      alert("✅ Order confirmed!");

      loadOrders();

    } else {

      alert(data.message || "Error confirming order");
    }

  } catch (err) {

    console.error(err);

    alert("Network error");
  }
}

// ================= SAFE EDIT =================
function openModalSafe(encoded) {

  const item =
    JSON.parse(decodeURIComponent(encoded));

  openModal(item);
}

// ================= OPEN MODAL =================
function openModal(item = null) {

  const modal =
    document.getElementById("modal");

  const body =
    document.getElementById("modalBody");

  const title =
    document.getElementById("modalTitle");

  modal.style.display = "flex";

  editId = item ? item.id : null;

  title.innerText =
    editId ? "Edit Item" : "Add Item";

  let fields = "";

  // ================= MENU =================
  if (currentType === "menu") {

    fields = `
      <input
        id="name"
        value="${item?.name || ""}"
        placeholder="Food Name"
      >

      <select id="menu_category">

        <option value="foods"
          ${item?.category === "foods" ? "selected" : ""}
        >
          🍽 Foods
        </option>

        <option value="cool drinks"
          ${item?.category === "cool drinks" ? "selected" : ""}
        >
          🥤 Cool Drinks
        </option>

        <option value="hot drinks"
          ${item?.category === "hot drinks" ? "selected" : ""}
        >
          ☕ Hot Drinks
        </option>

      </select>

      <input
        id="price"
        value="${item?.price || ""}"
        placeholder="Price"
      >

      <input
        type="file"
        id="image"
      >

      ${
        item?.image
          ? `<img src="${API_BASE + item.image}" width="80">`
          : ""
      }
    `;
  }

  // ================= INGREDIENT =================
  if (currentType === "ingredient") {

    fields = `
      <input
        id="name"
        placeholder="Ingredient Name"
        value="${item?.name || ""}"
      >

      <input
        id="quantity"
        placeholder="Quantity"
        value="${item?.quantity || ""}"
      >

      <input
        id="unit"
        placeholder="Unit"
        value="${item?.unit || ""}"
      >

      <input
        id="unit_price"
        placeholder="Unit Price"
        value="${item?.unit_price || ""}"
      >
    `;
  }

  // ================= EXPENSE =================
  if (currentType === "expense") {

    fields = `
      <select id="expense_category">

        <option value="food cost">
          Food Cost
        </option>

        <option value="salary">
          Salary
        </option>

        <option value="rent">
          Rent
        </option>

        <option value="utilities">
          Utilities
        </option>

        <option value="transport">
          Transport
        </option>

        <option value="other">
          Other
        </option>

      </select>

      <input
        id="amount"
        value="${item?.amount || ""}"
        placeholder="Amount"
      >

      <input
        type="date"
        id="expense_date"
        value="${item?.expense_date || ""}"
      >
    `;
  }

  body.innerHTML = fields;
}

// ================= SAVE ITEM =================
async function saveItem() {

  let method = editId ? "PUT" : "POST";

  // ================= MENU =================
  if (currentType === "menu") {

    const name =
      document.getElementById("name").value.trim();

    const category =
      document.getElementById("menu_category").value;

    const price =
      document.getElementById("price").value;

    if (!name || !category || !price) {
      alert("Please fill all fields");
      return;
    }

    const form = new FormData();

    form.append("name", name);
    form.append("category", category);
    form.append("price", price);

    const fileInput =
      document.getElementById("image");

    const file = fileInput.files[0];

    if (file) {
      form.append("image", file);
    }

    try {

      const res = await fetch(
        `${API_BASE}/api/menu${editId ? "/" + editId : ""}`,
        {
          method,

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: form,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error saving menu");
        return;
      }

      alert("✅ Menu saved successfully");

      loadMenu();

      closeModal();

    } catch (err) {

      console.error("MENU ERROR:", err);

      alert("Network error");
    }
  }

  // ================= INGREDIENT =================
  if (currentType === "ingredient") {

    const name =
      document.getElementById("name").value;

    const quantity =
      document.getElementById("quantity").value;

    const unit =
      document.getElementById("unit").value;

    const unit_price =
      document.getElementById("unit_price").value;

    if (!name || !quantity || !unit || !unit_price) {
      alert("Please fill all fields");
      return;
    }

    await authFetch(
      `/api/ingredients${editId ? "/" + editId : ""}`,
      {
        method,

        body: JSON.stringify({
          name,
          quantity,
          unit,
          unit_price,
        }),
      }
    );

    loadIngredients();

    closeModal();
  }

  // ================= EXPENSE =================
  if (currentType === "expense") {

    await authFetch(
      `/api/expenses${editId ? "/" + editId : ""}`,
      {
        method,

        body: JSON.stringify({
          category:
            document.getElementById("expense_category").value,

          amount:
            document.getElementById("amount").value,

          expense_date:
            document.getElementById("expense_date").value,
        }),
      }
    );

    loadExpenses();

    closeModal();
  }
}

// ================= DELETE =================
async function deleteItem(id) {

  if (!confirm("Delete this item?")) {
    return;
  }

  let url = "";

  if (currentType === "menu") {
    url = `/api/menu/${id}`;
  }

  if (currentType === "expense") {
    url = `/api/expenses/${id}`;
  }

  if (currentType === "ingredient") {
    url = `/api/ingredients/${id}`;
  }

  const data = await authFetch(url, {
    method: "DELETE",
  });

  if (data) {

    alert("✅ Deleted successfully");

    if (currentType === "menu") loadMenu();

    if (currentType === "expense") loadExpenses();

    if (currentType === "ingredient") loadIngredients();
  }
}

// ================= CLOSE MODAL =================
function closeModal() {

  document.getElementById("modal").style.display =
    "none";

  editId = null;
}

// ================= LOGOUT =================
function logout() {

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "login.html";
}