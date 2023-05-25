import { RestRoutes } from "./framework/types";
import config from "./framework/config";
import { Request, Response } from "express";
import { createHmac } from "crypto";
import webhookEntry from "./integrations/webhookEntry";

function processUpdatesToBase(authToken: string, webhookId: string, baseId: string) {

}

interface AirtableWebhookNotificationMsg {
    base: {
        id: string
    },
    webhook: {
        id: string
    },
    timestamp: string
}


// https://airtable.com/developers/web/api/webhooks-overview#webhook-notification-delivery
async function handleAirtableWebhookNotification(req: Request, res: Response) {
    const sendSuccessResponse = () => {
        res.status(200).send();
    }
    // 
    const reqBody = req.body as AirtableWebhookNotificationMsg;
    const reqBodyStr = JSON.stringify(req.body);
    console.debug("Received: ", reqBodyStr);
    //
    const receivedHash = req.headers["X-Airtable-Content-MAC"];
    if (!receivedHash) {
        console.warn(`No hash present in message, ignoring...`);
        return sendSuccessResponse();
    }
    // 
    const dbEntry = await webhookEntry.find(reqBody.base.id);
    if (!dbEntry) {
        console.warn(
            `Notification received for unexpected/unregisted webhook! Ignoring...`,
            JSON.stringify(reqBody)
        );
        return sendSuccessResponse();
    }
    if (!dbEntry?.macSecret) {
        console.warn(`No MAC secret registered for base: '${reqBody.base.id}', ignoring...`);
        return sendSuccessResponse();
    }
    //
    const decodedMacSecret = Buffer.from(dbEntry.macSecret, "base64");
    const hmac = createHmac("sha256", decodedMacSecret);
    hmac.update(reqBodyStr, "ascii");
    const expectedHash = 'hmac-sha256=' + hmac.digest('hex');
    if (receivedHash !== expectedHash) {
        console.error(
            `Received hash on received webhook notification does not match expected hash!`,
            `Received: '${receivedHash}'`,
            `Expected: '${expectedHash}'`,
            `Ignoring...`
        )
        return sendSuccessResponse();
    }
    // process 
    console.debug(`Processing notifications for base: '${reqBody.base.id}'`);
    processUpdatesToBase(dbEntry.authToken, dbEntry.webhookId, reqBody.base.id);
    // send empty body with 200 or 204 to acknowledge receipt
    sendSuccessResponse();
}


// 
export default [
    ["get", "/", (req, res) => {
        res.status(200).send({
            "healthy": true
        })
    }],
    ["post", "/rcv-airtable-webhook-notification", handleAirtableWebhookNotification]
] as RestRoutes;