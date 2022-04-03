export const partialUpdate = (name: string, dto: any) => {
  return Object.keys(dto).reduce((acc, curr) => {
    acc[`${name}.$.${curr}`] = dto[curr];
    return acc;
  }, {});
};
