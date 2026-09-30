function buildModalRow(assignment, courseTitle) {
    const tr = document.createElement("tr");

    const badgeClass = assignment.status === "graded" ? "badge good" : "badge soft";
    const badgeLabel = assignment.status === "graded" ? "Graded" : "Open";

    const earnedLabel = assignment.earnedPoints != null
        ? `<small class="${badgeClass}">${assignment.earnedPoints} points</small>`
        : "";

    tr.innerHTML = `
    <td>
      <a class="table-link" href="student-assignment-detail.html?id=${assignment.id}">${assignment.name}</a>
      ${earnedLabel}
    </td>
    <td>${courseTitle}</td>
    <td>${assignment.due}</td>
    <td><span class="${badgeClass}">${badgeLabel}</span></td>
  `;

    return tr;
}

function openGradeModal(courseId) {
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return;

    // const gradedAssignments = course.assignments.filter((a) => a.status === "graded");
    // // const earned = gradedAssignments.reduce((sum, a) => sum + (a.earnedPoints ?? 0), 0);
    // const possible = gradedAssignments.reduce((sum, a) => sum + a.points, 0);

    document.getElementById("modal-course-title").textContent = course.title;

    // const summaryEl = document.getElementById("modal-summary");
    // if (gradedAssignments.length > 0) {
    //     summaryEl.textContent = `${earned} earned / ${possible} graded possible points`;
    // } else {
    //     summaryEl.textContent = "No graded assignments yet.";
    // }

    const rowsBody = document.getElementById("modal-assignment-rows");
    rowsBody.innerHTML = "";
    course.assignments.forEach((assignment) => {
        rowsBody.appendChild(buildModalRow(assignment, course.title));
    });

    const modal = document.getElementById("grade-modal");
    modal.showModal();

    if (window.lucide) {
        lucide.createIcons();
    }
}

function init() {
    document.querySelectorAll("[data-details-for]").forEach((button) => {
        button.addEventListener("click", () => {
            openGradeModal(button.dataset.detailsFor);
        });
    });

    const modal = document.getElementById("grade-modal");

    document.getElementById("modal-cancel").addEventListener("click", () => modal.close());
    document.getElementById("modal-done").addEventListener("click", () => modal.close());
    document.getElementById("modal-close").addEventListener("click", () => modal.close());

    // Close when clicking the backdrop
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.close();
        }
    });
}

document.addEventListener("DOMContentLoaded", init);