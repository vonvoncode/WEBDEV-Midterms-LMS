const valid_username = "student";
const valid_password = "student";

const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("login-error");



function validateLogin(username, password) {
    return (
        username === valid_username && password === valid_password
    );
}

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        errorMessage.textContent = "";

        if (!username || !password) {
            errorMessage.textContent =
                "Please enter both username and password.";
            return;
        }

        if (validateLogin(username, password)) {
            window.location.href = "./dashboard.html";
        } else {
            errorMessage.textContent =
                "Invalid username or password.";

            passwordInput.value = "";
            passwordInput.focus();
        }
    });
}

const logoutbutton = document.getElementById('logout');

if (logoutbutton) {
    logoutbutton.addEventListener('click', () => {
        window.location.href = './index.html';
    });
}

/* Mobile sidebar nav (hamburger + overlay) */
const mobileMenuButton = document.querySelector('.mobile-menu');
const navOverlay = document.getElementById('nav-overlay');

function closeMobileNav() {
    document.body.classList.remove('nav-open');
}

if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
        document.body.classList.toggle('nav-open');
    });
}

if (navOverlay) {
    navOverlay.addEventListener('click', closeMobileNav);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeMobileNav();
    }
});

/* Dark mode toggle, persisted per browser */
const themeToggleButton = document.getElementById('theme-toggle');
const THEME_KEY = 'ascendone-theme';

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    if (themeToggleButton) {
        const icon = themeToggleButton.querySelector('[data-lucide]');
        if (icon) {
            icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
            if (window.lucide) {
                lucide.createIcons();
            }
        }
        themeToggleButton.setAttribute(
            'aria-label',
            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        );
    }
}

const storedTheme = localStorage.getItem(THEME_KEY);
if (storedTheme) {
    applyTheme(storedTheme);
}

if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const nextTheme = isDark ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, nextTheme);
        applyTheme(nextTheme);
    });
}

/* Shared toast helper, used by page-specific scripts to confirm an action */
let toastTimer = null;

function showToast(message) {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.classList.add('visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl.classList.remove('visible');
    }, 2600);
}

window.showToast = showToast;