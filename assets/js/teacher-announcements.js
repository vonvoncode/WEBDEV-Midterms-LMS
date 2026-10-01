        function buildAnnouncementCard(announcement) {
            const course = getCourseById(announcement.courseId);
            const div = document.createElement("div");
            div.className = "panel announcement-card";
            div.innerHTML = `
            <span class="course-icon ${course ? course.color : "purple"}">
            <i class="icon" data-lucide="book-open"></i>
            </span>
            <div>
            <div class="section-heading">
                <div>
                <small>${course ? course.title : "General"}</small>
                <h3>${announcement.title}</h3>
                </div>
                <time>${announcement.postedAt}</time>
            </div>
            <p>${announcement.body}</p>
            </div>
        `;
            return div;
        }

        function renderAnnouncementList(filterValue) {
            const filtered =
                filterValue === "all"
                    ? TEACHER_ANNOUNCEMENTS
                    : TEACHER_ANNOUNCEMENTS.filter((a) => a.courseId === filterValue);

            const list = document.getElementById("announcement-list");
            list.innerHTML = "";
            [...filtered].reverse().forEach((announcement) => list.appendChild(buildAnnouncementCard(announcement)));

            document.getElementById("no-announcements").hidden = filtered.length !== 0;

            if (window.lucide) {
                lucide.createIcons();
            }
        }

        function init() {
            document.getElementById("sidebar-name").textContent = getTeacherDisplayName();
            document.getElementById("sidebar-avatar").textContent = teacherInitials(getTeacherDisplayName());

            document.getElementById("announcement-filter").addEventListener("change", (event) => {
                renderAnnouncementList(event.target.value);
            });

            let pendingAnnouncement = null;

            const postAnnouncementDialog = document.getElementById(
                "post-announcement-confirm-dialog"
            );

            document
                .getElementById("post-announcement-form")
                .addEventListener("submit", (event) => {
                    event.preventDefault();

                    const errorEl = document.getElementById("post-announcement-error");
                    errorEl.textContent = "";

                    const courseId = document.getElementById("announcement-course").value;
                    const title = document.getElementById("announcement-title").value.trim();
                    const body = document.getElementById("announcement-body").value.trim();

                    if (!title || !body) {
                        errorEl.textContent = "Please add both a title and a message.";
                        return;
                    }

                    pendingAnnouncement = {
                        id: `AN-${Date.now()}`,
                        courseId,
                        title,
                        body,
                        postedAt: "Just now",
                    };

                    document.getElementById("announcement-title-to-post").textContent =
                        title;

                    postAnnouncementDialog.showModal();
                });

            document
                .getElementById("cancel-post-announcement")
                .addEventListener("click", () => {
                    postAnnouncementDialog.close();
                    pendingAnnouncement = null;
                });

            document
                .getElementById("confirm-post-announcement")
                .addEventListener("click", () => {
                    if (!pendingAnnouncement) return;

                    const courseId = pendingAnnouncement.courseId;
                    TEACHER_ANNOUNCEMENTS.push(pendingAnnouncement);
                    pendingAnnouncement = null;

                    document.getElementById("post-announcement-form").reset();
                    document.getElementById("announcement-course").value = courseId;
                    document.getElementById("announcement-filter").value = courseId;

                    postAnnouncementDialog.close();
                    renderAnnouncementList(courseId);
                    showToast("Announcement posted.");
                });

            postAnnouncementDialog.addEventListener("cancel", () => {
                pendingAnnouncement = null;
            });

            renderAnnouncementList("all");

            if (window.lucide) {
                lucide.createIcons();
            }
        }

        document.addEventListener("DOMContentLoaded", init);
