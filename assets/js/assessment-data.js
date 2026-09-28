const GRADING_SCALE = [
    { min: 98, points: 4.0 },
    { min: 95, points: 3.75 },
    { min: 92, points: 3.5 },
    { min: 89, points: 3.25 },
    { min: 86, points: 3.0 },
    { min: 83, points: 2.75 },
    { min: 80, points: 2.5 },
    { min: 77, points: 2.25 },
    { min: 74, points: 2.0 },
    { min: 71, points: 1.75 },
    { min: 68, points: 1.5 },
    { min: 64, points: 1.25 },
    { min: 60, points: 1.0 },
    { min: 0, points: 0.0 }
];

const ASSESSMENT_DETAILS = {
    "IT315-A1": {
        instructions: "Evaluate the navigation and accessibility of a website. Explain three improvements.",
        allowLate: true,
        submission: {
            submittedAt: "Sep 22, 2026, 11:00 PM",
            answer:
                "I reviewed keyboard navigation, color contrast, and form labels. My recommendations are visible focus indicators, darker text, and descriptive labels."
        },
        feedback: "Clear observations. Add evidence from user testing next time."
    },

    "IT315-A2": {
        instructions:
            "Run a short usability test with three participants and report your findings with recommended fixes.",
        allowLate: true,
        submission: null,
        feedback: null
    },

    "CS241-A1": {
        instructions:
            "Compare the time complexity of two sorting algorithms and justify which one fits a given data set.",
        allowLate: true,
        submission: {
            submittedAt: "Sep 22, 2026, 9:30 PM",
            answer:
                "Merge sort guarantees O(n log n) in every case, while quicksort averages O(n log n) but degrades to O(n^2) on already sorted input. For a large, unsorted data set I would choose quicksort with a random pivot."
        },
        feedback: "Solid comparison. Mention memory usage to strengthen your justification."
    },

    "IT332-A1": {
        instructions:
            "Simulate a small network with two subnets and document your addressing plan and test results.",
        allowLate: true,
        submission: null,
        feedback: null
    },

    "GE201-A1": {
        instructions:
            "Draft a one-page research proposal with a research question, method, and expected outcome.",
        allowLate: true,
        submission: null,
        feedback: null
    },

    "IT320-A1": {
        instructions:
            "Build a responsive personal portfolio page that works from phone screens to desktop.",
        allowLate: true,
        submission: null,
        feedback: null
    },

    "IT324-A1": {
        instructions:
            "Design an entity relationship diagram for a small library system, including keys and cardinalities.",
        allowLate: true,
        submission: null,
        feedback: null
    }
};