(function () {
    const DEFAULT_NAME = 'Von Quobie Ferrer';
    const MAX_LENGTH = 50;

    const modal = document.getElementById('profile-modal');
    const form = document.getElementById('profile-form');
    const nameInput = document.getElementById('display-name');
    const errorEl = document.getElementById('profile-error');

    const editButton = document.getElementById('edit-profile-btn');
    const closeButton = document.getElementById('profile-modal-close');
    const cancelButton = document.getElementById('profile-cancel');

    const appearanceButton = document.getElementById('appearance-btn');

    let currentName = getSavedDisplayName() || DEFAULT_NAME;

    function renderProfileCard(name) {
        document.getElementById('profile-name').textContent = name;
        document.getElementById('profile-avatar').textContent = getNameInitials(name);
    }

    function openModal() {
        nameInput.value = currentName;
        errorEl.textContent = '';
        modal.showModal();
        nameInput.focus();
        nameInput.select();
    }

    function closeModal() {
        modal.close();
    }

    function handleSubmit(event) {
        event.preventDefault();

        const value = nameInput.value.trim().replace(/\s+/g, ' ');

        if (!value) {
            errorEl.textContent = 'Please enter a display name.';
            nameInput.focus();
            return;
        }

        if (value.length > MAX_LENGTH) {
            errorEl.textContent = `Display name must be ${MAX_LENGTH} characters or fewer.`;
            nameInput.focus();
            return;
        }

        currentName = value;
        saveDisplayName(value);
        renderProfileCard(value);
        closeModal();

        if (window.showToast) {
            window.showToast('Profile updated.');
        }
    }

    editButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    form.addEventListener('submit', handleSubmit);

    nameInput.addEventListener('input', () => {
        errorEl.textContent = '';
    });


    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    function syncAppearanceLabel() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        appearanceButton.textContent = isDark ? 'Use light theme' : 'Use dark theme';
    }

    appearanceButton.addEventListener('click', () => {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.click();
        }
    });

    new MutationObserver(syncAppearanceLabel).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    /* ---------- Init ---------- */
    renderProfileCard(currentName);
    syncAppearanceLabel();
})();