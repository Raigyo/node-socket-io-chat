// Modules
// ---
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const morgan = require("morgan");
const config = require("./config");

// Const
// ---
const port = config.express.port;
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

app.use(morgan("dev"));

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
    usernameWanted = usernameWanted.trim();
    // Test if the name is not used yet
    let usernameTaken = false;
    for (let socketid in usernames) {
      console.log("user exists ", socketid, "--", usernames[socketid]);
      if (usernames[socketid] == usernameWanted) usernameTaken = true;
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
          socket.emit("acceptUsername", usernameWanted, getUsernames());
        });
      }
    }, timeFakeLoading);
  });

  // User disconected
  // Upon disconnection, sockets leave all the channels they were part of automatically,
  // and no special teardown is needed on your part.
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
    // We delete the username from array
    if (usernames[socket.id]) {
      console.log(`Username ${usernames[socket.id]} deleted`);
      delete usernames[socket.id];
    }
  });
});

// Server launch
// ---
// app.listen(path, [callback]):
// Starts a UNIX socket and listens for connections on the given path.
// This method is identical to Node’s http.Server.listen().
// To use Socket IO we need to replace app by server
server.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

// Array with usernames without index

const getUsernames = () => {
  let users = []; // array with usernames only
  for (let socketid in usernames) {
    users.push(usernames[socketid]);
  }
  return users;
};
