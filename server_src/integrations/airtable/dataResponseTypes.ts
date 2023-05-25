import { AirtableFieldType } from "@common/airtableResource";

export interface AirtableBase {
  id: string;
  name: string;
  permissionLevel: string;
}

export interface AirtableField {
  id: string;
  name: string;
  description: string;
  type: AirtableFieldType;
  // options: FieldOptions[T] // TODO
}

export interface AirtableTable {
  id: string;
  name: string;
  description: string;
  primaryFieldId: string;
  fields: Array<AirtableField>;
}

export interface AirtableRecord {
  id: string;
  createdTime: string; // A date timestamp in the ISO format, eg:"2018-01-01T00:00:00.000Z"
  fields: {
    [fieldIdOrName: string]: any;
  };
}

export interface ListOfBases {
  bases: Array<AirtableBase>;
  offset?: string | undefined;
}

export interface ListOfTablesInBase {
  tables: Array<AirtableTable>;
}

export interface ListOfRecordsInTable {
  records: Array<AirtableRecord>;
  offset?: string | undefined;
}

/**
 * {@link https://airtable.com/developers/web/api/model/webhooks-payload | Webhook Payload }
 *
 * @export
 * @interface WebhookPayload
 */
export interface WebhookPayload {
  baseTransactionNumber: number,
  payloadFormat: "v0",
  timestamp: string,
  createdTablesById?: {
    [id: string] : {
      metadata?: {
        name: string,
        description: string
      },
      fieldsById?: {
        [id: string]: {
          name: string,
          type: AirtableFieldType
        }
      },
      recordsById?: {
        [id: string]: {
          createdTime: string,
          cellValuesByFieldId: {
            [id: string]: any
          }
        }
      }
    }
  },
  changedTablesById?: {
    [id: string]: {
      changedMetadata?: {
        current: {
          name?: string,
          description?: string | null
        },
        previous: {
          name?: string,
          description?: string | null
        }
      },
      createdRecordsById?: {
        [id: string]: {
          createdTime: string,
          cellValuesByFieldId: {
            [id: string]: any
          }
        }
      },
      changedRecordsById?: {
        [id: string]: {
          current: {
            [id: string]: any
          },
          previous?: {
            [id: string]: any
          },
          unchanged?: {
            [id: string]: any
          }
        }
      },
      destroyedRecordIds?: Array<string>,
      createdFieldsById?: {
        [id: string]: {
          type: AirtableFieldType,
          name: string
        }
      },
      changedFieldsById?: {
        [id: string]: {
          current: {
            name?: string,
            type?: AirtableFieldType
          },
          previous?: {
            name?: string,
            type?: AirtableFieldType
          }
        }
      },
      destroyedFieldIds?: Array<string>,
    }
  },
  destroyedTableIds?: Array<string>
}

export interface ListOfWebhookPayloads {
  cursor: number,
  mightHaveMore: boolean,
  payloads: Array<WebhookPayload>
}