import { loadOptionalEnvironmentVariable } from "./framework/utils";

export default {
    redisUrl: loadOptionalEnvironmentVariable("REDIS_URL", "string")
} as const