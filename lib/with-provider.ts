import { AnyGenerator } from "../types";

export function withProviders<Args extends any[], Gen extends AnyGenerator>(
  callback: (...args: Args) => Gen,
  ...providers: Array<(generator: AnyGenerator) => AnyGenerator>
) {
  return (...args: Args) => {
    const generator: AnyGenerator = callback(...args);
    return providers.reduce(
      (generator, provider) => provider(generator),
      generator,
    ) as Gen;
  };
}
