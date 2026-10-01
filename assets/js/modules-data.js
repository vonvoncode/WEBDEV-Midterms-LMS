const MODULES = [
    /* IT 315 · Interface Design Systems */
    {
        id: "IT315-M1",
        courseId: "IT315",
        number: 1,
        title: "Foundations of Interface Design",
        description:
            "Core principles of layout, hierarchy, and consistency, and how design systems keep interfaces coherent.",
        pdf: "materials/IT315-M2.pdf"
    },
    {
        id: "IT315-M2",
        courseId: "IT315",
        number: 2,
        title: "Accessibility and Usability Basics",
        description:
            "How to evaluate navigation, contrast, and keyboard access, and how to run a simple usability review.",
        pdf: "materials/IT315-M2.pdf"
    },

    /* CS 241 · Data Structures & Algorithms */
    {
        id: "CS241-M1",
        courseId: "CS241",
        number: 1,
        title: "Arrays, Lists, and Complexity",
        description:
            "Common linear data structures and how to reason about their time and space complexity.",
        pdf: "materials/CS241-M1.pdf"
    },
    {
        id: "CS241-M2",
        courseId: "CS241",
        number: 2,
        title: "Sorting and Searching",
        description:
            "Comparing classic sorting and searching algorithms and choosing the right one for a data set.",
        pdf: "materials/CS241-M2.pdf"
    },

    /* IT 332 · Computer Networks */
    {
        id: "IT332-M1",
        courseId: "IT332",
        number: 1,
        title: "Network Models and Addressing",
        description:
            "The layered network models, IP addressing, and the fundamentals of subnetting.",
        pdf: "materials/IT332-M1.pdf"
    },
    {
        id: "IT332-M2",
        courseId: "IT332",
        number: 2,
        title: "Routing and Switching Essentials",
        description:
            "How packets move between networks and how switches and routers make forwarding decisions.",
        pdf: "materials/IT332-M2.pdf"
    },

    /* GE 201 · Research Methods */
    {
        id: "GE201-M1",
        courseId: "GE201",
        number: 1,
        title: "Forming a Research Question",
        description:
            "How to narrow a broad topic into a focused, answerable research question.",
        pdf: "materials/GE201-M1.pdf"
    },
    {
        id: "GE201-M2",
        courseId: "GE201",
        number: 2,
        title: "Research Methods and Ethics",
        description:
            "Qualitative and quantitative approaches, sampling, and responsible research practice.",
        pdf: "materials/GE201-M2.pdf"
    },

    /* IT 320 · Web Development */
    {
        id: "IT320-M1",
        courseId: "IT320",
        number: 1,
        title: "HTML and Semantic Structure",
        description:
            "Building meaningful page structure with semantic HTML and accessible markup.",
        pdf: "materials/IT320-M1.pdf"
    },
    {
        id: "IT320-M2",
        courseId: "IT320",
        number: 2,
        title: "Responsive Layouts with CSS",
        description:
            "Flexbox, grid, and media queries for layouts that adapt from phone screens to desktop.",
        pdf: "materials/IT320-M2.pdf"
    },

    /* IT 324 · Database Management Systems */
    {
        id: "IT324-M1",
        courseId: "IT324",
        number: 1,
        title: "Relational Model and ER Diagrams",
        description:
            "Entities, relationships, and keys, and how to translate an ER diagram into tables.",
        pdf: "materials/IT324-M1.pdf"
    },
    {
        id: "IT324-M2",
        courseId: "IT324",
        number: 2,
        title: "SQL Queries and Normalization",
        description:
            "Writing core SQL queries and normalizing tables to reduce redundancy.",
        pdf: "materials/IT324-M2.pdf"
    },

    /* MT 334 · Statistics & Probability */
    {
        id: "MT334-M1",
        courseId: "MT334",
        number: 1,
        title: "Problem Solving and Solution making",
        description:
            "Learning Problem solving and Solution Identification.",
        pdf: "materials/MT334-M1.pdf"
    }
];

const LESSONS_BY_MODULE = {
    "IT315-M1": [
        { title: "Principles of visual hierarchy", type: "reading" },
        { title: "Walkthrough: heuristic evaluation", type: "video" },
    ],
    "IT315-M2": [
        { title: "Low-fidelity vs high-fidelity prototypes", type: "reading" },
        { title: "Figma component libraries", type: "link" },
    ],
    "CS241-M1": [
        { title: "Arrays, stacks, and queues", type: "reading" },
        { title: "Linked list traversal", type: "video" },
    ],
    "CS241-M2": [
        { title: "Sorting and Searching", type: "reading" },
    ],
    "IT332-M1": [
        { title: "Network Models and Addressing", type: "reading" },
        { title: "IPv4 subnetting walkthrough", type: "video" },
    ],
    "IT332-M2": [
        { title: "Routing and Switching Essentials", type: "reading" },
    ],
    "GE201-M1": [
        { title: "Choosing a research problem", type: "reading" },
    ],
    "GE201-M2": [
        { title: "Research Methods and Ethics", type: "reading" },
    ],
    "IT320-M1": [
        { title: "Flexbox & grid in practice", type: "reading" },
        { title: "Media query breakpoints", type: "link" },
    ],
    "IT320-M2": [
        { title: "Responsive Layouts with CSS", type: "reading" },
    ],
    "IT324-M1": [
        { title: "Entity relationship diagrams", type: "reading" },
    ],
    "IT324-M2": [
        { title: "SQL Queries and Normalization", type: "reading" },
    ],
    // "MT334-M1": [
    //     { title: "Problem Solving and Solution making", type: "reading" },
    // ],
};

MODULES.forEach((module) => {
    module.lessons = (LESSONS_BY_MODULE[module.id] || []).map((lesson, index) => ({
        id: `${module.id}-L${index + 1}`,
        title: lesson.title,
        type: lesson.type,
        ...(index === 0 && lesson.type === "reading"
            ? { pdf: module.pdf }
            : {}),
    }));
});

const RECENT_MODULES_KEY = "ascendone-recent-modules";
const RECENT_MODULES_LIMIT = 4;

function getRecentModuleIds() {
    try {
        const stored = JSON.parse(sessionStorage.getItem(RECENT_MODULES_KEY));
        return Array.isArray(stored) ? stored : [];
    } catch (e) {
        return [];
    }
}

function recordRecentModule(id) {
    // Most recent first, no duplicates, capped
    const updated = [id, ...getRecentModuleIds().filter((existing) => existing !== id)].slice(
        0,
        RECENT_MODULES_LIMIT
    );

    try {
        sessionStorage.setItem(RECENT_MODULES_KEY, JSON.stringify(updated));
    } catch (e) {

    }
}