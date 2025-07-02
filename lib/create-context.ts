import {
  ProviderReturn,
  Provider,
  Consumer,
  ConsumerGenerator,
} from "../types";
import ContextError from "./context-error";

export default class Context<TNext> {
  private static defaultProvider = () => ({
    throw: new ContextError(
      "Context not provided, nor default provider defined",
    ),
  });

  public readonly defaultProvider;
  constructor(defaultProvider: Provider<TNext, never>) {
    this.defaultProvider = this.createProvider<never>(
      defaultProvider ?? Context.defaultProvider,
    );
  }

  public createProvider = <TReturn = never>(
    provider: Provider<TNext, TReturn>,
  ): Provider<TNext, TReturn> => {
    return Object.assign(() => provider(), { context: this });
  };

  public static *getProvided<TNext>(
    context: Context<TNext>,
  ): Generator<Context<TNext>, TNext, TNext> {
    const value = yield context;
    return value as TNext;
  }

  public static withProvider<TArgs extends any[], TNext, TReturn>(
    consumer: Consumer<TArgs, TNext, TReturn>,
    provider: Provider<TNext, TReturn>,
  ) {
    return async function* (...args: TArgs) {
      const generator = consumer(...args);
      let iteratorResult = await generator.next();
      while (!iteratorResult.done) {
        if (iteratorResult.value === provider.context) {
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
    generator: ConsumerGenerator<TNext, TReturn>,
    result: ProviderReturn<TNext, TReturn>,
  ) {
    if ("next" in result) return generator.next(result.next);
    if ("return" in result) return generator.return(result.return);
    if ("throw" in result) return generator.throw(result.throw);
    throw new ContextError(
      "Invalid provider generator provider return. Expected the object to include property next, return or throw",
    );
  }
}

const counterContext = new Context<number>();
let count = 0;
Context.withProviders(
  async function* consumer(): AsyncGenerator<Context<number>, string, number> {
    const count = yield* Context.getProvided(counterContext);
    return "hi";
  } satisfies Consumer<never[], number, string>,
  counterContext,
  async function* counterProvider() {
    if (Math.random() > 0.5) return { return: "hello" };
    return { next: ++count };
  },
);
