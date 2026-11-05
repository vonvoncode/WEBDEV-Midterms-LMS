<?php
// db.php — include this at the top of every page that needs the database
$host = 'localhost';
$dbname = 'ascendone';
$dbuser = 'root';
$dbpass = '';           // XAMPP's default MySQL root password is empty

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $dbuser, $dbpass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}