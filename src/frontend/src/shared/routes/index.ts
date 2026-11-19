export const routes = {
  home: () => "/",
  homeVerified: () => "/?verified=1",
  register: () => "/register",
  events: () => "/events",
  eventAdd: () => "/events/add",
  eventsDeleted: () => "/events/deleted",
  event: (id: number) => `/events/${id}`,
  eventPreviewImage: (id: number, templateId: number, page: number) =>
    `/api/events/${id}/preview.png?${new URLSearchParams({ template_id: String(templateId), page: String(page) })}`,
  guests: () => "/guests",
  guestAdd: () => "/guests/add",
  guestsDeleted: () => "/guests/deleted",
  guestEdit: (id: number) => `/guests/${id}`,
  templates: () => "/templates",
  templatePageImage: (id: number) => `/api/templates/${id}/page.png`,
  templatePreview: (id: number) => `/api/templates/${id}/preview`,
  settings: () => "/settings",
} as const;
