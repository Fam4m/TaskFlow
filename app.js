/* ===================================
   TaskFlow v2 - Application Logic
   ================================== */

// State
const state = {
    tasks: [],
    habits: [],
    habitCompletions: {}, // { 'YYYY-MM-DD': ['habitId1', 'habitId2'] }
    progressHistory: [],
    dailyCheckIns: {},
    trackerMonth: new Date(),
    currentFilter: 'all',
    currentTab: 'tasks',
    searchQuery: '',
    chart: null
};

// DOM Elements
const elements = {
    // Stats
    totalTasks: document.getElementById('total-tasks'),
    completedTasks: document.getElementById('completed-tasks'),

    // Tabs
    tabNav: document.querySelector('.tab-nav'),
    tabSlider: document.getElementById('tab-slider'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Task Form
    taskForm: document.getElementById('task-form'),
    taskTitle: document.getElementById('task-title'),
    taskPriority: document.getElementById('task-priority'),
    taskCategory: document.getElementById('task-category'),

    // Task List
    taskList: document.getElementById('task-list'),
    emptyState: document.getElementById('empty-state'),
    filterBtns: document.querySelectorAll('.filter-chip'),

    // Timeline
    projectTimelines: document.getElementById('project-timelines'),
    timelineEmpty: document.getElementById('timeline-empty'),

    // Analytics
    progressChart: document.getElementById('progress-chart'),
    streakCount: document.getElementById('streak-count'),
    tasksToday: document.getElementById('tasks-today'),
    avgProgress: document.getElementById('avg-progress'),

    // Overview
    ringProgress: document.getElementById('ring-progress'),
    progressRingValue: document.getElementById('ring-progress'),
    highPriorityBar: document.getElementById('high-priority-bar'),
    mediumPriorityBar: document.getElementById('medium-priority-bar'),
    lowPriorityBar: document.getElementById('low-priority-bar'),
    highCount: document.getElementById('high-count'),
    mediumCount: document.getElementById('medium-count'),
    lowCount: document.getElementById('low-count'),
    categoryList: document.getElementById('category-list'),

    // Modal
    editModal: document.getElementById('edit-modal'),
    editForm: document.getElementById('edit-form'),
    editTaskId: document.getElementById('edit-task-id'),
    editTitle: document.getElementById('edit-title'),
    editDescription: document.getElementById('edit-description'),
    editPriority: document.getElementById('edit-priority'),
    editCategory: document.getElementById('edit-category'),
    editDueDate: document.getElementById('edit-due-date'),
    editSubtasks: document.getElementById('edit-subtasks'),
    modalClose: document.getElementById('modal-close'),
    cancelEdit: document.getElementById('cancel-edit'),
    addSubtaskBtn: document.getElementById('add-subtask-btn'),

    // Tracker
    trackerMonthLabel: document.getElementById('tracker-month-label'),
    calendarGrid: document.getElementById('calendar-grid'),
    trackerStreak: document.getElementById('tracker-streak'),
    trackerMonthTotal: document.getElementById('tracker-month-total'),
    trackerTotal: document.getElementById('tracker-total'),

    // Day Checklist Modal
    dayChecklistModal: document.getElementById('day-checklist-modal'),
    dayChecklistDate: document.getElementById('day-checklist-date'),
    dayChecklistItems: document.getElementById('day-checklist-items'),
    dayChecklistEmpty: document.getElementById('day-checklist-empty'),
    dayChecklistClose: document.getElementById('day-checklist-close'),

    // Search
    searchInput: document.getElementById('search-input'),
    searchClear: document.getElementById('search-clear'),

    // Recurrence (in edit modal)
    editRecurrence: document.getElementById('edit-recurrence'),

    // Theme & Settings
    themeToggle: document.getElementById('theme-toggle'),
    settingsToggle: document.getElementById('settings-toggle'),
    settingsDropdown: document.getElementById('settings-dropdown'),
    exportBtn: document.getElementById('export-btn'),
    importBtn: document.getElementById('import-btn'),
    importFile: document.getElementById('import-file'),

    // Habits
    habitsChecklist: document.getElementById('habits-checklist'),
    habitsEmpty: document.getElementById('habits-empty'),
    habitForm: document.getElementById('habit-form'),
    habitTitle: document.getElementById('habit-title'),
    habitDaysPerWeek: document.getElementById('habit-days-per-week'),
    totalHabits: document.getElementById('total-habits'),
    completedToday: document.getElementById('completed-today'),
    bestStreak: document.getElementById('best-streak'),
    habitWeeklyChart: document.getElementById('habit-weekly-chart'),
    habitHeatmap: document.getElementById('habit-heatmap'),
    habitBreakdown: document.getElementById('habit-breakdown'),
    perHabitSection: document.getElementById('per-habit-section'),

    // Review Modal
    reviewModal: document.getElementById('review-modal'),
    reviewTitle: document.getElementById('review-title'),
    reviewClose: document.getElementById('review-close'),
    reviewDismiss: document.getElementById('review-dismiss'),
    scoreCircle: document.getElementById('score-circle'),
    scoreValue: document.getElementById('score-value'),
    reviewStats: document.getElementById('review-stats'),
    reviewCategoryChart: document.getElementById('review-category-chart'),
    reviewAchievements: document.getElementById('review-achievements')
};

// ===================================
// Initialization
// ===================================

function init() {
    loadFromStorage();
    loadTheme();
    setupEventListeners();
    initTabSlider();
    renderTasks();
    renderHabits();
    updateStats();
    initChart();
    recordDailyProgress();
    checkDailyReview();
}

function setupEventListeners() {
    // Tab Navigation
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Task Form
    elements.taskForm.addEventListener('submit', handleAddTask);

    // Filters
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
    });

    // Modal
    elements.modalClose.addEventListener('click', closeModal);
    elements.cancelEdit.addEventListener('click', closeModal);
    elements.editModal.addEventListener('click', (e) => {
        if (e.target === elements.editModal) closeModal();
    });
    elements.editForm.addEventListener('submit', handleEditSubmit);
    elements.addSubtaskBtn.addEventListener('click', () => addSubtaskInput());

    // Day Checklist Modal
    elements.dayChecklistClose.addEventListener('click', closeDayChecklist);
    elements.dayChecklistModal.addEventListener('click', (e) => {
        if (e.target === elements.dayChecklistModal) closeDayChecklist();
    });

    // Search
    elements.searchInput.addEventListener('input', debounce(handleSearch, 150));
    elements.searchClear.addEventListener('click', clearSearch);

    // Keyboard Shortcuts
    document.addEventListener('keydown', handleKeyboardShortcut);

    // Theme Toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Settings Menu
    elements.settingsToggle.addEventListener('click', toggleSettingsMenu);
    elements.exportBtn.addEventListener('click', exportData);
    elements.importBtn.addEventListener('click', () => elements.importFile.click());
    elements.importFile.addEventListener('change', importData);

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.settings-menu')) {
            elements.settingsDropdown.classList.remove('active');
        }
    });

    // Habits
    elements.habitForm.addEventListener('submit', handleAddHabit);

    // Review Modal
    elements.reviewClose.addEventListener('click', closeReviewModal);
    elements.reviewDismiss.addEventListener('click', closeReviewModal);
    elements.reviewModal.addEventListener('click', (e) => {
        if (e.target === elements.reviewModal) closeReviewModal();
    });
}

