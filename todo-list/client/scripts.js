// Cadastro
const postUser = async () => {
  let user = document.getElementById("user").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  let payload = { name: user, email: email, password: password };
  let url = "http://127.0.0.1:8000/auth/signup";

  fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  })
    .then(r => {
      if (!r.ok) throw new Error("Erro ao cadastrar usuário");
      return r.json();
    })
    .then(() => {
      document.getElementById("signupMsg").innerText = "Cadastro realizado!";
      document.getElementById("signupMsg").style.color = "green";
    })
    .catch(err => {
      document.getElementById("signupMsg").innerText = "Erro: " + err.message;
      document.getElementById("signupMsg").style.color = "red";
    });
};

// Login
const loginUser = async () => {
  let email = document.getElementById("loginEmail").value;
  let password = document.getElementById("loginPassword").value;

  let payload = { email, password };
  let url = "http://127.0.0.1:8000/auth/login";

  fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  })
    .then(r => {
      if (!r.ok) throw new Error("Credenciais inválidas");
      return r.json();
    })
    .then(data => {
      localStorage.setItem("token", data.access_token);
      document.getElementById("loginMsg").innerText = "Login realizado!";
      document.getElementById("loginMsg").style.color = "green";

      document.getElementById("tasksSection").style.display = "block";
      listTasks();
    })
    .catch(err => {
      document.getElementById("loginMsg").innerText = "Erro: " + err.message;
      document.getElementById("loginMsg").style.color = "red";
    });
};

// Criar tarefa
const createTask = async () => {
  let title = document.getElementById("newTaskTitle").value;
  let token = localStorage.getItem("token");

  fetch("http://127.0.0.1:8000/tasks", {
    method: "POST",
    body: JSON.stringify({ title, done: false }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
  })
    .then(r => {
      if (!r.ok) throw new Error("Erro ao criar tarefa");
      return r.json();
    })
    .then(task => {
      document.getElementById("tasksMsg").innerText = "Tarefa criada!";
      document.getElementById("tasksMsg").style.color = "green";
      document.getElementById("newTaskTitle").value = "";
      renderTask(task);
    })
    .catch(err => {
      document.getElementById("tasksMsg").innerText = "Erro: " + err.message;
      document.getElementById("tasksMsg").style.color = "red";
    });
};

// Listar tarefas
const listTasks = async () => {
  let token = localStorage.getItem("token");

  fetch("http://127.0.0.1:8000/tasks", {
    method: "GET",
    headers: { "Authorization": "Bearer " + token },
  })
    .then(r => {
      if (!r.ok) throw new Error("Erro ao listar tarefas");
      return r.json();
    })
    .then(data => {
      let tasks = data.tasks ?? data;
      let ul = document.getElementById("tasksList");
      ul.innerHTML = "";
      tasks.forEach(renderTask);
    })
    .catch(err => {
      document.getElementById("tasksMsg").innerText = "Erro: " + err.message;
      document.getElementById("tasksMsg").style.color = "red";
    });
};

// Renderizar tarefa (CORRIGIDO)
const renderTask = (task) => {
  let ul = document.getElementById("tasksList");

  let li = document.createElement("li");

  let left = document.createElement("div");
  left.classList.add("task-left");

  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.onchange = () => toggleTask(task.id, checkbox.checked);

  let span = document.createElement("span");
  span.innerText = task.title;

  left.appendChild(checkbox);
  left.appendChild(span);

  let editBtn = document.createElement("button");
  editBtn.innerText = "Editar";
  editBtn.classList.add("task-btn");
  editBtn.onclick = () => editTask(task.id, span);

  let delBtn = document.createElement("button");
  delBtn.innerText = "Excluir";
  delBtn.classList.add("task-btn");
  delBtn.onclick = () => deleteTask(task.id, li);

  li.appendChild(left);
  li.appendChild(editBtn);
  li.appendChild(delBtn);

  ul.appendChild(li);
};

// Atualizar status
const toggleTask = async (id, done) => {
  let token = localStorage.getItem("token");

  fetch(`http://127.0.0.1:8000/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify({ done }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
  });
};

// Editar
const editTask = async (id, span) => {
  let novoTitulo = prompt("Novo título:", span.innerText);
  if (!novoTitulo) return;

  let token = localStorage.getItem("token");

  fetch(`http://127.0.0.1:8000/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title: novoTitulo }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
  })
    .then(r => r.json())
    .then(t => (span.innerText = t.title));
};

// Excluir
const deleteTask = async (id, li) => {
  let token = localStorage.getItem("token");

  fetch(`http://127.0.0.1:8000/tasks/${id}`, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token },
  }).then(() => li.remove());
};

// Logout
const logoutUser = () => {
  localStorage.removeItem("token");
  document.getElementById("tasksSection").style.display = "none";
  document.getElementById("loginMsg").innerText = "Logout realizado!";
  document.getElementById("loginMsg").style.color = "green";
};
