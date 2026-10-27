function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rol');

    window.location.href = '/login/';
}
