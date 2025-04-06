document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) {
    console.error('Login form not found');
    return;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
  
    try {
      await login(username, password); // Perform login

      // After successful login, the JWT is stored in localStorage and user is redirected
      window.location.href = 'dashbored.html'; // Redirect to dashboard
    } catch (err) {
      console.error('Login error:', err);
      showError('An error occurred. Please try again.');
    }
  });

  function showError(message) {
    const errorBox = document.getElementById('errorMessage');
    errorBox.innerText = message;
    errorBox.classList.add('show');
    setTimeout(() => {
      errorBox.classList.remove('show');
      errorBox.innerText = '';
    }, 3000);
  }
});

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