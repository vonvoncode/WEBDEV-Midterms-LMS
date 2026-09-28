(function () {
    const TODO_LIMIT = 4;

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function dueTime(dueText) {
        const time = Date.parse(dueText);
        return Number.isNaN(time) ? Infinity : time;
    }

    /* ---------- To-do ---------- */

    function renderTodo() {
        const tbody = document.getElementById('todo-rows');
        if (!tbody) return;

        const open = [];
        COURSES.forEach((course) => {
            course.assignments.forEach((assignment) => {
                if (assignment.status !== 'graded') {
                    open.push({ course, assignment });
                }
            });
        });

        open.sort((a, b) => dueTime(a.assignment.due) - dueTime(b.assignment.due));
        const shown = open.slice(0, TODO_LIMIT);

        if (shown.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="muted">You\'re all caught up.</td></tr>';
            return;
        }

        tbody.innerHTML = shown
            .map(
                ({ course, assignment }) => `
          <tr>
            <td>
              <a class="table-link" href="student-assignment-detail.html?id=${encodeURIComponent(assignment.id)}">${escapeHTML(assignment.name)}</a>
              <small>${assignment.points} points</small>
            </td>
            <td>${escapeHTML(course.title)}</td>
            <td>${escapeHTML(assignment.due)}</td>
            <td><span class="badge soft">Open</span></td>
          </tr>`
            )
            .join('');
    }

    /* ---------- Course modules (last viewed) ---------- */

    function pickModules() {
        const recent = getRecentModuleIds()
            .map((id) => MODULES.find((m) => m.id === id))
            .filter(Boolean)
            .slice(0, RECENT_MODULES_LIMIT);

        if (recent.length > 0) {
            return { modules: recent, hasHistory: true };
        }

        // Nothing opened yet in this tab: suggest the first module of the first few courses
        const suggestions = COURSES.slice(0, RECENT_MODULES_LIMIT)
            .map((course) => MODULES.find((m) => m.courseId === course.id))
            .filter(Boolean);

        return { modules: suggestions, hasHistory: false };
    }

    function renderModules() {
        const list = document.getElementById('dashboard-modules');
        if (!list) return;

        const { modules, hasHistory } = pickModules();

        const subtitle = document.getElementById('modules-subtitle');
        if (subtitle) {
            subtitle.textContent = hasHistory ? 'Last viewed modules' : 'Start with these modules';
        }

        if (modules.length === 0) {
            list.innerHTML = '<p class="muted" style="padding:20px 0;">No modules have been posted yet.</p>';
            return;
        }

        list.innerHTML = modules
            .map((module) => {
                const course = COURSES.find((c) => c.id === module.courseId);
                const label = course ? `${course.code} · Module ${module.number}` : `Module ${module.number}`;

                return `
          <a href="student-module-detail.html?id=${encodeURIComponent(module.id)}">
            <span class="activity-icon"><i class="icon" data-lucide="file-text"></i></span>
            <div>
              <strong>${escapeHTML(module.title)}</strong>
              <small>${escapeHTML(label)}</small>
            </div>
            <i class="icon" data-lucide="chevron-right"></i>
          </a>`;
            })
            .join('');
    }

    function init() {
        renderTodo();
        renderModules();

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();