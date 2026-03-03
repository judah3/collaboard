export type RequestPolicyInput<TPayload> = {
  payload: TPayload;
  requestId?: string;
};

export type NormalizedRequest<TPayload> = {
  requestId: string;
  timestamp: string;
  payload: TPayload;
};

export type ApiError = {
  code: string;
  message: string;
  status: number;
};

const createRequestId = () => `req_${Math.random().toString(36).slice(2, 10)}`;

export const normalizeRequest = <TPayload>(input: RequestPolicyInput<TPayload>): NormalizedRequest<TPayload> => ({
  requestId: input.requestId ?? createRequestId(),
  timestamp: new Date().toISOString(),
  payload: input.payload
});

export const mapDomainError = (error: unknown): ApiError => {
  if (error instanceof Response) {
    return {
      code: "http_error",
      message: error.statusText || "Request failed",
      status: error.status
    };
  }

  if (error instanceof Error) {
    return {
      code: "runtime_error",
      message: error.message,
      status: 500
    };
  }

  return {
    code: "unknown_error",
    message: "Unexpected error",
    status: 500
  };
};

export const shapeResponse = <TData>(data: TData) => data;