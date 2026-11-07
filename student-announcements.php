<?php
require __DIR__ . '/auth.php';
requireLogin('student');
$user = currentUser();

$search = trim($_GET['q'] ?? '');

$sql = "
  SELECT an.*, c.title AS course_title, c.color AS course_color, u.display_name AS teacher_name
  FROM announcements an
  JOIN courses c ON c.id = an.course_id
  JOIN enrollments e ON e.course_id = c.id
  JOIN users u ON u.id = c.teacher_id
  WHERE e.student_id = ?
";
$params = [$user['id']];

if ($search !== '') {
    $sql .= " AND (an.title LIKE ? OR an.body LIKE ? OR c.title LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
$sql .= " ORDER BY an.posted_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$announcements = $stmt->fetchAll();

$activeNav = 'announcements';
$pageTitle = 'Announcements';
include __DIR__ . '/assets/includes/header.php';
?>
<link rel="stylesheet" href="assets/css/style.css">
<p class="eyebrow">Course updates</p>
<div class="page-intro">
  <div>
    <h2>Announcements</h2>
    <p>Messages and updates from your learning community.</p>
  </div>
</div>

<form method="GET" class="toolbar">
  <div class="search" style="min-width:320px;">
    <i class="icon" data-lucide="search"></i>
    <input
      type="search"
      name="q"
      value="<?= htmlspecialchars($search) ?>"
      placeholder="Search announcements"
      onchange="this.form.submit()"
    />
  </div>
</form>

<div id="announcement-list">
  <?php foreach ($announcements as $a): ?>
    <article class="panel announcement-card">
      <span class="course-icon <?= htmlspecialchars($a['course_color']) ?>">
        <i class="icon" data-lucide="book-open"></i>
      </span>
      <div>
        <div class="section-heading">
          <div>
            <small><?= htmlspecialchars($a['course_title']) ?></small>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
          </div>
          <time><?= date('M j, Y, g:i A', strtotime($a['posted_at'])) ?></time>
        </div>
        <p><?= nl2br(htmlspecialchars($a['body'])) ?></p>
        <p class="hint">By <?= htmlspecialchars($a['teacher_name']) ?></p>
      </div>
    </article>
  <?php endforeach; ?>

  <?php if (empty($announcements)): ?>
    <div class="empty" id="no-results">
      <i class="icon" data-lucide="search-x"></i>
      <h3>No announcements found</h3>
      <p>Try a different search term.</p>
    </div>
  <?php endif; ?>
</div>

<?php include __DIR__ . '/assets/includes/footer.php'; ?>