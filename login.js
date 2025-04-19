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

    if (!identifier || !password) {
      alert("Please enter both identifier and password.");
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
      console.log("Response Data: ", data);  // Log the response data

      // Since the response is the token itself
      const token = data;

            if (token) {
        localStorage.setItem("jwt", `Bearer ${data.token}`);
        window.location.href = "dashbored.html";
      } else {
        throw new Error("Token not received");
      }

    } catch (err) {
      alert("Login failed: " + err.message);
      console.error(err);
    }
  });
});
