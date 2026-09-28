const ACCOUNTS = [
    { username: "student", password: "student", redirect: "./student-dashboard.html" },
    { username: "teacher", password: "teacher", redirect: "./teacher-dashboard.html" },
];

/* Who is signed in for this tab (set at login, cleared at logout) */
const USER_KEY = 'ascendone-user';

const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("login-error");



function findAccount(username, password) {
    return (
        ACCOUNTS.find(
            (account) => account.username === username && account.password === password
        ) || null
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

        const account = findAccount(username, password);

        if (account) {
            try {
                sessionStorage.setItem(USER_KEY, account.username);
            } catch (e) {
                /* storage unavailable: pages fall back to guessing the role from the file name */
            }
            window.location.href = account.redirect;
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
        try {
            sessionStorage.removeItem(USER_KEY);
        } catch (e) {
            /* ignore */
        }
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

/* Display name: saved from a Settings page, applied to the sidebar on every page.
   Stored per account so the student and teacher names never mix in the same tab. */
const DISPLAY_NAME_KEY = 'ascendone-display-name';

function getCurrentUser() {
    try {
        const stored = sessionStorage.getItem(USER_KEY);
        if (stored) return stored;
    } catch (e) {
        /* fall through to the file-name guess */
    }
    // Page opened directly without logging in (e.g. while developing)
    return window.location.pathname.includes('teacher-') ? 'teacher' : 'student';
}

function displayNameKey() {
    return `${DISPLAY_NAME_KEY}:${getCurrentUser()}`;
}

function getNameInitials(name) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function getSavedDisplayName() {
    try {
        return sessionStorage.getItem(displayNameKey());
    } catch (e) {
        return null;
    }
}

function applyDisplayName(name) {
    if (!name) return;

    const initials = getNameInitials(name);

    document.querySelectorAll('.user-card strong').forEach((el) => {
        el.textContent = name;
    });
    document.querySelectorAll('.user-card .avatar').forEach((el) => {
        el.textContent = initials;
    });
    document.querySelectorAll('[data-user-first-name]').forEach((el) => {
        el.textContent = name.split(/\s+/)[0];
    });
}

function saveDisplayName(name) {
    try {
        sessionStorage.setItem(displayNameKey(), name);
    } catch (e) {
        /* storage unavailable: the name still updates for this page view */
    }
    applyDisplayName(name);
}

// Runs on every page that loads this script
applyDisplayName(getSavedDisplayName());