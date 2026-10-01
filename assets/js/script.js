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

function togglePasswordVisibility(input, button) {
    const showPassword = input.type === "password";

    input.type = showPassword ? "text" : "password";
    button.textContent = showPassword ? "Hide" : "Show";
    button.setAttribute(
        "aria-label",
        showPassword ? "Hide password" : "Show password"
    );
}

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

function setDateToday(date = new Date()) {
    const now = date;
    const options = { weekday: 'long', month: 'long', day: 'numeric' };

    const formattedDate = now.toLocaleDateString('en-US', options).toLowerCase();
    // const newSpan = document.createElement('span');
    // newSpan.id = datetoday;
    // newSpan.textContent = formattedDate;
    // def_date.replaceWith(newSpan);
    return formattedDate;
}

const def_date = document.getElementById('datetoday');

if (def_date) {
    def_date.textContent = setDateToday();
}

function getGreeting(date = new Date()) {
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    return 'Good evening';
}

const greetingEl = document.getElementById('greeting-text');

if (greetingEl) {
    greetingEl.textContent = getGreeting();
}

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

    }
    applyDisplayName(name);
}

applyDisplayName(getSavedDisplayName());

/* Notification delete / clear all — for testing only, nothing is saved,
   so a page refresh brings every notification back */
const clearAllButton = document.getElementById('clear-notifications');
const topbarNotificationBadge = document.querySelector('.notification-button .notification-count');

function updateNotificationBadge() {
    if (!topbarNotificationBadge) return;

    const unreadCount = document.querySelectorAll('.notification-row.unread').length;

    if (unreadCount === 0) {
        topbarNotificationBadge.remove();
    } else {
        topbarNotificationBadge.textContent = unreadCount;
    }
}

function updateNotificationPanelState() {
    const remaining = document.querySelectorAll('.notification-row').length;
    const emptyState = document.getElementById('no-notifications');

    if (emptyState) {
        emptyState.hidden = remaining !== 0;
    }
    if (clearAllButton) {
        clearAllButton.hidden = remaining === 0;
    }
}

const toggleButton = document.getElementById("toggle-password");

document.querySelectorAll('.notif-delete').forEach((button) => {
    button.addEventListener('click', () => {
        button.closest('.notification-row').remove();
        updateNotificationBadge();
        updateNotificationPanelState();
    });
});

if (clearAllButton) {
    clearAllButton.addEventListener('click', () => {
        document.querySelectorAll('.notification-row').forEach((row) => row.remove());
        updateNotificationBadge();
        updateNotificationPanelState();
    });
}

toggleButton.addEventListener("click", () => {
    togglePasswordVisibility(passwordInput, toggleButton);
});