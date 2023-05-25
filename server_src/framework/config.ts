import { ServerOptions as SocketIoServerOptions } from "socket.io";
import { CorsOptions } from "cors";
import { loadOptionalEnvironmentVariable } from "./utils";
import appConfig from "@server/appConfig";

type FrameworkConfig = {
  readonly host: string
  readonly port: number
  readonly publicAddress: string,
  readonly useTLS: boolean
  readonly cors: CorsOptions
}

class ConfigManager<TAppConfig> {
  readonly #c: FrameworkConfig & {app:TAppConfig}
  constructor(appConfig: TAppConfig) {
    this.#c = {
      host: loadOptionalEnvironmentVariable("HOST", "string") ?? "0.0.0.0",
      port: loadOptionalEnvironmentVariable("PORT", "integer") ?? 3434,
      publicAddress: loadOptionalEnvironmentVariable("PUBLIC_ADDRESS", "string") ?? "0.0.0.0:3434",
      useTLS: loadOptionalEnvironmentVariable("USE_TLS", "boolean") ?? false,
      cors: {
        origin: loadOptionalEnvironmentVariable("CORS_ORIGIN", "string") ?? "*",
      },
      app: appConfig
    }
  }
  get mainConfig() {
    return this.#c;
  } 
  get socketIoConfig() : Partial<SocketIoServerOptions> {
    return {
      cors: this.#c.cors,
      cookie: true,
    }  
  }
}

export default new ConfigManager(appConfig);