// Mendapatkan elemen DOM utama dengan getElementById() dan querySelector()
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const prioritySelect = document.getElementById('prioritySelect');
const deadlineInput = document.getElementById('deadlineInput');
const todoList = document.querySelector('#todoList');
const searchInput = document.getElementById('searchInput');
const messageEl = document.getElementById('message');
const toastEl = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const navButtons = document.querySelectorAll('.nav-item');
const viewPanels = document.querySelectorAll('.view-panel');
const editModal = document.getElementById('editModal');
const editTodoForm = document.getElementById('editTodoForm');
const editTodoInput = document.getElementById('editTodoInput');
const editPrioritySelect = document.getElementById('editPrioritySelect');
const editDeadlineInput = document.getElementById('editDeadlineInput');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const agendaEditModal = document.getElementById('agendaEditModal');
const editAgendaForm = document.getElementById('editAgendaForm');
const editAgendaTitleInput = document.getElementById('editAgendaTitleInput');
const editAgendaDateInput = document.getElementById('editAgendaDateInput');
const closeAgendaEditModalBtn = document.getElementById('closeAgendaEditModalBtn');
const cancelAgendaEditBtn = document.getElementById('cancelAgendaEditBtn');
const deleteModal = document.getElementById('deleteModal');
const deleteModalTitle = document.getElementById('deleteModalTitle');
const deleteModalMessage = document.getElementById('deleteModalMessage');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const agendaForm = document.getElementById('agendaForm');
const agendaInput = document.getElementById('agendaInput');
const agendaDateInput = document.getElementById('agendaDateInput');
const agendaList = document.getElementById('agendaList');

const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const progressPercentEl = document.getElementById('progressPercent');
const progressBarEl = document.getElementById('progressBar');

const STORAGE_KEY = 'todo-app-data-v1';
const AGENDA_KEY = 'todo-app-agenda-v1';
const THEME_KEY = 'todo-app-theme';

// Array untuk menyimpan semua data tugas
let todos = [];
let agendaItems = [];
let currentFilter = 'all';
let searchTerm = '';
let darkMode = false;
let editingTodoId = null;
let editingAgendaId = null;
let pendingDelete = null;

// Fungsi untuk memuat data dari localStorage saat aplikasi dibuka
function loadTodos() {
  const savedTodos = localStorage.getItem(STORAGE_KEY);

  if (savedTodos) {
    try {
      const parsedTodos = JSON.parse(savedTodos);
      todos = Array.isArray(parsedTodos)
        ? parsedTodos.map((todo) => ({
            ...todo,
            status: todo.status || (todo.completed ? 'completed' : 'pending'),
            completed: todo.completed ?? todo.status === 'completed',
          }))
        : [];
    } catch (error) {
      console.error('Gagal membaca data:', error);
      todos = [];
    }
  } else {
    todos = [];
  }
}

function loadAgenda() {
  const savedAgenda = localStorage.getItem(AGENDA_KEY);

  if (savedAgenda) {
    try {
      agendaItems = JSON.parse(savedAgenda);
      if (!Array.isArray(agendaItems)) {
        agendaItems = [];
      }
    } catch (error) {
      console.error('Gagal membaca agenda:', error);
      agendaItems = [];
    }
  } else {
    agendaItems = [];
  }
}

// Fungsi untuk menyimpan data ke localStorage
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function saveAgenda() {
  localStorage.setItem(AGENDA_KEY, JSON.stringify(agendaItems));
}

// Fungsi untuk menampilkan pesan singkat di bawah form
function showMessage(text) {
  messageEl.textContent = text;
}

// Fungsi untuk menampilkan notifikasi kecil
function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('show');

  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 1800);
}

function confirmDelete(message = 'Apakah Anda yakin ingin menghapus item ini?') {
  return window.confirm(message);
}

// Fungsi untuk mengatur tema gelap/terang
function applyTheme() {
  document.body.classList.toggle('dark', darkMode);
  localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');

  const icon = themeToggle.querySelector('i');
  if (darkMode) {
    icon.className = 'fa-solid fa-sun';
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> Mode Terang';
  } else {
    icon.className = 'fa-solid fa-moon';
    themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> Mode Gelap';
  }
}

// Fungsi untuk menginisialisasi tema dari localStorage
function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  darkMode = savedTheme === 'dark';
  applyTheme();
}

