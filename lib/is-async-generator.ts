export function isAsyncGenerator(
  source: unknown,
): source is GeneratorFunction | AsyncGeneratorFunction {
  return (
    Boolean(source) &&
    "AsyncGeneratorFunction" === Object.getPrototypeOf(source).constructor.name
  );
}
