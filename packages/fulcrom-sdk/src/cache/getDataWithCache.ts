export const getDataWithCache = async <T, A extends unknown[]>(
  caches: Map<string, T>,
  key: string,
  func: (...args: A) => Promise<T> | T,
  ...args: A
): Promise<Awaited<T>> => {
  const cache = caches.get(key);
  if (cache) {
    return cache as Awaited<T>;
  }
  const data = await func(...args);

  caches.set(key, data);
  return data;
};