// Fungsi untuk menghitung statistik tugas
function updateStats() {
  const total = todos.length;
  const completed = todos.filter((todo) => getTaskStatus(todo) === 'completed').length;
  const pending = total - completed;

  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  pendingTasksEl.textContent = pending;

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressPercentEl.textContent = percent + '%';

  if (progressBarEl) {
    progressBarEl.style.width = percent + '%';
  }
}

// Fungsi untuk mengatur prioritas ke teks dan kelas CSS
function getPriorityLabel(priority) {
  if (priority === 'tinggi') return 'Tinggi';
  if (priority === 'sedang') return 'Sedang';
  return 'Rendah';
}

function getPriorityClass(priority) {
  if (priority === 'tinggi') return 'priority-high';
  if (priority === 'sedang') return 'priority-medium';
  return 'priority-low';
}

function getTaskStatus(todo) {
  if (todo.status) {
    return todo.status;
  }

  return todo.completed ? 'completed' : 'pending';
}

function getStatusLabel(status) {
  if (status === 'doing') return 'Sedang dikerjakan';
  if (status === 'completed') return 'Selesai';
  return 'Belum selesai';
}

function getStatusClass(status) {
  if (status === 'doing') return 'status-doing';
  if (status === 'completed') return 'status-completed';
  return 'status-pending';
}

// Fungsi untuk memformat tanggal
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDeadline(deadlineString) {
  if (!deadlineString) {
    return 'Tidak ada deadline';
  }

  const date = new Date(deadlineString + 'T00:00:00');
  if (Number.isNaN(date.getTime())) {
    return 'Tidak ada deadline';
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function toInputDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function renderUpcomingDeadlines() {
  const upcoming = todos
    .filter((todo) => todo.deadline)
    .map((todo) => ({
      ...todo,
      date: new Date(todo.deadline + 'T00:00:00'),
    }))
    .filter((todo) => !Number.isNaN(todo.date.getTime()))
    .sort((a, b) => a.date - b.date)
    .slice(0, 3);

  const upcomingList = document.getElementById('upcomingDeadlines');
  if (!upcomingList) return;

  upcomingList.innerHTML = '';
  if (upcoming.length === 0) {
    upcomingList.innerHTML = '<div class="empty-state"><p>Tidak ada deadline mendatang.</p></div>';
    return;
  }

  upcoming.forEach((todo) => {
    const item = document.createElement('div');
    item.className = 'mini-item';
    item.innerHTML = `
      <span class="mini-dot"></span>
      <div>
        <strong>${todo.text}</strong>
        <p>${formatDeadline(todo.deadline)}</p>
      </div>
      <span class="status-pill ${getStatusClass(getTaskStatus(todo))}">
        ${getStatusLabel(getTaskStatus(todo))}
      </span>
    `;
    upcomingList.appendChild(item);
  });
}

function shiftDeadlineToNext(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;

  const currentDate = todo.deadline ? new Date(todo.deadline + 'T00:00:00') : new Date();
  if (Number.isNaN(currentDate.getTime())) {
    currentDate.setTime(Date.now());
  }

  currentDate.setDate(currentDate.getDate() + 1);
  todo.deadline = toInputDateString(currentDate);
  saveTodos();
  renderTodos();
  showToast('Deadline dipindahkan ke tanggal berikutnya');
}

function renderAgenda() {
  const sortedAgenda = agendaItems
    .map((item) => ({
      ...item,
      date: new Date(item.date + 'T00:00:00'),
    }))
    .filter((item) => !Number.isNaN(item.date.getTime()))
    .sort((a, b) => a.date - b.date);

  agendaList.innerHTML = '';

  if (sortedAgenda.length === 0) {
    agendaList.innerHTML = '<div class="empty-state"><p>Belum ada agenda.</p></div>';
    return;
  }

  sortedAgenda.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'agenda-item';
    card.innerHTML = `
      <div>
        <strong>${item.title}</strong>
        <p>${formatDeadline(toInputDateString(item.date))}</p>
      </div>
      <div class="agenda-actions">
        <button type="button" class="icon-btn edit-btn" data-id="${item.id}"><i class="fa-solid fa-pen"></i> Edit</button>
        <button type="button" class="icon-btn delete-btn" data-id="${item.id}"><i class="fa-solid fa-trash"></i> Hapus</button>
      </div>
    `;
    agendaList.appendChild(card);
  });
}

