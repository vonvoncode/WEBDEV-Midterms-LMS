(function () {
    function findModule(id, lessonId) {
        const module = MODULES.find((item) => item.id === id);
        if (!module) return null;

        const course = COURSES.find((item) => item.id === module.courseId);
        if (!course) return null;

        const lesson = module.lessons?.find((item) => item.id === lessonId);
        return { module, course, lesson };
    }

    function refreshIcons() {
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function renderPage({ module, course, lesson }) {
        const pdfPath = lesson?.pdf || module.pdf;
        const fileName = pdfPath.split("/").pop();
        const pageTitle = lesson?.title || module.title;

        document.title = `${pageTitle} · AscendOne`;

        const backLink = document.getElementById("back-link");
        backLink.href =
            `student-course-detail.html?id=${encodeURIComponent(course.id)}`;
        backLink.textContent = `← Back to ${course.title}`;

        document.getElementById("module-eyebrow").textContent =
            `${course.code} · Module ${module.number}`;
        document.getElementById("module-title").textContent = pageTitle;
        document.getElementById("module-description").textContent =
            module.description;
        document.getElementById("pdf-name").textContent = fileName;

        document.getElementById("pdf-frame").src = `${pdfPath}#view=FitH`;

        const openLink = document.getElementById("pdf-open");
        openLink.href = pdfPath;

        const downloadLink = document.getElementById("pdf-download");
        downloadLink.href = pdfPath;
        downloadLink.setAttribute("download", fileName);

        recordRecentModule(module.id);
        document.getElementById("module-content").hidden = false;
        refreshIcons();
    }

    function init() {
        const params = new URLSearchParams(window.location.search);
        const context = findModule(params.get("id"), params.get("lesson"));

        if (context) {
            renderPage(context);
        } else {
            document.getElementById("not-found").hidden = false;
            refreshIcons();
        }
    }

    document.addEventListener("DOMContentLoaded", init);
})();