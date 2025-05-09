document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) {
    console.error("Login form not found!");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identifier = document.getElementById("identifier").value;
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("errorMessage");
    errorDiv.classList.remove("show");
    errorDiv.textContent = "";

    if (!identifier || !password) {
      errorDiv.textContent = "Please enter both identifier and password.";
      errorDiv.classList.add("show");
      return;
    }

    const credentials = btoa(`${identifier}:${password}`);

    try {
      const response = await fetch("https://learn.reboot01.com/api/auth/signin", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
        },
      });

      if (response.status === 204) {
        throw new Error("Login successful but no token received. Try again or check server.");
      }

      if (!response.ok) {
        throw new Error(`Login failed (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Response Data: ", data);

      const token = data;

      if (token) {
        localStorage.setItem("jwt", token);
        errorDiv.classList.remove("show");
        errorDiv.textContent = "";
        window.location.href = "dashbored.html";
      } else {
        throw new Error("Token not received");
      }

    } catch (err) {
      errorDiv.textContent = "Invalid credentials. Try again";
      errorDiv.classList.add("show");
      console.error(err);
    }
  });
});