// Fungsi untuk menampilkan tugas sesuai filter dan pencarian
function renderTodos() {
  const filteredTodos = todos
    .filter((todo) => {
      const isCompleted = getTaskStatus(todo) === 'completed';
      const matchesFilter =
        currentFilter === 'all'
          ? true
          : currentFilter === 'completed'
          ? isCompleted
          : !isCompleted;

      const searchText = todo.text.toLowerCase();
      const matchesSearch = searchText.includes(searchTerm.trim().toLowerCase());

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const aCompleted = getTaskStatus(a) === 'completed';
      const bCompleted = getTaskStatus(b) === 'completed';
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
      }

      const priorityOrder = { tinggi: 0, sedang: 1, rendah: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  todoList.innerHTML = '';

  if (filteredTodos.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <i class="fa-solid fa-list-check"></i>
      <p>Tidak ada tugas yang sesuai.</p>
    `;
    todoList.appendChild(emptyState);
    updateStats();
    return;
  }

  filteredTodos.forEach((todo) => {
    const card = document.createElement('article');
    card.className = 'todo-card';

    const status = getTaskStatus(todo);

    if (status === 'completed') {
      card.classList.add('completed');
    }

    const topRow = document.createElement('div');
    topRow.className = 'todo-top';

    const title = document.createElement('h3');
    title.className = 'todo-title';
    title.textContent = todo.text;

    const badge = document.createElement('span');
    badge.className = 'priority-badge ' + getPriorityClass(todo.priority);
    badge.textContent = getPriorityLabel(todo.priority);

    topRow.appendChild(title);
    topRow.appendChild(badge);
    card.appendChild(topRow);

    const meta = document.createElement('div');
    meta.className = 'todo-meta';
    meta.innerHTML = `
      <span><i class="fa-regular fa-calendar-plus"></i> Ditambahkan: ${formatDate(todo.createdAt)}</span>
      <span><i class="fa-solid fa-hourglass-half"></i> Deadline: ${formatDeadline(todo.deadline)}</span>
      <span class="status-pill ${getStatusClass(status)}">${getStatusLabel(status)}</span>
    `;
    card.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const leftGroup = document.createElement('div');
    leftGroup.className = 'checkbox-wrap';

    const statusSelect = document.createElement('select');
    statusSelect.className = 'task-status-select';
    statusSelect.dataset.id = todo.id;
    statusSelect.innerHTML = `
      <option value="pending" ${status === 'pending' ? 'selected' : ''}>Belum selesai</option>
      <option value="doing" ${status === 'doing' ? 'selected' : ''}>Sedang dikerjakan</option>
      <option value="completed" ${status === 'completed' ? 'selected' : ''}>Selesai</option>
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'complete-checkbox';
    checkbox.checked = status === 'completed';
    checkbox.dataset.id = todo.id;

    const labelText = document.createElement('span');
    labelText.textContent = 'Selesai';

    leftGroup.appendChild(statusSelect);
    leftGroup.appendChild(checkbox);
    leftGroup.appendChild(labelText);

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'action-buttons';

    const deadlineBtn = document.createElement('button');
    deadlineBtn.type = 'button';
    deadlineBtn.className = 'icon-btn deadline-btn';
    deadlineBtn.dataset.id = todo.id;
    deadlineBtn.innerHTML = '<i class="fa-solid fa-forward"></i> Deadline berikut';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'icon-btn edit-btn';
    editBtn.dataset.id = todo.id;
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'icon-btn delete-btn';
    deleteBtn.dataset.id = todo.id;
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Hapus';

    buttonGroup.appendChild(deadlineBtn);
    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(deleteBtn);

    actions.appendChild(leftGroup);
    actions.appendChild(buttonGroup);
    card.appendChild(actions);
    todoList.appendChild(card);
  });

  updateStats();
  renderUpcomingDeadlines();
  renderAgenda();
}

// Fungsi untuk menambahkan tugas baru
function addTodo(event) {
  event.preventDefault();

  const text = todoInput.value.trim();
  const priority = prioritySelect.value;
  const deadline = deadlineInput.value;

  if (!text) {
    showMessage('Tugas tidak boleh kosong.');
    todoInput.focus();
    return;
  }

  const newTodo = {
    id: Date.now().toString(),
    text: text,
    priority: priority,
    deadline: deadline,
    status: 'pending',
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  saveTodos();
  renderTodos();
  todoForm.reset();
  showMessage('');
  showToast('Tugas berhasil ditambahkan');
  todoInput.focus();
}

function addAgenda(event) {
  event.preventDefault();

  const title = agendaInput.value.trim();
  const date = agendaDateInput.value;

  if (!title || !date) {
    showToast('Judul dan tanggal agenda harus diisi');
    return;
  }

  agendaItems.push({
    id: Date.now().toString(),
    title,
    date,
  });

  saveAgenda();
  renderAgenda();
  agendaForm.reset();
  showToast('Agenda berhasil ditambahkan');
}

function openAgendaEditModal(agenda) {
  editingAgendaId = agenda.id;
  editAgendaTitleInput.value = agenda.title;
  editAgendaDateInput.value = agenda.date || '';
  agendaEditModal.classList.add('show');
  agendaEditModal.setAttribute('aria-hidden', 'false');
  editAgendaTitleInput.focus();
}

function closeAgendaEditModal() {
  agendaEditModal.classList.remove('show');
  agendaEditModal.setAttribute('aria-hidden', 'true');
  editingAgendaId = null;
  editAgendaForm.reset();
}

function editAgenda(id) {
  const agenda = agendaItems.find((item) => item.id === id);
  if (!agenda) return;

  openAgendaEditModal(agenda);
}

function deleteAgenda(id) {
  const agenda = agendaItems.find((item) => item.id === id);
  if (!agenda) return;

  openDeleteModal({ type: 'agenda', id: agenda.id, label: agenda.title });
}

function openEditModal(todo) {
  editingTodoId = todo.id;
  editTodoInput.value = todo.text;
  editPrioritySelect.value = todo.priority;
  editDeadlineInput.value = todo.deadline || '';
  editModal.classList.add('show');
  editModal.setAttribute('aria-hidden', 'false');
  editTodoInput.focus();
}

function closeEditModal() {
  editModal.classList.remove('show');
  editModal.setAttribute('aria-hidden', 'true');
  editingTodoId = null;
  editTodoForm.reset();
}

function openDeleteModal({ type, id, label }) {
  pendingDelete = { type, id };
  deleteModalTitle.textContent = type === 'agenda' ? 'Hapus Agenda' : 'Hapus Tugas';
  deleteModalMessage.textContent = `Apakah Anda yakin ingin menghapus ${type === 'agenda' ? 'agenda' : 'tugas'} "${label}"?`;
  deleteModal.classList.add('show');
  deleteModal.setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
  deleteModal.classList.remove('show');
  deleteModal.setAttribute('aria-hidden', 'true');
  pendingDelete = null;
}

function confirmDeleteAction() {
  if (!pendingDelete) return;

  const { type, id } = pendingDelete;

  if (type === 'agenda') {
    const index = agendaItems.findIndex((item) => item.id === id);
    if (index !== -1) {
      agendaItems.splice(index, 1);
      saveAgenda();
      renderAgenda();
      showToast('Agenda berhasil dihapus');
    }
  } else if (type === 'bulk-completed') {
    todos = todos.filter((todo) => getTaskStatus(todo) !== 'completed');
    saveTodos();
    renderTodos();
    showToast('Tugas selesai berhasil dibersihkan');
  } else if (type === 'bulk-all') {
    todos = [];
    saveTodos();
    renderTodos();
    showToast('Semua tugas berhasil dihapus');
  } else {
    const index = todos.findIndex((item) => item.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
      showToast('Tugas berhasil dihapus');
    }
  }

  closeDeleteModal();
}

// Fungsi untuk mengedit tugas
function editTodo(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;

  openEditModal(todo);
}

// Fungsi untuk menghapus satu tugas
function deleteTodo(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;

  openDeleteModal({ type: 'todo', id: todo.id, label: todo.text });
}

// Fungsi untuk mengubah status selesai/belum selesai
function toggleTodo(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;

  const nextCompleted = !todo.completed;
  todo.completed = nextCompleted;
  todo.status = nextCompleted ? 'completed' : 'pending';
  saveTodos();
  renderTodos();
}

// Fungsi untuk menghapus semua tugas selesai
function clearCompleted() {
  openDeleteModal({
    type: 'bulk-completed',
    id: 'completed',
    label: 'semua tugas selesai',
  });
}

// Fungsi untuk menghapus semua tugas
function clearAll() {
  openDeleteModal({
    type: 'bulk-all',
    id: 'all',
    label: 'semua tugas',
  });
}

// Event listener untuk form tambah tugas
 todoForm.addEventListener('submit', addTodo);

// Event listener untuk menambahkan tugas saat tombol Enter ditekan
 todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addTodo(event);
  }
});

