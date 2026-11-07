<?php
require __DIR__ . '/db.php'; // created in step 4

// Users
$teacherPass = password_hash('teacher123', PASSWORD_DEFAULT);
$studentPass = password_hash('student123', PASSWORD_DEFAULT);

$pdo->exec("INSERT IGNORE INTO users (id, username, password, display_name, role) VALUES
  (1, 'teacher', '$teacherPass', 'Nimrod Reyes Sajise', 'teacher'),
  (2, 'student', '$studentPass', 'Von Quobie Ferrer', 'student')");

// Courses
$courses = [
  ['IT315', 'IT 315', 3, 'Interface Design Systems', 'Information Technology',
   'Design accessible interfaces through research, prototyping, and evaluation.', 'purple'],
  ['CS241', 'CS 241', 3, 'Data Structures & Algorithms', 'Computer Science',
   'Core data structures, algorithmic complexity, and problem solving.', 'blue'],
  // ...add IT332, GE201, IT320, IT324 the same way, straight from your courses-data.js
];

$stmt = $pdo->prepare("INSERT IGNORE INTO courses (id, code, units, title, department, description, color, teacher_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
foreach ($courses as $c) $stmt->execute($c);

// Enroll the demo student in all of them
$pdo->exec("INSERT IGNORE INTO enrollments (course_id, student_id)
  SELECT id, 2 FROM courses");

// Assignments for IT315 (repeat per course using your real data)
$pdo->exec("INSERT INTO assignments (course_id, name, points, due, instructions, allow_late) VALUES
  ('IT315', 'Interface audit', 100, '2026-09-21 23:00:00',
   'Evaluate the navigation and accessibility of a website. Explain three improvements.', 1),
  ('IT315', 'Usability testing report', 100, '2026-10-10 23:00:00',
   'Run a short usability test with three participants and report findings with fixes.', 1)");

// Modules + lessons for IT315
$pdo->exec("INSERT INTO modules (id, course_id, number, title, description) VALUES
  (1, 'IT315', 1, 'Foundations of Interface Design', 'Core principles of layout, hierarchy, and consistency.')");
$pdo->exec("INSERT INTO lessons (module_id, title, type, pdf_path) VALUES
  (1, 'Principles of visual hierarchy', 'reading', 'assets/modules/IT315-M1.pdf'),
  (1, 'Walkthrough: heuristic evaluation', 'video', NULL)");

echo "Seed complete.";