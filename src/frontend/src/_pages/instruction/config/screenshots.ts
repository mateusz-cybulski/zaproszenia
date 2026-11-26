import type { StaticImageData } from "next/image";

import eventDetails from "../screenshots/event-details.webp";
import eventGuestsAdd from "../screenshots/event-guests-add.webp";
import eventNew from "../screenshots/event-new.webp";
import eventPrintMenu from "../screenshots/event-print-menu.webp";
import eventTemplates from "../screenshots/event-templates.webp";
import events from "../screenshots/events.webp";
import guestAiReview from "../screenshots/guest-ai-review.webp";
import guestEdit from "../screenshots/guest-edit.webp";
import guestVerificationMenu from "../screenshots/guest-verification-menu.webp";
import guests from "../screenshots/guests.webp";
import guestsImport from "../screenshots/guests-import.webp";
import guestsSelection from "../screenshots/guests-selection.webp";
import guestsVerify from "../screenshots/guests-verify.webp";
import login from "../screenshots/login.webp";
import register from "../screenshots/register.webp";
import settings from "../screenshots/settings.webp";
import templateEditor from "../screenshots/template-editor.webp";
import templateField from "../screenshots/template-field.webp";
import templateUpload from "../screenshots/template-upload.webp";
import templates from "../screenshots/templates.webp";

// Device pixels per CSS pixel the screenshots were taken at; they are shown no larger than taken.
export const SCREENSHOT_SCALE = 1.5;

// Taken from the Polish app with sample data, so both languages show the same images.
export const SCREENSHOTS = {
  eventDetails,
  eventGuestsAdd,
  eventNew,
  eventPrintMenu,
  eventTemplates,
  events,
  guestAiReview,
  guestEdit,
  guestVerificationMenu,
  guests,
  guestsImport,
  guestsSelection,
  guestsVerify,
  login,
  register,
  settings,
  templateEditor,
  templateField,
  templateUpload,
  templates,
} as const satisfies Record<string, StaticImageData>;

export type ScreenshotName = keyof typeof SCREENSHOTS;
