<?php
require __DIR__ . '/auth.php';
requireLogin('student');
$user = currentUser();

$stmt = $pdo->prepare("SELECT username, display_name, program, year_level FROM users WHERE id = ?");
$stmt->execute([$user['id']]);
$profile = $stmt->fetch();

$activeNav = 'settings';
$pageTitle = 'Settings';
include __DIR__ . '/assets/includes/header.php';

function initials(string $name): string {
    $parts = preg_split('/\s+/', trim($name));
    $first = $parts[0][0] ?? '';
    $last  = count($parts) > 1 ? $parts[count($parts) - 1][0] : '';
    return strtoupper($first . $last);
}
?>
<link rel="stylesheet" href="assets/css/style.css">
<p class="eyebrow">Your account</p>
<div class="page-intro">
  <div>
    <h2>Profile &amp; settings</h2>
    <p>Make your learning space feel like you.</p>
  </div>
</div>

<div class="panel profile-card">
  <span class="avatar large" id="profile-avatar"><?= initials($profile['display_name']) ?></span>
  <div>
    <strong id="profile-name" style="display:block; font-size:16px;"><?= htmlspecialchars($profile['display_name']) ?></strong>
    <p style="margin:4px 0 2px;">
      <?= htmlspecialchars($profile['program'] ?? '') ?><?= $profile['year_level'] ? ' · ' . htmlspecialchars($profile['year_level']) : '' ?>
    </p>
    <p>Student · @<?= htmlspecialchars($profile['username']) ?></p>
  </div>
  <button class="button secondary" id="edit-profile-btn" type="button">Edit profile</button>
</div>

<section class="panel" style="margin-top:20px;">
  <div class="panel-heading">
    <div><h2>Preferences</h2></div>
  </div>

  <div class="setting-row" style="padding:23px 24px 0;">
    <div>
      <strong>Appearance</strong>
      <p>Choose a comfortable theme for this session.</p>
    </div>
    <button class="button secondary" id="appearance-btn" type="button">Use light theme</button>
  </div>

  <div class="setting-row" style="padding:23px 24px;">
    <div>
      <strong>Notifications</strong>
      <p>Assignment updates, new submissions, and grades appear in your notification center.</p>
    </div>
    <a href="student-notifications.php" class="button secondary">View notifications</a>
  </div>
</section>

<dialog id="profile-modal">
  <div class="dialog-head">
    <h2>Edit profile</h2>
    <button class="icon-button" id="profile-modal-close" type="button" aria-label="Close">
      <i class="icon" data-lucide="x"></i>
    </button>
  </div>
  <form id="profile-form" method="POST" action="update-profile.php">
    <div class="dialog-content">
      <div class="field">
        <label for="display-name">Display name</label>
        <input type="text" id="display-name" name="display_name"
               value="<?= htmlspecialchars($profile['display_name']) ?>" maxlength="50" required />
      </div>
      <p class="form-error" id="profile-error" role="alert"></p>
    </div>
    <div class="dialog-actions">
      <button class="button secondary" id="profile-cancel" type="button">Cancel</button>
      <button class="button primary" type="submit">Save changes</button>
    </div>
  </form>
</dialog>

<script>
  const modal = document.getElementById('profile-modal');
  const editButton = document.getElementById('edit-profile-btn');
  const closeButton = document.getElementById('profile-modal-close');
  const cancelButton = document.getElementById('profile-cancel');
  const nameInput = document.getElementById('display-name');
  const errorEl = document.getElementById('profile-error');

  function openModal() {
    errorEl.textContent = '';
    modal.showModal();
    nameInput.focus();
  }
  function closeModal() { modal.close(); }

  editButton.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);
  cancelButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

  document.getElementById('profile-form').addEventListener('submit', (event) => {
    const value = nameInput.value.trim().replace(/\s+/g, ' ');
    if (!value) {
      event.preventDefault();
      errorEl.textContent = 'Enter a display name.';
      nameInput.focus();
    }
    // otherwise the form posts normally to update-profile.php
  });

  /* ---------- Appearance button: mirrors the topbar theme toggle ---------- */
  const appearanceButton = document.getElementById('appearance-btn');

  function syncAppearanceLabel() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    appearanceButton.textContent = isDark ? 'Use light theme' : 'Use dark theme';
  }

  appearanceButton.addEventListener('click', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.click();
  });

  new MutationObserver(syncAppearanceLabel).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  syncAppearanceLabel();
</script>

<?php include __DIR__ . '/assets/includes/footer.php'; ?>