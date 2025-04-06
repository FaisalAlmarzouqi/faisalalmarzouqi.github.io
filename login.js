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
    const errorBox = document.getElementById('errorMessage');

    try {
      const token = await login(username, password);

      if (!token) {
        showError('Invalid credentials. Please try again.');
        return;
      }

      localStorage.setItem('jwt', token);
      window.location.href = 'profile.html';  // ✅ make sure this matches your file
    } catch (err) {
      console.error('Login error:', err);
      showError('An error occurred. Please try again.');
    }
  });

  function showError(message) {
    const errorBox = document.getElementById('errorMessage');
    errorBox.innerText = message;
    errorBox.classList.add('show');

    // Optionally clear the input fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';

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

  if (!response.ok) return null;

  const text = await response.text();
  if (!text) return null;

  const data = JSON.parse(text);
  return data.token;
}
