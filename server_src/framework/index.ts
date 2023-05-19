import process from "node:process";
import { default as createRestApiServer } from "express";
import { Server as SocketIoApiServer } from "socket.io";
import { createServer } from "node:http";
import { loadConfig, getSocketIoConfig } from "./config";
import { initializeRestApiServer } from "./rest";
import { initializeSocketIoApiServer } from "./socket";
import { SocketIoRoute } from "./socket/types";
export type SocketIoRoutes<TReq = unknown, TRes = unknown> = Array<SocketIoRoute<TReq, TRes>>;

export function startServer(socketIoRoutes: SocketIoRoutes) {
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

  // load config from env
  const config = loadConfig();

  // create server structure
  const restApiServer = createRestApiServer();
  const server = createServer(restApiServer);
  const socketIoApiServer = new SocketIoApiServer(
    server,
    getSocketIoConfig(config)
  );

  // initialize API servers
  initializeRestApiServer(restApiServer);
  initializeSocketIoApiServer(socketIoApiServer, socketIoRoutes);

  // start serving
  server.listen(config.port, config.host, () => {
    console.info(`Server listening on: ${JSON.stringify(server.address())}`);
  });
}