// ===================================
// Tab Navigation with Slider
// ===================================

function initTabSlider() {
    updateTabSlider();
    window.addEventListener('resize', updateTabSlider);
}

function updateTabSlider() {
    const activeBtn = document.querySelector('.tab-btn.active');
    if (activeBtn && elements.tabSlider) {
        const navRect = elements.tabNav.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        elements.tabSlider.style.width = `${btnRect.width}px`;
        elements.tabSlider.style.transform = `translateX(${btnRect.left - navRect.left - 4}px)`;
    }
}

function switchTab(tabId) {
    state.currentTab = tabId;

    // Update buttons
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update slider
    updateTabSlider();

    // Update content
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}-tab`);
    });

    // Refresh specific tabs
    if (tabId === 'analytics' && state.chart) {
        state.chart.update();
    }
    if (tabId === 'overview') {
        updateOverview();
    }
    if (tabId === 'timeline') {
        renderTimeline();
    }
    if (tabId === 'tracker') {
        renderCalendar();
    }
}

// ===================================
// Task CRUD Operations
// ===================================

function handleAddTask(e) {
    e.preventDefault();

    const title = elements.taskTitle.value.trim();
    if (!title) return;

    const task = {
        id: generateId(),
        title: title,
        description: '',
        subtasks: [],
        progress: 0,
        priority: elements.taskPriority.value,
        category: elements.taskCategory.value,
        dueDate: null,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    state.tasks.unshift(task);
    saveToStorage();
    renderTasks();
    updateStats();

    elements.taskTitle.value = '';
    elements.taskTitle.focus();
}

function deleteTask(taskId) {
    const index = state.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
        state.tasks.splice(index, 1);
        saveToStorage();
        renderTasks();
        updateStats();
    }
}

function toggleTaskComplete(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const card = document.querySelector(`.task-card[data-id="${taskId}"]`);

    if (task.progress === 100) {
        // Uncompleting a task - just update immediately
        task.progress = 0;
        task.completedAt = null;
        task.subtasks.forEach(st => st.completed = false);
        saveToStorage();
        renderTasks();
        updateStats();
    } else {
        // Completing a task - animate first
        task.progress = 100;
        task.completedAt = new Date().toISOString();
        task.subtasks.forEach(st => st.completed = true);
        saveToStorage();

        // Animate the completion
        if (card && state.currentFilter !== 'completed') {
            const checkEl = card.querySelector('.task-check');
            if (checkEl) {
                checkEl.classList.add('checked', 'celebrating');
            }

            // Wait for celebration, then animate out
            setTimeout(() => {
                card.classList.add('completing');

                // After animation, re-render
                setTimeout(() => {
                    renderTasks();
                    updateStats();
                }, 500);
            }, 200);
        } else {
            renderTasks();
            updateStats();
        }

        // Handle recurring tasks - reset and advance due date
        if (task.recurrence && task.recurrence !== 'none') {
            setTimeout(() => {
                task.progress = 0;
                task.completedAt = null;
                task.subtasks.forEach(st => st.completed = false);

                // Advance due date based on recurrence
                if (task.dueDate) {
                    const dueDate = new Date(task.dueDate + 'T00:00:00');
                    switch (task.recurrence) {
                        case 'daily':
                            dueDate.setDate(dueDate.getDate() + 1);
                            break;
                        case 'weekly':
                            dueDate.setDate(dueDate.getDate() + 7);
                            break;
                        case 'monthly':
                            dueDate.setMonth(dueDate.getMonth() + 1);
                            break;
                    }
                    task.dueDate = formatDateStr(dueDate);
                }

                saveToStorage();
                renderTasks();
                updateStats();
            }, 800); // Delay for completion animation
        }
    }
}

function toggleSubtask(taskId, subtaskIndex) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task && task.subtasks[subtaskIndex]) {
        task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
        calculateTaskProgress(task);
        saveToStorage();
        renderTasks();
        renderTimeline();
        updateStats();
    }
}

function calculateTaskProgress(task) {
    if (task.subtasks.length === 0) return;
    const completed = task.subtasks.filter(st => st.completed).length;
    task.progress = Math.round((completed / task.subtasks.length) * 100);
    task.completedAt = task.progress === 100 ? new Date().toISOString() : null;
}

function openEditModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    elements.editTaskId.value = task.id;
    elements.editTitle.value = task.title;
    elements.editDescription.value = task.description || '';
    elements.editPriority.value = task.priority;
    elements.editCategory.value = task.category;
    elements.editDueDate.value = task.dueDate || '';
    elements.editRecurrence.value = task.recurrence || 'none';

    elements.editSubtasks.innerHTML = '';
    task.subtasks.forEach((subtask) => {
        addSubtaskInput(subtask.text, subtask.dueDate);
    });

    elements.editModal.classList.add('active');
}

function closeModal() {
    elements.editModal.classList.remove('active');
}

function handleEditSubmit(e) {
    e.preventDefault();

    const taskId = elements.editTaskId.value;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.title = elements.editTitle.value.trim();
    task.description = elements.editDescription.value.trim();
    task.priority = elements.editPriority.value;
    task.category = elements.editCategory.value;
    task.dueDate = elements.editDueDate.value || null;
    task.recurrence = elements.editRecurrence.value;

    const subtaskRows = elements.editSubtasks.querySelectorAll('.subtask-input-row');
    const oldSubtasks = [...task.subtasks];
    task.subtasks = [];

    subtaskRows.forEach((row, index) => {
        const textInput = row.querySelector('input[type="text"]');
        const dateInput = row.querySelector('input[type="date"]');
        const text = textInput?.value.trim();
        if (text) {
            task.subtasks.push({
                text: text,
                dueDate: dateInput?.value || null,
                completed: oldSubtasks[index]?.completed || false
            });
        }
    });

    calculateTaskProgress(task);
    saveToStorage();
    renderTasks();
    renderTimeline();
    updateStats();
    closeModal();
}

function addSubtaskInput(text = '', dueDate = '') {
    const row = document.createElement('div');
    row.className = 'subtask-input-row';
    row.innerHTML = `
        <input type="text" placeholder="Subtask..." value="${escapeHtml(text)}">
        <input type="date" value="${dueDate || ''}">
        <button type="button" class="subtask-remove" onclick="this.parentElement.remove()">×</button>
    `;
    elements.editSubtasks.appendChild(row);

    if (!text) {
        row.querySelector('input[type="text"]').focus();
    }
}

// ===================================
// Rendering Tasks
// ===================================

function renderTasks() {
    const filteredTasks = getFilteredTasks();

    // Clear existing cards
    const cards = elements.taskList.querySelectorAll('.task-card');
    cards.forEach(card => card.remove());

    if (filteredTasks.length === 0) {
        elements.emptyState.style.display = 'flex';
        return;
    }

    elements.emptyState.style.display = 'none';

    filteredTasks.forEach(task => {
        const card = createTaskCard(task);
        elements.taskList.appendChild(card);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.progress === 100 ? 'completed' : ''}`;
    card.dataset.id = task.id;
    card.draggable = true;

    // Drag events
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragleave', handleDragLeave);

    const dueDateHtml = task.dueDate ? `
        <span class="task-due ${getDueStatus(task.dueDate)}">${formatDate(task.dueDate)}</span>
    ` : '';

    const progressHtml = task.subtasks.length > 0 ? `
        <div class="task-progress">
            <div class="progress-label">
                <span>Progress</span>
                <span>${task.progress}%</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill" style="width: ${task.progress}%"></div>
            </div>
        </div>
    ` : '';

    const subtasksHtml = task.subtasks.length > 0 ? `
        <div class="task-subtasks">
            ${task.subtasks.map((st, i) => `
                <div class="subtask-item">
                    <div class="subtask-check ${st.completed ? 'checked' : ''}" onclick="toggleSubtask('${task.id}', ${i})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                    </div>
                    <div class="subtask-content">
                        <span class="subtask-text ${st.completed ? 'completed' : ''}">${escapeHtml(st.text)}</span>
                        ${st.dueDate ? `<span class="subtask-due ${getDueStatus(st.dueDate)}">${formatDate(st.dueDate)}</span>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '';

    card.innerHTML = `
        <div class="task-header">
            <div class="drag-handle" title="Drag to reorder">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.5"></circle>
                    <circle cx="15" cy="6" r="1.5"></circle>
                    <circle cx="9" cy="12" r="1.5"></circle>
                    <circle cx="15" cy="12" r="1.5"></circle>
                    <circle cx="9" cy="18" r="1.5"></circle>
                    <circle cx="15" cy="18" r="1.5"></circle>
                </svg>
            </div>
            <div class="task-check ${task.progress === 100 ? 'checked' : ''}" onclick="toggleTaskComplete('${task.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            </div>
            <div class="task-body">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                    <span class="task-category">${task.category}</span>
                    ${dueDateHtml}
                    ${task.recurrence && task.recurrence !== 'none' ? `
                        <span class="recurrence-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 1l4 4-4 4"></path>
                                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                <path d="M7 23l-4-4 4-4"></path>
                                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                            </svg>
                            ${task.recurrence}
                        </span>
                    ` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn" onclick="openEditModal('${task.id}')" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="action-btn delete" onclick="deleteTask('${task.id}')" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
        ${progressHtml}
        ${subtasksHtml}
    `;

    return card;
}

function getFilteredTasks() {
    let tasks = state.tasks;

    // Apply search filter
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        tasks = tasks.filter(t =>
            t.title.toLowerCase().includes(query) ||
            (t.description && t.description.toLowerCase().includes(query)) ||
            t.category.toLowerCase().includes(query)
        );
    }

    // Apply status filter
    // 'all' and 'active' both show incomplete tasks (completed tasks only in 'completed')
    switch (state.currentFilter) {
        case 'completed':
            return tasks.filter(t => t.progress === 100);
        default:
            // 'all' and 'active' show only incomplete tasks
            return tasks.filter(t => t.progress < 100);
    }
}

function handleFilter(filter) {
    state.currentFilter = filter;

    elements.filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    renderTasks();
}

// ===================================
// Timeline Rendering
// ===================================

function renderTimeline() {
    // Get tasks that have subtasks with due dates
    const tasksWithTimelines = state.tasks.filter(task =>
        task.subtasks.some(st => st.dueDate)
    );

    // Clear existing timeline cards
    const existingCards = elements.projectTimelines.querySelectorAll('.project-timeline-card');
    existingCards.forEach(c => c.remove());

    if (tasksWithTimelines.length === 0) {
        elements.timelineEmpty.style.display = 'block';
        return;
    }

    elements.timelineEmpty.style.display = 'none';

    // Render each project's horizontal timeline
    tasksWithTimelines.forEach(task => {
        const card = createProjectTimelineCard(task);
        elements.projectTimelines.appendChild(card);
    });
}

function createProjectTimelineCard(task) {
    const card = document.createElement('div');
    card.className = 'project-timeline-card';

    // Get subtasks with due dates, sorted by date
    const timedSubtasks = task.subtasks
        .map((st, index) => ({ ...st, index }))
        .filter(st => st.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Calculate progress - find the rightmost completed node position
    const completedCount = timedSubtasks.filter(st => st.completed).length;

    // Find the index of the last (rightmost) completed subtask
    let lastCompletedIndex = -1;
    for (let i = timedSubtasks.length - 1; i >= 0; i--) {
        if (timedSubtasks[i].completed) {
            lastCompletedIndex = i;
            break;
        }
    }

    // Calculate progress fill based on position of the rightmost completed node
    // Each node takes up equal space, so we fill to the center of that node's position
    const totalNodes = timedSubtasks.length;
    const progressPercent = lastCompletedIndex >= 0 && totalNodes > 1
        ? Math.round(((lastCompletedIndex + 0.5) / (totalNodes - 0.5)) * 100)
        : lastCompletedIndex >= 0 ? 100 : 0;

    card.innerHTML = `
        <div class="project-timeline-header">
            <span class="project-timeline-title">${escapeHtml(task.title)}</span>
            <span class="project-timeline-progress">${completedCount}/${timedSubtasks.length} complete</span>
        </div>
        <div class="horizontal-timeline">
            <div class="timeline-track">
                <div class="timeline-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="timeline-nodes">
                ${timedSubtasks.map(st => {
        const status = st.completed ? 'completed' : getDueStatus(st.dueDate);
        return `
                        <div class="timeline-node" onclick="toggleSubtask('${task.id}', ${st.index})">
                            <div class="node-dot ${status}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <polyline points="20,6 9,17 4,12"></polyline>
                                </svg>
                            </div>
                            <div class="node-label">
                                <div class="node-title ${st.completed ? 'completed' : ''}">${escapeHtml(st.text)}</div>
                                <div class="node-date ${status}">${formatDate(st.dueDate)}</div>
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;

    return card;
}

function formatTimelineDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) {
        return 'Today';
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }
}

function getDueStatus(dateStr) {
    if (!dateStr) return '';

    const date = new Date(dateStr + 'T23:59:59');
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateOnly = new Date(dateStr + 'T00:00:00');
    dateOnly.setHours(0, 0, 0, 0);

    if (date < now && dateOnly.getTime() < today.getTime()) {
        return 'overdue';
    } else if (dateOnly.getTime() === today.getTime()) {
        return 'today';
    }
    return '';
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ===================================
// Statistics & Analytics
// ===================================

function updateStats() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.progress === 100).length;

    elements.totalTasks.textContent = total;
    elements.completedTasks.textContent = completed;

    updateAnalytics();

    if (state.chart) {
        updateChartData();
    }
}

function updateAnalytics() {
    const today = new Date().toDateString();
    const completedToday = state.tasks.filter(t => {
        if (!t.completedAt) return false;
        return new Date(t.completedAt).toDateString() === today;
    }).length;

    elements.tasksToday.textContent = completedToday;

    const avgProgress = state.tasks.length > 0
        ? Math.round(state.tasks.reduce((sum, t) => sum + t.progress, 0) / state.tasks.length)
        : 0;
    elements.avgProgress.textContent = `${avgProgress}%`;

    const streak = calculateStreak();
    elements.streakCount.textContent = streak;
}

function calculateStreak() {
    if (state.progressHistory.length === 0) return 0;

    let streak = 0;
    const sortedHistory = [...state.progressHistory].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedHistory.length; i++) {
        const historyDate = new Date(sortedHistory[i].date);
        historyDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);

        if (historyDate.getTime() === expectedDate.getTime()) {
            if (sortedHistory[i].tasksCompleted > 0 || sortedHistory[i].progress > 0) {
                streak++;
            } else {
                break;
            }
        } else {
            break;
        }
    }

    return streak;
}

function updateOverview() {
    const total = state.tasks.length;
    const avgProgress = total > 0
        ? Math.round(state.tasks.reduce((sum, t) => sum + t.progress, 0) / total)
        : 0;

    // Update ring
    elements.progressRingValue.textContent = avgProgress;
    const circle = document.getElementById('progress-ring');
    if (circle) {
        const circumference = 326.726;
        const offset = circumference - (avgProgress / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    // Priority bars
    const priorities = { high: 0, medium: 0, low: 0 };
    state.tasks.forEach(t => priorities[t.priority]++);

    const maxPriority = Math.max(priorities.high, priorities.medium, priorities.low, 1);

    elements.highPriorityBar.style.width = `${(priorities.high / maxPriority) * 100}%`;
    elements.mediumPriorityBar.style.width = `${(priorities.medium / maxPriority) * 100}%`;
    elements.lowPriorityBar.style.width = `${(priorities.low / maxPriority) * 100}%`;

    elements.highCount.textContent = priorities.high;
    elements.mediumCount.textContent = priorities.medium;
    elements.lowCount.textContent = priorities.low;

    // Categories
    const categories = {};
    state.tasks.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + 1;
    });

    elements.categoryList.innerHTML = Object.entries(categories).map(([cat, count]) => `
        <div class="category-row">
            <div class="category-dot ${cat}"></div>
            <span class="category-name">${cat}</span>
            <span class="category-num">${count}</span>
        </div>
    `).join('');

    if (Object.keys(categories).length === 0) {
        elements.categoryList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem;">No tasks yet</p>';
    }
}

// ===================================
// Chart.js
// ===================================

function initChart() {
    const ctx = elements.progressChart.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(255, 153, 102, 0.25)');
    gradient.addColorStop(1, 'rgba(255, 153, 102, 0)');

    state.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Progress',
                data: [],
                borderColor: '#ff9966',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff9966',
                pointBorderColor: '#0a0a0a',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#18181b',
                    titleColor: '#fafafa',
                    bodyColor: '#a1a1aa',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: { color: '#52525b', font: { size: 11 } }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: {
                        color: '#52525b',
                        font: { size: 11 },
                        callback: v => v + '%'
                    }
                }
            },
            interaction: { intersect: false, mode: 'index' }
        }
    });

    updateChartData();
}

function updateChartData() {
    if (!state.chart) return;

    const last7Days = getLast7DaysData();

    state.chart.data.labels = last7Days.map(d => d.label);
    state.chart.data.datasets[0].data = last7Days.map(d => d.progress);
    state.chart.update();
}

function getLast7DaysData() {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const historyEntry = state.progressHistory.find(h => h.date === dateStr);

        days.push({
            label: date.toLocaleDateString('en-US', { weekday: 'short' }),
            date: dateStr,
            progress: historyEntry?.progress || 0
        });
    }

    return days;
}

function recordDailyProgress() {
    const today = new Date().toISOString().split('T')[0];

    const avgProgress = state.tasks.length > 0
        ? Math.round(state.tasks.reduce((sum, t) => sum + t.progress, 0) / state.tasks.length)
        : 0;
    const completedCount = state.tasks.filter(t => t.progress === 100).length;

    const existingEntry = state.progressHistory.find(h => h.date === today);

    if (existingEntry) {
        existingEntry.progress = avgProgress;
        existingEntry.tasksCompleted = completedCount;
    } else {
        state.progressHistory.push({
            date: today,
            progress: avgProgress,
            tasksCompleted: completedCount
        });
    }

    state.progressHistory = state.progressHistory
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 30);

    saveToStorage();
}

// ===================================
// Storage
// ===================================

function saveToStorage() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('taskflow_habits', JSON.stringify(state.habits));
    localStorage.setItem('taskflow_habit_completions', JSON.stringify(state.habitCompletions));
    localStorage.setItem('taskflow_history', JSON.stringify(state.progressHistory));
    localStorage.setItem('taskflow_checkins', JSON.stringify(state.dailyCheckIns));
}

function loadFromStorage() {
    try {
        const tasks = localStorage.getItem('taskflow_tasks');
        const habits = localStorage.getItem('taskflow_habits');
        const habitCompletions = localStorage.getItem('taskflow_habit_completions');
        const history = localStorage.getItem('taskflow_history');
        const checkIns = localStorage.getItem('taskflow_checkins');

        if (tasks) state.tasks = JSON.parse(tasks);
        if (habits) state.habits = JSON.parse(habits);
        if (habitCompletions) state.habitCompletions = JSON.parse(habitCompletions);
        if (history) state.progressHistory = JSON.parse(history);
        if (checkIns) state.dailyCheckIns = JSON.parse(checkIns);
    } catch (e) {
        console.error('Error loading from storage:', e);
    }
}

// ===================================
// Utilities
// ===================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===================================
// Search Functions
// ===================================

function handleSearch(e) {
    state.searchQuery = e.target.value.trim();
    renderTasks();
}

function clearSearch() {
    state.searchQuery = '';
    elements.searchInput.value = '';
    renderTasks();
    elements.searchInput.focus();
}

// ===================================
// Habits
// ===================================

function handleAddHabit(e) {
    e.preventDefault();

    const title = elements.habitTitle.value.trim();
    if (!title) return;

    const daysPerWeek = parseInt(elements.habitDaysPerWeek.value) || 7;

    const habit = {
        id: generateId(),
        title: title,
        daysPerWeek: daysPerWeek,
        createdAt: new Date().toISOString()
    };

    state.habits.push(habit);
    saveToStorage();
    renderHabits();

    elements.habitTitle.value = '';
    elements.habitDaysPerWeek.value = '7';
}

function toggleHabit(habitId) {
    const today = getTodayStr();

    if (!state.habitCompletions[today]) {
        state.habitCompletions[today] = [];
    }

    const index = state.habitCompletions[today].indexOf(habitId);
    if (index === -1) {
        state.habitCompletions[today].push(habitId);
    } else {
        state.habitCompletions[today].splice(index, 1);
    }

    saveToStorage();
    renderHabits();
}

function deleteHabit(habitId) {
    const index = state.habits.findIndex(h => h.id === habitId);
    if (index !== -1) {
        state.habits.splice(index, 1);
        saveToStorage();
        renderHabits();
    }
}

function renderHabits() {
    const today = getTodayStr();
    const completedToday = state.habitCompletions[today] || [];

    elements.habitsChecklist.innerHTML = '';

    if (state.habits.length === 0) {
        elements.habitsEmpty.style.display = 'flex';
    } else {
        elements.habitsEmpty.style.display = 'none';

        state.habits.forEach(habit => {
            const isCompleted = completedToday.includes(habit.id);
            const streak = calculateHabitStreak(habit.id);
            const daysPerWeek = habit.daysPerWeek || 7;
            const goalText = daysPerWeek === 7 ? 'Daily' : `${daysPerWeek}x/week`;

            const item = document.createElement('div');
            item.className = `habit-item ${isCompleted ? 'completed' : ''}`;
            item.innerHTML = `
                <div class="habit-check ${isCompleted ? 'checked' : ''}" onclick="toggleHabit('${habit.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                </div>
                <div class="habit-info">
                    <span class="habit-name">${escapeHtml(habit.title)}</span>
                    <span class="habit-goal-badge">${goalText}</span>
                </div>
                ${streak > 0 ? `
                    <div class="habit-streak">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        ${streak} day${streak > 1 ? 's' : ''}
                    </div>
                ` : ''}
                <button class="habit-delete" onclick="deleteHabit('${habit.id}')" title="Delete habit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;
            elements.habitsChecklist.appendChild(item);
        });
    }

    updateHabitStats();
}

function updateHabitStats() {
    const today = getTodayStr();
    const completedToday = state.habitCompletions[today] || [];

    elements.totalHabits.textContent = state.habits.length;
    elements.completedToday.textContent = completedToday.filter(id =>
        state.habits.some(h => h.id === id)
    ).length;

    // Find best streak
    let bestStreak = 0;
    state.habits.forEach(habit => {
        const streak = calculateHabitStreak(habit.id);
        if (streak > bestStreak) bestStreak = streak;
    });
    elements.bestStreak.textContent = bestStreak;

    // Render analytics
    renderWeeklyChart();
    renderHeatmap();
    renderHabitBreakdown();
}

function renderWeeklyChart() {
    if (state.habits.length === 0) {
        elements.habitWeeklyChart.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Add habits to see weekly progress</p>';
        return;
    }

    // Get current week's completions per habit
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

    const habitProgress = state.habits.map(habit => {
        let completedThisWeek = 0;

        // Count completions for this week
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            if (date > today) break; // Don't count future days

            const dateStr = date.toISOString().split('T')[0];
            const completions = state.habitCompletions[dateStr] || [];
            if (completions.includes(habit.id)) {
                completedThisWeek++;
            }
        }

        const goal = habit.daysPerWeek || 7;
        const pct = Math.min((completedThisWeek / goal) * 100, 100);

        return {
            name: habit.title,
            completed: completedThisWeek,
            goal: goal,
            pct: pct
        };
    });

    elements.habitWeeklyChart.innerHTML = habitProgress.map(h => `
        <div class="weekly-habit-row">
            <span class="weekly-habit-name">${escapeHtml(h.name)}</span>
            <div class="weekly-habit-bar">
                <div class="weekly-habit-fill ${h.completed >= h.goal ? 'complete' : ''}" style="width: ${h.pct}%"></div>
            </div>
            <span class="weekly-habit-count ${h.completed >= h.goal ? 'complete' : ''}">${h.completed}/${h.goal}</span>
        </div>
    `).join('');
}

