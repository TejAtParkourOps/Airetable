import { io, Socket } from "socket.io-client";
import { Response } from "@common/response";

interface Options {
    authToken?: string | (() => string) | undefined | null
}

export const errors = {
  "not-connected": Error("The socket is not connected. Please call connect() function first.")
} as const;

export class ClientSideSocket {
  readonly #serverAddr: string;
  readonly #client: Socket;
  constructor(serverAddress: string, options: Options) {
    this.#serverAddr = serverAddress;
    // initialise client
    this.#client = io(this.#serverAddr, {
      autoConnect: false, // use implemented connect() method!
    });
    this.#client.on("connect", () => {
      console.debug("Connected to server.");
    });
    this.#client.on("connect_error", (error: Error) => {
      console.error("Error connecting to server:", error.message);
    });
    this.#client.on("disconnect", (reason, description) => {
      if (reason !== "io client disconnect") {
        console.error("Server cut connection!", reason, description);
      }
    });
  }
  async connect() {
    return new Promise<void>((resolve)=>{
      this.#client.connect();
      const n = setInterval(()=>{
        if (!this.#client.connected) {
          console.debug("Connecting to server...");
        } else {
          clearInterval(n);
          resolve();
        }  
      }, 1000);
    });
  }
  disconnect() {
    return new Promise<void>((resolve)=>{
      this.#client.disconnect();
      const n = setInterval(()=>{
        if (!this.#client.disconnected) {
          console.debug("Disconnecting from server...");
        } else {
          clearInterval(n);
          resolve();
        }  
      }, 1000);
    });
  }
  #assertConnection() {
      if (!this.#client.connected) {
        throw errors["not-connected"];
      } 
  }
  sendRequest<TRequest, TResponseData>(route: string, data: TRequest): Promise<TResponseData> {
    this.#assertConnection();
    return new Promise(async (resolve, reject) => {
      // this.#assertConnection();
      // define callback function
      const callbackFunc = (response: Response<TResponseData>) => {
        if (!response.isSuccess) {
          reject(response);
        } else {
          resolve(response.data);
        }
      };
      // generate request args, schema: [ authToken (if any), data, callback ]
      const args = [null, data ?? null, callbackFunc];
      // send the message
      this.#client.emit(route, ...args);
    });
  }
//   subscribeToEvent(eventPath: string, callback: (...args: Array<any>) => void) {
//     this.#client.on(eventPath, (...args: Array<any>) => {
//       callback(...args);
//     });
//   }
}
