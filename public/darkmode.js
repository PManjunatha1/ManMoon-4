// Global Dark Mode Handler
(function() {
    const savedMode = localStorage.getItem('nightMode');
    if (savedMode === 'enabled') {
        document.body.classList.add('night-mode');
    }
})();