function renderHeatmap() {
    const cells = [];
    const today = new Date();
    const totalHabits = state.habits.length || 1;

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const completions = state.habitCompletions[dateStr] || [];
        const validCompletions = completions.filter(id => state.habits.some(h => h.id === id));
        const pct = validCompletions.length / totalHabits;

        let level = 0;
        if (pct > 0) level = 1;
        if (pct >= 0.5) level = 2;
        if (pct >= 0.75) level = 3;
        if (pct >= 1) level = 4;

        const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        cells.push(`<div class="heatmap-cell level-${level}" title="${dateLabel}: ${validCompletions.length}/${state.habits.length}"></div>`);
    }

    elements.habitHeatmap.innerHTML = cells.join('');
}

function renderHabitBreakdown() {
    if (state.habits.length === 0) {
        elements.perHabitSection.style.display = 'none';
        return;
    }

    elements.perHabitSection.style.display = 'block';

    const breakdown = state.habits.map(habit => {
        const rate = getCompletionRate(habit.id, 30);
        const streak = calculateHabitStreak(habit.id);
        return { habit, rate, streak };
    });

    elements.habitBreakdown.innerHTML = breakdown.map(item => `
        <div class="habit-breakdown-item">
            <span class="habit-breakdown-name">${escapeHtml(item.habit.title)}</span>
            <div class="habit-breakdown-bar">
                <div class="habit-breakdown-fill" style="width: ${item.rate}%"></div>
            </div>
            <span class="habit-breakdown-pct">${item.rate}%</span>
            <span class="habit-breakdown-streak">${item.streak}d streak</span>
        </div>
    `).join('');
}

