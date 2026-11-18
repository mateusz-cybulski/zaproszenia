export const routes = {
  home: () => "/",
  homeVerified: () => "/?verified=1",
  register: () => "/register",
  events: () => "/events",
  guests: () => "/guests",
  guestAdd: () => "/guests/add",
  guestEdit: (id: number) => `/guests/${id}`,
  templates: () => "/templates",
  templatePageImage: (id: number) => `/api/templates/${id}/page.png`,
  templatePreview: (id: number) => `/api/templates/${id}/preview`,
  settings: () => "/settings",
} as const;
