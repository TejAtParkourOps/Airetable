import { NonEmptyString, Union2Tuple } from "./generics";
import { makeBadRequestResponse, makeErrorResponse } from "./response";

export type AirtableResourceType = "base" | "table" | "record";

type BaseIdAddressArg = string;
type TableIdAddressArg<T extends AirtableResourceType> = T extends Exclude<
  AirtableResourceType,
  "base"
>
  ? string
  : never;
type RecordIdAddressArg<T extends AirtableResourceType> = T extends Exclude<
  AirtableResourceType,
  "base" | "table"
>
  ? string
  : never;

export type AirtableResourceAddress =
  | {
      is: "base";
      baseId: BaseIdAddressArg;
      tableId?: TableIdAddressArg<"base">;
      recordId?: RecordIdAddressArg<"base">;
    }
  | {
      is: "table";
      baseId: BaseIdAddressArg;
      tableId: TableIdAddressArg<"table">;
      recordId?: RecordIdAddressArg<"table">;
    }
  | {
      is: "record";
      baseId: BaseIdAddressArg;
      tableId: TableIdAddressArg<"record">;
      recordId: RecordIdAddressArg<"record">;
    };

export function addressToString(
  resourceAddress: AirtableResourceAddress
): string {
  switch (resourceAddress.is) {
    case "base":
      return `${resourceAddress.baseId}`;
    case "table":
      return `${resourceAddress.baseId}->${resourceAddress.tableId}`;
    case "record":
      return `${resourceAddress.baseId}->${resourceAddress.tableId}->${resourceAddress.recordId}`;
    default:
      throw makeErrorResponse(400, "Could not access resource.");
  }
}

export function stringToAddress<TAddr extends string>(
  address: NonEmptyString<TAddr>
): AirtableResourceAddress {
  const components = address.split("->");
  if (components.length < 1 || components.length > 3)
    throw makeErrorResponse(400, "Could not access resource.");
  components.forEach((c) => {
    const valid = /^[a-zA-Z0-9]+$/g.test(c);
    if (!valid) throw makeErrorResponse(400, "Could not access resource.");
  });
  switch (components?.length) {
    case 1:
      return { is: "base", baseId: components[0] };
    case 2:
      return { is: "table", baseId: components[0], tableId: components[1] };
    case 3:
      return {
        is: "record",
        baseId: components[0],
        tableId: components[1],
        recordId: components[3],
      };
    default:
      throw makeErrorResponse(400, "Could not access resource.");
  }
}