function getCompletionRate(habitId, days) {
    let completed = 0;
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const completions = state.habitCompletions[dateStr] || [];
        if (completions.includes(habitId)) {
            completed++;
        }
    }

    return Math.round((completed / days) * 100);
}

function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

function calculateHabitStreak(habitId) {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const completions = state.habitCompletions[dateStr] || [];
        if (completions.includes(habitId)) {
            streak++;
        } else if (i > 0) {
            // Skip today if not completed yet, but break on other days
            break;
        }
    }

    return streak;
}

// Make habit functions available globally
window.toggleHabit = toggleHabit;
window.deleteHabit = deleteHabit;

// ===================================
// Daily Review System
// ===================================

function checkDailyReview() {
    const today = getTodayStr();
    const lastReviewDate = localStorage.getItem('taskflow_last_review');

    // Show review if we haven't shown one today and there's data from yesterday
    if (lastReviewDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Check if there was any activity yesterday
        const yesterdayHistory = state.progressHistory.find(h => h.date === yesterdayStr);
        const yesterdayHabits = state.habitCompletions[yesterdayStr];

        if (yesterdayHistory || (yesterdayHabits && yesterdayHabits.length > 0)) {
            // Small delay to let UI render first
            setTimeout(() => showReview('daily', yesterdayStr), 500);
        }
    }
}

