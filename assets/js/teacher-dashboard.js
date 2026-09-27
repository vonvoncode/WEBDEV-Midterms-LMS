function buildToGradeRow(assignment, course) {
    const tr = document.createElement("tr");
    const badgeClass = assignment.status === "graded" ? "badge good" : "badge soft";
    const badgeLabel = assignment.status === "graded" ? "Graded" : "Open";

    tr.innerHTML = `
    <td>
      <span class="table-link">${assignment.name}</span>
      <small>${assignment.points} points · ${assignment.type === "quiz" ? "Quiz" : "Upload"}</small>
    </td>
    <td>${course.title}</td>
    <td>${assignment.due}</td>
    <td><span class="${badgeClass}">${badgeLabel}</span></td>
  `;
    return tr;
}

function buildUpcomingRow(assignment, course) {
    const a = document.createElement("a");
    a.href = `teacher-courses.html?id=${course.id}`;

    const [month, day] = assignment.due.split(" ");
    a.innerHTML = `
    <time><b>${day.replace(",", "")}</b><span>${month}</span></time>
    <div>
      <strong>${assignment.name}</strong>
      <small>${course.title} · ${assignment.due}</small>
    </div>
  `;
    return a;
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

    const upcomingList = document.getElementById("upcoming-list");
    openAssignments.slice(0, 3).forEach(({ assignment, course }) => {
        upcomingList.appendChild(buildUpcomingRow(assignment, course));
    });

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
