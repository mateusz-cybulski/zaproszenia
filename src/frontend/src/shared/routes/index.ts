export const routes = {
  home: () => "/",
  homeVerified: () => "/?verified=1",
  homePasswordChanged: () => "/?password-changed=1",
  register: () => "/register",
  resetPassword: () => "/reset-password",
  events: () => "/events",
  eventAdd: () => "/events/add",
  eventsDeleted: () => "/events/deleted",
  event: (id: number) => `/events/${id}`,
  eventPreviewImage: (id: number, templateId: number, page: number) =>
    `/api/events/${id}/preview.png?${new URLSearchParams({ template_id: String(templateId), page: String(page) })}`,
  eventDocument: (id: number, kind: string) => `/api/events/${id}/documents/${kind}`,
  guestAiVerification: (id: number) => `/api/guests/${id}/verification/ai`,
  guests: () => "/guests",
  guestAdd: () => "/guests/add",
  guestsDeleted: () => "/guests/deleted",
  guestEdit: (id: number) => `/guests/${id}`,
  templates: () => "/templates",
  template: (id: number) => `/templates/${id}`,
  templatePreviewImage: (id: number) => `/api/templates/${id}/preview.png`,
  savedTemplatePreviewImage: (id: number, updatedAt: string) =>
    `/api/templates/${id}/preview.png?${new URLSearchParams({ version: updatedAt })}`,
  settings: () => "/settings",
} as const;
export { withQuery } from "./with-query";
export type { SearchParams } from "./search-params";
