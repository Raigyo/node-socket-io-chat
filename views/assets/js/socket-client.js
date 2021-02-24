const socket = io();

// Global var
let formUsername = document.body.querySelector("#formUsername"),
  inputUsername = formUsername.querySelector("#inputUsername"),
  loaderUsername = formUsername.querySelector("#loaderUsername"),
  inputMessage = document.body.querySelector("#inputMessage"),
  username,
  allUsers;

// Send username to server
formUsername.addEventListener("submit", (event) => {
  event.preventDefault();
  let usernameWanted = inputUsername.value;
  console.log(usernameWanted);
  socket.emit("setUsername", usernameWanted);
  // Loader switch
  inputUsername.classList.add("hidden");
  loaderUsername.classList.remove("hidden");
});

// Send a msg
inputMessage.addEventListener("keydown", (event) => {
  if (event.keyCode === 13) {
    sendMessage();
  }
});

const sendMessage = () => {
  let text = inputMessage.value.trim();
  if (text !== "") {
    socket.emit("sendMessage", text);
    inputMessage.value = "";
  }
};

// Receive answer from server according user name acceptance
socket.on("acceptUsername", (_username, _allUsers) => {
  username = _username;
  allUsers = _allUsers;
  console.log("allUsers: ", allUsers);
  closeModal();
  updateUsers(allUsers);
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
socket.on("newUser", (newUsername, _allUsers) => {
  allUsers = _allUsers;
  updateUsers(allUsers);
  // msg displayed to other users when connecting
  messageNewUser(newUsername);
});
socket.on("leftUser", (leaveUsername, _allUsers) => {
  allUsers = _allUsers;
  updateUsers(allUsers);
  console.log("leaveUsername ", leaveUsername);
  console.log("_allUsers ", _allUsers);
  // msg displayed to other users leaving
  messageLeaveUser(leaveUsername);
});

// display msg
socket.on("confirmMessage", (text) => showMyMessage(text));
