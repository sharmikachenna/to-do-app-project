// ======== Get important elements ========
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const errorMsg = document.getElementById("error");
const progressText = document.getElementById("progress");
const doneMsg = document.getElementById("doneMsg");
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");

// Confetti variables
let confettiPieces = [];
let confettiShown = false;

// ======== Load tasks on startup ========
window.addEventListener("DOMContentLoaded", loadTasks);

// ======== Add new task ========
addTaskBtn.addEventListener("click", addNewTask);
taskInput.addEventListener("keypress", e => e.key === "Enter" && addNewTask());

function addNewTask() {
  const text = taskInput.value.trim();
  if (!text) return showError("Please enter a task.");
  addTask(text);
  taskInput.value = "";
  clearError();
}

// ======== Create a new task item ========
function addTask(text, completed = false) {
  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = completed;

  const span = document.createElement("span");
  span.textContent = text;
  span.className = "task-text";

  const buttons = document.createElement("div");
  buttons.className = "task-buttons";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.className = "edit";
  editBtn.onclick = () => enableInlineEdit(li, span);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete";
  deleteBtn.onclick = () => {
    li.remove();
    saveTasks();
    updateProgress(true);
  };

  buttons.append(editBtn, deleteBtn);
  li.append(checkbox, span, buttons);
  taskList.appendChild(li);

  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed", checkbox.checked);
    saveTasks();
    updateProgress(true);
  });

  saveTasks();
}

// ======== Inline edit feature ========
function enableInlineEdit(li, span) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.className = "edit-input";
  li.replaceChild(input, span);
  input.focus();

  const save = () => {
    const newText = input.value.trim();
    if (newText) span.textContent = newText;
    li.replaceChild(span, input);
    saveTasks();
    updateProgress(true);
  };

  input.addEventListener("blur", save);
  input.addEventListener("keypress", e => e.key === "Enter" && save());
}

// ======== Error message handling ========
function showError(msg) {
  errorMsg.textContent = msg;
  setTimeout(() => (errorMsg.textContent = ""), 2000);
}
function clearError() {
  errorMsg.textContent = "";
}

// ======== Save & Load tasks ========
function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach(li => {
    const text = li.querySelector(".task-text").textContent;
    const done = li.querySelector("input[type='checkbox']").checked;
    tasks.push({ text, done });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateProgress(false);
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks.forEach(t => addTask(t.text, t.done));
  updateProgress(false, true);
}

// ======== Progress & Confetti ========
function updateProgress(triggeredByUser = false, pageLoad = false) {
  const tasks = document.querySelectorAll("#taskList li");
  const completed = document.querySelectorAll("#taskList input:checked").length;
  progressText.textContent = `${completed}/${tasks.length} tasks done`;
  doneMsg.textContent = "";

  if (tasks.length > 0 && completed === tasks.length) {
    doneMsg.textContent = "You’re all done!";
    if ((pageLoad || triggeredByUser) && !confettiShown) {
      startConfetti();
      confettiShown = true;
    }
  } else {
    confettiShown = false;
  }
}

// ======== Confetti animation ========
function startConfetti() {
  confettiPieces = [];
  for (let i = 0; i < 150; i++) {
    confettiPieces.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      size: Math.random() * 6 + 4,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      speed: Math.random() * 3 + 2
    });
  }
  animateConfetti();
  setTimeout(() => (confettiPieces = []), 3000);
}

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    p.y += p.speed;
    p.x += Math.sin(p.y * 0.05) * 2;
  });
  if (confettiPieces.length > 0) requestAnimationFrame(animateConfetti);
}

// ======== Responsive Canvas ========
function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
