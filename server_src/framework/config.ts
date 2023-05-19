import { ServerOptions as SocketIoServerOptions } from "socket.io";
import { CorsOptions } from "cors";

type EnvironmentVariableType = "string" | "integer" | "boolean";

function loadOptionalEnvironmentVariable<TVal extends EnvironmentVariableType>(
  key: string,
  asType: Extract<EnvironmentVariableType, "string">
): string;
function loadOptionalEnvironmentVariable<TVal extends EnvironmentVariableType>(
  key: string,
  asType: Extract<EnvironmentVariableType, "integer">
): number;
function loadOptionalEnvironmentVariable<TVal extends EnvironmentVariableType>(
  key: string,
  asType: Extract<EnvironmentVariableType, "boolean">
): boolean;
function loadOptionalEnvironmentVariable(
  key: string,
  asType: EnvironmentVariableType
) {
  const _key = `AIRETABLE_${key}`;
  const val = process.env?.[_key];
  if (!val) return undefined;
  switch (asType) {
    case "integer":
      return parseInt(val);
    case "boolean":
      const _val = val.toLowerCase();
      return ["true", "yes", "y", "1"].includes(_val) ? true : false;
    default:
      return val as string;
  }
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
