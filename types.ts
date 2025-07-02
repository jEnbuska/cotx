import Context from "./lib/create-context";

export type Provider<TNext, TReturn, Args extends any[] = never[]> = ((
  ...args: Args
) => AsyncGenerator<TNext, ProviderReturn<TNext, TReturn>>) & {
  readonly context: Context<TNext>;
};

export type ProviderReturn<TNext, TReturn = void, TThrow = Error> =
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
) => ConsumerGenerator<TNext, TReturn>;

export type ConsumerGenerator<TNext, TReturn> = AsyncGenerator<
  Context<TNext>,
  TReturn,
  TNext
>;
