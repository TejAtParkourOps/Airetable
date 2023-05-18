import process from "node:process";
import { default as createRestApiServer } from "express";
import { Server as SocketIoServer } from "socket.io";
import { createServer } from "node:http";
import { loadConfig, getSocketIoConfig } from "./config";

export function startServer() {
  console.info("Server is running.");

  // called when `process.exit(...)` called or no additional work to perform.
  process.on("exit", (code) => {
    console.info(`Server exited with code: ${code}`);
  });

  // listen to exit signals from environment
  ["SIGTERM", "SIGINT", "SIGQUIT"].forEach((signal) => {
    process.on(signal, () => {
      console.info(`Received signal: ${signal}`);
      console.info(`Exiting gracefully...`);
      process.exit(0);
    });
  });

  // add comment here
  process.on("warning", (warning) => {
    console.warn(warning.name); // Print the warning name
    console.warn(warning.message); // Print the warning message
    console.warn(warning.stack); // Print the stack trace
  });

  const config = loadConfig();

  const restApiServer = createRestApiServer();
  const server = createServer(restApiServer);
  const socketIoServer = new SocketIoServer(server, getSocketIoConfig(config));

  server.listen(config.port, config.host, () => {
    console.info(`Server listening on: ${JSON.stringify(server.address())}`);
  });
}
