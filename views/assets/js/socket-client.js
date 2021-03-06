// Script component managing client sockets

const socket = io();

// Global var
let formUsername = document.body.querySelector("#formUsername"),
  inputUsername = formUsername.querySelector("#inputUsername"),
  loaderUsername = formUsername.querySelector("#loaderUsername"),
  inputMessage = document.body.querySelector("#inputMessage"),
  currentUserWelcome = document.body.querySelector("#currentUserWelcome"),
  username,
  allUsers;

// Send username to server
formUsername.addEventListener("submit", (event) => {
  event.preventDefault();
  let usernameWanted = inputUsername.value;
  socket.emit("setUsername", usernameWanted);
  // Loader switch
  inputUsername.classList.add("hidden");
  loaderUsername.classList.remove("hidden");
});

// Send a msg & writing processing
let isWriting = false,
  stopWriting;
inputMessage.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    // send msg
    sendMessage();
  } else {
    // writing processing
    clearTimeout(stopWriting); // when user writes the setTimeout is not executed
    if (!isWriting) {
      isWriting = true;
      console.log("Start writing:", chat.person);
      socket.emit("startWriting", chat.person);
    }
    stopWriting = setTimeout(() => {
      console.log("Stop writing:", chat.person);
      socket.emit("stopWriting", chat.person);
      isWriting = false;
    }, 1000);
  }
});

const sendMessage = () => {
  let text = inputMessage.value.trim();
  if (text !== "") {
    // send msg
    socket.emit("sendMessage", text, chat.person); // text + recipient
    inputMessage.value = "";
    // writing processing - if we send msg before clearTimeout, we repeat the operation
    isWriting = false;
    clearTimeout(stopWriting);
    console.log("Stop writing: ", chat.person);
    socket.emit("stopWriting", chat.person);
  }
};

// Receive answer from server according user name acceptance
socket.on("acceptUsername", (_username, _allUsers, allSocketIDs) => {
  username = _username;
  allUsers = _allUsers;
  closeModal();
  updateUsers(allUsers);
  currentUserWelcome.textContent = `Bienvenue ${_username}!`;
  setFriends(allUsers, allSocketIDs, username);
});
socket.on("rejectUsername", (_username) => {
  inputUsername.value = "";
  inputUsername.setAttribute(
    "placeholder",
    `User name ${_username} already taken!`
  );
  // Loader switch
  inputUsername.classList.remove("hidden");
  loaderUsername.classList.add("hidden");
});

// Users in chat update
socket.on("newUser", (newUsername, newSocketID, _allUsers) => {
  allUsers = _allUsers;
  updateUsers(allUsers);
  // msg displayed to other users when connecting
  messageNewUser(newUsername);
  addUserChat(newUsername, newSocketID);
});
socket.on("leftUser", (oldSocketID, leaveUsername, _allUsers) => {
  allUsers = _allUsers;
  updateUsers(allUsers);
  // msg displayed to other users leaving
  messageLeaveUser(leaveUsername);
  removeUserChat(oldSocketID);
});

// display msg
socket.on("confirmMessage", (text, dataChat) => showMyMessage(text, dataChat));
socket.on("newMessage", (text, usernameSender, dataChat) =>
  showNewMessage(text, usernameSender, dataChat)
);

// info about msg writing
socket.on("userStartWriting", (usernameWriting, dataChat) =>
  showSomeoneWriting(usernameWriting, dataChat)
);
socket.on("userStopWriting", (dataChat) => removeSomeoneWriting(dataChat));
