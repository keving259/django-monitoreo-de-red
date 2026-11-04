function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

async function logout() {
    try {
        const response = await fetch('/api/logout/', {
            method: "POST",
            credentials: 'same-origin',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
    
    } catch (error) {
        console.error("Error al cerrar la sesión:", error);
        return;
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('rol');

    window.location.href = '/login/';
}
