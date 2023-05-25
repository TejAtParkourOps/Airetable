import { AirtableResourceAddress } from "@common/airtableResourceAddress";
import { NonEmptyString } from "@common/generics";
import { ErrorResponse, makeErrorResponse } from "@common/response";
import axios, { AxiosError } from "axios";
import {
  ListOfBases,
  ListOfRecordsInTable,
  ListOfTablesInBase,
} from "./dataResponseTypes";
import assert from "node:assert";
import { CreateWebhookResponse, ListOfWebhooks } from "./webhookResponseTypes";

type QueryParams = Record<string, string | number>;

/**
 * {@link https://airtable.com/developers/web/api/create-a-webhook | Create a webhook }
 *
 * @export
 * @template TAuthTkn
 * @template TBaseId
 * @param {NonEmptyString<TAuthTkn>} authToken
 * @param {NonEmptyString<TBaseId>} baseId
 * @param {string} notificationUrl
 * @return {*} 
 */
export async function createWebhookForBase<TAuthTkn extends string, TBaseId extends string>(authToken:NonEmptyString<TAuthTkn>, baseId: NonEmptyString<TBaseId>, notificationUrl?: string) {
  assert(authToken.length > 0);
  assert(baseId.length > 0);
  const response = await axios.post(
    `https://api.airtable.com/v0/bases/${baseId}/webhooks`, 
    {
      notificationUrl: notificationUrl,
      specification: {
        options: {
          filters: {
            dataTypes: [
              "tableData",    // i.e. record and cell value changes,
              "tableFields",  // i.e. changes to fields
              "tableMetadata" // i.e. table name and description changes
            ]
          }
        }
      }
    },
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json"
      }
    }
  );
  return response.data as CreateWebhookResponse;
}

export async function deleteWebhook<TAuthTkn extends string, TBaseId extends string, TWebhookId extends string>(authToken:NonEmptyString<TAuthTkn>, baseId: NonEmptyString<TBaseId>, webhookId: NonEmptyString<TWebhookId>) {
  assert(baseId.length > 0);
  assert(webhookId.length > 0);
  const response = await axios.delete(
    `https://api.airtable.com/v0/bases/${baseId}/webhooks/${webhookId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json"
      }
    }
  );
  // there is no return, only success code
}

async function makeAirtableRequest<TResult>(
  authToken: string,
  request: string,
  params?: QueryParams
): Promise<TResult> {
  assert(authToken.length > 0);
  assert(request.length > 0);
  const response = await axios.get(request, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    params,
  });
  return response.data as TResult;
}

type UnpaginatingCallback<TResult> = (
  newResult: TResult,
  accumulatingResult: TResult
) => void;
async function makeUnpaginatingAirtableRequest<
  TResult extends { offset?: string }
>(
  authToken: string,
  request: string,
  unpaginationCallback: UnpaginatingCallback<TResult>,
  params?: QueryParams
): Promise<TResult> {
  assert(authToken.length > 0);
  assert(request.length > 0);
  let noMore = false;
  let queryParams: QueryParams = params ?? {};
  let accumulation: TResult | null = null;
  let nIterations = 0;
  while (noMore !== true) {
    nIterations++;

    const response: TResult = await makeAirtableRequest(
      authToken,
      request,
      queryParams
    );
    if (nIterations === 1) {
      accumulation = response;
    } else {
      assert(accumulation);
      unpaginationCallback(response, accumulation);
    }

    if (response?.offset) {
      queryParams.offset = response.offset;
    } else {
      noMore = true;
    }
  }
  assert(accumulation);
  delete accumulation.offset;
  return accumulation;
}

export const getListOfBases = <TAuthTkn extends string>(
  authToken: NonEmptyString<TAuthTkn>
) =>
  makeUnpaginatingAirtableRequest<ListOfBases>(
    authToken,
    `https://api.airtable.com/v0/meta/bases`,
    (newResult, accumulatingResult) => {
      accumulatingResult.bases.push(...newResult.bases);
    }
  );

export const getListOfTablesInBase = <
  TAuthTkn extends string,
  TBaseId extends string
>(
  authToken: NonEmptyString<TAuthTkn>,
  baseId: NonEmptyString<TBaseId>
) =>
  makeAirtableRequest<ListOfTablesInBase>(
    authToken,
    `https://api.airtable.com/v0/meta/bases/${baseId}/tables`
  );

export const getListOfRecordsInTable = <
  TAuthTkn extends string,
  TBaseId extends string,
  TTableId extends string
>(
  authToken: NonEmptyString<TAuthTkn>,
  baseId: NonEmptyString<TBaseId>,
  tableId: NonEmptyString<TTableId>
) =>
  makeUnpaginatingAirtableRequest<ListOfRecordsInTable>(
    authToken,
    `https://api.airtable.com/v0/${baseId}/${tableId}`,
    (newResult, accumulatingResult) => {
      accumulatingResult.records.push(...newResult.records);
    },
    {
      returnFieldsByFieldId: "true",
    }
  );

export const getListOfWebhook = <TAuthTkn extends string, TBaseId extends string>(authToken: NonEmptyString<TAuthTkn>, baseId: NonEmptyString<TBaseId>) =>
  makeAirtableRequest<ListOfWebhooks>(authToken, `https://api.airtable.com/v0/bases/${baseId}/webhooks`, {});

export const refreshWebhook = 
  <TAuthTkn extends string, TBaseId extends string, TWebhookId extends string>
  (authToken: NonEmptyString<TAuthTkn>, baseId: NonEmptyString<TBaseId>, webhookId: NonEmptyString<TWebhookId>) => 
  makeAirtableRequest(authToken, `https://api.airtable.com/v0/bases/${baseId}/webhooks/${webhookId}/refresh`, {});