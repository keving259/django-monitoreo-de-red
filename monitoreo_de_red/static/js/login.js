const loginForm = document.querySelector('.login__form');
const usernameInput = document.getElementById('login-username');
const passwordInput = document.getElementById('login-pw');
const liveMessage = document.querySelector('[data-live]');
const submitButton = loginForm.querySelector('[type="submit"]');

function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");

    if (next) {
        try {
            const destination = new URL(next, window.location.origin);

            if (destination.origin === window.location.origin) {
                return destination.pathname + destination.search + destination.hash;
            }
        } catch {
            /* Ruta predeterminada */
        }
    }
    return '/api/hosts/';
}

function showToast(message) {
    sessionStorage.setItem('toastMessage', message);
    window.location.assign(getRedirectUrl());
}

function getCookie(name) {
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
        const [key, ...value] = cookie.trim().split('=');

        if (key === name) {
            return decodeURIComponent(value.join('='));
        }
    }
    return null;
}

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

    const next = getRedirectUrl();
    const csrfToken = getCookie('csrftoken');

    try {
        const response = await fetch('/api/login/', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ username, password, next }),
        });

        const data = await response.json();

        if (!response.ok) {
            liveMessage.textContent = 
                data.error || 'No se puede iniciar sesión';
            return;
        }

        localStorage.setItem('authToken', data.token);

        showToast(`Bienvenido, ${username}!`);

    } catch (error) {
        console.log("Error al iniciar sesión:", error);
        liveMessage.textContent =
            'No se pudo conectar con el servidor. Intente de nuevo';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Iniciar sesión';
    }
});

document.querySelectorAll("[data-pw-toggle]").forEach((button) => {
    button.addEventListener('click', () => {
        const inputId = button.getAttribute('aria-controls');
        const input = document.getElementById(inputId);

        if (!input) {
            return;
        }

        const showPassword = input.type === 'password';

        input.type = showPassword ? 'text' : 'password';

        button.setAttribute('aria-pressed', String(showPassword));
        button.setAttribute(
            'aria-label',
            showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
        );
        
        const eyeOn = button.querySelector('.login__eye-on');
        const eyeOff = button.querySelector('.login__eye-off');

        if (eyeOn) {
            eyeOn.style.display = showPassword ? 'none' : 'block';
        }

        if (eyeOff) {
            eyeOff.style.display = showPassword ? 'block' : 'none'
        }
    });
});
