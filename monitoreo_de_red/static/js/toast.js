document.addEventListener("DOMContentLoaded", () => {
    const message = sessionStorage.getItem('toastMessage');

    if (!message) return;

    const toast = document.getElementById('toast');

    if (!toast) return;

    toast.textContent = message;
    toast.hidden = false;
    toast.classList.add('show');

    sessionStorage.removeItem('toastMessage');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.hidden = true;
    }, 3000);
})
