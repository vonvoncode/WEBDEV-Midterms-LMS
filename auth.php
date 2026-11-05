<?php
session_start();
require __DIR__ . '/db.php';

function requireLogin($role = null) {
    if (!isset($_SESSION['user_id'])) {
        header('Location: /ascendone/index.php');
        exit;
    }
    if ($role && $_SESSION['role'] !== $role) {
        header('Location: /ascendone/index.php');
        exit;
    }
}

function currentUser() {
    return [
        'id' => $_SESSION['user_id'] ?? null,
        'name' => $_SESSION['display_name'] ?? '',
        'role' => $_SESSION['role'] ?? null,
    ];
}