function showReview(type = 'daily', dateStr = null) {
    const targetDate = dateStr || getTodayStr();
    const date = new Date(targetDate + 'T00:00:00');
    const dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    // Set title
    if (type === 'daily') {
        elements.reviewTitle.textContent = `📊 ${dateLabel}`;
    } else if (type === 'weekly') {
        elements.reviewTitle.textContent = '📈 Weekly Review';
    } else {
        elements.reviewTitle.textContent = '🏆 Monthly Review';
    }

    // Calculate productivity score
    const score = calculateProductivityScore(targetDate);
    elements.scoreValue.textContent = score;
    elements.scoreCircle.style.background = `conic-gradient(var(--accent) ${score * 3.6}deg, var(--bg-hover) 0deg)`;

    // Get stats for the day
    const historyEntry = state.progressHistory.find(h => h.date === targetDate);
    const habitsCompleted = (state.habitCompletions[targetDate] || []).filter(id =>
        state.habits.some(h => h.id === id)
    ).length;

    elements.reviewStats.innerHTML = `
        <div class="review-stat">
            <span class="review-stat-value">${historyEntry?.tasksCompleted || 0}</span>
            <span class="review-stat-label">Tasks Done</span>
        </div>
        <div class="review-stat">
            <span class="review-stat-value">${habitsCompleted}</span>
            <span class="review-stat-label">Habits Done</span>
        </div>
        <div class="review-stat">
            <span class="review-stat-value">${state.habits.length}</span>
            <span class="review-stat-label">Total Habits</span>
        </div>
        <div class="review-stat">
            <span class="review-stat-value">${state.tasks.filter(t => t.completedAt && t.completedAt.startsWith(targetDate)).length}</span>
            <span class="review-stat-label">Completed</span>
        </div>
    `;

    // Category breakdown
    const categories = getCategoryBreakdown(targetDate);
    if (categories.length > 0) {
        const maxCount = Math.max(...categories.map(c => c.count));
        elements.reviewCategoryChart.innerHTML = categories.map(cat => `
            <div class="category-bar-row">
                <span class="category-bar-name">${cat.name}</span>
                <div class="category-bar-track">
                    <div class="category-bar-fill" style="width: ${(cat.count / maxCount) * 100}%"></div>
                </div>
                <span class="category-bar-count">${cat.count}</span>
            </div>
        `).join('');
    } else {
        elements.reviewCategoryChart.innerHTML = '<p style="color: var(--text-muted)">No tasks completed</p>';
    }

    // Achievements/highlights
    const achievements = getAchievements(targetDate);
    elements.reviewAchievements.innerHTML = achievements.map(a => `
        <div class="achievement-item">
            <span class="achievement-icon">${a.icon}</span>
            <span class="achievement-text">${a.text}</span>
        </div>
    `).join('') || '<p style="color: var(--text-muted)">Keep going!</p>';

    // Show modal
    elements.reviewModal.classList.add('active');

    // Mark as reviewed
    localStorage.setItem('taskflow_last_review', getTodayStr());
}

