import { GeneratorContextRequest } from "../types";

export function isGeneratorContextRequest(
  value: unknown,
): value is GeneratorContextRequest<unknown[]> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return "context" in value && "name" in value && "args" in value;
}