// Event listener untuk pencarian tugas secara real-time
 searchInput.addEventListener('input', (event) => {
  searchTerm = event.target.value;
  renderTodos();
});

agendaForm.addEventListener('submit', addAgenda);

agendaList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = button.dataset.id;
  if (button.classList.contains('edit-btn')) {
    editAgenda(id);
  } else if (button.classList.contains('delete-btn')) {
    deleteAgenda(id);
  }
});

// Event listener untuk filter tugas
 filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    renderTodos();
  });
});

// Event delegation untuk tombol edit dan hapus, serta checkbox selesai
 todoList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = button.dataset.id;
  if (button.classList.contains('delete-btn') && button.closest('.todo-card')) {
    deleteTodo(id);
  } else if (button.classList.contains('edit-btn') && button.closest('.todo-card')) {
    editTodo(id);
  } else if (button.classList.contains('deadline-btn')) {
    shiftDeadlineToNext(id);
  } else if (button.classList.contains('edit-btn') && button.closest('.agenda-item')) {
    editAgenda(id);
  } else if (button.classList.contains('delete-btn') && button.closest('.agenda-item')) {
    deleteAgenda(id);
  }
});

 todoList.addEventListener('change', (event) => {
  const checkbox = event.target.closest('.complete-checkbox');
  if (checkbox) {
    toggleTodo(checkbox.dataset.id);
    return;
  }

  const statusSelect = event.target.closest('.task-status-select');
  if (!statusSelect) return;

  const todo = todos.find((item) => item.id === statusSelect.dataset.id);
  if (!todo) return;

  const nextStatus = statusSelect.value;
  todo.status = nextStatus;
  todo.completed = nextStatus === 'completed';
  saveTodos();
  renderTodos();
  showToast('Status tugas diperbarui');
});

