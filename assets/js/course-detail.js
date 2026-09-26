const COURSES = [
    {
        id: "IT315",
        code: "IT 315",
        units: 3,
        title: "Interface Design Systems",
        department: "Information Technology",
        description: "Design accessible interfaces through research, prototyping, and evaluation.",
        color: "purple",
        instructor: "Nimrod Reyes Sajise",
        progress: 50,
        currentGrade: "3.25",
        assignments: [
            { name: "Interface audit", points: 100, due: "Sep 21, 2026, 11:00 PM", status: "graded" },
            { name: "Usability testing report", points: 100, due: "Sep 27, 2026, 11:00 PM", status: "open" }
        ]
    },
    {
        id: "CS241",
        code: "CS 241",
        units: 3,
        title: "Data Structures & Algorithms",
        department: "Information Technology",
        description: "Choose efficient structures and algorithms to solve practical problems.",
        color: "blue",
        instructor: "Nimrod Reyes Sajise",
        progress: 100,
        currentGrade: "3.00",
        assignments: [
            { name: "Algorithm analysis", points: 50, due: "Sep 23, 2026, 11:00 PM", status: "graded" }
        ]
    },
    {
        id: "IT332",
        code: "IT 332",
        units: 3,
        title: "Computer Networks",
        department: "Information Technology",
        description: "Understand how networked systems are designed, addressed, and secured.",
        color: "orange",
        instructor: "Nimrod Reyes Sajise",
        progress: 0,
        currentGrade: null,
        assignments: [
            { name: "Network simulation lab", points: 100, due: "Sep 29, 2026, 11:00 PM", status: "open" }
        ]
    },
    {
        id: "GE201",
        code: "GE 201",
        units: 3,
        title: "Research Methods",
        department: "General Education",
        description: "Build the skills to design, conduct, and report original research.",
        color: "pink",
        instructor: "Nimrod Reyes Sajise",
        progress: 0,
        currentGrade: null,
        assignments: [
            { name: "Research proposal", points: 100, due: "Oct 1, 2026, 11:00 PM", status: "open" }
        ]
    },
    {
        id: "IT320",
        code: "IT 320",
        units: 3,
        title: "Web Development",
        department: "Information Technology",
        description: "Build responsive, accessible websites from the ground up.",
        color: "teal",
        instructor: "Nimrod Reyes Sajise",
        progress: 0,
        currentGrade: null,
        assignments: [
            { name: "Responsive portfolio", points: 100, due: "Oct 3, 2026, 11:00 PM", status: "open" }
        ]
    },
    {
        id: "IT324",
        code: "IT 324",
        units: 3,
        title: "Database Management Systems",
        department: "Information Technology",
        description: "Model, normalize, and query relational databases effectively.",
        color: "indigo",
        instructor: "Nimrod Reyes Sajise",
        progress: 0,
        currentGrade: null,
        assignments: [
            { name: "Entity relationship diagram", points: 100, due: "Oct 5, 2026, 11:00 PM", status: "open" }
        ]
    }
];

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
      <span class="table-link">${assignment.name}</span>
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

    document.getElementById("current-grade").textContent = course.currentGrade ?? "Pending";
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