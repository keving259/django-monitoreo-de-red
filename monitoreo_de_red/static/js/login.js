const loginForm = document.querySelector('.login__form');
const usernameInput = document.getElementById('login-username');
const passwordInput = document.getElementById('login-pw');

const successView = document.querySelector('[data-success]');
const formView = document.querySelector('[data-view]');
const liveMessage = document.querySelector('[data-live]');
const doneText = document.querySelector('[data-done-text]');
const resetButton = document.querySelector('[data-reset]');
const submitButton = loginForm.querySelector('[type="submit"]');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!loginForm.reportValidity()) {
        return;
    };

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-pw').value;

    liveMessage.textContent = '';

    loginForm.querySelectorAll('[data-error]').forEach((element) => {
        element.textContent = '';
    });

    submitButton.disabled = true;
    submitButton.textContent = 'Iniciando sesión...';

    try {
        const response = await fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            liveMessage.textContent = 
                data.error || 'No se puede iniciar sesión';
            return;
        }

        sessionStorage.setItem('authToken', data.token);

        formView.hidden = true;
        successView.hidden = false;

        doneText.textContent = 
            `Sesión iniciada correctamente. Bienvenido, ${username}`;
        
        successView.focus();
    } catch (error) {
        console.log("Error al iniciar sesión:", error);
        liveMessage.textContent =
            'No se pudo conectar con el servidor. Intente de nuevo';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Iniciar sesión';
    }
});

resetButton.addEventListener('click', () => {
    successView.hidden = true;
    formView.hidden = false;

    loginForm.reset();
    liveMessage.textContent = '';

    usernameInput.focus();
});
