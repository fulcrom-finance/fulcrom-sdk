export const objectFromEntries = <Key extends string | number, Value>(
  entries: Iterable<readonly [Key, Value]>,
) => {
  return Object.fromEntries<Value>(entries) as { [k in Key]: Value };
};
