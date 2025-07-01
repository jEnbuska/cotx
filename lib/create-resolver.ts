import ContextError from "./context-error";

export function createResolver<TArgs extends any[], TReturn = void>(
  generatorFunction: (
    ...args: TArgs
  ) => AsyncGenerator<unknown, TReturn, void | undefined>,
) {
  return async function (...args: TArgs): Promise<TReturn> {
    const generator = generatorFunction(...args);
    let iteratorResult = await generator.next();
    while (!iteratorResult.done) {
      iteratorResult = await generator.throw(
        new ContextError(
          `Generator context request "${iteratorResult.value}" was not resolved.`,
        ),
      );
    }
    return iteratorResult.value satisfies TReturn;
  };
}
