const registerForm = document.getElementById("registerForm");
registerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const response = await fetch("http://localhost:3000/api/user/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  if (response.ok) {
    console.log("api register success");
    window.location.href = "login.html";
  } else {
    console.error("api register failed");
  }
});
