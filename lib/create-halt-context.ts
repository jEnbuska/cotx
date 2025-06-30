import { GeneratorContextRequest, AnyGenerator } from "../types";
import { isGeneratorContextRequest } from "./is-generator-context-request";

const context = Symbol("halt-context");
export function createHaltContext<
  TData,
  OnHalt extends (data: TData) => void = (data: TData) => never,
>(defaultHandler?: OnHalt) {
  function isHaltContextYield(
    value: unknown,
  ): value is GeneratorContextRequest<[TData]> {
    return isGeneratorContextRequest(value) && value.context === context;
  }
  return {   
    *halt(
      data: TData,
    ): Generator<{ args: [TData]; name: string; context: Symbol }, never> {
      yield { args: [data], name: "", context };
      throw new Error("Halt context was not resolved");
    },
    onHalt(handler = defaultHandler) {
      return async function* generatorContextProvider(
        generator: AnyGenerator,
      ): AsyncGenerator {
        let next = await generator.next();
        while (!next.done) {
          if (!isHaltContextYield(next.value)) {
            const value = yield next.value;
            next = await generator.next(value);
            continue;
          }
          const { args } = next.value;
          handler?.(args[0]);
          return;
        }
        return next.value;
      };
    },
  };
}
