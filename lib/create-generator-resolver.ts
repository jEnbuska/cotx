import {isGeneratorContextRequest} from "./is-generator-context-request";

export function createResolver<TArgs extends any[], TReturn = void>(
  generatorFunction: (
    ...args: TArgs
  ) =>
    | AsyncGenerator<unknown, TReturn, void | undefined>
    | Generator<unknown, TReturn, void | undefined>,
) {
  return async function (...args: TArgs): Promise<TReturn> {
    const generator = generatorFunction(...args);
    let next = await generator.next();
    if (next.done) {
      return next.value satisfies TReturn;
    }
    const { value } = next;
    if (isGeneratorContextRequest(value)) {
      throw new Error(
        `Generator context request "${value.name}" was not resolved.`,
      );
    }

    throw new Error(
      `Unexpected value ${
        typeof value === "symbol" ? value.toString() : value
      } yielded to resolveWithProviders`,
    );
  };
}
