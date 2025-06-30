import { GeneratorContextRequest, GeneratorContextProvider, AnyGenerator } from "../types";
import { isAnyGeneratorFunction } from "./is-any-generator-function";

export function createGeneratorContext<
  Return,
  Args extends any[] = [],
  ProviderArgs extends any[] = [],
>() {
  const context = Symbol("context");

  function* getContext(
    ...args: Args
  ): Generator<{ args: Args; name: string; context: Symbol }, Return, Return> {
    const value = yield { args, name: "", context };
    return value as Return;
  }
  function isOwnContextRequest(
    value: unknown,
  ): value is GeneratorContextRequest<Args> {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    if ("context" in value && "name" in value && "args" in value) {
      return value.context === context;
    }
    return false;
  }
  return {
    getContext,
    createProvider(
      ...providerArgs: [
        ...ProviderArgs,
        GeneratorContextProvider<[...ProviderArgs, ...Args], Return>,
      ]
    ) {
      const args = providerArgs.slice(
        0,
        providerArgs.length - 1,
      ) as ProviderArgs;
      const provider = providerArgs[
        providerArgs.length - 1
      ] as GeneratorContextProvider<[...ProviderArgs, ...Args], Return>;
      return async function* generatorContextProvider(
        generator: AnyGenerator,
      ): AsyncGenerator {
        let next = await generator.next();
        while (!next.done) {
          if (!isOwnContextRequest(next.value)) {
            const value = yield next.value;
            next = await generator.next(value);
          } else if (isAnyGeneratorFunction(provider)) {
            const value = yield* provider(...args, ...next.value.args);
            next = await generator.next(value);
          } else {
            const result = await provider(...args, ...next.value.args);
            next = await generator.next(result);
          }
        }
        return next.value;
      };
    },
  };
}
