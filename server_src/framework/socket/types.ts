import {
  SuccessResponse,
  ErrorResponse,
  HttpSuccessResponseType,
  HttpErrorResponseType,
  Response,
} from "@common/response";
import { Server, Socket } from "socket.io";

export type ResponseHandlerCallback<TResponseData> = (
  response: Response<TResponseData>
) => void;
export type _SocketIoRouteHandler<TRequest, TResponseData> = (
  token: string | null,
  data: TRequest,
  callback: ResponseHandlerCallback<TResponseData>
) => void;
export type SocketIoRouteHandler<TRequest, TResponseData> = (
  server: Server,
  socket: Socket
) => _SocketIoRouteHandler<TRequest, TResponseData>;
export type SocketIoRoute<TRequest, TResponseData> = [
  name: string,
  installer: SocketIoRouteHandler<TRequest, TResponseData>
];
