<?php
require __DIR__ . '/auth.php';
requireLogin('student');
$user = currentUser();

$search = trim($_GET['q'] ?? '');
$sql = "SELECT c.* FROM courses c
        JOIN enrollments e ON e.course_id = c.id
        WHERE e.student_id = ?";
$params = [$user['id']];
if ($search !== '') {
    $sql .= " AND (c.title LIKE ? OR c.code LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$courses = $stmt->fetchAll();

$activeNav = 'courses';
$pageTitle = 'My Courses';
include __DIR__ . '/includes/header.php';
?>

<p class="eyebrow">Your courses</p>
<div class="toolbar">
  <div class="search">
    <i class="icon" data-lucide="search"></i>
    <form method="GET">
      <input type="search" name="q" value="<?= htmlspecialchars($search) ?>"
             placeholder="Search your courses" onchange="this.form.submit()" />
    </form>
  </div>
</div>

<p id="result-count"><?= count($courses) ?> course<?= count($courses) === 1 ? '' : 's' ?></p>

<div class="course-grid" id="course-list">
  <?php foreach ($courses as $course): ?>
    <?php
      $stmt2 = $pdo->prepare("SELECT COUNT(*) total,
                 SUM(CASE WHEN s.earned_points IS NOT NULL THEN 1 ELSE 0 END) done
               FROM assignments a
               LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
               WHERE a.course_id = ?");
      $stmt2->execute([$user['id'], $course['id']]);
      $prog = $stmt2->fetch();
      $percent = $prog['total'] > 0 ? round(100 * $prog['done'] / $prog['total']) : 0;
    ?>
    <a href="student-course-detail.php?id=<?= urlencode($course['id']) ?>" class="course-card">
      <div class="course-cover <?= htmlspecialchars($course['color']) ?>">
        <span><?= htmlspecialchars($course['code']) ?></span>
        <i class="icon" data-lucide="book-open"></i>
      </div>
      <div class="course-body">
        <h3><?= htmlspecialchars($course['title']) ?></h3>
        <p><?= $percent ?>% of assignments submitted</p>
        <div class="progress"><span style="width:<?= $percent ?>%"></span></div>
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

<?php include __DIR__ . '/includes/footer.php'; ?>