function getInitials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function buildAssignmentRow(assignment, courseTitle) {
    const tr = document.createElement("tr");

    const badgeClass = assignment.status === "graded" ? "badge good" : "badge soft";
    const badgeLabel = assignment.status === "graded" ? "Graded" : "Open";

    tr.innerHTML = `
    <td>
      <a class="table-link" href="student-assignment-detail.html?id=${assignment.id}">${assignment.name}</a>
      <small>${assignment.points} points</small>
    </td>
    <td>${courseTitle}</td>
    <td>${assignment.due}</td>
    <td><span class="${badgeClass}">${badgeLabel}</span></td>
  `;

    return tr;
}

function renderModules(course) {
    const modules = MODULES.filter((m) => m.courseId === course.id);
    const list = document.getElementById('module-list');

    document.getElementById('module-count').textContent =
        `${modules.length} ${modules.length === 1 ? 'module' : 'modules'} to read`;

    if (modules.length === 0) {
        list.innerHTML = '<p class="muted" style="padding:20px 0;">No modules have been posted for this course yet.</p>';
        return;
    }

    list.innerHTML = modules.map((m) => `
    <a href="student-module-detail.html?id=${m.id}">
      <span class="activity-icon"><i class="icon" data-lucide="file-text"></i></span>
      <div>
        <strong>Module ${m.number} · ${m.title}</strong>
        <small>${m.description}</small>
      </div>
      <i class="icon" data-lucide="chevron-right"></i>
    </a>`).join('');
}

function renderCourse(course) {
    document.title = `${course.title} · AscendOne`;

    document.getElementById("course-title").textContent = course.title;
    document.getElementById("hero-meta").textContent = `${course.code} · ${course.units} units`;
    document.getElementById("hero-title").textContent = course.title;
    document.getElementById("hero-sub").textContent = `${course.instructor} · ${course.department}`;
    document.getElementById("hero-percent").textContent = `${course.progress}%`;
    document.getElementById("hero-progress-bar").style.width = `${course.progress}%`;
    document.getElementById("course-description").textContent = course.description;

    const hero = document.getElementById("course-hero");
    hero.classList.add(course.color);

    const gradedCount = course.assignments.filter((a) => a.status === "graded").length;
    const totalCount = course.assignments.length;

    document.getElementById("assignment-count").textContent =
        `${totalCount} ${totalCount === 1 ? "opportunity" : "opportunities"} to learn`;

    const rowsBody = document.getElementById("assignment-rows");
    rowsBody.innerHTML = "";
    course.assignments.forEach((assignment) => {
        rowsBody.appendChild(buildAssignmentRow(assignment, course.title));
    });

    document.getElementById("instructor-avatar").textContent = getInitials(course.instructor);
    document.getElementById("instructor-name").textContent = course.instructor;

    document.getElementById("current-grade").textContent = course.gpa ?? "Pending";
    document.getElementById("graded-count").textContent =
        `${gradedCount} of ${totalCount} assignments graded`;

    document.getElementById("course-content").hidden = false;

    if (course) {
        renderModules(course)
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

function showNotFound() {
    document.getElementById("course-title").textContent = "Course";
    document.getElementById("not-found").hidden = false;

    if (window.lucide) {
        lucide.createIcons();
    }
}

function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const course = COURSES.find((c) => c.id === id);

    if (course) {
        renderCourse(course);
    } else {
        showNotFound();
    }
}

document.addEventListener("DOMContentLoaded", init);