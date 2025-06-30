export type GeneratorContextRequest<Args extends any[]> = {
  context: symbol;
  args: Args;
  name: string;
};

export type AnyGenerator<Return = any> =
  | Generator<unknown, Return>
  | AsyncGenerator<unknown, Return>;

export type GeneratorContext<
  Name extends string,
  Args extends any[],
  Return,
  ProviderArgs extends any[] = Args,
> = {
  [K in `get${Capitalize<Name>}Context`]: GetGeneratorContext<Args, Return>;
} & {
  [K in `create${Capitalize<Name>}Provider`]: CreateGeneratorContextProvider<
    ProviderArgs,
    Args,
    Return
  >;
};

export type GeneratorContextProvider<Args extends any[], Return> = (
  ...args: Args
) => AnyGenerator<Return | Promise<Return>> | Promise<Return> | Return;

export type CreateGeneratorContextProvider<ProviderArgs extends any[], Args extends any[], Return> = (
  provider: GeneratorContextProvider<[...ProviderArgs, ...Args], Return>,
) => (generator: AnyGenerator) => AsyncGenerator;

export type GetGeneratorContext<Args extends any[], Return> = (
  ...args: Args
) => AsyncGenerator<GeneratorContextRequest<Args>, Return>;
