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
      const success = await login(username, password);

      if (success) {
        localStorage.setItem('jwt', 'session-ok');  // Save dummy session token
        window.location.href = 'dashbored.html';    // ✅ Redirect
      } else {
        showError('Invalid credentials. Please try again.');
      }
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

async function login(username, password) {
  const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${username}:${password}`),
      'Content-Type': 'application/json',
    },
  });

  console.log('Login status:', response.status);

  if (response.status === 204 || response.status === 200) {
    return true;
  }

  return false;
}
