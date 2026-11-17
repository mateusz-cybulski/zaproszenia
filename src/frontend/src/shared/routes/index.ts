export const routes = {
  home: () => "/",
  guestEdit: (id: number) => `/guests/${id}`,
} as const;
