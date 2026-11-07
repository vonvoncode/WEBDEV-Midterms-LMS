<?php
require __DIR__ . '/auth.php';
requireLogin('student');
$user = currentUser();

$search     = trim($_GET['q'] ?? '');
$courseId   = $_GET['course'] ?? 'all';

// Courses for the filter dropdown (only ones the student is enrolled in)
$stmt = $pdo->prepare("
  SELECT c.id, c.title FROM courses c
  JOIN enrollments e ON e.course_id = c.id
  WHERE e.student_id = ?
  ORDER BY c.id
");
$stmt->execute([$user['id']]);
$enrolledCourses = $stmt->fetchAll();

// Assignment list, with this student's submission status joined in
$sql = "
  SELECT a.id, a.name, a.points, a.due, c.id AS course_id, c.title AS course_title,
         s.earned_points
  FROM assignments a
  JOIN courses c ON c.id = a.course_id
  JOIN enrollments e ON e.course_id = c.id
  LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = e.student_id
  WHERE e.student_id = ?
";
$params = [$user['id']];

if ($search !== '') {
    $sql .= " AND (a.name LIKE ? OR c.title LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
if ($courseId !== 'all' && $courseId !== '') {
    $sql .= " AND c.id = ?";
    $params[] = $courseId;
}
$sql .= " ORDER BY a.id ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$assignments = $stmt->fetchAll();

$activeNav = 'assessments';
$pageTitle = 'Assessments';
include __DIR__ . '/assets/includes/header.php';
?>
<link rel="stylesheet" href="assets/css/style.css">
<p class="eyebrow">Stay on track</p>
<div class="page-intro">
  <div>
    <h2>Assessments</h2>
    <p>Your assignments, deadlines, and submission status.</p>
  </div>
</div>

<form method="GET" class="toolbar">
  <div class="search" style="min-width:320px;">
    <i class="icon" data-lucide="search"></i>
    <input
      type="search"
      name="q"
      value="<?= htmlspecialchars($search) ?>"
      placeholder="Search assignments"
      onchange="this.form.submit()"
    />
  </div>

  <select name="course" onchange="this.form.submit()">
    <option value="all" <?= $courseId === 'all' ? 'selected' : '' ?>>All courses</option>
    <?php foreach ($enrolledCourses as $c): ?>
      <option value="<?= htmlspecialchars($c['id']) ?>" <?= $courseId === $c['id'] ? 'selected' : '' ?>>
        <?= htmlspecialchars($c['title']) ?>
      </option>
    <?php endforeach; ?>
  </select>
</form>

<section class="panel">
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Assignment</th>
          <th>Course</th>
          <th>Due</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($assignments as $a): ?>
          <?php $isGraded = $a['earned_points'] !== null; ?>
          <tr>
            <td>
              <a class="table-link" href="student-assignment-detail.php?id=<?= $a['id'] ?>">
                <?= htmlspecialchars($a['name']) ?>
              </a>
              <small><?= $a['points'] ?> points</small>
            </td>
            <td><?= htmlspecialchars($a['course_title']) ?></td>
            <td><?= date('M j, Y, g:i A', strtotime($a['due'])) ?></td>
            <td>
              <span class="badge <?= $isGraded ? 'good' : 'soft' ?>">
                <?= $isGraded ? 'Graded' : 'Open' ?>
              </span>
            </td>
          </tr>
        <?php endforeach; ?>

        <?php if (empty($assignments)): ?>
          <tr><td colspan="4">
            <div class="empty">
              <i class="icon" data-lucide="search-x"></i>
              <h3>No assignments found</h3>
              <p>Try a different search term or course.</p>
            </div>
          </td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</section>

<?php include __DIR__ . '/assets/includes/footer.php'; ?>