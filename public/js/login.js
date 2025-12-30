const loginForm = document.getElementById("loginForm");
loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const response = await fetch("http://localhost:3000/api/user/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  if (response.ok) {
    console.log("api login success");
    if (result.token) {
      localStorage.setItem("token", result.token);
    }
    window.location.href = "/";
  } else {
    console.error("api login failed");
  }
});
