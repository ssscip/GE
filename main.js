// Shrinking header on scroll for all pages
window.addEventListener('scroll', () => {
    const header = document.querySelector('header, #main-header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add('shrunk');
    } else {
        header.classList.remove('shrunk');
    }
});
