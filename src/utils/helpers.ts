export function zip<T, U>(array1: T[], array2: U[]) {
  const result: [T, U][] = [];
  const length = Math.min(array1.length, array2.length);
  for (let i = 0; i < length; i++) {
    result.push([array1[i], array2[i]]);
  }
  return result;
}
