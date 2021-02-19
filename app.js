const express = require("express");
const app = express();
const port = 3000;
const morgan = require("morgan");
// Default path for sendFile
let options = {
  root: __dirname + "/views", // __dirname: current directory
};

// app.use([path,] callback [, callback...])
// Mounts the specified middleware function or functions at the specified path:
// the middleware function is executed when the base of the requested path matches path.
app.use((req, res, next) => {
  console.log(`URL: ${req.path}`);
  next();
});

app.use(morgan("dev"));

// middleware used to define static files directory
app.use(express.static(options.root));

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

// app.listen(path, [callback]):
// Starts a UNIX socket and listens for connections on the given path.
// This method is identical to Node’s http.Server.listen().
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

//