function closeReviewModal() {
    elements.reviewModal.classList.remove('active');
}

function calculateProductivityScore(dateStr) {
    const historyEntry = state.progressHistory.find(h => h.date === dateStr);
    const habitsCompleted = (state.habitCompletions[dateStr] || []).filter(id =>
        state.habits.some(h => h.id === id)
    ).length;

    const taskScore = historyEntry ? Math.min(historyEntry.tasksCompleted * 15, 50) : 0;
    const habitScore = state.habits.length > 0
        ? Math.round((habitsCompleted / state.habits.length) * 50)
        : 50;

    return Math.min(taskScore + habitScore, 100);
}

function getCategoryBreakdown(dateStr) {
    const categories = {};

    state.tasks.forEach(task => {
        if (task.completedAt && task.completedAt.startsWith(dateStr)) {
            categories[task.category] = (categories[task.category] || 0) + 1;
        }
    });

    return Object.entries(categories)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
}

function getAchievements(dateStr) {
    const achievements = [];
    const habitsCompleted = (state.habitCompletions[dateStr] || []).filter(id =>
        state.habits.some(h => h.id === id)
    ).length;

    if (habitsCompleted === state.habits.length && state.habits.length > 0) {
        achievements.push({ icon: '🌟', text: 'Completed all habits!' });
    }

    // Check for streaks
    state.habits.forEach(habit => {
        const streak = calculateHabitStreak(habit.id);
        if (streak >= 7) {
            achievements.push({ icon: '🔥', text: `${habit.title}: ${streak} day streak!` });
        }
    });

    const historyEntry = state.progressHistory.find(h => h.date === dateStr);
    if (historyEntry && historyEntry.tasksCompleted >= 5) {
        achievements.push({ icon: '💪', text: `Completed ${historyEntry.tasksCompleted} tasks!` });
    }

    if (achievements.length === 0) {
        achievements.push({ icon: '✨', text: 'Every day is a new opportunity!' });
    }

    return achievements;
}

