const COURSE_COLORS = ["purple", "blue", "orange", "pink", "teal", "indigo"];

const ATTENDANCE_STORAGE_KEY = "ascendone-attendance";
let currentCourseId = null;
let pendingLessonModuleId = null;

const TEACHER_MODULES_KEY = "ascendone-teacher-modules-session";

function readTeacherModuleStore() {
    try {
        return JSON.parse(sessionStorage.getItem(TEACHER_MODULES_KEY)) || {};
    } catch (error) {
        return {};
    }
}

function saveTeacherModules(course) {
    const store = readTeacherModuleStore();
    store[course.id] = course.modules;
    sessionStorage.setItem(TEACHER_MODULES_KEY, JSON.stringify(store));
}

function loadTeacherModules() {
    const store = readTeacherModuleStore();

    TEACHER_COURSES.forEach((course) => {
        if (Array.isArray(store[course.id])) {
            course.modules = store[course.id];
        }
    });
}

/* ---------- dialog helpers ---------- */
function openDialog(id) {
    document.getElementById(id).showModal();
}

function closeDialog(id) {
    document.getElementById(id).close();
}

/* ---------- grid view ---------- */
function renderGrid(filterText) {
    const term = (filterText || "").trim().toLowerCase();
    const filtered = TEACHER_COURSES.filter(
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

function buildCourseCardButton(course) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "course-card";

    const total = course.assignments.length;
    const graded = course.assignments.filter((a) => a.status === "graded").length;
    const percent = total === 0 ? 0 : Math.round((graded / total) * 100);

    btn.innerHTML = `
    <div class="course-cover ${course.color}">
      <span>${course.code}</span>
      <i class="icon" data-lucide="book-open"></i>
    </div>
    <div class="course-body">
      <h3>${course.title}</h3>
      <small>${course.students.length} students enrolled</small>
      <p>${graded} of ${total} assignments graded</p>
      <div class="progress"><span style="width: ${percent}%"></span></div>
    </div>
  `;

    btn.addEventListener("click", () => openWorkspace(course.id));
    return btn;
}

/* ---------- workspace (overview / modules / assignments / students) ---------- */
function openWorkspace(courseId) {
    const course = getCourseById(courseId);
    if (!course) {
        showNotFound();
        return;
    }

    currentCourseId = courseId;
    document.getElementById("courses-view").hidden = true;
    document.getElementById("course-not-found").hidden = true;
    document.getElementById("course-workspace").hidden = false;
    document.getElementById("topbar-title").textContent = course.title;
    history.replaceState(null, "", `teacher-courses.html?id=${courseId}`);

    renderWorkspace(course);
    switchTab("overview");
}

function backToGrid() {
    currentCourseId = null;
    document.getElementById("course-workspace").hidden = true;
    document.getElementById("course-not-found").hidden = true;
    document.getElementById("courses-view").hidden = false;
    document.getElementById("topbar-title").textContent = "My Courses";
    history.replaceState(null, "", "teacher-courses.html");
    renderGrid(document.getElementById("course-search").value);
}

function showNotFound() {
    document.getElementById("courses-view").hidden = true;
    document.getElementById("course-workspace").hidden = true;
    document.getElementById("course-not-found").hidden = false;
    document.getElementById("topbar-title").textContent = "My Courses";
    if (window.lucide) {
        lucide.createIcons();
    }
}

function renderWorkspace(course) {
    const hero = document.getElementById("workspace-hero");
    COURSE_COLORS.forEach((c) => hero.classList.remove(c));
    hero.classList.add(course.color);

    document.getElementById("workspace-meta").textContent = `${course.code} · ${course.units} units`;
    document.getElementById("workspace-title").textContent = course.title;
    document.getElementById("workspace-sub").textContent = course.department;
    document.getElementById("workspace-description").textContent = course.description;

    const total = course.assignments.length;
    const graded = course.assignments.filter((a) => a.status === "graded").length;
    const percent = total === 0 ? 0 : Math.round((graded / total) * 100);
    document.getElementById("workspace-percent").textContent = `${percent}%`;
    document.getElementById("workspace-progress-bar").style.width = `${percent}%`;

    renderModules(course);
    renderAssignments(course);
    renderStudents(course);
}

function switchTab(tabName) {
    document.querySelectorAll(".course-tabs button").forEach((btn) => {
        const active = btn.dataset.tab === tabName;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.hidden = panel.dataset.tabPanel !== tabName;
    });
}

/* ---------- modules & lessons ---------- */
function renderModules(course) {
    document.getElementById("modules-count").textContent =
        `${course.modules.length} module${course.modules.length === 1 ? "" : "s"}`;

    const list = document.getElementById("module-list");
    list.innerHTML = "";

    if (course.modules.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-inline";
        empty.textContent = "No modules yet. Add your first module to start building out this course.";
        list.appendChild(empty);
        return;
    }

    course.modules.forEach((mod, index) =>
    list.appendChild(buildModuleItem(course, mod, index))
);

    if (window.lucide) {
        lucide.createIcons();
    }
}

function lessonIcon(type) {
    if (type === "video") return "play-circle";
    if (type === "link") return "link";
    return "file-text";
}

function buildLessonRow(course, module, lesson) {
    const row = document.createElement("a");
    row.className = "lesson-row";
    row.href =
        `teacher-lesson-editor.html?course=${encodeURIComponent(course.id)}` +
        `&module=${encodeURIComponent(module.id)}` +
        `&lesson=${encodeURIComponent(lesson.id)}`;

    const icon = document.createElement("i");
    icon.className = "icon";
    icon.dataset.lucide = lessonIcon(lesson.type);

    const title = document.createElement("strong");
    title.textContent = lesson.title;

    const type = document.createElement("span");
    type.className = "lesson-type";
    type.textContent = lesson.type;

    row.append(icon, title, type);
    return row;
}

function buildModuleItem(course, mod, index) {
    const wrap = document.createElement("div");
    wrap.className = "module-item";
    wrap.dataset.moduleId = mod.id;

    const header = document.createElement("button");
    header.type = "button";
    header.className = "module-header";
    header.innerHTML = `
    <span class="module-index">${index + 1}</span>
    <span class="module-header-text">
      <h3>${mod.title}</h3>
      <small>${mod.lessons.length} lesson${mod.lessons.length === 1 ? "" : "s"}</small>
    </span>
    <i class="icon chevron" data-lucide="chevron-down"></i>
  `;
    header.addEventListener("click", () => wrap.classList.toggle("open"));

    const body = document.createElement("div");
    body.className = "module-body";

    const lessonList = document.createElement("div");
    lessonList.className = "lesson-list";
    if (mod.lessons.length === 0) {
        const emptyLesson = document.createElement("p");
        emptyLesson.className = "hint";
        emptyLesson.style.marginBottom = "14px";
        emptyLesson.textContent = "No lessons in this module yet.";
        lessonList.appendChild(emptyLesson);
    } else {
        mod.lessons.forEach((lesson) =>
            lessonList.appendChild(buildLessonRow(course, mod, lesson))
        );
    }

    const addLessonBtn = document.createElement("button");
    addLessonBtn.type = "button";
    addLessonBtn.className = "button secondary";
    addLessonBtn.innerHTML = `<i class="icon" data-lucide="plus"></i> Add lesson`;
    addLessonBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        pendingLessonModuleId = mod.id;
        document.getElementById("add-lesson-error").textContent = "";
        openDialog("add-lesson-dialog");
    });

    body.appendChild(lessonList);
    body.appendChild(addLessonBtn);

    wrap.appendChild(header);
    wrap.appendChild(body);
    return wrap;
}

