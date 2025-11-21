export const between = (min: number, max: number): number => {
  // max is not included
  return min + Math.floor(Math.random() * (max - min));
};

export const choose = <T>(arr: T[]): T => {
  const index = between(0, arr.length);
  return arr[index];
};
