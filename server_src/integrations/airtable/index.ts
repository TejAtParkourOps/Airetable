import { AirtableResourceAddress } from "@common/airtableResourceAddress";
import { NonEmptyString } from "@common/generics";
import { ErrorResponse, makeErrorResponse } from "@common/response";
import axios, { AxiosError } from "axios";
import {
  ListOfBases,
  ListOfRecordsInTable,
  ListOfTablesInBase,
} from "./responseTypes";
import assert from "node:assert";

type QueryParams = Record<string, string | number>;

async function makeAirtableRequest<TResult>(
  authToken: string,
  request: string,
  params?: QueryParams
): Promise<TResult> {
  assert(authToken.length > 0);
  assert(request.length > 0);
  try {
    const response = await axios.get(request, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params,
    });
    return response.data as TResult;
  } catch (err) {
    console.error(err);
    throw err;
  }
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
  try {
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
  } catch (err) {
    console.error(err);
    throw err;
  }
}

const getListOfBases = <TAuthTkn extends string>(
  authToken: NonEmptyString<TAuthTkn>
) =>
  makeUnpaginatingAirtableRequest<ListOfBases>(
    authToken,
    `https://api.airtable.com/v0/meta/bases`,
    (newResult, accumulatingResult) => {
      accumulatingResult.bases.push(...newResult.bases);
    }
  );

const getListOfTablesInBase = <TAuthTkn extends string, TBaseId extends string>(
  authToken: NonEmptyString<TAuthTkn>,
  baseId: NonEmptyString<TBaseId>
) =>
  makeAirtableRequest<ListOfTablesInBase>(
    authToken,
    `https://api.airtable.com/v0/meta/bases/${baseId}/tables`
  );

const getListOfRecordsInTable = <
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
    }
  );

(async () => {
  const authTkn =
    "patvVIhW6YcAMw0cE.68a8a732bc788a931157e9e257bd72513628b94048e9572bc523ad12a91c50f0";
  const n = await getListOfBases(authTkn);
  const m = await getListOfTablesInBase(authTkn, n.bases[0].id);
  const o = await getListOfRecordsInTable(
    authTkn,
    n.bases[0].id,
    m.tables[0].id
  );
  console.log(o.records);
})();