/* ---------- assignments ---------- */
function renderAssignments(course) {
    document.getElementById("assignments-count").textContent =
        `${course.assignments.length} assignment${course.assignments.length === 1 ? "" : "s"}`;

    const body = document.getElementById("assignment-rows");
    body.innerHTML = "";
    course.assignments.forEach((a) => body.appendChild(buildAssignmentRow(a)));

    if (window.lucide) {
        lucide.createIcons();
    }
}

function buildAssignmentRow(assignment) {
    const tr = document.createElement("tr");
    const badgeClass = assignment.status === "graded" ? "badge good" : "badge soft";
    const badgeLabel = assignment.status === "graded" ? "Graded" : "Open";
    const typeLabel = assignment.type === "quiz" ? "Quiz" : "Upload";
    const typeIcon = assignment.type === "quiz" ? "list-checks" : "upload";

    tr.innerHTML = `
    <td>
      <span class="table-link">${assignment.name}</span>
      <small>${assignment.points} points</small>
    </td>
    <td><i class="icon" data-lucide="${typeIcon}" style="width:16px;height:16px;vertical-align:-3px;margin-right:5px;"></i>${typeLabel}</td>
    <td>${assignment.due}</td>
    <td><span class="${badgeClass}">${badgeLabel}</span></td>
  `;
    return tr;
}

