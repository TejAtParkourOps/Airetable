import appConfig from "@server/appConfig";
import { createClient } from "redis";

export default () => {
    const client = createClient({
        url: appConfig.redisUrl
    });
    
    client.on("error", err => {
        console.error(`Redis client error: `, err);
    });

    return client;
};