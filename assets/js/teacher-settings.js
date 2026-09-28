function initTeacherSettings() {
    const modal = document.getElementById("profile-modal");
    const form = document.getElementById("profile-form");
    const nameInput = document.getElementById("display-name");
    const errorEl = document.getElementById("profile-error");

    const editButton = document.getElementById("edit-profile-btn");
    const closeButton = document.getElementById("profile-modal-close");
    const cancelButton = document.getElementById("profile-cancel");

    const appearanceButton = document.getElementById("appearance-btn");
    const themeToggle = document.getElementById("theme-toggle");

    if (!modal || !form || !nameInput || !errorEl || !editButton) {
        console.error("Teacher settings could not find the profile dialog elements.");
        return;
    }

    function paintProfile(name) {
        const initials = teacherInitials(name);

        document.getElementById("sidebar-name").textContent = name;
        document.getElementById("sidebar-avatar").textContent = initials;
        document.getElementById("profile-name").textContent = name;
        document.getElementById("profile-avatar").textContent = initials;
    }

    function openModal() {
        nameInput.value = getTeacherDisplayName();
        errorEl.textContent = "";
        modal.showModal();
        nameInput.focus();
        nameInput.select();
    }

    function closeModal() {
        modal.close();
    }

    editButton.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModal);
    cancelButton.addEventListener("click", closeModal);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const newName = nameInput.value.trim().replace(/\s+/g, " ");

        if (!newName) {
            errorEl.textContent = "Please enter a display name.";
            nameInput.focus();
            return;
        }

        if (newName.length > 50) {
            errorEl.textContent = "Display name must be 50 characters or fewer.";
            nameInput.focus();
            return;
        }

        setTeacherDisplayName(newName);
        paintProfile(newName);
        closeModal();
        showToast("Profile updated.");
    });

    nameInput.addEventListener("input", () => {
        errorEl.textContent = "";
    });

    // Close the dialog when the user clicks outside its box.
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    function syncAppearanceLabel() {
        const isDark =
            document.documentElement.getAttribute("data-theme") === "dark";

        appearanceButton.textContent = isDark
            ? "Use light theme"
            : "Use dark theme";
    }

    // script.js handles the actual theme and saves it in local storage.
    if (appearanceButton && themeToggle) {
        appearanceButton.addEventListener("click", () => {
            themeToggle.click();
        });

        new MutationObserver(syncAppearanceLabel).observe(
            document.documentElement,
            {
                attributes: true,
                attributeFilter: ["data-theme"],
            }
        );

        syncAppearanceLabel();
    }

    paintProfile(getTeacherDisplayName());
}

document.addEventListener("DOMContentLoaded", initTeacherSettings);