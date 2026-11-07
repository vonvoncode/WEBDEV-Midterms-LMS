<?php
require __DIR__ . '/auth.php';
requireLogin(); // either role can edit their own display name

$user = currentUser();
$newName = trim($_POST['display_name'] ?? '');
$newName = preg_replace('/\s+/', ' ', $newName);

if ($newName === '' || mb_strlen($newName) > 50) {
    // Fail quietly back to the settings page; add proper error flashing later if you want it
    header('Location: student-settings.php');
    exit;
}

$stmt = $pdo->prepare("UPDATE users SET display_name = ? WHERE id = ?");
$stmt->execute([$newName, $user['id']]);

// Keep the session in sync so the sidebar updates immediately, no re-login needed
$_SESSION['display_name'] = $newName;

header('Location: ' . ($user['role'] === 'teacher' ? 'teacher-settings.php' : 'student-settings.php'));
exit;