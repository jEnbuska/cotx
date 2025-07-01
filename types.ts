import Context from "./lib/create-context";

export type AnyGenerator<TReturn = any> = AsyncGenerator<unknown, TReturn>;

export type GeneratorContextProvider<Return> = () => AsyncGenerator<
  GeneratorProviderReturn<Return, Return>
>;

export type CreateGeneratorContextProvider<TReturn> = (
  provider: GeneratorContextProvider<GeneratorProviderReturn<TReturn, TReturn>>,
) => (generator: AsyncGenerator) => AsyncGenerator;

export type ContextProvider<TReturn, TNext> = () => AsyncGenerator<
  TNext,
  GeneratorProviderReturn<TNext, TReturn>
>;

export type GeneratorProviderReturn<TNext, TReturn, TThrow = Error> =
  | {
      next: TNext;
    }
  | {
      return: TReturn;
    }
  | {
      throw: TThrow;
    };

export type Consumer<TArgs extends any[], TNext, TReturn> = (
  ...args: TArgs[]
) =>
  | AsyncGenerator<Context<TNext>, TReturn, TNext>
  | Generator<Context<TNext>, TReturn, TNext>;

export type ConsumerGenerator<TNext, TReturn> =
  | AsyncGenerator<Context<TNext>, TReturn, TNext>
  | Generator<Context<TNext>, TReturn, TNext>;
