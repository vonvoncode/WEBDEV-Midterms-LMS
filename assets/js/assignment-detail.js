(function () {
    const SUBMISSIONS_KEY = 'ascendone-submissions';
    // Initial submission is free; only successfully saved replacements count.
    const MAX_SUBMISSION_REPLACEMENTS = 3;

    function getReplacementState(submission) {
        const used = Number.isSafeInteger(submission?.replacementCount)
            && submission.replacementCount >= 0 ? submission.replacementCount : 0;
        const limit = Number.isSafeInteger(MAX_SUBMISSION_REPLACEMENTS)
            && MAX_SUBMISSION_REPLACEMENTS >= 0 ? MAX_SUBMISSION_REPLACEMENTS : 0;
        return { used, limit, remaining: Math.max(0, limit - used) };
    }

    function currentSubmission(assignment) {
        return loadSubmissions()[assignment.id]
            || ASSESSMENT_DETAILS[assignment.id]?.submission || null;
    }

    function submissionBlockReason(assignment, submission) {
        if (assignment.status === 'graded') return 'Graded submissions are locked.';
        const detail = ASSESSMENT_DETAILS[assignment.id] || {};
        if (detail.allowLate === false && isPastDue(assignment.due)) {
            return 'Submissions are closed for this assignment.';
        }
        if (submission && getReplacementState(submission).remaining === 0) {
            return 'Replacement limit reached.';
        }
        return '';
    }

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
            throw new Error('Unable to save your submission. Please try again.');
        }
    }


    // File bytes live in IndexedDB; submission metadata stays in sessionStorage.
    function fileStore(action, key, file) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ascendone-submission-files', 1);
            request.onupgradeneeded = () => request.result.createObjectStore('files');
            request.onerror = () => reject(new Error('File storage is unavailable. Please try again.'));
            request.onblocked = () => reject(new Error('Close other assignment tabs and try again.'));
            request.onsuccess = () => {
                const db = request.result;
                const tx = db.transaction('files', action === 'get' ? 'readonly' : 'readwrite');
                const store = tx.objectStore('files');
                const operation = action === 'put' ? store.put(file, key)
                    : action === 'delete' ? store.delete(key) : store.get(key);
                tx.oncomplete = () => { db.close(); resolve(operation.result); };
                tx.onabort = () => { db.close(); reject(new Error('The file could not be saved or read. Please try again.')); };
                tx.onerror = () => { }; // onabort reports transaction failures.
            };
        });
    }

    const fileUrls = new Set();
    window.addEventListener('pagehide', () => {
        fileUrls.forEach((url) => URL.revokeObjectURL(url));
        fileUrls.clear();
    });
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) window.location.reload();
    });

    async function displayFile(body, submission) {
        if (!submission?.fileName) return;
        const row = document.createElement('p');
        row.className = 'hint';
        row.textContent = 'File: ' + submission.fileName + ' (loading…)';
        body.appendChild(row);
        if (!submission.fileId) {
            row.textContent = 'File: ' + submission.fileName + ' — only the name was saved; file unavailable.';
            return;
        }
        try {
            const file = await fileStore('get', submission.fileId);
            if (!row.isConnected) return;
            if (!(file instanceof Blob)) throw new Error('File unavailable in this browser.');
            // Do not execute uploaded HTML/SVG as a same-origin document.
            const previewTypes = ['application/pdf', 'text/plain', 'image/png', 'image/jpeg',
                'image/gif', 'image/webp', 'image/avif', 'audio/mpeg', 'audio/ogg',
                'audio/wav', 'video/mp4', 'video/webm'];
            const preview = previewTypes.includes(file.type);
            const blob = preview ? file : file.slice(0, file.size, 'application/octet-stream');
            const url = URL.createObjectURL(blob);
            fileUrls.add(url);
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = submission.fileName;
            if (!preview) link.download = submission.fileName;
            row.replaceChildren('File: ', link);
        } catch (error) {
            row.textContent = 'File: ' + submission.fileName + ' — ' + error.message;
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
        const submission = currentSubmission(assignment);

        if (isGraded) {
            renderGraded(body, context, detail, submission);
        } else if (submission && (!editing || submissionBlockReason(assignment, submission))) {
            renderSubmitted(body, context, submission);
        } else {
            renderForm(body, context, Boolean(submission));
        }

        if (isGraded || (submission && (!editing || submissionBlockReason(assignment, submission)))) {
            displayFile(body, submission);
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
        <br/>
        <h3 class="gradeBox">${earned} / ${assignment.points} points · ${gradePointFor(percent)}</h3>
        <p>${escapeHTML(detail.feedback || 'No written feedback yet.')}</p>
      </div>
      <p class="hint">Graded submissions are locked.</p>
    `;
    }

    function renderSubmitted(body, context, submission) {
        const { used, limit, remaining } = getReplacementState(submission);
        const blocked = submissionBlockReason(context.assignment, submission);
        body.innerHTML = `
      <span class="badge good2">Submitted</span>
      ${submission.late ? '<span class="badge danger">Late</span>' : ''}
      <p class="muted">Submitted ${escapeHTML(submission.submittedAt)}</p>
      <div class="callout">
      <p class="answer-text">${escapeHTML(submission.answer)}</p>
      </div>
      <div class="notice">
        Waiting for your teacher to grade this. ${used} of ${limit} replacements used; ${remaining} remaining. ${blocked ? escapeHTML(blocked) : "You can replace your submission while submissions are open and it is ungraded."}
      </div>
      <div class="actions" style="margin-top:16px;">
        <button class="button secondary" id="replace-btn" type="button" ${blocked ? "disabled" : ""}>Replace submission</button>
      </div>
    `;

        document.getElementById('replace-btn').addEventListener('click', () => {
            renderSubmission(context, true);
        });
    }

    function renderForm(body, context, isReplacing) {
        const { assignment } = context;
        const existing = currentSubmission(assignment);

        body.innerHTML = `
      ${isReplacing ? '' : '<span class="badge soft">Not submitted</span>'}
      <form id="submission-form" novalidate>
        <div class="field">
          <label for="answer">Your answer</label>
          <textarea id="answer" rows="6" placeholder="Write your answer or paste a document link"></textarea>
        </div>
 
        <div class="field file-zone">
          <label for="file-record">Attachment (optional)</label>
          <input type="file" id="file-record" />
          <small>Files are stored in this browser. Click the saved file name to open it. Leave empty to keep your current attachment.</small>
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

        let saving = false;
        document.getElementById('submission-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (saving) return;

            const latest = currentSubmission(assignment);
            const blocked = submissionBlockReason(assignment, latest);
            if (blocked) {
                errorEl.textContent = blocked;
                return;
            }

            const answer = answerInput.value.trim();
            if (!answer) {
                errorEl.textContent = 'Write an answer or paste a link before submitting.';
                answerInput.focus();
                return;
            }

            const file = document.getElementById('file-record').files[0];

            saving = true;
            const controls = [...document.getElementById('submission-form').querySelectorAll('button, input, textarea')];
            controls.forEach((control) => { control.disabled = true; });
            let newFileId = null;
            try {
                if (file) {
                    newFileId = crypto.randomUUID();
                    await fileStore('put', newFileId, file);
                }
                const recheck = submissionBlockReason(assignment, currentSubmission(assignment));
                if (recheck) throw new Error(recheck);
                saveSubmission(assignment.id, {
                    answer,
                    fileName: file ? file.name : (latest?.fileName || ''),
                    fileId: newFileId || latest?.fileId || null,
                    submittedAt: formatNow(),
                    late: isPastDue(assignment.due),
                    replacementCount: latest
                        ? getReplacementState(latest).used + 1 : 0
                });
            } catch (error) {
                if (newFileId) fileStore('delete', newFileId).catch(() => { });
                errorEl.textContent = error.message;
                saving = false;
                controls.forEach((control) => { control.disabled = false; });
                return;
            }

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
        backLink.href = `student-course-detail.html?id=${encodeURIComponent(course.id)}`;
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