/* ---------- students ---------- */
function getAttendanceData() {
    try {
        return JSON.parse(localStorage.getItem(ATTENDANCE_STORAGE_KEY)) || {};
    } catch (error) {
        return {};
    }
}

function saveAttendanceData(data) {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(data));
}

function getCourseAttendance(data, courseId) {
    if (!data[courseId]) {
        data[courseId] = { dates: [], records: {} };
    }

    return data[courseId];
}

function formatAttendanceDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function renderStudents(course) {
    document.getElementById("students-count").textContent =
        `${course.students.length} student${course.students.length === 1 ? "" : "s"} enrolled`;

    document.getElementById("go-to-grades-link").href =
        `teacher-grades.html?course=${course.id}`;

    const data = getAttendanceData();
    const attendance = getCourseAttendance(data, course.id);
    const head = document.getElementById("attendance-head");
    const body = document.getElementById("attendance-rows");

    head.innerHTML = "";
    body.innerHTML = "";

    const headerRow = document.createElement("tr");
    const studentHeader = document.createElement("th");
    studentHeader.textContent = "Student";
    headerRow.appendChild(studentHeader);

    attendance.dates.forEach((date) => {
        const dateHeader = document.createElement("th");
        dateHeader.textContent = formatAttendanceDate(date);
        headerRow.appendChild(dateHeader);
    });

    head.appendChild(headerRow);

    course.students.forEach((student) => {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");

        nameCell.textContent = student.name;
        row.appendChild(nameCell);

        attendance.dates.forEach((date) => {
            const cell = document.createElement("td");
            const button = document.createElement("button");
            const status = attendance.records[date]?.[student.id] || "";

            button.type = "button";
            button.className = `attendance-tile ${status}`;
            button.dataset.studentId = student.id;
            button.dataset.date = date;
            button.textContent = status
                ? status[0].toUpperCase() + status.slice(1)
                : "Unmarked";
            button.setAttribute(
                "aria-label",
                `${student.name}, ${formatAttendanceDate(date)}: ${button.textContent}`
            );

            cell.appendChild(button);
            row.appendChild(cell);
        });

        body.appendChild(row);
    });

    const selectedDate = document.getElementById("attendance-date").value;
    const selectedRecords = attendance.records[selectedDate] || {};
    const presentCount = Object.values(selectedRecords).filter(
        (status) => status === "present"
    ).length;
    const absentCount = Object.values(selectedRecords).filter(
        (status) => status === "absent"
    ).length;
    const unmarkedCount = course.students.length - presentCount - absentCount;

    document.getElementById("attendance-summary").textContent = selectedDate
        ? `${presentCount} present · ${absentCount} absent · ${unmarkedCount} unmarked`
        : "Choose a date and click Add date to start taking attendance.";

    if (window.lucide) {
        lucide.createIcons();
    }
}

/* ---------- new assignment: type toggle + quiz builder ---------- */
function setAssignmentType(type) {
    document.querySelectorAll("[data-assignment-type]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.assignmentType === type);
    });
    document.getElementById("assignment-type-value").value = type;
    document.querySelectorAll("[data-type-fields]").forEach((field) => {
        field.hidden = field.dataset.typeFields !== type;
    });
}

