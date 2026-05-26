// ================= CONFIG =================
//const API = "http://localhost:5000";

const API = "https://restaurant-backend-umgr.onrender.com";

// ================= INIT =================
window.onload = () => {
  const form = document.getElementById("registerForm");

  if (form) {
    form.addEventListener("submit", registerUser);
  }
};

// ================= REGISTER =================
async function registerUser(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    showToast("Please fill all fields");
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Registration failed");
      return;
    }

    showToast("✅ Registration successful");

    // Redirect to login after short delay
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

  } catch (err) {
    showToast("Server error");
  }
}

// ================= TOAST =================
function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) {
    alert(message);
    return;
  }

  toast.innerText = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}