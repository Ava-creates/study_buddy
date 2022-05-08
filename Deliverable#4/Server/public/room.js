
var socket;
var roomID;
var userName; 

window.onload = async function() {
  pomodoro.init();
  roomID = JSON.parse(localStorage.getItem("roomID"));

  if (!roomID) {
    alert("You are not connected to a room yet. Please match again!");
    location.href = '/dashboard.html'
    return;
  } 

  await fetch(`https://studybuddy-server.herokuapp.com/room/${roomID}`).then(async function (response) {
    // The API call was successful!
    if (response.status === 401) {
      alert("You are not connected to a room yet. Please match again!");
      location.href = '/dashboard.html'
    }

    if (response.status === 200) {
      await fetch(`https://studybuddy-server.herokuapp.com/userdata`).then(async function (response2) {
        // The API call was successful!
        if (response.status === 401) {
          alert("You are not logged in!");
          location.href = '/';
        }
        
        let json = await response.json();
        const messages = json.messages;
        const users = json.users;

        let json2 = await response2.json();
        const userName = json2.displayName;
        
        let usersString = "" + (users.length - 1) + " students are in this room: ";
        users.forEach((user) => {
          if (user !== userName) {
            usersString += user + ", ";
          }
        })
        addMessage("", usersString)

        messages.forEach((message) => {
          if (message.author === userName) {
            addMessage("", message.message)
          } else {
            addMessage(message.author, message.message)
          }
        });
      }).catch(function (err) {
        console.warn('Something went wrong.', err);
      });
    }
  }).catch(function (err) {
    console.warn('Something went wrong.', err);
  });

  
  socket = io("https://studybuddy-server.herokuapp.com/")

  socket.on('userEnter', (user) => {
    const str = "--- " + user.user + " has joined the room. ---"
    addMessage("", str);
  })
  
  socket.on('userExit', (user) => {
    const str = "--- " + user.user + " has left the room. ---"
    addMessage("", str);
  })

  socket.on('message', (msgObj) => {
    const { sent_by, message } = msgObj;
    if (sent_by === userName) {
      addMessage("", message);
    } else {
      addMessage(sent_by, message);
    }
  })

  socket.on('pomodoro', (message) => {
    const { timeLeft, isPaused, status, breakType } = message

    if (status === "running") {
      pomodoro.startWork();
    } else if (status === "break") {
      if (breakType === "long") {
        pomodoro.startLongBreak();
      } else if (breakType === "short") {
        pomodoro.startShortBreak();
      }
    }

    pomodoro.resetVariables(Math.floor(timeLeft / 60), timeLeft % 60, !isPaused);
  })
}

const exitChat = document.getElementById("exitChat");
exitChat.addEventListener('click', () => {
  fetch('https://studybuddy-server.herokuapp.com/leaveRoom');
  location.href = '/dashboard.html';
  localStorage.setItem("roomID", "")
})


// chat feature

function addMessage(name, message) /// assuming m is a json with the message and like person name
{
    const el = document.createElement('div');
    el.classList.add('msgln');

    el.innerHTML = "";
    
    if (name) {
      el.innerHTML += "<b class='user-name'>"+ name+"</b> ";
    }

    el.innerHTML += message;
    document.getElementById("chatbox").appendChild(el);
}

const msgInputBox = document.getElementById('usermsg');
const msgSendButton = document.getElementById('submitmsg');

msgSendButton.addEventListener('click', () => {
  const msg = msgInputBox.value;

  if (msg !== "") {
    socket.emit('send_message', msg);
  } 

  msgInputBox.value = "";
})


// todo feature

// Getting the user input
const taskInput = document.querySelector(".task-input input"),
    filters = document.querySelectorAll(".filters span"),
    clearAll = document.querySelector(".clear-btn"),
    taskBox = document.querySelector(".task-box");

let editId,
    isEditTask = false,
    todos = JSON.parse(localStorage.getItem("todo-list"));

// checking when the button is being clicked to store the input text in the to-do
filters.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector("span.active").classList.remove("active");
        btn.classList.add("active");
        showTodo(btn.id);
    });
});
// Displaying the to-do
function showTodo(filter) {
    let liTag = "";
    if (todos) {
        todos.forEach((todo, id) => {
            let completed = todo.status == "completed" ? "checked" : "";
            if (filter == todo.status || filter == "all") {
                liTag += `<li class="task">
                            <label for="${id}">
                                <input onclick="updateStatus(this)" type="checkbox" id="${id}" ${completed}>
                                <p class="${completed}">${todo.name}</p>
                            </label>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="task-menu">
                                    <li onclick='editTask(${id}, "${todo.name}")'><i class="uil uil-pen"></i>Edit</li>
                                    <li onclick='deleteTask(${id}, "${filter}")'><i class="uil uil-trash"></i>Delete</li>
                                </ul>
                            </div>
                        </li>`;
            }
        });
    }
    // Displaying to-do list or default text if it is empty
    taskBox.innerHTML = liTag || `<span>You don't have any task here</span>`;
    let checkTask = taskBox.querySelectorAll(".task");
    !checkTask.length ? clearAll.classList.remove("active") : clearAll.classList.add("active");
    taskBox.offsetHeight >= 300 ? taskBox.classList.add("overflow") : taskBox.classList.remove("overflow");
}
showTodo("all");

function showMenu(selectedTask) {
    let menuDiv = selectedTask.parentElement.lastElementChild;
    menuDiv.classList.add("show");
    document.addEventListener("click", e => {
        if (e.target.tagName != "I" || e.target != selectedTask) {
            menuDiv.classList.remove("show");
        }
    });
}

function updateStatus(selectedTask) {
    let taskName = selectedTask.parentElement.lastElementChild;
    if (selectedTask.checked) {
        taskName.classList.add("checked");
        todos[selectedTask.id].status = "completed";
    } else {
        taskName.classList.remove("checked");
        todos[selectedTask.id].status = "pending";
    }
    localStorage.setItem("todo-list", JSON.stringify(todos))
}

function editTask(taskId, textName) {
    editId = taskId;
    isEditTask = true;
    taskInput.value = textName;
    taskInput.focus();
    taskInput.classList.add("active");
}

function deleteTask(deleteId, filter) {
    isEditTask = false;
    todos.splice(deleteId, 1);
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo(filter);
}

clearAll.addEventListener("click", () => {
    isEditTask = false;
    todos.splice(0, todos.length);
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo()
});

taskInput.addEventListener("keyup", e => {
    let userTask = taskInput.value.trim();
    if (e.key == "Enter" && userTask) {
        if (!isEditTask) {
            todos = !todos ? [] : todos;
            let taskInfo = { name: userTask, status: "pending" };
            todos.push(taskInfo);
        } else {
            isEditTask = false;
            todos[editId].name = userTask;
        }
        taskInput.value = "";
        localStorage.setItem("todo-list", JSON.stringify(todos));
        showTodo(document.querySelector("span.active").id);
    }
});