function addQuestionRow() {
    const template = document.getElementById("quiz-question-template");
    const clone = template.content.cloneNode(true);

    const uniqueName = `correct-option-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    clone.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.name = uniqueName;
    });

    const questionEl = clone.querySelector(".quiz-question");
    clone.querySelector(".remove-question").addEventListener("click", () => questionEl.remove());

    document.getElementById("quiz-question-list").appendChild(clone);
    if (window.lucide) {
        lucide.createIcons();
    }
}

function formatDueDate(datetimeLocalValue) {
    const date = new Date(datetimeLocalValue);
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

/* ---------- init & event wiring ---------- */
function init() {
    loadTeacherModules();

    document.getElementById("sidebar-name").textContent = getTeacherDisplayName();
    document.getElementById("sidebar-avatar").textContent = teacherInitials(getTeacherDisplayName());

    document.querySelectorAll("[data-close-dialog]").forEach((btn) => {
        btn.addEventListener("click", () => closeDialog(btn.dataset.closeDialog));
    });

    document.querySelectorAll(".course-tabs button").forEach((btn) => {
        btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    const attendanceDateInput = document.getElementById("attendance-date");

    function getTodayDate() {
        const today = new Date();
        const timezoneOffset = today.getTimezoneOffset() * 60000;
        return new Date(today.getTime() - timezoneOffset)
            .toISOString()
            .slice(0, 10);
    }

    attendanceDateInput.value = getTodayDate();

    document.getElementById("add-attendance-date").addEventListener("click", () => {
        const date = attendanceDateInput.value;
        const course = getCourseById(currentCourseId);

        if (!course || !date) return;

        const data = getAttendanceData();
        const attendance = getCourseAttendance(data, course.id);

        if (!attendance.dates.includes(date)) {
            attendance.dates.push(date);
            attendance.dates.sort();
            saveAttendanceData(data);
        }

        renderStudents(course);
    });

    document.getElementById("attendance-rows").addEventListener("click", (event) => {
        const button = event.target.closest(".attendance-tile");
        if (!button) return;

        const course = getCourseById(currentCourseId);
        if (!course) return;

        const data = getAttendanceData();
        const attendance = getCourseAttendance(data, course.id);
        const { date, studentId } = button.dataset;

        if (!attendance.records[date]) {
            attendance.records[date] = {};
        }

        const currentStatus = attendance.records[date][studentId];

        if (!currentStatus) {
            attendance.records[date][studentId] = "present";
        } else if (currentStatus === "present") {
            attendance.records[date][studentId] = "absent";
        } else {
            delete attendance.records[date][studentId];
        }

        saveAttendanceData(data);
        renderStudents(course);
    });

    attendanceDateInput.addEventListener("change", () => {
        const course = getCourseById(currentCourseId);
        if (course) renderStudents(course);
    });

    document.getElementById("course-search").addEventListener("input", (event) => {
        renderGrid(event.target.value);
    });

    document.getElementById("back-to-courses").addEventListener("click", backToGrid);
    document.getElementById("not-found-back").addEventListener("click", backToGrid);

    /* Add course */
    document.getElementById("open-add-course").addEventListener("click", () => {
        document.getElementById("add-course-error").textContent = "";
        openDialog("add-course-dialog");
    });

    document.getElementById("add-course-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const errorEl = document.getElementById("add-course-error");
        const code = document.getElementById("course-code").value.trim();
        const units = parseInt(document.getElementById("course-units").value, 10);
        const title = document.getElementById("course-title-input").value.trim();
        const department = document.getElementById("course-department").value.trim();
        const description = document.getElementById("course-description-input").value.trim();
        const color = document.getElementById("course-color").value;

        if (!code || !title || !department || !description) {
            errorEl.textContent = "Please fill in every field.";
            return;
        }

        const id = code.replace(/\s+/g, "").toUpperCase();
        if (getCourseById(id)) {
            errorEl.textContent = "A course with that code already exists.";
            return;
        }

        TEACHER_COURSES.push({
            id,
            code,
            units,
            title,
            department,
            description,
            color,
            modules: [],
            assignments: [],
            students: [],
        });

        event.target.reset();
        document.getElementById("course-units").value = 3;
        closeDialog("add-course-dialog");
        renderGrid(document.getElementById("course-search").value);
        showToast(`${title} was added to your courses.`);
    });

    /* Add module */
    document.getElementById("open-add-module").addEventListener("click", () => {
        document.getElementById("add-module-error").textContent = "";
        openDialog("add-module-dialog");
    });

    document.getElementById("add-module-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const errorEl = document.getElementById("add-module-error");
        const title = document.getElementById("module-title").value.trim();

        if (!title) {
            errorEl.textContent = "Give the module a title.";
            return;
        }

        const course = getCourseById(currentCourseId);
        course.modules.push({
            id: `${course.id}-M-${Date.now()}`,
            title,
            lessons: [],
        });

        saveTeacherModules(course);

        event.target.reset();
        closeDialog("add-module-dialog");
        renderModules(course);
        showToast(`"${title}" module added.`);
    });

    /* Add lesson */
    document.getElementById("add-lesson-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const errorEl = document.getElementById("add-lesson-error");
        const title = document.getElementById("lesson-title").value.trim();
        const type = document.getElementById("lesson-type").value;

        if (!title) {
            errorEl.textContent = "Give the lesson a title.";
            return;
        }

        const course = getCourseById(currentCourseId);
        const mod = course.modules.find((m) => m.id === pendingLessonModuleId);
        if (mod) {
            mod.lessons.push({ id: `L-${Date.now()}`, title, type });
            saveTeacherModules(course);
        }

        event.target.reset();
        closeDialog("add-lesson-dialog");
        renderModules(course);

        if (mod) {
            const moduleEl = document.querySelector(`[data-module-id="${mod.id}"]`);
            if (moduleEl) moduleEl.classList.add("open");
        }

        showToast(`"${title}" lesson added.`);
    });

    /* New assignment */
    document.getElementById("open-add-assignment").addEventListener("click", () => {
        document.getElementById("add-assignment-error").textContent = "";
        document.getElementById("quiz-question-list").innerHTML = "";
        setAssignmentType("upload");
        addQuestionRow();
        openDialog("add-assignment-dialog");
    });

    document.querySelectorAll("[data-assignment-type]").forEach((btn) => {
        btn.addEventListener("click", () => setAssignmentType(btn.dataset.assignmentType));
    });

    document.getElementById("add-question-button").addEventListener("click", () => addQuestionRow());

    document.getElementById("add-assignment-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const errorEl = document.getElementById("add-assignment-error");
        const title = document.getElementById("assignment-title").value.trim();
        const points = parseInt(document.getElementById("assignment-points").value, 10);
        const dueRaw = document.getElementById("assignment-due").value;
        const type = document.getElementById("assignment-type-value").value;

        if (!title || !dueRaw || !points) {
            errorEl.textContent = "Please fill in the title, points, and due date.";
            return;
        }

        let questions = [];
        if (type === "quiz") {
            const questionEls = document.querySelectorAll("#quiz-question-list .quiz-question");
            if (questionEls.length === 0) {
                errorEl.textContent = "Add at least one question for a quiz assignment.";
                return;
            }
            for (const qEl of questionEls) {
                const prompt = qEl.querySelector(".question-prompt").value.trim();
                const options = Array.from(qEl.querySelectorAll(".question-option")).map((i) => i.value.trim());
                const checkedRadio = qEl.querySelector('input[type="radio"]:checked');
                if (!prompt || options.some((o) => !o) || !checkedRadio) {
                    errorEl.textContent = "Fill in every question, its four options, and mark the correct answer.";
                    return;
                }
                questions.push({
                    id: `Q-${Date.now()}-${questions.length}`,
                    prompt,
                    options,
                    correctIndex: parseInt(checkedRadio.value, 10),
                });
            }
        }

        const course = getCourseById(currentCourseId);
        const newAssignment = {
            id: `A-${Date.now()}`,
            name: title,
            points,
            due: formatDueDate(dueRaw),
            type,
            status: "open",
        };
        if (type === "quiz") {
            newAssignment.questions = questions;
        }
        course.assignments.push(newAssignment);

        event.target.reset();
        document.getElementById("assignment-points").value = 100;
        setAssignmentType("upload");
        document.getElementById("quiz-question-list").innerHTML = "";
        closeDialog("add-assignment-dialog");
        renderWorkspace(course);
        showToast(`"${title}" was posted.`);
    });

    /* Initial view: deep link via ?id=, or the grid */
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("id");
    if (requestedId) {
        openWorkspace(requestedId);
    } else {
        renderGrid("");
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

document.addEventListener("DOMContentLoaded", init);
