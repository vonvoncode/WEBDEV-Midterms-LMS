<?php
require __DIR__ . '/auth.php';
requireLogin('student');
$user = currentUser();

/* ---------- Stat tiles ---------- */

$stmt = $pdo->prepare("SELECT COUNT(*) FROM enrollments WHERE student_id = ?");
$stmt->execute([$user['id']]);
$courseCount = $stmt->fetchColumn();

$stmt = $pdo->prepare("
  SELECT COUNT(DISTINCT a.id) FROM assignments a
  JOIN enrollments e ON e.course_id = a.course_id
  LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = e.student_id
  WHERE e.student_id = ? AND (s.id IS NULL OR s.earned_points IS NULL)
");
$stmt->execute([$user['id']]);
$pendingCount = $stmt->fetchColumn();

$stmt = $pdo->prepare("
  SELECT COUNT(*) FROM submissions s
  JOIN assignments a ON a.id = s.assignment_id
  WHERE s.student_id = ?
");
$stmt->execute([$user['id']]);
$submittedCount = $stmt->fetchColumn();

$stmt = $pdo->prepare("
  SELECT a.points, s.earned_points
  FROM submissions s
  JOIN assignments a ON a.id = s.assignment_id
  WHERE s.student_id = ? AND s.earned_points IS NOT NULL
");
$stmt->execute([$user['id']]);
$graded = $stmt->fetchAll();

function percentToGpa(float $percent): float {
    // Adjust these breakpoints to match your actual GRADING_SCALE/GPA_SCALE from assessment-data.js
    $scale = [
        ['min' => 97, 'gpa' => 4.00], ['min' => 93, 'gpa' => 3.70], ['min' => 90, 'gpa' => 3.30],
        ['min' => 87, 'gpa' => 3.00], ['min' => 83, 'gpa' => 2.70], ['min' => 80, 'gpa' => 2.30],
        ['min' => 77, 'gpa' => 2.00], ['min' => 73, 'gpa' => 1.70], ['min' => 70, 'gpa' => 1.30],
        ['min' => 67, 'gpa' => 1.00], ['min' => 60, 'gpa' => 0.70], ['min' => 0,  'gpa' => 0.00],
    ];
    foreach ($scale as $row) {
        if ($percent >= $row['min']) return $row['gpa'];
    }
    return 0.00;
}

$gpa = 0.00;
if (!empty($graded)) {
    $gpaSum = 0;
    foreach ($graded as $g) {
        $percent = $g['points'] > 0 ? ($g['earned_points'] / $g['points']) * 100 : 0;
        $gpaSum += percentToGpa($percent);
    }
    $gpa = round($gpaSum / count($graded), 2);
}

/* ---------- To-do: open assignments, soonest due first ---------- */

$stmt = $pdo->prepare("
  SELECT a.id, a.name, a.points, a.due, c.code AS course_code, c.title AS course_title
  FROM assignments a
  JOIN courses c ON c.id = a.course_id
  JOIN enrollments e ON e.course_id = a.course_id
  LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = e.student_id
  WHERE e.student_id = ? AND (s.id IS NULL OR s.earned_points IS NULL)
  GROUP BY a.id
  ORDER BY a.due ASC
  LIMIT 4
");
$stmt->execute([$user['id']]);
$todo = $stmt->fetchAll();

/* ---------- Course modules panel: first module of each enrolled course ---------- */

$stmt = $pdo->prepare("
  SELECT m.*, c.code AS course_code
  FROM modules m
  JOIN courses c ON c.id = m.course_id
  JOIN enrollments e ON e.course_id = c.id
  WHERE e.student_id = ? AND m.number = 1
  LIMIT 4
");
$stmt->execute([$user['id']]);
$modules = $stmt->fetchAll();

/* ---------- My courses grid, with progress bar ---------- */

$courseColors = ['purple', 'blue', 'orange', 'pink', 'teal', 'indigo'];

$stmt = $pdo->prepare("
  SELECT c.*, u.display_name AS instructor_name
  FROM courses c
  JOIN enrollments e ON e.course_id = c.id
  JOIN users u ON u.id = c.teacher_id
  WHERE e.student_id = ?
");
$stmt->execute([$user['id']]);
$courses = $stmt->fetchAll();

foreach ($courses as &$course) {
    $stmt2 = $pdo->prepare("
      SELECT COUNT(*) total,
             SUM(CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END) submitted
      FROM assignments a
      LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
      WHERE a.course_id = ?
    ");
    $stmt2->execute([$user['id'], $course['id']]);
    $prog = $stmt2->fetch();
    $course['percent'] = $prog['total'] > 0 ? round(100 * $prog['submitted'] / $prog['total']) : 0;
}
unset($course);

/* ---------- Announcements preview ---------- */

$stmt = $pdo->prepare("
  SELECT an.*, c.title AS course_title, c.color AS course_color, u.display_name AS teacher_name
  FROM announcements an
  JOIN courses c ON c.id = an.course_id
  JOIN enrollments e ON e.course_id = c.id
  JOIN users u ON u.id = c.teacher_id
  WHERE e.student_id = ?
  ORDER BY an.posted_at DESC
  LIMIT 2
");
$stmt->execute([$user['id']]);
$announcements = $stmt->fetchAll();

$activeNav = 'dashboard';
$pageTitle = 'Dashboard';
include __DIR__ . '/assets/includes/header.php';
?>
<link rel="stylesheet" href="assets/css/style.css">
<p class="eyebrow"><?= strtoupper(date('l, F j')) ?></p>
<div class="page-intro">
  <div>
    <h2>Good morning, <?= htmlspecialchars(explode(' ', $user['name'])[0]) ?>.</h2>
    <p>Here's what needs your attention today.</p>
  </div>
  <a href="student-courses.php" class="button primary">
    <i class="icon" data-lucide="book-open"></i> Browse courses
  </a>
</div>

<div class="stats-grid">
  <div class="stat lavender">
    <span class="stat-icon"><i class="icon" data-lucide="clock"></i></span>
    <div>
      <strong><?= $pendingCount ?></strong>
      <span>Tasks due this week</span>
    </div>
  </div>
  <div class="stat sky">
    <span class="stat-icon"><i class="icon" data-lucide="book-open"></i></span>
    <div>
      <strong><?= $courseCount ?></strong>
      <span>Enrolled courses</span>
    </div>
  </div>
  <div class="stat peach">
    <span class="stat-icon"><i class="icon" data-lucide="graduation-cap"></i></span>
    <div>
      <strong><?= number_format($gpa, 2) ?></strong>
      <span>Provisional GPA</span>
    </div>
  </div>
  <div class="stat mint">
    <span class="stat-icon"><i class="icon" data-lucide="check-check"></i></span>
    <div>
      <strong><?= $submittedCount ?></strong>
      <span>Assignments submitted</span>
    </div>
  </div>
</div>

<div class="detail-grid">

  <section class="panel">
    <div class="panel-heading">
      <div>
        <h2>To-do</h2>
        <p>One step closer to your goals.</p>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Assignment</th><th>Course</th><th>Due</th><th>Status</th></tr>
        </thead>
        <tbody>
          <?php foreach ($todo as $row): ?>
            <tr>
              <td>
                <a class="table-link" href="student-assignment-detail.php?id=<?= $row['id'] ?>">
                  <?= htmlspecialchars($row['name']) ?>
                </a>
                <small><?= $row['points'] ?> points</small>
              </td>
              <td><?= htmlspecialchars($row['course_title']) ?></td>
              <td><?= date('M j, Y, g:i A', strtotime($row['due'])) ?></td>
              <td><span class="badge soft">Open</span></td>
            </tr>
          <?php endforeach; ?>
          <?php if (empty($todo)): ?>
            <tr><td colspan="4">Nothing pending — you're all caught up.</td></tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </section>

  <div class="detail-side">
    <section class="panel padded">
      <div class="panel-heading" style="padding:0 0 18px; border-bottom:0;">
        <div>
          <h2>Course modules</h2>
          <p>Start with these modules</p>
        </div>
      </div>
      <div class="activity-list">
        <?php foreach ($modules as $m): ?>
          <a href="student-module-detail.php?id=<?= $m['id'] ?>">
            <span class="activity-icon"><i class="icon" data-lucide="file-text"></i></span>
            <div>
              <strong><?= htmlspecialchars($m['title']) ?></strong>
              <small><?= htmlspecialchars($m['course_code']) ?> · Module <?= $m['number'] ?></small>
            </div>
            <i class="icon" data-lucide="chevron-right"></i>
          </a>
        <?php endforeach; ?>
        <?php if (empty($modules)): ?>
          <p class="hint">No modules yet.</p>
        <?php endif; ?>
      </div>
    </section>
  </div>

</div>

<section class="panel" style="margin-top:20px;">
  <div class="panel-heading">
    <div>
      <h2>My courses</h2>
      <p>Pick up where you left off.</p>
    </div>
    <a href="student-courses.php" class="text-button">See all <i class="icon" data-lucide="chevron-right"></i></a>
  </div>
  <div class="course-grid" style="padding:22px;">
    <?php foreach ($courses as $i => $course): ?>
      <a href="student-course-detail.php?id=<?= urlencode($course['id']) ?>" class="course-card">
        <div class="course-cover <?= htmlspecialchars($course['color'] ?: $courseColors[$i % count($courseColors)]) ?>">
          <span><?= htmlspecialchars($course['code']) ?></span>
          <i class="icon" data-lucide="book-open"></i>
        </div>
        <div class="course-body">
          <h3><?= htmlspecialchars($course['title']) ?></h3>
          <small><?= htmlspecialchars($course['instructor_name']) ?></small>
          <p><?= $course['percent'] ?>% of assignments submitted</p>
          <div class="progress"><span style="width:<?= $course['percent'] ?>%"></span></div>
        </div>
      </a>
    <?php endforeach; ?>
  </div>
</section>

<section class="panel" style="margin-top:20px;">
  <div class="panel-heading">
    <div>
      <h2>From your learning community</h2>
      <p>Recent announcements</p>
    </div>
    <a href="student-announcements.php" class="text-button">See all <i class="icon" data-lucide="chevron-right"></i></a>
  </div>
  <?php foreach ($announcements as $a): ?>
    <div class="announcement-preview">
      <span class="course-icon <?= htmlspecialchars($a['course_color']) ?>">
        <i class="icon" data-lucide="book-open"></i>
      </span>
      <div>
        <small><?= htmlspecialchars($a['course_title']) ?></small>
        <h3><?= htmlspecialchars($a['title']) ?></h3>
        <p><?= htmlspecialchars($a['body']) ?></p>
      </div>
    </div>
  <?php endforeach; ?>
  <?php if (empty($announcements)): ?>
    <p class="hint" style="padding:0 24px 20px;">No announcements yet.</p>
  <?php endif; ?>
</section>

<?php include __DIR__ . '/assets/includes/footer.php'; ?>