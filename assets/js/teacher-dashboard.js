function buildToGradeRow(assignment, course) {
  const tr = document.createElement("tr");
  const badgeClass = assignment.status === "graded" ? "badge good" : "badge soft";
  const badgeLabel = assignment.status === "graded" ? "Graded" : "Open";

  tr.innerHTML = `
    <td>
<a
  class="table-link"
  href="teacher-grades.html?course=${encodeURIComponent(course.id)}"
>
  ${assignment.name}
</a>      <small>${assignment.points} points · ${assignment.type === "quiz" ? "Quiz" : "Upload"}</small>
    </td>
    <td>${course.title}</td>
    <td>${assignment.due}</td>
    <td><span class="${badgeClass}">${badgeLabel}</span></td>
  `;
  return tr;
}

const TEACHING_CHECKLIST_KEY = "ascendone-teaching-checklist";

const TEACHING_TASKS = [
  {
    id: "lesson-content",
    title: "Set up lesson content",
    detail: "Add modules and lessons to a course.",
    href: "teacher-courses.html",
  },
  {
    id: "announcement",
    title: "Post a class announcement",
    detail: "Share an update with your students.",
    href: "teacher-announcements.html",
  },
  {
    id: "attendance",
    title: "Record class attendance",
    detail: "Mark attendance from a course page.",
    href: "teacher-courses.html",
  },
  {
    id: "grades",
    title: "Review student grades",
    detail: "Check student progress across your courses.",
    href: "teacher-grades.html",
  },
];

function renderTeachingChecklist() {
  const checklist = document.getElementById("teaching-checklist");
  const progress = document.getElementById("checklist-progress");

  if (!checklist || !progress) return;

  let completedTasks = {};

  try {
    completedTasks =
      JSON.parse(localStorage.getItem(TEACHING_CHECKLIST_KEY)) || {};
  } catch {
    completedTasks = {};
  }

  checklist.innerHTML = "";

  TEACHING_TASKS.forEach((task) => {
    const row = document.createElement("div");
    row.className = "checklist-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(completedTasks[task.id]);
    checkbox.setAttribute("aria-label", `Mark "${task.title}" complete`);

    const copy = document.createElement("div");
    copy.className = "checklist-copy";

    const title = document.createElement("strong");
    title.textContent = task.title;

    const detail = document.createElement("small");
    detail.textContent = task.detail;

    copy.append(title, detail);

    const link = document.createElement("a");
    link.href = task.href;
    link.textContent = "Open";

    if (checkbox.checked) {
      row.classList.add("is-done");
    }

    checkbox.addEventListener("change", () => {
      completedTasks[task.id] = checkbox.checked;
      localStorage.setItem(
        TEACHING_CHECKLIST_KEY,
        JSON.stringify(completedTasks)
      );

      row.classList.toggle("is-done", checkbox.checked);
      updateChecklistProgress(completedTasks);
    });

    row.append(checkbox, copy, link);
    checklist.appendChild(row);
  });

  updateChecklistProgress(completedTasks);
}

function updateChecklistProgress(completedTasks) {
  const progress = document.getElementById("checklist-progress");
  const count = TEACHING_TASKS.filter(
    (task) => completedTasks[task.id]
  ).length;

  progress.textContent = `${count} of ${TEACHING_TASKS.length} completed`;
}

function buildCourseCard(course) {
  const a = document.createElement("a");
  a.href = `teacher-courses.html?id=${course.id}`;
  a.className = "course-card";

  const gradedCount = course.assignments.filter((x) => x.status === "graded").length;
  const total = course.assignments.length;
  const percent = total === 0 ? 0 : Math.round((gradedCount / total) * 100);

  a.innerHTML = `
    <div class="course-cover ${course.color}">
      <span>${course.code}</span>
      <i class="icon" data-lucide="book-open"></i>
    </div>
    <div class="course-body">
      <h3>${course.title}</h3>
      <small>${course.students.length} students enrolled</small>
      <p>${gradedCount} of ${total} assignments graded</p>
      <div class="progress"><span style="width: ${percent}%"></span></div>
    </div>
  `;
  return a;
}

function buildAnnouncementPreview(announcement, course) {
  const div = document.createElement("div");
  div.className = "announcement-preview";
  div.innerHTML = `
    <i class="icon" data-lucide="megaphone"></i>
    <div>
      <small>${course ? course.title : "General"}</small>
      <h3>${announcement.title}</h3>
      <p>${announcement.body}</p>
    </div>
  `;
  return div;
}

function init() {
  document.getElementById("sidebar-name").textContent = getTeacherDisplayName();
  document.getElementById("sidebar-avatar").textContent = teacherInitials(getTeacherDisplayName());

  const uniqueStudentIds = new Set();
  let openCount = 0;
  const openAssignments = [];

  TEACHER_COURSES.forEach((course) => {
    course.students.forEach((s) => uniqueStudentIds.add(s.id));
    course.assignments.forEach((assignment) => {
      if (assignment.status !== "graded") {
        openCount += 1;
        openAssignments.push({ assignment, course });
      }
    });
  });

  document.getElementById("stat-courses").textContent = TEACHER_COURSES.length;
  document.getElementById("stat-students").textContent = uniqueStudentIds.size;
  document.getElementById("stat-to-grade").textContent = openCount;
  document.getElementById("stat-announcements").textContent = TEACHER_ANNOUNCEMENTS.length;

  const toGradeBody = document.getElementById("to-grade-rows");
  openAssignments.slice(0, 4).forEach(({ assignment, course }) => {
    toGradeBody.appendChild(buildToGradeRow(assignment, course));
  });

  renderTeachingChecklist();

  const courseGrid = document.getElementById("dashboard-course-grid");
  TEACHER_COURSES.slice(0, 4).forEach((course) => {
    courseGrid.appendChild(buildCourseCard(course));
  });

  const announcementsPanel = document.getElementById("dashboard-announcements");
  TEACHER_ANNOUNCEMENTS.slice(-2).reverse().forEach((announcement) => {
    const course = getCourseById(announcement.courseId);
    announcementsPanel.appendChild(buildAnnouncementPreview(announcement, course));
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

document.addEventListener("DOMContentLoaded", init);
