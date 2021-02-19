// Modules
// ---
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const morgan = require("morgan");
const config = require("./config");

// Global variables
// ---
const port = config.express.port;
// Default path for sendFile
const options = {
  root: __dirname + "/views", // __dirname: current directory
};

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
  setTimeout(() => {
    socket.emit("hi", "Server says hi!"); // to client
  }, 1000);
  socket.on("hi", (msg) => {
    // from client
    console.log(msg + socket.id);
  });
  // User disconected
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

// Server launch
// ---
// app.listen(path, [callback]):
// Starts a UNIX socket and listens for connections on the given path.
// This method is identical to Node’s http.Server.listen().
// To use Socket IO we need to replace app by server
server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
