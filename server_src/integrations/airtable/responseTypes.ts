export interface AirtableBase {
  id: string;
  name: string;
  permissionLevel: string;
}

export type AirtableFieldType =
  | "singleLineText"
  | "email"
  | "url"
  | "multilineText"
  | "number"
  | "percent"
  | "currency"
  | "singleSelect"
  | "multipleSelects"
  | "singleCollaborator"
  | "multipleCollaborators"
  | "multipleRecordLinks"
  | "date"
  | "dateTime"
  | "phoneNumber"
  | "multipleAttachments"
  | "checkbox"
  | "formula"
  | "createdTime"
  | "rollup"
  | "count"
  | "lookup"
  | "multipleLookupValues"
  | "autoNumber"
  | "barcode"
  | "rating"
  | "richText"
  | "duration"
  | "lastModifiedTime"
  | "button"
  | "createdBy"
  | "lastModifiedBy"
  | "externalSyncSource";

export interface AirtableField<T extends AirtableFieldType> {
  id: string;
  name: string;
  description: string;
  type: T;
  // options: FieldOptions[T] // TODO
}

export interface AirtableTable {
  id: string;
  name: string;
  description: string;
  primaryFieldId: string;
  fields: Array<AirtableField<any>>;
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
