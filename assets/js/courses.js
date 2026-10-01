function buildCourseCardButton(course) {
    const a = document.createElement("a");
    a.href = `student-course-detail.html?id=${encodeURIComponent(course.id)}`;
    a.className = "course-card";
    a.innerHTML = `
    <div class="course-cover ${course.color}">
      <span>${course.code}</span>
      <i class="icon" data-lucide="book-open"></i>
    </div>
    <div class="course-body">
      <h3>${course.title}</h3>
      <small>${course.instructor}</small>
      <p>${course.progress}% of assignments submitted</p>
      <div class="progress"><span style="width:${course.progress}%"></span></div>
    </div>
  `;
    return a;
}

function renderGrid(filterText) {
    const term = (filterText || "").trim().toLowerCase();
    const filtered = COURSES.filter(
        (course) =>
            !term ||
            course.title.toLowerCase().includes(term) ||
            course.code.toLowerCase().includes(term)
    );

    const grid = document.getElementById("course-list");
    grid.innerHTML = "";
    filtered.forEach((course) => grid.appendChild(buildCourseCardButton(course)));

    document.getElementById("result-count").textContent =
        `${filtered.length} course${filtered.length === 1 ? "" : "s"}`;
    document.getElementById("no-results").hidden = filtered.length !== 0;

    if (window.lucide) {
        lucide.createIcons();
    }
}

function init() {
    renderGrid("");

    const searchInput = document.getElementById("course-search");
    if (searchInput) {
        searchInput.addEventListener("input", () => renderGrid(searchInput.value));
    }
}

document.addEventListener("DOMContentLoaded", init);