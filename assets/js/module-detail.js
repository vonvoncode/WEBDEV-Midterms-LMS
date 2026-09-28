(function () {
    function findModule(id) {
        const module = MODULES.find((m) => m.id === id);
        if (!module) return null;

        const course = COURSES.find((c) => c.id === module.courseId);
        return course ? { module, course } : null;
    }

    function refreshIcons() {
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function renderPage({ module, course }) {
        const fileName = module.pdf.split('/').pop();

        document.title = `${module.title} · AscendOne`;

        const backLink = document.getElementById('back-link');
        backLink.href = `course-detail.html?id=${encodeURIComponent(course.id)}`;
        backLink.textContent = `← Back to ${course.title}`;

        document.getElementById('module-eyebrow').textContent = `${course.code} · Module ${module.number}`;
        document.getElementById('module-title').textContent = module.title;
        document.getElementById('module-description').textContent = module.description;
        document.getElementById('pdf-name').textContent = fileName;

        document.getElementById('pdf-frame').src = `${module.pdf}#view=FitH`;

        const openLink = document.getElementById('pdf-open');
        openLink.href = module.pdf;

        const downloadLink = document.getElementById('pdf-download');
        downloadLink.href = module.pdf;
        downloadLink.setAttribute('download', fileName);

        // Feeds the "Last viewed modules" panel on the dashboard
        recordRecentModule(module.id);

        document.getElementById('module-content').hidden = false;
        refreshIcons();
    }

    function init() {
        const id = new URLSearchParams(window.location.search).get('id');
        const context = findModule(id);

        if (context) {
            renderPage(context);
        } else {
            document.getElementById('not-found').hidden = false;
            refreshIcons();
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();