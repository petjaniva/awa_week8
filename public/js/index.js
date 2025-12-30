const checkStorageForToken = () => {
  const token = localStorage.getItem("token");
  return token !== null;
};
const fetchPrivateData = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/api/private/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.ok) {
    const result = await response.json();
    console.log("private data fetch success:", result);
    // create a logout button
    const logoutButton = document.createElement("button");
    logoutButton.id = "logout";
    logoutButton.textContent = "Logout";
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
    });
    document.body.appendChild(logoutButton);
  } else {
    console.error("private data fetch failed");
  }
};
if (!checkStorageForToken()) {
  window.location.href = "/login.html";
} else {
  fetchPrivateData();
}
