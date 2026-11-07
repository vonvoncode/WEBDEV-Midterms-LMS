<?php
require __DIR__ . '/auth.php';
requireLogin('student');
$user = currentUser();

function percentToGpa(float $percent): float {
    // Matches the "Grading scale" panel on the right of this page — keep these two in sync
    $scale = [
        ['min' => 98, 'gpa' => 4.00], ['min' => 95, 'gpa' => 3.75], ['min' => 92, 'gpa' => 3.50],
        ['min' => 89, 'gpa' => 3.25], ['min' => 86, 'gpa' => 3.00], ['min' => 83, 'gpa' => 2.75],
        ['min' => 80, 'gpa' => 2.50], ['min' => 77, 'gpa' => 2.25], ['min' => 74, 'gpa' => 2.00],
        ['min' => 71, 'gpa' => 1.75], ['min' => 68, 'gpa' => 1.50], ['min' => 64, 'gpa' => 1.25],
        ['min' => 60, 'gpa' => 1.00], ['min' => 0,  'gpa' => 0.00],
    ];
    foreach ($scale as $row) {
        if ($percent >= $row['min']) return $row['gpa'];
    }
    return 0.00;
}

// All enrolled courses
$stmt = $pdo->prepare("
  SELECT c.*, u.display_name AS instructor_name
  FROM courses c
  JOIN enrollments e ON e.course_id = c.id
  JOIN users u ON u.id = c.teacher_id
  WHERE e.student_id = ?
  ORDER BY c.id
");
$stmt->execute([$user['id']]);
$courses = $stmt->fetchAll();

// All assignments + this student's submission, across every enrolled course
$stmt = $pdo->prepare("
  SELECT a.id, a.name, a.points, a.due, a.course_id,
         s.earned_points
  FROM assignments a
  JOIN enrollments e ON e.course_id = a.course_id
  LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = e.student_id
  WHERE e.student_id = ?
  ORDER BY a.id ASC
");
$stmt->execute([$user['id']]);
$allAssignments = $stmt->fetchAll();

// Group assignments by course, and compute each course's percent/GPA from graded work only
$byCourse = [];
foreach ($allAssignments as $a) {
    $byCourse[$a['course_id']][] = $a;
}

$gpaWeightedSum = 0;
$gpaUnitsSum = 0;
$modalData = []; // course_id => ['title'=>, 'rows'=>[...]]

foreach ($courses as &$course) {
    $assignments = $byCourse[$course['id']] ?? [];
    $graded = array_filter($assignments, fn($a) => $a['earned_points'] !== null);

    $earnedSum = array_sum(array_column($graded, 'earned_points'));
    $pointsSum = array_sum(array_column($graded, 'points'));

    $course['gradedCount'] = count($graded);
    $course['totalCount']  = count($assignments);

    if ($pointsSum > 0) {
        $course['percent'] = round(($earnedSum / $pointsSum) * 100, 2);
        $course['gpa']     = percentToGpa($course['percent']);
        $gpaWeightedSum += $course['gpa'] * $course['units'];
        $gpaUnitsSum    += $course['units'];
    } else {
        $course['percent'] = null;
        $course['gpa']     = null;
    }

    $modalData[$course['id']] = [
        'title' => $course['title'],
        'rows'  => array_map(function ($a) {
            $isGraded = $a['earned_points'] !== null;
            return [
                'id'     => $a['id'],
                'name'   => $a['name'],
                'points' => $a['points'],
                'due'    => date('M j, Y, g:i A', strtotime($a['due'])),
                'status' => $isGraded ? 'Graded' : 'Open',
                'grade'  => $isGraded ? $a['earned_points'] . ' / ' . $a['points'] : '—',
            ];
        }, $assignments),
    ];
}
unset($course);

$overallGpa = $gpaUnitsSum > 0 ? round($gpaWeightedSum / $gpaUnitsSum, 2) : 0.00;

$gradingScale = [
    ['grade' => '4.00', 'min' => 98], ['grade' => '3.75', 'min' => 95], ['grade' => '3.50', 'min' => 92],
    ['grade' => '3.25', 'min' => 89], ['grade' => '3.00', 'min' => 86], ['grade' => '2.75', 'min' => 83],
    ['grade' => '2.50', 'min' => 80], ['grade' => '2.25', 'min' => 77], ['grade' => '2.00', 'min' => 74],
    ['grade' => '1.75', 'min' => 71], ['grade' => '1.50', 'min' => 68], ['grade' => '1.25', 'min' => 64],
    ['grade' => '1.00', 'min' => 60], ['grade' => '0.00', 'min' => 0],
];

$activeNav = 'grades';
$pageTitle = 'Grades';
include __DIR__ . '/assets/includes/header.php';
?>
<link rel="stylesheet" href="assets/css/style.css">
<p class="eyebrow">Academic performance</p>
<div class="page-intro">
  <div>
    <h2>Grades</h2>
    <p>See your progress, points, and teacher feedback.</p>
  </div>
</div>

<div class="gpa-banner">
  <div>
    <span>Provisional GPA</span>
    <p>Weighted by course units · based on graded work only</p>
  </div>
  <strong><?= number_format($overallGpa, 2) ?></strong>
</div>

<div class="grades-layout">

  <div class="grades-list">
    <?php foreach ($courses as $course): ?>
      <div class="panel grade-card">
        <span class="course-icon <?= htmlspecialchars($course['color']) ?>">
          <i class="icon" data-lucide="book-open"></i>
        </span>

        <div class="grade-main">
          <div>
            <small><?= htmlspecialchars($course['code']) ?> · <?= $course['units'] ?> units</small>
            <h3><?= htmlspecialchars($course['title']) ?></h3>
            <p><?= $course['gradedCount'] ?> / <?= $course['totalCount'] ?> assignments graded</p>
          </div>
        </div>

        <div class="grade-values">
          <?php if ($course['percent'] !== null): ?>
            <span><?= number_format($course['percent'], 2) ?>%</span>
            <strong><?= number_format($course['gpa'], 2) ?></strong>
          <?php else: ?>
            <span class="accent">Pending</span>
            <strong>—</strong>
          <?php endif; ?>
        </div>

        <button class="button secondary" data-details-for="<?= htmlspecialchars($course['id']) ?>" type="button">
          Details
        </button>
      </div>
    <?php endforeach; ?>
  </div>

  <aside class="panel padded">
    <h2>Grading scale</h2>
    <p class="hint">Minimum percentage required</p>
    <table class="scale-table">
      <thead>
        <tr><th>Grade</th><th>Minimum %</th></tr>
      </thead>
      <tbody>
        <?php foreach ($gradingScale as $row): ?>
          <tr><td><?= $row['grade'] ?></td><td><?= $row['min'] ?></td></tr>
        <?php endforeach; ?>
      </tbody>
    </table>
    <p class="hint" style="margin-top:14px;">
      Thresholds use the unrounded percentage. Pending work is excluded from your GPA until it's graded.
    </p>
  </aside>

</div>

<!-- Grade detail modal: one dialog, filled from GRADES_DATA below depending on which course was clicked -->
<dialog id="grade-modal">
  <div class="dialog-head">
    <h2 id="modal-course-title">Course</h2>
    <button class="icon-button" id="modal-close" type="button" aria-label="Close">
      <i class="icon" data-lucide="x"></i>
    </button>
  </div>
  <div class="dialog-content">
    <p id="modal-summary" class="hint"></p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Assignment</th><th>Due</th><th>Status</th><th>Grade</th></tr>
        </thead>
        <tbody id="modal-assignment-rows"></tbody>
      </table>
    </div>
  </div>
  <div class="dialog-actions">
    <button class="button secondary" id="modal-cancel" type="button">Close</button>
    <button class="button primary" id="modal-done" type="button">Done</button>
  </div>
</dialog>

<script>
  const GRADES_DATA = <?= json_encode($modalData, JSON_UNESCAPED_UNICODE) ?>;

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function buildModalRow(row) {
    const tr = document.createElement('tr');
    const badgeClass = row.status === 'Graded' ? 'badge good' : 'badge soft';
    tr.innerHTML = `
      <td>
        <a class="table-link" href="student-assignment-detail.php?id=${row.id}">${escapeHTML(row.name)}</a>
        <small>${row.points} points</small>
      </td>
      <td>${escapeHTML(row.due)}</td>
      <td><span class="${badgeClass}">${row.status}</span></td>
      <td>${escapeHTML(row.grade)}</td>
    `;
    return tr;
  }

  function openGradeModal(courseId) {
    const data = GRADES_DATA[courseId];
    if (!data) return;

    document.getElementById('modal-course-title').textContent = data.title;

    const gradedRows = data.rows.filter((r) => r.status === 'Graded');
    const summaryEl = document.getElementById('modal-summary');
    summaryEl.textContent = gradedRows.length > 0
      ? `${gradedRows.length} of ${data.rows.length} assignments graded so far.`
      : 'No graded assignments yet.';

    const tbody = document.getElementById('modal-assignment-rows');
    tbody.innerHTML = '';
    data.rows.forEach((row) => tbody.appendChild(buildModalRow(row)));

    document.getElementById('grade-modal').showModal();
    if (window.lucide) lucide.createIcons();
  }

  document.querySelectorAll('[data-details-for]').forEach((button) => {
    button.addEventListener('click', () => openGradeModal(button.dataset.detailsFor));
  });

  const modal = document.getElementById('grade-modal');
  document.getElementById('modal-cancel').addEventListener('click', () => modal.close());
  document.getElementById('modal-done').addEventListener('click', () => modal.close());
  document.getElementById('modal-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });
</script>

<?php include __DIR__ . '/assets/includes/footer.php'; ?>