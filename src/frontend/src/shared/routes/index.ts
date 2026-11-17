export const routes = {
  home: () => "/",
  homeVerified: () => "/?verified=1",
  register: () => "/register",
  events: () => "/events",
  guests: () => "/guests",
  guestEdit: (id: number) => `/guests/${id}`,
  templates: () => "/templates",
  settings: () => "/settings",
} as const;
