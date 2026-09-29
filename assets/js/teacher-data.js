/* Shared data for the teacher perspective of AscendOne.
   Loaded before each teacher-*.js file, mirrors how COURSES lives in
   course-detail.js for the student side, just centralized since more
   than one teacher page reads from it. */

const TEACHER_PROFILE = {
    name: "Nimrod Reyes Sajise",
    role: "Faculty · Information Technology Department",
    email: "nimrod.sajise@ascendone.edu",
};

const TEACHER_NAME_KEY = "ascendone-teacher-name";

function getTeacherDisplayName() {
    return localStorage.getItem(TEACHER_NAME_KEY) || TEACHER_PROFILE.name;
}

function setTeacherDisplayName(name) {
    localStorage.setItem(TEACHER_NAME_KEY, name);
}

function teacherInitials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

const TEACHER_COURSES = [
    {
        id: "IT315",
        code: "IT 315",
        units: 3,
        title: "Interface Design Systems",
        department: "Information Technology",
        description: "Design accessible interfaces through research, prototyping, and evaluation.",
        color: "purple",
        modules: [
            {
                id: "IT315-M1",
                title: "Foundations of Interface Design",
                lessons: [
                    { id: "L1", title: "Principles of visual hierarchy", type: "reading" },
                    { id: "L2", title: "Walkthrough: heuristic evaluation", type: "video" },
                ],
            },
            {
                id: "IT315-M2",
                title: "Accessibility and Usability Basics",
                lessons: [
                    { id: "L3", title: "Low-fidelity vs high-fidelity prototypes", type: "reading" },
                    { id: "L4", title: "Figma component libraries", type: "link" },
                ],
            },
        ],
        assignments: [
            {
                id: "A1",
                name: "Interface audit",
                points: 100,
                due: "Sep 21, 2026, 11:00 PM",
                type: "upload",
                status: "graded",
            },
            {
                id: "A2",
                name: "Usability testing report",
                points: 100,
                due: "Sep 27, 2026, 11:00 PM",
                type: "upload",
                status: "open",
            },
        ],
        students: [
            { id: "S1", name: "Von Quobie Ferrer", email: "von.ferrer@ascendone.edu", scores: { A1: 91, A2: null } },
            { id: "S2", name: "Marielle Bautista", email: "marielle.bautista@ascendone.edu", scores: { A1: 88, A2: null } },
            { id: "S3", name: "Julian Torres", email: "julian.torres@ascendone.edu", scores: { A1: 95, A2: null } },
            { id: "S4", name: "Andrea Villaflor", email: "andrea.villaflor@ascendone.edu", scores: { A1: 84, A2: null } },
        ],
    },
    {
        id: "CS241",
        code: "CS 241",
        units: 3,
        title: "Data Structures & Algorithms",
        department: "Information Technology",
        description: "Choose efficient structures and algorithms to solve practical problems.",
        color: "blue",
        modules: [
            {
                id: "CS241-M1",
                title: "Arrays, Lists, and Complexity",
                lessons: [
                    { id: "L1", title: "Arrays, stacks, and queues", type: "reading" },
                    { id: "L2", title: "Linked list traversal", type: "video" },
                ],
            },
            {
                id: "CS241-M2",
                title: "Sorting and Searching",
                lessons: [
                    {
                        id: "L1",
                        title: "Sorting and Searching",
                        type: "reading",
                        pdf: "materials/CS241-M2.pdf",
                    },
                ],
            },
        ],
        assignments: [
            {
                id: "A1",
                name: "Algorithm analysis",
                points: 50,
                due: "Sep 23, 2026, 11:00 PM",
                type: "quiz",
                status: "graded",
                questions: [
                    {
                        id: "Q1",
                        prompt: "What is the time complexity of binary search?",
                        options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
                        correctIndex: 1,
                    },
                    {
                        id: "Q2",
                        prompt: "Which structure uses LIFO ordering?",
                        options: ["Queue", "Stack", "Linked list", "Tree"],
                        correctIndex: 1,
                    },
                ],
            },
        ],
        students: [
            { id: "S1", name: "Von Quobie Ferrer", email: "von.ferrer@ascendone.edu", scores: { A1: 44 } },
            { id: "S2", name: "Marielle Bautista", email: "marielle.bautista@ascendone.edu", scores: { A1: 47 } },
            { id: "S5", name: "Rafael Domingo", email: "rafael.domingo@ascendone.edu", scores: { A1: 39 } },
        ],
    },
    {
        id: "IT332",
        code: "IT 332",
        units: 3,
        title: "Computer Networks",
        department: "Information Technology",
        description: "Understand how networked systems are designed, addressed, and secured.",
        color: "orange",
        modules: [
            {
                id: "IT332-M1",
                title: "Network Models and Addressing",
                lessons: [
                    { id: "L0", title: "Network Models and Addressing", type: "reading" },
                    { id: "L1", title: "IPv4 subnetting walkthrough", type: "video" },
                ],
            },
            {
                id: "IT332-M2",
                title: "Routing and Switching Essentials",
                lessons: [
                    {
                        id: "L1",
                        title: "Routing and Switching Essentials",
                        type: "reading",
                        pdf: "materials/IT332-M2.pdf",
                    },
                ],
            },
        ],
        assignments: [
            {
                id: "A1",
                name: "Network simulation lab",
                points: 100,
                due: "Sep 29, 2026, 11:00 PM",
                type: "upload",
                status: "open",
            },
        ],
        students: [
            { id: "S3", name: "Julian Torres", email: "julian.torres@ascendone.edu", scores: { A1: null } },
            { id: "S4", name: "Andrea Villaflor", email: "andrea.villaflor@ascendone.edu", scores: { A1: null } },
            { id: "S6", name: "Kaye Mendoza", email: "kaye.mendoza@ascendone.edu", scores: { A1: null } },
        ],
    },
    {
        id: "GE201",
        code: "GE 201",
        units: 3,
        title: "Research Methods",
        department: "General Education",
        description: "Build the skills to design, conduct, and report original research.",
        color: "pink",
        modules: [
            {
                id: "GE201-M1",
                title: "Forming a Research Question",
                lessons: [
                    { id: "L1", title: "Choosing a research problem", type: "reading" },
                ],
            },
            {
                id: "GE201-M2",
                title: "Research Methods and Ethics",
                lessons: [
                    {
                        id: "L1",
                        title: "Research Methods and Ethics",
                        type: "reading",
                        pdf: "materials/GE201-M2.pdf",
                    },
                ],
            },
        ],
        assignments: [
            {
                id: "A1",
                name: "Research proposal",
                points: 100,
                due: "Oct 1, 2026, 11:00 PM",
                type: "upload",
                status: "open",
            },
        ],
        students: [
            { id: "S1", name: "Von Quobie Ferrer", email: "von.ferrer@ascendone.edu", scores: { A1: null } },
            { id: "S5", name: "Rafael Domingo", email: "rafael.domingo@ascendone.edu", scores: { A1: null } },
        ],
    },
    {
        id: "IT320",
        code: "IT 320",
        units: 3,
        title: "Web Development",
        department: "Information Technology",
        description: "Build responsive, accessible websites from the ground up.",
        color: "teal",
        modules: [
            {
                id: "IT320-M1",
                title: "HTML and Semantic Structure",
                lessons: [
                    { id: "L1", title: "Flexbox & grid in practice", type: "reading" },
                    { id: "L2", title: "Media query breakpoints", type: "link" },
                ],
            },
            {
                id: "IT320-M2",
                title: "Responsive Layouts with CSS",
                lessons: [
                    {
                        id: "L1",
                        title: "Responsive Layouts with CSS",
                        type: "reading",
                        pdf: "materials/IT320-M2.pdf",
                    },
                ],
            },
        ],
        assignments: [
            {
                id: "A1",
                name: "Responsive portfolio",
                points: 100,
                due: "Oct 3, 2026, 11:00 PM",
                type: "upload",
                status: "open",
            },
        ],
        students: [
            { id: "S2", name: "Marielle Bautista", email: "marielle.bautista@ascendone.edu", scores: { A1: null } },
            { id: "S6", name: "Kaye Mendoza", email: "kaye.mendoza@ascendone.edu", scores: { A1: null } },
        ],
    },
    {
        id: "IT324",
        code: "IT 324",
        units: 3,
        title: "Database Management Systems",
        department: "Information Technology",
        description: "Model, normalize, and query relational databases effectively.",
        color: "indigo",
        modules: [
            {
                id: "IT324-M1",
                title: "Relational Model and ER Diagrams",
                lessons: [
                    { id: "L1", title: "Entity relationship diagrams", type: "reading" },
                ],
            },
            {
                id: "IT324-M2",
                title: "SQL Queries and Normalization",
                lessons: [
                    {
                        id: "L1",
                        title: "SQL Queries and Normalization",
                        type: "reading",
                        pdf: "materials/IT324-M2.pdf",
                    },
                ],
            },
        ],
        assignments: [
            {
                id: "A1",
                name: "Entity relationship diagram",
                points: 100,
                due: "Oct 5, 2026, 11:00 PM",
                type: "upload",
                status: "open",
            },
        ],
        students: [
            { id: "S3", name: "Julian Torres", email: "julian.torres@ascendone.edu", scores: { A1: null } },
            { id: "S4", name: "Andrea Villaflor", email: "andrea.villaflor@ascendone.edu", scores: { A1: null } },
            { id: "S5", name: "Rafael Domingo", email: "rafael.domingo@ascendone.edu", scores: { A1: null } },
        ],
    },
];

