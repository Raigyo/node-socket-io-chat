// Script component managing server configuration and sockets

// Modules
// ---
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const striptags = require("striptags");
const config = require("./config");
const PORT = process.env.PORT || 3000;
// Const
// ---
// Default path for sendFile
const options = {
  root: __dirname + "/views", // __dirname: current directory
};
// Global variables
// ---
let usernames = [];

// Middlewares
// ---
// app.use([path,] callback [, callback...])
// Mounts the specified middleware function or functions at the specified path:
// the middleware function is executed when the base of the requested path matches path.
app.use((req, res, next) => {
  console.log(`URL: ${req.path}`);
  next();
});

// middleware used to define static files directory
app.use(require("express").static(options.root));

// Routes
// ---
// app.get(path, callback): get route
app.get("/", (req, res) => {
  res.redirect("home");
});
app.get("/home", (req, res) => {
  // console.log(req.hostname, req.path);
  // console.log(req.query); // /?page=test => { page: 'test' }
  // res.send("Hello World!");
  res.sendFile("index.html", options); // Transfers the file at the given path.
});

app.get("/params/:name", (req, res) => {
  // res.send(req.params.name); // display path after params/
});

// IO

// IO Event handler
io.on("connection", (socket) => {
  // socket.emit('request', /* … */); // emit an event to the socket
  // io.emit('broadcast', /* … */); // emit an event to all connected sockets
  // socket.on('reply', () => { /* … */ }); // listen to the event
  console.log(`User ${socket.id} connected`);
  // Assign a user name
  // Receive user name from client
  socket.on("setUsername", (usernameWanted) => {
    // String trim
    usernameWanted = striptags(usernameWanted.trim());
    // Test if the name is not used yet
    let usernameTaken = false;
    for (let socketid in usernames) {
      console.log("user exists ", socketid, "--", usernames[socketid]);
      if (usernames[socketid] === usernameWanted) usernameTaken = true;
    }

    // Fake loading time
    let timeFakeLoading = 1000;
    setTimeout(() => {
      // Final check
      if (usernameTaken) {
        socket.emit("rejectUsername", usernameWanted);
      } else {
        // Users = users authenticated in the chat
        socket.join("users", () => {
          usernames[socket.id] = usernameWanted;
          let justUsernames = getUsernames();
          socket.emit(
            "acceptUsername",
            usernameWanted,
            justUsernames,
            getSocketIDs()
          );
          // when a new user enter a room:
          // socket.broadcast.emit("new user connected")
          // we don't use broadcast because it sends te event to all sockets excepted sender
          // but we need to send event only to the users already identified
          // so we make a broadcast using room name and send a connection message
          // to all other users and update the list of users in chat
          socket
            .to("users")
            .emit("newUser", usernameWanted, socket.id, justUsernames);
        });
      }
    }, timeFakeLoading);
  });

  // Receive / broadcast a msg
  socket.on("sendMessage", (text, dataChat) => {
    text = striptags(text.trim());
    if (text !== "") {
      let data = getVariablesDataChat(dataChat, socket.id);
      socket
        .to(data.roomToSend)
        .emit("newMessage", text, usernames[socket.id], data.chatToShow);
      // send msg to room + sender name + socket
      socket.emit("confirmMessage", text, data.dataChat); // send msg to sender to manage bubble class
    }
  });

  // Informations about msg writing
  socket.on("startWriting", (dataChat) => {
    let data = getVariablesDataChat(dataChat, socket.id);
    socket
      .to(data.roomToSend)
      .emit("userStartWriting", usernames[socket.id], data.chatToShow);
  });
  socket.on("stopWriting", (dataChat) => {
    let data = getVariablesDataChat(dataChat, socket.id);
    socket.to(data.roomToSend).emit("userStopWriting", data.chatToShow);
  });

  // User disconected
  // Upon disconnection, sockets leave all the channels they were part of automatically,
  // and no special teardown is needed on your part.
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
    // We delete the username from array
    if (usernames[socket.id]) {
      console.log(`Username ${usernames[socket.id]} deleted`);
      let userLeaving = usernames[socket.id];
      delete usernames[socket.id];
      // we send a leaving message to all user and update the list of users in chat
      socket
        .to("users")
        .emit("leftUser", socket.id, userLeaving, getUsernames());
    }
  });
});

// Array with usernames without index

const getUsernames = () => {
  let users = []; // array with usernames only
  for (let socketid in usernames) {
    users.push(usernames[socketid]);
  }
  return users;
};

// Array with socketIDs without index

const getSocketIDs = () => {
  let socketIDs = [];
  for (let socketid in usernames) {
    socketIDs.push(socketid);
  }
  return socketIDs;
};

// Send all var from DataChat
const getVariablesDataChat = (dataChat, socketID) => {
  dataChat = dataChat === null ? "person0" : dataChat;
  return {
    // send msg to target user (to)
    roomToSend: dataChat === "person0" ? "users" : dataChat,
    // chat/user in which the message has to be shown (from)
    chatToShow: dataChat === "person0" ? dataChat : socketID,
    dataChat: dataChat,
  };
};

// Server launch
// ---
// app.listen(path, [callback]):
// Starts a UNIX socket and listens for connections on the given path.
// This method is identical to Node’s http.Server.listen().
// To use Socket IO we need to replace app by server
// server.listen(port, () => {
//   console.log(`App listening at http://localhost:${port}`);
// });

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
