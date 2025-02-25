function toggleTheme() {
    var button = document.getElementById('theme-toggler');
    var theme = document.body.classList.contains('light') ? 'dark' : 'light';
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
        button.innerHTML = '<i class="bi bi-brightness-high-fill"></i>';
    } else {
        button.innerHTML = '<i class="bi bi-moon-fill"></i>';
    }
}

function applySavedTheme() {
    var button = document.getElementById('theme-toggler');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        if (savedTheme === 'dark') {
            button.innerHTML = '<i class="bi bi-brightness-high-fill"></i>';
        } else {
            button.innerHTML = '<i class="bi bi-moon-fill"></i>';
        }
    } else {
        // Default theme
        document.body.classList.add('dark');
        button.innerHTML = '<i class="bi bi-moon-fill"></i>';
    }
}

// Apply the saved theme on page load
document.addEventListener('DOMContentLoaded', applySavedTheme);