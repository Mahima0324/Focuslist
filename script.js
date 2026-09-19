const STORAGE_KEY = "focusListTasks";

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

let currentStatus = "all";
let currentPriority = "all";
let editingTaskId = null;


// Elements

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const searchInput = document.getElementById("searchInput");
const priorityFilter = document.getElementById("priorityFilter");

const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");

const modalTitle = document.getElementById("modalTitle");

const addTaskBtn = document.getElementById("addTaskBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");

const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");


// Save tasks

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}


// Open modal

function openModal(task = null) {

    taskModal.classList.remove("hidden");

    if (task) {

        editingTaskId = task.id;

        modalTitle.textContent = "Edit Task";
        taskTitle.value = task.title;

        const priorityInput = document.querySelector(
            `input[name="priority"][value="${task.priority}"]`
        );

        if (priorityInput) {
            priorityInput.checked = true;
        }

    } else {

        editingTaskId = null;

        modalTitle.textContent = "Create a Task";

        taskForm.reset();

        document.querySelector(
            'input[name="priority"][value="high"]'
        ).checked = true;
    }

    setTimeout(() => taskTitle.focus(), 100);
}


// Close modal

function closeModal() {
    taskModal.classList.add("hidden");
    taskForm.reset();
    editingTaskId = null;
}


// Add / edit task

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = taskTitle.value.trim();

    const priority = document.querySelector(
        'input[name="priority"]:checked'
    ).value;

    if (!title) {
        return;
    }


    if (editingTaskId) {

        const task = tasks.find(
            item => item.id === editingTaskId
        );

        if (task) {
            task.title = title;
            task.priority = priority;
        }

    } else {

        const newTask = {
            id: Date.now().toString(),
            title: title,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
    }


    saveTasks();
    renderTasks();
    closeModal();
});


// Render tasks

function renderTasks() {

    const searchTerm = searchInput.value.trim().toLowerCase();

    let filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm);

        const matchesStatus =
            currentStatus === "all" ||
            (currentStatus === "active" && !task.completed) ||
            (currentStatus === "completed" && task.completed);

        const matchesPriority =
            currentPriority === "all" ||
            task.priority === currentPriority;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
        );
    });


    taskList.innerHTML = "";


    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

        filteredTasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    }


    updateStatistics();
}


// Create task element

function createTaskElement(task) {

    const item = document.createElement("div");

    item.className =
        `task-item ${task.completed ? "completed" : ""}`;


    const checkbox = document.createElement("button");

    checkbox.className =
        `checkbox ${task.completed ? "checked" : ""}`;

    checkbox.setAttribute(
        "aria-label",
        task.completed
            ? "Mark task as active"
            : "Mark task as completed"
    );

    checkbox.addEventListener("click", () => {
        toggleTask(task.id);
    });


    const details = document.createElement("div");

    details.className = "task-details";


    const title = document.createElement("div");

    title.className = "task-title";
    title.textContent = task.title;


    const meta = document.createElement("div");

    meta.className = "task-meta";


    const priority = document.createElement("span");

    priority.className =
        `priority priority-${task.priority}`;

    priority.textContent = task.priority;


    const date = document.createElement("span");

    date.textContent = formatDate(task.createdAt);


    meta.appendChild(priority);
    meta.appendChild(date);

    details.appendChild(title);
    details.appendChild(meta);


    const actions = document.createElement("div");

    actions.className = "task-actions";


    const editButton = document.createElement("button");

    editButton.className = "icon-btn";
    editButton.innerHTML = "✎";
    editButton.setAttribute("aria-label", "Edit task");

    editButton.addEventListener("click", () => {
        openModal(task);
    });


    const deleteButton = document.createElement("button");

    deleteButton.className = "icon-btn delete-btn";
    deleteButton.innerHTML = "⌫";
    deleteButton.setAttribute("aria-label", "Delete task");

    deleteButton.addEventListener("click", () => {
        deleteTask(task.id);
    });


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);


    item.appendChild(checkbox);
    item.appendChild(details);
    item.appendChild(actions);


    return item;
}


// Toggle task

function toggleTask(id) {

    const task = tasks.find(
        item => item.id === id
    );

    if (!task) {
        return;
    }

    task.completed = !task.completed;

    saveTasks();
    renderTasks();
}


// Delete task

function deleteTask(id) {

    tasks = tasks.filter(
        task => task.id !== id
    );

    saveTasks();
    renderTasks();
}


// Statistics

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;


    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;


    const progress =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);


    progressText.textContent = `${progress}%`;
    progressFill.style.width = `${progress}%`;
}


// Format date

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
    });
}


// Search

searchInput.addEventListener("input", () => {
    renderTasks();
});


// Priority filter

priorityFilter.addEventListener("change", () => {

    currentPriority = priorityFilter.value;

    renderTasks();
});


// Status filters

document.querySelectorAll(".filter-btn").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".filter-btn")
            .forEach(btn => {
                btn.classList.remove("active");
            });

        button.classList.add("active");

        currentStatus =
            button.dataset.status;

        renderTasks();
    });
});


// Open modal buttons

addTaskBtn.addEventListener("click", () => {
    openModal();
});

emptyAddBtn.addEventListener("click", () => {
    openModal();
});


// Close modal

closeModalBtn.addEventListener("click", closeModal);

cancelBtn.addEventListener("click", closeModal);


// Close when clicking outside

taskModal.addEventListener("click", event => {

    if (event.target === taskModal) {
        closeModal();
    }
});


// Escape key

document.addEventListener("keydown", event => {

    if (
        event.key === "Escape" &&
        !taskModal.classList.contains("hidden")
    ) {
        closeModal();
    }
});


// Initial render

renderTasks();