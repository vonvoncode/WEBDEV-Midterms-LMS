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
      <a class="table-link" href="assignment-detail.html?id=${assignment.id}">${assignment.name}</a>
      <small>${assignment.points} points</small>
    </td>
    <td>${courseTitle}</td>
    <td>${assignment.due}</td>
    <td><span class="${badgeClass}">${badgeLabel}</span></td>
  `;

    return tr;
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