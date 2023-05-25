export type EnvironmentVariableType = "string" | "integer" | "boolean";

export function loadOptionalEnvironmentVariable<TVal extends EnvironmentVariableType>(
  key: string,
  asType: Extract<EnvironmentVariableType, "string">
): string;
export function loadOptionalEnvironmentVariable<TVal extends EnvironmentVariableType>(
  key: string,
  asType: Extract<EnvironmentVariableType, "integer">
): number;
export function loadOptionalEnvironmentVariable<TVal extends EnvironmentVariableType>(
  key: string,
  asType: Extract<EnvironmentVariableType, "boolean">
): boolean;
export function loadOptionalEnvironmentVariable(
  key: string,
  asType: EnvironmentVariableType
) {
  const _key = `AIRETABLE_${key}`;
  const val = process.env?.[_key];
  if (!val) return undefined;
  switch (asType) {
    case "integer":
      return parseInt(val);
    case "boolean":
      const _val = val.toLowerCase();
      return ["true", "yes", "y", "1"].includes(_val) ? true : false;
    default:
      return val as string;
  }
}

