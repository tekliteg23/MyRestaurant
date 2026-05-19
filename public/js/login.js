// ================= CONFIG =================
//const API = "http://localhost:5000";

const API = "https://restaurant-backend.onrender.com";

// ================= INIT =================
window.onload = () => {

  const form =
    document.getElementById("loginForm");

  if (form) {

    form.addEventListener(
      "submit",
      loginUser
    );
  }
};

// ================= LOGIN =================
async function loginUser(e) {

  e.preventDefault();

  const email =
    document.getElementById("email")
      .value
      .trim();

  const password =
    document.getElementById("password")
      .value
      .trim();

  if (!email || !password) {

    showToast("Please fill all fields");
    return;
  }

  try {

    const res = await fetch(
      `${API}/api/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {

      showToast(
        data.message || "Login failed"
      );

      return;
    }

    // ================= SAVE USER =================
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.user.id,
        token: data.token,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role
      })
    );

    showToast("✅ Login successful");

    // ================= SMART REDIRECT =================
    const redirect =
      localStorage.getItem(
        "redirectAfterLogin"
      );

    setTimeout(() => {

      if (redirect) {

        localStorage.removeItem(
          "redirectAfterLogin"
        );

        window.location.href = redirect;

        return;
      }

      // ================= ADMIN =================
      if (data.user.role === "admin") {

        window.location.href =
          "dashboard.html";
      }

      // ================= USER =================
      else {

        window.location.href =
          "order.html";
      }

    }, 1000);

  } catch (err) {

    console.error(
      "LOGIN ERROR:",
      err
    );

    showToast("Server error");
  }
}

// ================= TOGGLE PASSWORD =================
function togglePassword() {

  const input =
    document.getElementById("password");

  input.type =
    input.type === "password"
      ? "text"
      : "password";
}

// ================= TOAST =================
function showToast(message) {

  const toast =
    document.getElementById("toast");

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