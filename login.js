document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const identifier = document.getElementById("identifier").value;  // Get username
  const password = document.getElementById("password").value;      // Get password

  try {
    const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: identifier,  // Ensure this matches the API's expected field name
        password: password,
      }),
    });

    const result = await response.json();
    console.log("Login response text:", result);

    if (result.jwt) {
      localStorage.setItem("jwt", result.jwt);
      window.location.href = "dashbored.html"; // Redirect to dashboard after successful login
    } else {
      document.getElementById("errorMessage").textContent = result?.error || "Login failed.";
    }
  } catch (error) {
    console.error("Login error:", error);
    document.getElementById("errorMessage").textContent = "Network error.";
  }
});






// Updated login function to use Basic Authentication with the correct server API
// Updated login function to use Basic Authentication with the correct server API
async function login(username, password) {
  const encoded = btoa(`${username}:${password}`);
  console.log("Trying to log in with Basic Auth:", encoded);

  const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + encoded,
      'Content-Type': 'application/json',
    },
  });

  console.log('Login status:', response.status);
  const text = await response.text();
  console.log('Login response text:', text);

  if (response.status === 200) {
    const authHeader = response.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwt = authHeader.split(' ')[1];
      localStorage.setItem("jwt", jwt);
      window.location.href = "dashbored.html";
      return;
    } else {
      console.warn('JWT not found in Authorization header');
    }
  } else {
    displayError('Invalid credentials or login error');
  }
}
