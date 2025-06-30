export function roundDecimals(num: number, precision: number) {
  return (+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(
    precision,
  );
}
