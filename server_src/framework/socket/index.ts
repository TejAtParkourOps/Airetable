import { SuccessResponse, ErrorResponse } from "@common/response";
import { Server, Socket } from "socket.io";
import { SocketIoRoute } from "./types";

export function initializeSocketIoApiServer(
  server: Server,
  routes: Array<SocketIoRoute<unknown, unknown>>
) {
  server.on("connection", (socket) => {
    // handle generic errors...
    socket.on("error", (err?: Error) => {
      console.error("Socket.io API server error!", err?.message);
    });
    // handle for all messages...
    socket.onAny((...args: Array<any>) => {
      // dump message:
      console.debug("Socket.io API server received message:", args);
      // check message validity:
      // 0. message name
      const receivedMessageName = args[0];
      if (!receivedMessageName || typeof receivedMessageName !== "string") {
        console.error(
          `Socket.io API server, invalid message name: '${receivedMessageName}'`
        );
      }
      // 1. token
      // --- nothing yet
      // 2. data
      // --- nothing yet
      // 3. callback
      const callback = args[3];
      if (!callback || typeof callback !== "function") {
        console.error(
          "Socket.io API server, invalid message: no/invalid callback present in request!"
        );
      }
    });
    // register routes
    routes.forEach((r) => {
      socket.on(r[0], r[1](server, socket));
      console.debug(`Registered Socket.io route: '${r[0]}'`);
    });
  });
}
