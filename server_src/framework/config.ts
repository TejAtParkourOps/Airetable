import { ServerOptions as SocketIoServerOptions } from "socket.io";
import { CorsOptions } from "cors";

type EnvironmentVariableType = "string" | "integer" | "boolean";

function loadOptionalEnvironmentVariable<
  TVal extends EnvironmentVariableType,
  TRet extends TVal extends "string"
    ? string
    : TVal extends "integer"
    ? number
    : TVal extends "boolean"
    ? boolean
    : never
>(key: string, asType: TVal): TRet | undefined {
  const _key = `AIRETABLE_${key}`;
  const val = process.env?.[_key];
  if (!val) return undefined;
  return val as TRet;
}

export interface Config {
  host: string;
  port: number;
  cors: CorsOptions;
}

export function loadConfig(): Config {
  const c = {
    host: loadOptionalEnvironmentVariable("HOST", "string") ?? "0.0.0.0",
    port: loadOptionalEnvironmentVariable("PORT", "integer") ?? 3434,
    cors: {
      origin: loadOptionalEnvironmentVariable("CORS_ORIGIN", "string"),
    },
  };
  console.debug("Loaded config:", c);
  return c;
}

export function getSocketIoConfig(
  config: Config
): Partial<SocketIoServerOptions> {
  return {
    cors: config.cors,
    cookie: true,
  };
}
