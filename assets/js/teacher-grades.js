const GPA_SCALE = [
    { min: 98, gpa: "4.00" },
    { min: 95, gpa: "3.75" },
    { min: 92, gpa: "3.50" },
    { min: 89, gpa: "3.25" },
    { min: 86, gpa: "3.00" },
    { min: 83, gpa: "2.75" },
    { min: 80, gpa: "2.50" },
    { min: 77, gpa: "2.25" },
    { min: 74, gpa: "2.00" },
    { min: 71, gpa: "1.75" },
    { min: 68, gpa: "1.50" },
    { min: 64, gpa: "1.25" },
    { min: 60, gpa: "1.00" },
    { min: 0, gpa: "0.00" },
];

function percentToGpa(percent) {
    if (percent == null) return null;
    return GPA_SCALE.find((tier) => percent >= tier.min).gpa;
}

let selectedCourseId = "IT315";
let sortState = { key: "name", dir: "asc" };
let pendingGradeStudentId = null;

function renderRoster() {
    const course = getCourseById(selectedCourseId);

    document.getElementById("course-banner-title").textContent = `${course.title} average`;
    const average = courseGradePercent(course);
    document.getElementById("course-average").textContent = average == null ? "Pending" : `${average}%`;
    document.getElementById("roster-count").textContent =
        `${course.students.length} student${course.students.length === 1 ? "" : "s"}`;

    const rows = course.students.map((student) => ({
        student,
        percent: studentPercent(course, student),
    }));

    rows.sort((a, b) => {
        let result;
        if (sortState.key === "name") {
            result = a.student.name.localeCompare(b.student.name);
        } else {
            const aValue = a.percent == null ? -1 : a.percent;
            const bValue = b.percent == null ? -1 : b.percent;
            result = aValue - bValue;
        }
        return sortState.dir === "asc" ? result : -result;
    });

    const body = document.getElementById("roster-rows");
    body.innerHTML = "";
    rows.forEach(({ student, percent }) => body.appendChild(buildRosterRow(course, student, percent)));

    if (window.lucide) {
        lucide.createIcons();
    }
}

function buildRosterRow(course, student, percent) {
    const total = course.assignments.length;
    const graded = course.assignments.filter(
        (a) => a.status === "graded" && student.scores[a.id] != null
    ).length;
    const gpa = percentToGpa(percent);
    const barWidth = total === 0 ? 0 : Math.round((graded / total) * 100);

    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td>
      <div class="roster-name">
        <span class="avatar">${teacherInitials(student.name)}</span>
        <span class="table-link">${student.name}</span>
      </div>
    </td>
    <td>${percent == null ? '<span class="muted">Pending</span>' : `${percent}%`}</td>
    <td>${gpa == null ? "—" : gpa}</td>
    <td>
      <small>${graded} of ${total} graded</small>
      <div class="progress" style="margin-top: 6px; width: 130px;">
        <span style="width: ${barWidth}%"></span>
      </div>
    </td>
    <td><button class="button secondary" type="button" data-grade-student="${student.id}">Grade</button></td>
  `;
    return tr;
}

function openGradeDialog(studentId) {
    const course = getCourseById(selectedCourseId);
    const student = course.students.find((s) => s.id === studentId);
    if (!student) return;

    pendingGradeStudentId = studentId;
    document.getElementById("grade-dialog-name").textContent = student.name;
    document.getElementById("grade-dialog-course").textContent = `${course.title} · ${course.code}`;

    const rowsWrap = document.getElementById("grade-dialog-rows");
    rowsWrap.innerHTML = "";

    if (course.assignments.length === 0) {
        const empty = document.createElement("p");
        empty.className = "hint";
        empty.textContent = "This course has no assignments yet.";
        rowsWrap.appendChild(empty);
    } else {
        course.assignments.forEach((assignment) => {
            const currentScore = student.scores[assignment.id];
            const field = document.createElement("div");
            field.className = "field";
            field.innerHTML = `
        <label for="score-${assignment.id}">
          ${assignment.name}
          <span class="hint">(${assignment.points} pts · ${assignment.status === "graded" ? "Graded" : "Open"})</span>
        </label>
        <input
          type="number"
          id="score-${assignment.id}"
          min="0"
          max="${assignment.points}"
          value="${currentScore != null ? currentScore : ""}"
          data-assignment-id="${assignment.id}"
          placeholder="Not yet scored"
        />
      `;
            rowsWrap.appendChild(field);
        });
    }

    document.getElementById("grade-dialog").showModal();
}

function saveGrades() {
    const course = getCourseById(selectedCourseId);
    const student = course.students.find((s) => s.id === pendingGradeStudentId);
    if (!student) return;

    document.querySelectorAll("#grade-dialog-rows input[data-assignment-id]").forEach((input) => {
        const assignmentId = input.dataset.assignmentId;
        const value = input.value.trim();
        student.scores[assignmentId] = value === "" ? null : Number(value);
    });

    course.assignments.forEach((assignment) => {
        const allGraded = course.students.every((s) => s.scores[assignment.id] != null);
        assignment.status = allGraded ? "graded" : "open";
    });

    document.getElementById("grade-dialog").close();
    renderRoster();
    showToast(`Grades saved for ${student.name}.`);
}

function init() {
    document.getElementById("sidebar-name").textContent = getTeacherDisplayName();
    document.getElementById("sidebar-avatar").textContent = teacherInitials(getTeacherDisplayName());

    const params = new URLSearchParams(window.location.search);
    const requestedCourse = params.get("course");
    if (requestedCourse && getCourseById(requestedCourse)) {
        selectedCourseId = requestedCourse;
    }
    document.getElementById("course-filter").value = selectedCourseId;

    document.getElementById("course-filter").addEventListener("change", (event) => {
        selectedCourseId = event.target.value;
        history.replaceState(null, "", `teacher-grades.html?course=${selectedCourseId}`);
        renderRoster();
    });

    document.querySelectorAll("[data-sort]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.sort;
            if (sortState.key === key) {
                sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
            } else {
                sortState = { key, dir: "asc" };
            }
            renderRoster();
        });
    });

    document.getElementById("roster-rows").addEventListener("click", (event) => {
        const btn = event.target.closest("[data-grade-student]");
        if (btn) {
            openGradeDialog(btn.dataset.gradeStudent);
        }
    });

    document.querySelectorAll("[data-close-dialog]").forEach((btn) => {
        btn.addEventListener("click", () => document.getElementById(btn.dataset.closeDialog).close());
    });

    document.getElementById("save-grades-button").addEventListener("click", saveGrades);

    renderRoster();

    if (window.lucide) {
        lucide.createIcons();
    }
}

document.addEventListener("DOMContentLoaded", init);
