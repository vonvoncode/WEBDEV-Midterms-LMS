(function () {
    const SUBMISSIONS_KEY = 'ascendone-submissions';

    /* ---------- Helpers ---------- */

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function findAssignment(id) {
        for (const course of COURSES) {
            const assignment = course.assignments.find((a) => a.id === id);
            if (assignment) {
                return { course, assignment };
            }
        }
        return null;
    }

    function gradePointFor(percent) {
        const row = GRADING_SCALE.find((r) => percent >= r.min);
        return (row ? row.points : 0).toFixed(2);
    }

    function formatNow() {
        return new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    function isPastDue(dueText) {
        const due = Date.parse(dueText);
        return !Number.isNaN(due) && Date.now() > due;
    }

    /* Submissions made in this tab (same lifetime as the rest of the demo) */
    function loadSubmissions() {
        try {
            return JSON.parse(sessionStorage.getItem(SUBMISSIONS_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveSubmission(id, submission) {
        const all = loadSubmissions();
        all[id] = submission;
        try {
            sessionStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
        } catch (e) {
            /* storage unavailable: submission still shows for this page view */
        }
    }

    function refreshIcons() {
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    /* ---------- Submission panel (three states) ---------- */

    function renderSubmission(context, editing) {
        const { assignment } = context;
        const detail = ASSESSMENT_DETAILS[assignment.id] || {};
        const body = document.getElementById('submission-body');

        const isGraded = assignment.status === 'graded';
        const submission = isGraded
            ? detail.submission
            : loadSubmissions()[assignment.id] || detail.submission || null;

        if (isGraded) {
            renderGraded(body, context, detail, submission);
        } else if (submission && !editing) {
            renderSubmitted(body, context, submission);
        } else {
            renderForm(body, context, Boolean(submission));
        }

        refreshIcons();
    }

    function renderGraded(body, { assignment }, detail, submission) {
        const earned = assignment.earnedPoints ?? 0;
        const percent = (earned / assignment.points) * 100;

        body.innerHTML = `
      <span class="badge good">Graded</span>
      ${submission
                ? `<p class="muted">Submitted ${escapeHTML(submission.submittedAt)}</p>
             <p class="answer-text">${escapeHTML(submission.answer)}</p>`
                : `<p class="muted">No submission on record.</p>`
            }
      <div class="feedback">
        <span class="eyebrow">Teacher feedback</span>
        <h3>${earned} / ${assignment.points} points · ${gradePointFor(percent)}</h3>
        <p>${escapeHTML(detail.feedback || 'No written feedback yet.')}</p>
      </div>
      <p class="hint">Graded submissions are locked.</p>
    `;
    }

    function renderSubmitted(body, context, submission) {
        body.innerHTML = `
      <span class="badge soft">Submitted</span>
      ${submission.late ? '<span class="badge danger">Late</span>' : ''}
      <p class="muted">Submitted ${escapeHTML(submission.submittedAt)}</p>
      <p class="answer-text">${escapeHTML(submission.answer)}</p>
      ${submission.fileName
                ? `<p class="hint">File record: ${escapeHTML(submission.fileName)}</p>`
                : ''
            }
      <div class="notice">
        Waiting for your teacher to grade this. You can replace your submission until it is graded.
      </div>
      <div class="actions" style="margin-top:16px;">
        <button class="button secondary" id="replace-btn" type="button">Replace submission</button>
      </div>
    `;

        document.getElementById('replace-btn').addEventListener('click', () => {
            renderSubmission(context, true);
        });
    }

    function renderForm(body, context, isReplacing) {
        const { assignment } = context;
        const existing = loadSubmissions()[assignment.id];

        body.innerHTML = `
      ${isReplacing ? '' : '<span class="badge soft">Not submitted</span>'}
      <form id="submission-form" novalidate>
        <div class="field">
          <label for="answer">Your answer</label>
          <textarea id="answer" rows="6" placeholder="Write your answer or paste a document link"></textarea>
        </div>
 
        <div class="field file-zone">
          <label for="file-record">Optional file record</label>
          <input type="file" id="file-record" />
          <small>Only the file name is recorded. File contents are not saved.</small>
        </div>
 
        <p class="form-error" id="submission-error" role="alert"></p>
 
        <div class="actions">
          <button class="button primary" type="submit">
            ${isReplacing ? 'Save replacement' : 'Submit assignment'}
          </button>
          ${isReplacing
                ? '<button class="button secondary" id="cancel-replace" type="button">Cancel</button>'
                : ''
            }
        </div>
      </form>
    `;

        const answerInput = document.getElementById('answer');
        const errorEl = document.getElementById('submission-error');

        // Textarea value is set via the DOM (not the template) so user text is never parsed as HTML
        if (existing) {
            answerInput.value = existing.answer;
        }

        answerInput.addEventListener('input', () => {
            errorEl.textContent = '';
        });

        if (isReplacing) {
            document.getElementById('cancel-replace').addEventListener('click', () => {
                renderSubmission(context, false);
            });
        }

        document.getElementById('submission-form').addEventListener('submit', (event) => {
            event.preventDefault();

            const answer = answerInput.value.trim();
            if (!answer) {
                errorEl.textContent = 'Write an answer or paste a link before submitting.';
                answerInput.focus();
                return;
            }

            const file = document.getElementById('file-record').files[0];

            saveSubmission(assignment.id, {
                answer,
                fileName: file ? file.name : '',
                submittedAt: formatNow(),
                late: isPastDue(assignment.due)
            });

            renderSubmission(context, false);

            if (window.showToast) {
                window.showToast(isReplacing ? 'Submission replaced.' : 'Assignment submitted.');
            }
        });
    }

    /* ---------- Page ---------- */

    function renderPage(context) {
        const { course, assignment } = context;
        const detail = ASSESSMENT_DETAILS[assignment.id] || {};

        document.title = `${assignment.name} · AscendOne`;

        const backLink = document.getElementById('back-link');
        backLink.href = `course-detail.html?id=${encodeURIComponent(course.id)}`;
        backLink.textContent = `← Back to ${course.title}`;

        document.getElementById('assignment-eyebrow').textContent = `${course.code} · Assignment`;
        document.getElementById('assignment-title').textContent = assignment.name;
        document.getElementById('assignment-points').textContent = `${assignment.points} points`;
        document.getElementById('due-text').textContent = `Due ${assignment.due}`;
        document.getElementById('late-text').textContent =
            detail.allowLate === false ? 'Late submissions closed' : 'Late submissions allowed';
        document.getElementById('instructions-text').textContent =
            detail.instructions || 'No instructions provided for this assignment.';

        renderSubmission(context, false);

        document.getElementById('assignment-content').hidden = false;
        refreshIcons();
    }

    function init() {
        const id = new URLSearchParams(window.location.search).get('id');
        const context = findAssignment(id);

        if (context) {
            renderPage(context);
        } else {
            document.getElementById('not-found').hidden = false;
            refreshIcons();
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();