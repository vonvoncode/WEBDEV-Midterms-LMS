document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("course");
    const moduleId = params.get("module");
    const lessonId = params.get("lesson");

    const storeKey = "ascendone-teacher-modules-session";

    let store = {};
    try {
        store = JSON.parse(sessionStorage.getItem(storeKey)) || {};
    } catch (error) {
        store = {};
    }

    const course = getCourseById(courseId);
    if (course && Array.isArray(store[course.id])) {
        course.modules = store[course.id];
    }

    const module = course?.modules.find((item) => item.id === moduleId);
    const lesson = module?.lessons.find((item) => item.id === lessonId);

    if (!course || !module || !lesson) {
        document.getElementById("editor-heading").textContent =
            "Lesson not found";
        return;
    }

    const studentModule = MODULES.find((item) => item.id === moduleId);
    const readingWithPdf = studentModule?.lessons?.find(
        (item) => item.type === "reading" && item.pdf
    );

    const currentPdfPath = lesson.pdfRemoved
        ? ""
        : lesson.pdf ||
        (lesson.type === "reading" ? readingWithPdf?.pdf : "") ||
        "";

    if (currentPdfPath) {
        const currentPdfSection = document.getElementById("current-pdf-section");
        const fileName = currentPdfPath.split("/").pop();

        document.getElementById("current-pdf-name").textContent = fileName;
        document.getElementById("current-pdf-open").href = currentPdfPath;
        document.getElementById("current-pdf-frame").src =
            `${currentPdfPath}#view=FitH`;
        currentPdfSection.hidden = false;

        const removePdfDialog = document.getElementById("remove-pdf-dialog");

        document.getElementById("remove-current-pdf").addEventListener("click", () => {
            removePdfDialog.showModal();
        });

        document.getElementById("cancel-remove-pdf").addEventListener("click", () => {
            removePdfDialog.close();
        });

        document.getElementById("confirm-remove-pdf").addEventListener("click", () => {
            lesson.pdfRemoved = true;
            delete lesson.pdf;

            store[course.id] = course.modules;
            sessionStorage.setItem(storeKey, JSON.stringify(store));

            currentPdfSection.hidden = true;
            removePdfDialog.close();
        });
    }


    const returnUrl =
        `teacher-courses.html?id=${encodeURIComponent(course.id)}`;

    document.getElementById("back-to-course").href = returnUrl;
    document.getElementById("cancel-edit").href = returnUrl;
    document.getElementById("editor-heading").textContent =
        `${module.title} · Lesson`;

    document.getElementById("editor-title").value = lesson.title;
    document.getElementById("editor-type").value = lesson.type;
    document.getElementById("editor-content").value = lesson.content || "";

    let previewUrl = null;

    document.getElementById("editor-pdf").addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = URL.createObjectURL(file);

        document.getElementById("pdf-preview-name").textContent = file.name;
        document.getElementById("pdf-preview").src = previewUrl;
        document.getElementById("pdf-preview-panel").hidden = false;
    });

    document.getElementById("lesson-editor-form").addEventListener("submit", (event) => {
        event.preventDefault();

        lesson.title = document.getElementById("editor-title").value.trim();
        lesson.type = document.getElementById("editor-type").value;
        lesson.content = document.getElementById("editor-content").value.trim();

        store[course.id] = course.modules;
        sessionStorage.setItem(storeKey, JSON.stringify(store));

        window.location.href = returnUrl;
    });
});