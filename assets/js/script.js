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