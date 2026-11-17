export const routes = {
  home: () => "/",
  /** Home page after the link in an address-confirmation email. */
  homeVerified: () => "/?verified=1",
  register: () => "/register",
  guestEdit: (id: number) => `/guests/${id}`,
} as const;
