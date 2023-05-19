import { AxiosError } from "axios";

const httpSuccessResponses = {
  200: {
    isSuccess: true,
    text: "Okay",
  },
  201: {
    isSuccess: true,
    text: "Created",
  },
} as const;

const httpErrorResponses = {
  400: {
    isSuccess: false,
    text: "Bad Request",
  },
  401: {
    isSuccess: false,
    text: "Unauthorized",
  },
  404: {
    isSuccess: false,
    text: "Not Found",
  },
  408: {
    isSuccess: false,
    text: "Request Timeout",
  },
  500: {
    isSuccess: false,
    text: "Internal Server Error",
  },
  501: {
    isSuccess: false,
    text: "Not Implemented",
  },
  503: {
    isSuccess: false,
    text: "Service Unavailable",
  },
};

type HttpSuccessResponseSpec = typeof httpSuccessResponses;
export type HttpSuccessResponseType = keyof HttpSuccessResponseSpec;

type HttpErrorResponseSpec = typeof httpErrorResponses;
export type HttpErrorResponseType = keyof HttpErrorResponseSpec;

// type HttpResponseSpec = HttpSuccessResponseSpec & HttpErrorResponseSpec;
// type HttpResponseType = HttpSuccessResponseType | HttpErrorResponseType;

export interface SuccessResponse<R extends HttpSuccessResponseType, TReturn> {
  isSuccess: true;
  statusCode: R;
  statusText: HttpSuccessResponseSpec[R]["text"];
  developerFriendlyMessage?: string;
  userFriendlyMessage: string;
  data: TReturn;
}

export interface ErrorResponse<R extends HttpErrorResponseType> {
  isSuccess: false;
  statusCode: R;
  statusText: HttpErrorResponseSpec[R]["text"];
  developerFriendlyMessage?: string;
  userFriendlyMessage: string;
  data?: never;
}

export function makeErrorResponse<R extends HttpErrorResponseType>(
  code: R,
  userMsg: string,
  devMsg?: string
): ErrorResponse<R> {
  return {
    isSuccess: false,
    statusCode: code,
    statusText: httpErrorResponses[code]["text"],
    developerFriendlyMessage: devMsg,
    userFriendlyMessage: userMsg,
  };
}

export function makeSuccessResponse<R extends HttpSuccessResponseType, TData>(
  data: TData,
  code: R,
  userMsg: string,
  devMsg?: string
): SuccessResponse<R, TData> {
  return {
    isSuccess: true,
    statusCode: code,
    statusText: httpSuccessResponses[code]["text"],
    developerFriendlyMessage: devMsg,
    userFriendlyMessage: userMsg,
    data
  };
}


export type Response<TResponseData> = SuccessResponse<HttpSuccessResponseType, TResponseData> | ErrorResponse<HttpErrorResponseType>;