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

    const earnedLabel = assignment.earnedPoints != null
        ? `<small class="${badgeClass}">${assignment.earnedPoints} points</small>`
        : "No Submission yet";

    tr.innerHTML = `
    <td>
      <a class="table-link" href="student-assignment-detail.html?id=${assignment.id}">${assignment.name}</a>
      <small>${assignment.points} points</small>
    </td>
    <td>${courseTitle}</td>
    <td>${assignment.due}</td>
    <td><span class="${badgeClass}">${badgeLabel}</span></td>
    <td>${earnedLabel}</td>
  `;

    return tr;
}

function renderModules(course) {
    const modules = MODULES.filter((module) => module.courseId === course.id);
    const list = document.getElementById("module-list");

    document.getElementById("module-count").textContent =
        `${modules.length} ${modules.length === 1 ? "module" : "modules"} to read`;

    list.innerHTML = "";

    if (modules.length === 0) {
        list.innerHTML =
            '<p class="muted" style="padding:20px 0;">No modules have been posted for this course yet.</p>';
        return;
    }

    modules.forEach((module, index) => {
        const item = document.createElement("div");
        item.className = "module-item";

        const header = document.createElement("button");
        header.type = "button";
        header.className = "module-header";
        header.setAttribute("aria-expanded", "false");

        const number = document.createElement("span");
        number.className = "module-index";
        number.textContent = index + 1;

        const heading = document.createElement("span");
        heading.className = "module-header-text";

        const title = document.createElement("h3");
        title.textContent = module.title;

        const count = document.createElement("small");
        count.textContent =
            `${module.lessons.length} lesson${module.lessons.length === 1 ? "" : "s"}`;

        heading.append(title, count);

        const chevron = document.createElement("i");
        chevron.className = "icon chevron";
        chevron.dataset.lucide = "chevron-down";

        header.append(number, heading, chevron);
        header.addEventListener("click", () => {
            item.classList.toggle("open");
            header.setAttribute(
                "aria-expanded",
                item.classList.contains("open") ? "true" : "false"
            );
        });

        const body = document.createElement("div");
        body.className = "module-body";

        const lessonList = document.createElement("div");
        lessonList.className = "lesson-list";

        module.lessons.forEach((lesson) => {
            const isPdfReading = lesson.type === "reading" && lesson.pdf;
            const row = document.createElement(isPdfReading ? "a" : "div");
            row.className = "lesson-row";

            if (isPdfReading) {
                row.href =
                    `student-module-detail.html?id=${encodeURIComponent(module.id)}` +
                    `&lesson=${encodeURIComponent(lesson.id)}`;
            }

            const icon = document.createElement("i");
            icon.className = "icon";
            icon.dataset.lucide =
                lesson.type === "video" ? "play-circle" :
                    lesson.type === "link" ? "link" : "file-text";

            const lessonTitle = document.createElement("strong");
            lessonTitle.textContent = lesson.title;

            const type = document.createElement("span");
            type.className = "lesson-type";
            type.textContent = lesson.type;

            row.append(icon, lessonTitle, type);
            lessonList.appendChild(row);
        });

        body.appendChild(lessonList);
        item.append(header, body);
        list.appendChild(item);
    });

    if (window.lucide) {
        lucide.createIcons();
    }
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
        renderModules(course);
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
        // renderModules(course);
    } else {
        showNotFound();
    }
}

document.addEventListener("DOMContentLoaded", init);