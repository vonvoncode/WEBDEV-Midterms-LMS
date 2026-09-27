function paintProfile() {
    const name = getTeacherDisplayName();
    const initials = teacherInitials(name);

    document.getElementById("sidebar-name").textContent = name;
    document.getElementById("sidebar-avatar").textContent = initials;
    document.getElementById("profile-name").textContent = name;
    document.getElementById("profile-avatar").textContent = initials;
    document.getElementById("profile-role").textContent = TEACHER_PROFILE.role;
    document.getElementById("display-name").value = name;
}

function init() {
    paintProfile();

    document.getElementById("profile-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const errorEl = document.getElementById("profile-form-error");
        errorEl.textContent = "";

        const newName = document.getElementById("display-name").value.trim();
        if (!newName) {
            errorEl.textContent = "Display name can't be empty.";
            return;
        }

        setTeacherDisplayName(newName);
        paintProfile();
        showToast("Profile updated.");
    });

    if (window.lucide) {
        lucide.createIcons();
    }
}

document.addEventListener("DOMContentLoaded", init);
