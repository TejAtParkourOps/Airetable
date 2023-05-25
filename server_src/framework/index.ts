import process from "node:process";
import { default as createRestApiServer } from "express";
import { Server as SocketIoApiServer } from "socket.io";
import { createServer as createHttpServer, Server as HttpServer } from "node:http";
import { createServer as createHttpsServer, Server as HttpsServer } from "node:https";
import config from "./config";
import { initializeRestApiServer } from "./rest";
import { initializeSocketIoApiServer } from "./socket";
import { RestRoutes, SocketIoRoute } from "./types";
import fs from "node:fs";
import path from "node:path"

export type SocketIoRoutes<TReq = unknown, TRes = unknown> = Array<
  SocketIoRoute<TReq, TRes>
>;

export function startServer(socketIoRoutes: SocketIoRoutes, restRoutes: RestRoutes) {
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

  // create server structure
  const restApiServer = createRestApiServer();
  let server: HttpServer | HttpsServer | null = null;
  if (config.mainConfig.useTLS) {
    server = createHttpsServer({
      key: fs.readFileSync(path.resolve(__dirname, '../../tlscerts/server.pem'), 'utf8'),
      cert: fs.readFileSync(path.resolve(__dirname, '../../tlscerts/server.crt'), 'utf8')
    }, restApiServer);
  } else {
    server = createHttpServer(restApiServer);
  }
  const socketIoApiServer = new SocketIoApiServer(
    server,
    config.socketIoConfig
  );
  
  // initialize API servers
  initializeRestApiServer(restApiServer, restRoutes);
  initializeSocketIoApiServer(socketIoApiServer, socketIoRoutes);
  
  // start serving
  server.listen(config.mainConfig.port, config.mainConfig.host, () => {
    if (!server) return;
    console.info(`Using config: `, JSON.stringify(config.mainConfig))
    console.info(`Server listening on: ${JSON.stringify(server.address())}`);
  });
}
