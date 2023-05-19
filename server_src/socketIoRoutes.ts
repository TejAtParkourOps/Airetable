import { makeErrorResponse, makeSuccessResponse } from "@common/response";
import { SocketIoRoutes } from "./framework";
import { SocketIoRouteHandler } from "./framework/socket/types";
import {
  getListOfBases,
  getListOfRecordsInTable,
  getListOfTablesInBase,
} from "./integrations/airtable";
import {
  AirtableField,
  AirtableRecord,
  AirtableTable,
} from "./integrations/airtable/responseTypes";
import {
  ABase,
  AField,
  ATable,
  ARecord,
  ACell,
} from "@common/airtableResource";
import { AxiosError } from "axios";

const processFields = (rawTable: AirtableTable): Record<string, AField> => {
  const result: Record<string, AField> = {};
  for (const f of rawTable.fields) {
    const field: AField = {
      id: f.id,
      name: f.name,
      description: f.description,
      type: f.type,
    };
    result[field.id] = field;
  }
  return result;
};

const processRecords = (
  rawRecords: Array<AirtableRecord>,
  fields: Record<string, AField>
): Record<string, ARecord> => {
  const result: Record<string, ARecord> = {};
  for (const r of rawRecords) {
    const cells: Record<string, ACell> = {};
    for (const [key, val] of Object.entries(r.fields)) {
      cells[key] = {
        fieldId: key,
        fieldName: fields[key].name,
        value: val,
      };
    }
    const record: ARecord = {
      id: r.id,
      createdTime: r.createdTime,
      cells,
    };
    result[record.id] = record;
  }
  return result;
};

const fetchBase: SocketIoRouteHandler<
  { authToken: string; baseId: string },
  ABase
> = (server, socket) => async (tkn, data, cb) => {
  try {
    // get base info
    const listOfBases = await getListOfBases(data.authToken);
    const _base = listOfBases.bases.find((b) => b.id === data.baseId);
    // error: if base not found
    if (!_base) {
      return cb(
        makeErrorResponse(404, `Could not find Airtable Base: '${data.baseId}'`)
      );
    }
    // get tables in base
    const _tables = (await getListOfTablesInBase(data.authToken, data.baseId))
      .tables;
    // get records for each table in base
    const recordsByTable: Record<string, Array<AirtableRecord>> = {};
    for (const t of _tables) {
      recordsByTable[t.id] = (
        await getListOfRecordsInTable(data.authToken, data.baseId, t.id)
      ).records;
    }
    // populate base
    const tables: Record<string, ATable> = {};
    for (const t of _tables) {
      const _fields = processFields(t);
      tables[t.id] = {
        id: t.id,
        name: t.name,
        description: t.description,
        fields: _fields,
        primaryField: _fields[t.primaryFieldId],
        records: processRecords(recordsByTable[t.id], _fields),
      };
    }
    const base: ABase = {
      id: _base.id,
      name: _base.name,
      tables: tables,
    };
    cb(makeSuccessResponse(base, 200, "Airtable Base found!"));
    return base;
  } catch (err) {
    console.error(err);
    // handle errors from Axios
    if (err instanceof AxiosError) {
      switch (err.response?.status) {
        case 400: // this is probably because of something internal
          return cb(
            makeErrorResponse(
              500,
              "Something went wrong while trying to fetch Airtable Base."
            )
          );
        case 401:
          return cb(
            makeErrorResponse(
              401,
              "Your Airtable authorization token does not have access to the requested Airtable Base."
            )
          );
        case 404:
          return cb(
            makeErrorResponse(404, `Could not find Airtable resource!`)
          );
        default:
      }
    }
    // handle other errors
    cb(
      makeErrorResponse(
        500,
        "Something went wrong while trying to fetch Airtable Base."
      )
    );
  }
};

export default [["sync-base-req", fetchBase]] as SocketIoRoutes;
