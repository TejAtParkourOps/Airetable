import redis from "@server/framework/redis"
import { CreateWebhookResponse } from "../airtable/webhookResponseTypes";

const keys = [
    "authToken",
    "webhookId",
    "macSecret",
    "expiryTimestamp"
];

export interface WebhookEntry {
    readonly authToken: string,
    readonly webhookId: string,
    readonly macSecret: string,
    readonly expiryTimestamp: number
}

async function del(baseId: string) {
    const client = redis();
    await client.connect();
    const result = await client.hGetAll(baseId);
    const keys = Object.keys(result);
    console.debug(keys)
    if (keys.length > 0)
        client.hDel(baseId, keys);
    // await client.disconnect();
    console.debug(`Deleted webhook entry (if any) for base: '${baseId}'`);
}

async function fnd(baseId: string) : Promise<WebhookEntry | null> {
    const client = redis();
    await client.connect();
    const result = await client.hGetAll(baseId);
    // await client.disconnect();
    const resultContainsAllKeys = (Object.keys(result).length === keys.length) && (Object.keys(result).every( k => keys.includes(k)) );
    if (!resultContainsAllKeys) {
        // no or invalid entry, delete and return null
        console.debug(`No webhook entry found for base: '${baseId}'`);
        del(baseId);
        return null;
    }
    if (parseInt(result.expiryTimestamp) <= Date.now()) {
        // expired entry, delete and return null
        console.debug(`Expired webhook entry found for base: '${baseId}'`);
        del(baseId);
        return null;
    }
    console.debug(`Valid webhook entry found for base: '${baseId}'`)
    console.debug(JSON.stringify(result));
    return {
        authToken: result.authToken,
        webhookId: result.webhookId,
        macSecret: result.macSecret,
        expiryTimestamp: parseInt(result.expiryTimestamp)
    }
}

async function crt(authToken: string, baseId: string, webhookId: string, macSecret: string, expiryTimestamp: number) : Promise<WebhookEntry> {
    const client = redis();
    await client.connect();
    await client.hSet(baseId, {
        authToken,
        webhookId,
        macSecret,
        expiryTimestamp     
    });
    // await client.disconnect();
    const result = {
        authToken,
        webhookId,
        macSecret,
        expiryTimestamp
    };
    console.debug(`Creating webhook entry for base: '${baseId}': ${JSON.stringify(result)}`);
    return result;
}

export default {
    create: crt,
    delete: del,
    find: fnd
}

