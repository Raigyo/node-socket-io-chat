const socket = io();

socket.on("hi", (msg) => {
  // from server
  alert(msg);
  setTimeout(() => {
    socket.emit("hi", "Hello from user "); // to server
  }, 1000);
});
