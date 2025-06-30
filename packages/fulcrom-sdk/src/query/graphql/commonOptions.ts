export const getCommonOptions = (query: string) => {
  return {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
          ${query}
        }`,
    }),
  };
};
