export function isAnyGeneratorFunction(
  source: unknown,
): source is GeneratorFunction | AsyncGeneratorFunction {
  return (
    Boolean(source) &&
    ["GeneratorFunction", "AsyncGeneratorFunction"].includes(
      Object.getPrototypeOf(source).constructor.name,
    )
  );
}