// Make showReview available globally for manual trigger
window.showReview = showReview;

// ===================================
// Keyboard Shortcuts
// ===================================

function handleKeyboardShortcut(e) {
    // Don't trigger shortcuts when typing in input fields
    const activeElement = document.activeElement;
    const isTyping = activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT';

    // Escape always works - close modals or clear search
    if (e.key === 'Escape') {
        if (elements.editModal.classList.contains('active')) {
            closeModal();
        } else if (elements.dayChecklistModal.classList.contains('active')) {
            closeDayChecklist();
        } else if (state.searchQuery) {
            clearSearch();
        } else if (isTyping) {
            activeElement.blur();
        }
        return;
    }

    // Skip other shortcuts if typing
    if (isTyping) return;

    switch (e.key.toLowerCase()) {
        case 'n':
            // Focus new task input
            e.preventDefault();
            switchTab('tasks');
            elements.taskTitle.focus();
            break;
        case '/':
            // Focus search input
            e.preventDefault();
            switchTab('tasks');
            elements.searchInput.focus();
            break;
        case '1':
            e.preventDefault();
            switchTab('tasks');
            break;
        case '2':
            e.preventDefault();
            switchTab('timeline');
            break;
        case '3':
            e.preventDefault();
            switchTab('analytics');
            break;
        case '4':
            e.preventDefault();
            switchTab('overview');
            break;
        case '5':
            e.preventDefault();
            switchTab('habits');
            break;
        case '6':
            e.preventDefault();
            switchTab('tracker');
            break;
        case 't':
            e.preventDefault();
            toggleTheme();
            break;
    }
}

// ===================================
// Theme Toggle
// ===================================

function loadTheme() {
    const savedTheme = localStorage.getItem('taskflow_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('taskflow_theme', newTheme);
}

// ===================================
// Settings Menu
// ===================================

function toggleSettingsMenu(e) {
    e.stopPropagation();
    elements.settingsDropdown.classList.toggle('active');
}

// ===================================
// Data Export/Import
// ===================================

function exportData() {
    const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        tasks: state.tasks,
        progressHistory: state.progressHistory,
        dailyCheckIns: state.dailyCheckIns
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Close settings menu
    elements.settingsDropdown.classList.remove('active');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const data = JSON.parse(event.target.result);

            // Validate data structure
            if (!data.tasks || !Array.isArray(data.tasks)) {
                alert('Invalid backup file format.');
                return;
            }

            // Confirm before overwriting
            if (!confirm('This will replace all current data. Are you sure?')) {
                return;
            }

            // Restore data
            state.tasks = data.tasks || [];
            state.progressHistory = data.progressHistory || [];
            state.dailyCheckIns = data.dailyCheckIns || {};

            saveToStorage();
            renderTasks();
            updateStats();
            if (state.chart) updateChartData();
            renderTimeline();
            renderCalendar();

            alert('Data imported successfully!');
        } catch (err) {
            alert('Error reading backup file: ' + err.message);
        }
    };
    reader.readAsText(file);

    // Reset file input
    e.target.value = '';

    // Close settings menu
    elements.settingsDropdown.classList.remove('active');
}

// ===================================
// Drag and Drop
// ===================================

let draggedTask = null;

function handleDragStart(e) {
    draggedTask = e.target.closest('.task-card');
    if (draggedTask) {
        draggedTask.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedTask.dataset.id);
    }
}

