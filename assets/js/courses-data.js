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
        percent: "91.00%",
        gpa: "3.25",
        assignments: [
            { name: "Interface audit", points: 100, earnedPoints: 91, due: "Sep 21, 2026, 11:00 PM", status: "graded" },
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
        percent: "88.00%",
        gpa: "3.00",
        assignments: [
            { name: "Algorithm analysis", points: 50, earnedPoints: 44, due: "Sep 23, 2026, 11:00 PM", status: "graded" }
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
        percent: null,
        gpa: null,
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
        percent: null,
        gpa: null,
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
        percent: null,
        gpa: null,
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
        percent: null,
        gpa: null,
        assignments: [
            { name: "Entity relationship diagram", points: 100, due: "Oct 5, 2026, 11:00 PM", status: "open" }
        ]
    }
];