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

export type SyncBaseRequest = {
  baseId: string;
};

export type AField = {
  id: string;
  name: string;
  description: string;
  type: AirtableFieldType;
};

export type ACell = {
  fieldId: string;
  fieldName: string;
  value: any;
};

export type ARecord = {
  id: string;
  createdTime: string;
  cells: {
    [fieldId: string]: ACell;
  };
};

export type ATable = {
  id: string;
  name: string;
  description: string;
  fields: {
    [id: string]: AField;
  };
  primaryField: AField;
  records: {
    [id: string]: ARecord;
  };
};

export type ABase = {
  id: string;
  name: string;
  tables: {
    [id: string]: ATable;
  };
};
