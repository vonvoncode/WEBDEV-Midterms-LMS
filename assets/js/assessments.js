function buildAssessmentList() {
    const list = [];

    COURSES.forEach((course) => {
        course.assignments.forEach((assignment) => {
            list.push({
                name: assignment.name,
                points: assignment.points,
                due: assignment.due,
                status: assignment.status,
                courseId: course.id,
                courseTitle: course.title
            });
        });
    });

    return list;
}

const ASSESSMENTS = buildAssessmentList();

function buildAssessmentRow(item) {
    const tr = document.createElement("tr");
    tr.dataset.course = item.courseId;

    const badgeClass = item.status === "graded" ? "badge good" : "badge soft";
    const badgeLabel = item.status === "graded" ? "Graded" : "Open";

    tr.innerHTML = `
    <td>
      <span class="table-link">${item.name}</span>
      <small>${item.points} points</small>
    </td>
    <td>${item.courseTitle}</td>
    <td>${item.due}</td>
    <td><span class="${badgeClass}">${badgeLabel}</span></td>
  `;

    return tr;
}

function renderAssessments(list) {
    const tbody = document.getElementById("assignment-rows");
    const emptyState = document.getElementById("no-results");

    tbody.innerHTML = "";

    if (list.length === 0) {
        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;
    list.forEach((item) => tbody.appendChild(buildAssessmentRow(item)));
}

function populateCourseFilter() {
    const select = document.getElementById("course-filter");

    COURSES.forEach((course) => {
        const option = document.createElement("option");
        option.value = course.id;
        option.textContent = course.title;
        select.appendChild(option);
    });
}

function applyFilters() {
    const searchTerm = document.getElementById("assignment-search").value.trim().toLowerCase();
    const courseFilter = document.getElementById("course-filter").value;

    const filtered = ASSESSMENTS.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm) ||
            item.courseTitle.toLowerCase().includes(searchTerm);
        const matchesCourse = courseFilter === "all" || item.courseId === courseFilter;
        return matchesSearch && matchesCourse;
    });

    renderAssessments(filtered);
}

function init() {
    populateCourseFilter();

    document.getElementById("assignment-search").addEventListener("input", applyFilters);
    document.getElementById("course-filter").addEventListener("change", applyFilters);

    applyFilters();

    if (window.lucide) {
        lucide.createIcons();
    }
}

document.addEventListener("DOMContentLoaded", init);