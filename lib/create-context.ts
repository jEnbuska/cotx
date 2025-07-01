import {
  GeneratorProviderReturn,
  ContextProvider,
  Consumer,
  ConsumerGenerator,
} from "../types";
import ContextError from "./context-error";

export default class Context<TNext> {
  public static *getProvider<TNext>(
    context: Context<TNext>,
  ): Generator<Context<TNext>, TNext, TNext> {
    const value = yield context;
    return value as TNext;
  }

  public static *withProvider<TArgs extends any[], TNext, TReturn>(
    consumer: Consumer<TArgs, TNext, TReturn>,
    instance: Context<TNext>,
    provider: ContextProvider<TReturn, TNext>,
  ) {
    return async function* (
      ...args: TArgs
    ): AsyncGenerator<unknown, TReturn, TNext> {
      const generator = consumer(...args);
      let iteratorResult = await generator.next();
      while (!iteratorResult.done) {
        if (iteratorResult.value === instance) {
          iteratorResult = await Context.handleGeneratorProviderReturn(
            generator,
            yield* provider(),
          );
        } else {
          const value = yield iteratorResult.value;
          iteratorResult = await generator.next(value);
        }
      }
      return iteratorResult.value;
    };
  }

  private static handleGeneratorProviderReturn<TNext, TReturn>(
    consumer: ConsumerGenerator<TNext, TReturn>,
    result: GeneratorProviderReturn<TNext, TReturn>,
  ) {
    if ("next" in result) return consumer.next(result.next);
    if ("return" in result) return consumer.return(result.return);
    if ("throw" in result) return consumer.throw(result.throw);
    throw new ContextError(
      "Invalid provider generator provider return. Expected the object to include property next, return or throw",
    );
  }
}

const counterContext = new Context<number>();
let count = 0;
Context.withProvider(
  async function* consumer(): AsyncGenerator<Context<number>, string, number> {
    const count = yield* Context.getProvider(counterContext);
    return "hi";
  } satisfies Consumer<never[], number, string>,
  counterContext,
  async function* counterProvider() {
    if (Math.random() > 0.5) return { return: "hello" };
    return { next: ++count };
  },
);
