<?php
require __DIR__ . '/auth.php';
requireLogin('student');
$user = currentUser();

$search = trim($_GET['q'] ?? '');

$sql = "
  SELECT c.*, u.display_name AS instructor_name
  FROM courses c
  JOIN enrollments e ON e.course_id = c.id
  JOIN users u ON u.id = c.teacher_id
  WHERE e.student_id = ?
";
$params = [$user['id']];

if ($search !== '') {
    $sql .= " AND (c.title LIKE ? OR c.code LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
$sql .= " ORDER BY c.code ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$courses = $stmt->fetchAll();

// Progress per course (percent of assignments submitted)
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

$activeNav = 'courses';
$pageTitle = 'My Courses';
include __DIR__ . '/assets/includes/header.php';
?>
<link rel="stylesheet" href="assets/css/style.css">
<p class="eyebrow">Your learning space</p>
<div class="page-intro">
  <div>
    <h2>My courses</h2>
    <p>A place to learn, create, and move forward together.</p>
  </div>
</div>

<div class="toolbar">
  <form method="GET" class="search" style="min-width:320px;">
    <i class="icon" data-lucide="search"></i>
    <input
      type="search"
      name="q"
      value="<?= htmlspecialchars($search) ?>"
      placeholder="Search your courses"
      onchange="this.form.submit()"
    />
  </form>
</div>

<p id="result-count">
  <?= count($courses) ?> course<?= count($courses) === 1 ? '' : 's' ?>
</p>

<div class="course-grid" id="course-list">
  <?php foreach ($courses as $course): ?>
    <a href="student-course-detail.php?id=<?= urlencode($course['id']) ?>" class="course-card">
      <div class="course-cover <?= htmlspecialchars($course['color']) ?>">
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

  <?php if (empty($courses)): ?>
    <div class="empty" id="no-results">
      <i class="icon" data-lucide="search-x"></i>
      <h3>No courses found</h3>
      <p>Try a different search term.</p>
    </div>
  <?php endif; ?>
</div>

<?php include __DIR__ . '/assets/includes/footer.php'; ?>