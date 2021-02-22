const socket = io();

// Global var
let formUsername = document.body.querySelector("#formUsername"),
  inputUsername = formUsername.querySelector("#inputUsername"),
  loaderUsername = formUsername.querySelector("#loaderUsername"),
  username;

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

// Receive answer from server according user name acceptance
socket.on("acceptUsername", (_username) => {
  username = _username;
  closeModal();
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
