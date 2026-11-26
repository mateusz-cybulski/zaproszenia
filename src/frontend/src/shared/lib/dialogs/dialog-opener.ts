const DIALOG = "[role=dialog], [role=alertdialog]";

// The last element focused outside any dialog: read when a dialog closes, it is the dialog's
// opener. Neither document.activeElement nor state taken when the dialog mounts names it: the
// route's loading skeleton is a dialog that takes focus first, and Next can render the dialog
// before it is opened.
let lastFocusOutsideDialogs: HTMLElement | null = null;

export function rememberFocusOutsideDialogs(event: FocusEvent) {
  if (event.target instanceof HTMLElement && !event.target.closest(DIALOG)) {
    lastFocusOutsideDialogs = event.target;
  }
}

export function dialogOpener(): HTMLElement | null {
  return lastFocusOutsideDialogs?.isConnected ? lastFocusOutsideDialogs : null;
}
