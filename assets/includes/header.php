<?php
// Expects $activeNav (string) and $pageTitle (string) to be set before including this file
$user = currentUser();
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#7056ff" />
  <title><?= htmlspecialchars($pageTitle) ?> · AscendOne</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="assets/css/styles.css" />
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar" id="sidebar">
      <a href="<?= $user['role'] ?>-dashboard.php" class="brand" aria-label="AscendOne home">
        <span class="brand-symbol"><i class="icon" data-lucide="book-open"></i></span>
        AscendOne
      </a>
      <p class="tagline">reach the top as one</p>

      <p class="nav-label"><?= $user['role'] === 'teacher' ? 'Teacher workspace' : 'Student workspace' ?></p>
      <nav>
        <a href="<?= $user['role'] ?>-dashboard.php" class="<?= $activeNav === 'dashboard' ? 'active' : '' ?>">
          <i class="icon" data-lucide="layout-dashboard"></i> Dashboard
        </a>
        <a href="<?= $user['role'] ?>-courses.php" class="<?= $activeNav === 'courses' ? 'active' : '' ?>">
          <i class="icon" data-lucide="book-open"></i> <?= $user['role'] === 'teacher' ? 'Courses' : 'My Courses' ?>
        </a>
        <?php if ($user['role'] === 'student'): ?>
        <a href="student-assessments.php" class="<?= $activeNav === 'assessments' ? 'active' : '' ?>">
          <i class="icon" data-lucide="file-text"></i> Assessments
        </a>
        <a href="student-grades.php" class="<?= $activeNav === 'grades' ? 'active' : '' ?>">
          <i class="icon" data-lucide="graduation-cap"></i> Grades
        </a>
        <?php else: ?>
        <a href="teacher-grades.php" class="<?= $activeNav === 'grades' ? 'active' : '' ?>">
          <i class="icon" data-lucide="graduation-cap"></i> Grades
        </a>
        <?php endif; ?>
        <a href="<?= $user['role'] ?>-announcements.php" class="<?= $activeNav === 'announcements' ? 'active' : '' ?>">
          <i class="icon" data-lucide="megaphone"></i> Announcements
        </a>
        <a href="<?= $user['role'] ?>-notifications.php" class="<?= $activeNav === 'notifications' ? 'active' : '' ?>">
          <i class="icon" data-lucide="bell"></i> Notifications
        </a>
      </nav>

      <div class="sidebar-bottom">
        <a href="<?= $user['role'] ?>-settings.php" class="settings-link">
          <i class="icon" data-lucide="settings"></i> Settings
        </a>
        <div class="user-card">
          <span class="avatar"><?= strtoupper(substr($user['name'],0,1) . substr(strrchr($user['name'],' '),1,1)) ?></span>
          <div>
            <strong><?= htmlspecialchars($user['name']) ?></strong>
            <small><?= ucfirst($user['role']) ?> Account</small>
          </div>
        </div>
        <a href="logout.php" class="logout">
          <i class="icon" data-lucide="log-out"></i> Log out
        </a>
      </div>
    </aside>

    <button id="nav-overlay" aria-label="Close menu"></button>

    <header class="topbar">
      <div class="topbar-title">
        <button class="icon-button mobile-menu" aria-label="Open menu" aria-controls="sidebar">
          <i class="icon" data-lucide="menu"></i>
        </button>
        <div><h1><?= htmlspecialchars($pageTitle) ?></h1><p>First semester · 2026</p></div>
      </div>
      <div class="top-actions">
        <span class="role-chip"><?= ucfirst($user['role']) ?></span>
        <button class="icon-button" id="theme-toggle" aria-label="Toggle dark mode">
          <i class="icon" data-lucide="moon"></i>
        </button>
        <a href="<?= $user['role'] ?>-notifications.php" class="icon-button notification-button" aria-label="Notifications">
          <i class="icon" data-lucide="bell"></i>
        </a>
      </div>
    </header>

    <main class="main-content">