function handleDragEnd(e) {
    if (draggedTask) {
        draggedTask.classList.remove('dragging');
    }
    // Remove drag-over from all cards
    document.querySelectorAll('.task-card.drag-over').forEach(card => {
        card.classList.remove('drag-over');
    });
    draggedTask = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const card = e.target.closest('.task-card');
    if (card && card !== draggedTask) {
        card.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const card = e.target.closest('.task-card');
    if (card) {
        card.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const targetCard = e.target.closest('.task-card');

    if (!targetCard || !draggedTask || targetCard === draggedTask) return;

    const draggedId = draggedTask.dataset.id;
    const targetId = targetCard.dataset.id;

    // Find indices in state.tasks
    const draggedIndex = state.tasks.findIndex(t => t.id === draggedId);
    const targetIndex = state.tasks.findIndex(t => t.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged task and insert at target position
    const [task] = state.tasks.splice(draggedIndex, 1);
    state.tasks.splice(targetIndex, 0, task);

    saveToStorage();
    renderTasks();
}

// ===================================
// Initialize
// ===================================

document.addEventListener('DOMContentLoaded', init);

// Global functions for onclick handlers
window.toggleTaskComplete = toggleTaskComplete;
window.toggleSubtask = toggleSubtask;
window.deleteTask = deleteTask;
window.openEditModal = openEditModal;
window.openDayChecklist = openDayChecklist;
window.toggleDayTask = toggleDayTask;
window.navigateMonth = navigateMonth;

// ===================================
// Daily Tracker / Calendar
// ===================================

// Track which date's modal is open
let currentChecklistDate = null;

function getActiveTasks() {
    // Return tasks that are not 100% complete
    return state.tasks.filter(t => t.progress < 100);
}

function getDayProgress(dateStr) {
    const activeTasks = getActiveTasks();
    if (activeTasks.length === 0) return 0;

    const dayCheckIns = state.dailyCheckIns[dateStr] || {};
    const checkedCount = activeTasks.filter(t => dayCheckIns[t.id]).length;

    return Math.round((checkedCount / activeTasks.length) * 100);
}

function hasAnyCheckIn(dateStr) {
    const dayCheckIns = state.dailyCheckIns[dateStr];
    if (!dayCheckIns) return false;
    return Object.keys(dayCheckIns).some(k => dayCheckIns[k]);
}

function renderCalendar() {
    const year = state.trackerMonth.getFullYear();
    const month = state.trackerMonth.getMonth();

    // Update month label
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    elements.trackerMonthLabel.textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDateStr(today);

    // Build calendar grid
    let html = '';

    // Previous month days (faded)
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        html += `<div class="calendar-day other-month"><span>${day}</span></div>`;
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDateStr(date);
        const isToday = dateStr === todayStr;
        const isFuture = date > today;
        const progress = getDayProgress(dateStr);
        const hasChecks = hasAnyCheckIn(dateStr);

        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (isFuture) classes += ' future';
        if (progress === 100) classes += ' complete';
        else if (hasChecks) classes += ' partial';

        const clickHandler = isFuture ? '' : `onclick="openDayChecklist('${dateStr}')"`;

        // Progress ring uses CSS custom property
        html += `<div class="${classes}" style="--progress: ${progress}" ${clickHandler}>
            <div class="day-progress-ring"></div>
            <span>${day}</span>
            ${progress === 100 ? '<svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20,6 9,17 4,12"></polyline></svg>' : ''}
        </div>`;
    }

    // Next month days (faded)
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="calendar-day other-month"><span>${day}</span></div>`;
    }

    elements.calendarGrid.innerHTML = html;

    // Update stats
    updateTrackerStats();
}

function openDayChecklist(dateStr) {
    currentChecklistDate = dateStr;

    // Format the date nicely for display
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.dayChecklistDate.textContent = date.toLocaleDateString('en-US', options);

    // Get active tasks
    const activeTasks = getActiveTasks();

    if (activeTasks.length === 0) {
        elements.dayChecklistItems.style.display = 'none';
        elements.dayChecklistEmpty.style.display = 'block';
    } else {
        elements.dayChecklistItems.style.display = 'block';
        elements.dayChecklistEmpty.style.display = 'none';

        // Build checklist items
        const dayCheckIns = state.dailyCheckIns[dateStr] || {};

        let html = '';
        activeTasks.forEach(task => {
            const isChecked = dayCheckIns[task.id] === true;
            html += `
                <div class="day-checklist-item ${isChecked ? 'checked' : ''}" onclick="toggleDayTask('${dateStr}', '${task.id}')">
                    <div class="day-checklist-checkbox ${isChecked ? 'checked' : ''}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                    </div>
                    <div class="day-checklist-info">
                        <span class="day-checklist-title">${escapeHtml(task.title)}</span>
                        <span class="day-checklist-meta">
                            <span class="priority-dot ${task.priority}"></span>
                            ${task.category}
                        </span>
                    </div>
                </div>
            `;
        });

        elements.dayChecklistItems.innerHTML = html;
    }

    elements.dayChecklistModal.classList.add('active');
}

function closeDayChecklist() {
    elements.dayChecklistModal.classList.remove('active');
    currentChecklistDate = null;
}

function toggleDayTask(dateStr, taskId) {
    // Initialize date object if doesn't exist
    if (!state.dailyCheckIns[dateStr]) {
        state.dailyCheckIns[dateStr] = {};
    }

    // Toggle the task
    if (state.dailyCheckIns[dateStr][taskId]) {
        delete state.dailyCheckIns[dateStr][taskId];
    } else {
        state.dailyCheckIns[dateStr][taskId] = true;
    }

    // Clean up empty date objects
    if (Object.keys(state.dailyCheckIns[dateStr]).length === 0) {
        delete state.dailyCheckIns[dateStr];
    }

    saveToStorage();

    // Re-render the modal to update checkboxes
    openDayChecklist(dateStr);

    // Update the calendar
    renderCalendar();
}

function navigateMonth(delta) {
    state.trackerMonth.setMonth(state.trackerMonth.getMonth() + delta);
    renderCalendar();
}

function formatDateStr(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function updateTrackerStats() {
    // Count days with any check-ins
    const datesWithCheckIns = Object.keys(state.dailyCheckIns).filter(d => hasAnyCheckIn(d));

    // Total check-in days
    elements.trackerTotal.textContent = datesWithCheckIns.length;

    // This month's check-in days
    const year = state.trackerMonth.getFullYear();
    const month = state.trackerMonth.getMonth();
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const thisMonthCount = datesWithCheckIns.filter(d => d.startsWith(monthPrefix)).length;
    elements.trackerMonthTotal.textContent = thisMonthCount;

    // Calculate streak
    const streak = calculateTrackerStreak();
    elements.trackerStreak.textContent = streak;
}

function calculateTrackerStreak() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    // Check if today has any check-ins, if not, start from yesterday
    const todayStr = formatDateStr(currentDate);
    if (!hasAnyCheckIn(todayStr)) {
        currentDate.setDate(currentDate.getDate() - 1);
    }

    // Count consecutive days with any check-ins
    while (true) {
        const dateStr = formatDateStr(currentDate);
        if (hasAnyCheckIn(dateStr)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