const TEACHER_ANNOUNCEMENTS = [
    {
        id: "AN1",
        courseId: "IT315",
        title: "Welcome to our design studio",
        body: "Bring your prototype to our next session. We will practice giving constructive feedback.",
        postedAt: "Sep 20, 2026",
    },
    {
        id: "AN2",
        courseId: "IT332",
        title: "Network lab reminder",
        body: "Check your subnet calculations before submitting your simulation lab.",
        postedAt: "Sep 24, 2026",
    },
    {
        id: "AN3",
        courseId: "CS241",
        title: "Quiz results posted",
        body: "Algorithm analysis quiz scores are up. Review sessions are open during consultation hours.",
        postedAt: "Sep 25, 2026",
    },
];

/* Derived helpers shared across pages */
function getCourseById(courseId) {
    return TEACHER_COURSES.find((course) => course.id === courseId) || null;
}

function courseGradePercent(course) {
    const graded = course.assignments.filter((a) => a.status === "graded");
    if (graded.length === 0) return null;

    let earned = 0;
    let possible = 0;
    graded.forEach((assignment) => {
        possible += assignment.points * course.students.length;
        course.students.forEach((student) => {
            earned += student.scores[assignment.id] || 0;
        });
    });

    return possible === 0 ? null : Math.round((earned / possible) * 100);
}

function studentPercent(course, student) {
    const graded = course.assignments.filter(
        (a) => a.status === "graded" && student.scores[a.id] != null
    );
    if (graded.length === 0) return null;

    let earned = 0;
    let possible = 0;
    graded.forEach((assignment) => {
        earned += student.scores[assignment.id];
        possible += assignment.points;
    });

    return possible === 0 ? null : Math.round((earned / possible) * 1000) / 10;
}
