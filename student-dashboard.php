<?php
require __DIR__ . '/auth.php';
requireLogin('student');
$user = currentUser();

// To-do: open assignments (not yet submitted/graded), soonest due date first
$stmt = $pdo->prepare("
  SELECT a.*, c.title AS course_title, c.code AS course_code
  FROM assignments a
  JOIN courses c ON c.id = a.course_id
  JOIN enrollments e ON e.course_id = a.course_id
  LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = e.student_id
  WHERE e.student_id = ? AND (s.earned_points IS NULL)
  ORDER BY a.due ASC
  LIMIT 4
");
$stmt->execute([$user['id']]);
$todo = $stmt->fetchAll();

// Quick stats
$stmt = $pdo->prepare("SELECT COUNT(*) FROM enrollments WHERE student_id = ?");
$stmt->execute([$user['id']]);
$courseCount = $stmt->fetchColumn();

$stmt = $pdo->prepare("
  SELECT COUNT(*) FROM assignments a
  JOIN enrollments e ON e.course_id = a.course_id
  LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = e.student_id
  WHERE e.student_id = ? AND s.id IS NULL
");
$stmt->execute([$user['id']]);
$pendingCount = $stmt->fetchColumn();

// Courses grid (for the "My courses" preview)
$stmt = $pdo->prepare("
  SELECT c.* FROM courses c
  JOIN enrollments e ON e.course_id = c.id
  WHERE e.student_id = ?
  LIMIT 6
");
$stmt->execute([$user['id']]);
$courses = $stmt->fetchAll();

$activeNav = 'dashboard';
$pageTitle = 'Dashboard';
include __DIR__ . '/includes/header.php';
?>

<p class="eyebrow">Welcome back</p>
<div class="page-intro">
  <div>
    <h2>Hi, <?= htmlspecialchars(explode(' ', $user['name'])[0]) ?></h2>
    <p>Here's what needs your attention today.</p>
  </div>
</div>

<div class="stats-grid">
  <div class="panel padded stat-card">
    <small>Enrolled courses</small>
    <strong><?= $courseCount ?></strong>
  </div>
  <div class="panel padded stat-card">
    <small>Pending assignments</small>
    <strong><?= $pendingCount ?></strong>
  </div>
</div>

<section class="panel">
  <div class="panel-heading">
    <div>
      <h2>To-do</h2>
      <p>Assignments that still need your attention</p>
    </div>
  </div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr><th>Assignment</th><th>Course</th><th>Due</th></tr>
      </thead>
      <tbody>
        <?php foreach ($todo as $row): ?>
          <tr>
            <td>
              <a class="table-link" href="student-assignment-detail.php?id=<?= $row['id'] ?>">
                <?= htmlspecialchars($row['name']) ?>
              </a>
            </td>
            <td><?= htmlspecialchars($row['course_code']) ?></td>
            <td><?= date('M j, g:i A', strtotime($row['due'])) ?></td>
          </tr>
        <?php endforeach; ?>
        <?php if (empty($todo)): ?>
          <tr><td colspan="3">Nothing pending — you're all caught up.</td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</section>

<section class="panel" style="margin-top:20px;">
  <div class="panel-heading">
    <div>
      <h2>My courses</h2>
    </div>
  </div>
  <div class="course-grid">
    <?php foreach ($courses as $course): ?>
      <a href="student-course-detail.php?id=<?= urlencode($course['id']) ?>" class="course-card">
        <div class="course-cover <?= htmlspecialchars($course['color']) ?>">
          <span><?= htmlspecialchars($course['code']) ?></span>
          <i class="icon" data-lucide="book-open"></i>
        </div>
        <div class="course-body">
          <h3><?= htmlspecialchars($course['title']) ?></h3>
        </div>
      </a>
    <?php endforeach; ?>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>