// Event listener untuk tombol hapus semua dan hapus tugas selesai
 clearCompletedBtn.addEventListener('click', clearCompleted);
 clearAllBtn.addEventListener('click', clearAll);

// Event listener untuk toggle dark mode
 themeToggle.addEventListener('click', () => {
  darkMode = !darkMode;
  applyTheme();
  showToast(darkMode ? 'Mode gelap aktif' : 'Mode terang aktif');
});

editTodoForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!editingTodoId) return;

  const todo = todos.find((item) => item.id === editingTodoId);
  if (!todo) return;

  const updatedText = editTodoInput.value.trim();
  if (!updatedText) {
    showToast('Tugas tidak boleh kosong');
    return;
  }

  todo.text = updatedText;
  todo.priority = editPrioritySelect.value;
  todo.deadline = editDeadlineInput.value;

  saveTodos();
  renderTodos();
  closeEditModal();
  showToast('Tugas berhasil diperbarui');
});

closeEditModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

confirmDeleteBtn.addEventListener('click', confirmDeleteAction);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);
closeDeleteModalBtn.addEventListener('click', closeDeleteModal);

deleteModal.addEventListener('click', (event) => {
  if (event.target === deleteModal) {
    closeDeleteModal();
  }
});

editAgendaForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!editingAgendaId) return;

  const agenda = agendaItems.find((item) => item.id === editingAgendaId);
  if (!agenda) return;

  const updatedTitle = editAgendaTitleInput.value.trim();
  if (!updatedTitle) {
    showToast('Judul agenda tidak boleh kosong');
    return;
  }

  const updatedDate = editAgendaDateInput.value.trim();
  agenda.title = updatedTitle;
  agenda.date = updatedDate;

  saveAgenda();
  renderAgenda();
  closeAgendaEditModal();
  showToast('Agenda berhasil diperbarui');
});

closeAgendaEditModalBtn.addEventListener('click', closeAgendaEditModal);
cancelAgendaEditBtn.addEventListener('click', closeAgendaEditModal);

editModal.addEventListener('click', (event) => {
  if (event.target === editModal) {
    closeEditModal();
  }
});

agendaEditModal.addEventListener('click', (event) => {
  if (event.target === agendaEditModal) {
    closeAgendaEditModal();
  }
});

function switchView(viewName) {
  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewName);
  });

  viewPanels.forEach((panel) => {
    const targetId = `view${viewName.charAt(0).toUpperCase()}${viewName.slice(1)}`;
    panel.classList.toggle('active-view', panel.id === targetId);
  });
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    switchView(button.dataset.view);
  });
});

// Inisialisasi aplikasi saat halaman dibuka
 function init() {
  loadTodos();
  loadAgenda();
  loadTheme();
  renderTodos();
  switchView('overview');
}

 init();