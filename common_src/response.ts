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
};

type HttpSuccessResponseSpec = typeof httpSuccessResponses;
type HttpSuccessResponseType = keyof HttpSuccessResponseSpec;

type HttpErrorResponseSpec = typeof httpErrorResponses;
type HttpErrorResponseType = keyof HttpErrorResponseSpec;

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
