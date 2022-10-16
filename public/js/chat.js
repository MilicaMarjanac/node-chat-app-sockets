const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $messages = document.querySelector("#messages");
const messageTemplate = document.querySelector("#message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

let { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// globals
let onlineUsers = [];
let currentUserData = {};
let currentRoomData = {};

function autoscroll(messages) {
  const $newMessage = messages.lastElementChild;
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  const visibleHeight = messages.offsetHeight;
  const containerHeight = messages.scrollHeight;
  const scrollOffset = messages.scrollTop + visibleHeight;
  if (containerHeight - 22 - scrollOffset <= newMessageHeight) {
    messages.scrollTop = messages.scrollHeight;
  }
}

window.addEventListener("load", () => {
  fetch("/api/users", {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, room }),
  })
    .then((res) => res.json())
    .then((user) => {
      currentUserData = user;
      document.querySelector("#current-name").innerHTML = user.username;
      socket.emit("join", user);
    });
});

socket.on("roomAdded", async (user) => {
  const allRooms = await fetch("/api/rooms", {
    method: "GET",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
  const roomExist = allRooms.find(
    (currentRoom) => currentRoom.name === user.room
  );
  let userExist;
  if (!roomExist) {
    fetch("/api/rooms", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, room: user.room }),
    })
      .then((res) => res.json())
      .then((response) => {
        currentRoomData = response;
        socket.emit("currentRoomData", currentRoomData);
      });
  } else {
    currentRoomData = roomExist;
    userExist = roomExist.users.find(
      (existingUser) => existingUser._id === user._id
    );
    if (userExist === undefined) {
      roomExist.users.push(user);
      fetch(`/api/rooms/${roomExist._id}`, {
        method: "PUT",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...roomExist }),
      })
        .then((res) => res.json())
        .then((response) => {
          currentRoomData = response;
          updateDataAndFetchMessages(currentRoomData, user);
        });
    }
  }
  if (userExist && roomExist) {
    updateDataAndFetchMessages(currentRoomData, user);
  }
});

function updateDataAndFetchMessages(currentRoomData, user) {
  socket.emit("currentRoomData", currentRoomData);
  if (user.username === username) {
    fetchMesssages(currentRoomData);
  }
}

function fetchMesssages(currentRoomData) {
  fetch(`/api/messages/room/${currentRoomData._id}`, {
    method: "GET",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((messages) => {
      messages.forEach((message) => {
        if (message) {
          renderTemplate(message, messageTemplate);
        }
      });
    });
}

$messageForm.addEventListener("submit", (e) => {
  sendMessage(e, $messageForm, $messageFormButton, $messageFormInput);
});

function sendMessage(e, form, button, input) {
  e.preventDefault();
  form.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  fetch("/api/messages", {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: currentUserData,
      content: message,
      room: currentRoomData,
    }),
  })
    .then((res) => res.json())
    .then((response) => {
      socket.emit("sendMessage", response, (error) => {
        button.removeAttribute("disabled");
        input.value = "";
        input.focus();
        if (error) {
          return console.log(error);
        }
      });
    });
}

socket.on("message", (message) => {
  fetch(`/api/messages/${message._id}`, {
    method: "GET",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((message) => {
      renderTemplate(message, messageTemplate);
    });
});

socket.on("onlineUsers", (users) => {
  onlineUsers = users;
});

socket.on("updateRoomData", (currentRoomData) => {
  updateRoomData(currentRoomData.name, currentRoomData.users);
});

function updateRoomData(room, users) {
  users = users.filter((user) => user.username !== username);
  const html = Mustache.render(sidebarTemplate, {
    room: room.toUpperCase(),
    users,
    count: onlineUsers.length - 1,
  });
  document.querySelector("#sidebar").innerHTML = html;
  setStatus(onlineUsers, "add");
}

function setStatus(users, action) {
  const listItem = document.querySelector(".users");
  const userNames = users.map((user) => user.username);
  for (let i = 0; i < listItem.children.length; i++) {
    let child = listItem.children[i];
    if (userNames.includes(child.innerText)) {
      if (action === "add") {
        child.classList.add("online");
      } else {
        child.classList.remove("online");
      }
    }
  }
}

function renderTemplate(message, template) {
  const side = message.sender.username === username ? "right" : "left";
  const html = Mustache.render(template, {
    username: message.sender.username,
    data: message.content,
    createdAt: moment(message.createdAt).format("h:mm a"),
    side,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll($messages);
}

socket.on("userLeft", (socketID) => {
  const offlineUser = onlineUsers.filter((user) => user.socketID == socketID);
  setStatus(offlineUser, "remove");
  onlineUsers = onlineUsers.filter((user) => user.socketID != socketID);
  updateRoomData(currentRoomData.name, currentRoomData.users);
});
