// ================= CONFIG =================

// Localhost for development
// const API = "http://localhost:5000";

// Production Render API
const API =
  "https://restaurant-backend-umgr.onrender.com";

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

  // ================= VALIDATION =================

  if (!email || !password) {

    showToast(
      "Please fill all fields"
    );

    return;
  }

  try {

    // ================= API REQUEST =================

    const res = await fetch(
      `${API}/api/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })
      }
    );

    // ================= RESPONSE =================

    const data =
      await res.json();

    console.log(
      "LOGIN RESPONSE:",
      data
    );

    // ================= HANDLE LOGIN ERROR =================

    if (!res.ok) {

      showToast(
        data.message ||
        "Login failed"
      );

      return;
    }

    // ================= CHECK TOKEN =================

    if (!data.token) {

      showToast(
        "Token missing from server"
      );

      return;
    }

    // ================= SAVE TOKEN =================

    localStorage.setItem(
      "token",
      data.token
    );

    // ================= SAVE USER =================

    const userData = {
      id:
        data.user?.id || "",

      name:
        data.user?.name || "",

      email:
        data.user?.email || "",

      role:
        data.user?.role || "user"
    };

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    console.log(
      "SAVED USER:",
      userData
    );

    // ================= SUCCESS =================

    showToast(
      "✅ Login successful"
    );

    // ================= REDIRECT =================

    setTimeout(() => {

      const role =
        userData.role
          .toLowerCase()
          .trim();

      console.log(
        "USER ROLE:",
        role
      );

     // ================= ADMIN =================

if (role === "admin") {

  console.log(
    "Redirecting to dashboard..."
  );

  window.location.href =
    "dashboard.html";

  return;
}

// ================= USER =================

if (role === "user") {

  console.log(
    "Redirecting to order page..."
  );

  window.location.href =
    "order.html";

  return;
}

      // ================= UNKNOWN ROLE =================

      console.log(
        "Unknown role:",
        role
      );

      showToast(
        "Invalid user role"
      );

    }, 1000);

  } catch (err) {

    console.error(
      "LOGIN ERROR:",
      err
    );

    showToast(
      "Server error"
    );
  }
}

// ================= TOGGLE PASSWORD =================

function togglePassword() {

  const input =
    document.getElementById(
      "password"
    );

  input.type =
    input.type === "password"
      ? "text"
      : "password";
}

// ================= TOAST =================

function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  // Fallback alert
  if (!toast) {

    alert(message);

    return;
  }

  toast.innerText =
    message;

  toast.style.display =
    "block";

  setTimeout(() => {

    toast.style.display =
      "none";

  }, 3000);
}