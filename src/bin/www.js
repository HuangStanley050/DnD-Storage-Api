#!/usr/bin/env node

/**
 * Module dependencies.
 */
import http from "http";
import app from "../app";
// var debug = require('debug')('dnd-storage-api:server');

/**
 * Get port from environment and store in Express.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
const port = normalizePort(process.env.PORT || "8000");
/**
 * Event listener for HTTP server "error" event.
 */

/**
 * Create HTTP server.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe  + ${port}` : `Port  + ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error("bind requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error("bind is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;

  console.log("server running on port: ", port);
}

/**
 * Listen on provided port, on all network interfaces.
 */

const server = http.createServer(app);

app.set("port", port);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */
