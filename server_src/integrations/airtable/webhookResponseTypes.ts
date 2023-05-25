/**
 *
 * {@link https://airtable.com/developers/web/api/create-a-webhook | Airtable Web API: Create a webhook}
 * 
 * @property {string} id                 - An identifier for the webhook (WebhookId).
 * @property {string} macSecretBase64    - A MAC secret. The client should store this value to authenticate webhook pings. There is no way to retrieve this value after the initial creation of the webhook.
 * @property {string} expirationTime     - The time when the webhook expires and is disabled in the ISO format. The webhook will not expire if this is null (in the case User API keys are used).
 * 
 * @export
 * @interface CreateWebhookResponse
 */
export interface CreateWebhookResponse {
    expirationTime?: string, 
    id: string,
    macSecretBase64: string
}

/**
 * 
 * {@link https://airtable.com/developers/web/api/model/webhooks-specification | Airtable Web API: Webhook specification}
 *
 * @export
 * @interface WebhookSpecification
 */
export interface WebhookSpecification {
    options: {
        filters: {
            dataTypes: Array<"tableData" | "tableFields" | "tableMetadata">
        },
        recordChangeScope: string
    }
}

export interface WebhookInfo {
    id: string,
    areNotificationsEnabled: boolean,
    cursorForNextPayload: number,
    isHookEnabled: boolean,
    lastSuccessfulNotificationTime: string | null,
    notificationUrl: string | null,
    expirationTime?: string,
    lastNotificationResult: null | 
        {
            success: false,
            error: {
                message: string
            },
            completionTimestamp: string,
            durationMs: number,
            retryNumber: number,
            willBeRetried: boolean
        }
        |
        {
            success: true,
            completionTimestamp: string,
            durationMs: number,
            retryNumber: number
        },
    specification: {
        options: WebhookSpecification
    }
}

/**
 *
 * {@link https://airtable.com/developers/web/api/list-webhooks | Airtable Web API: List webhooks}
 *
 * @export
 * @interface Webhook
 */
export interface ListOfWebhooks {
    webhooks: Array<WebhookInfo>
}


export interface RefreshWebhookResponse {
    expirationTime: string | null
}