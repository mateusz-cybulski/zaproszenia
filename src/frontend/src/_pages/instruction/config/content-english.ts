import type { InstructionContent } from "../model/instruction-content";

export const ENGLISH_CONTENT: InstructionContent = {
  language: "en",
  title: "User guide",
  intro:
    "Zaproszenia prepares printed invitations and envelopes for events: you keep a list of guests, design the invitation and envelope on a PDF template, and the app fills in every guest's name, salutation and address. The app itself is in Polish, so this guide gives each Polish label in bold with its English meaning.",
  contentsLabel: "Contents",
  backToApp: "Open the app",
  languageLabel: "Language",
  sections: [
    {
      id: "overview",
      title: "How it works",
      blocks: [
        {
          type: "text",
          text: "The sidebar has four parts: **Wydarzenia** (Events), **Goście** (Guests), **Szablony** (Templates) and **Ustawienia** (Settings). A typical round of invitations goes like this:",
        },
        {
          type: "steps",
          items: [
            "Fill in the sender in **Ustawienia**: it is printed as the return address and the signature.",
            "Add guests to the guest base in **Goście**, one by one or from a spreadsheet, and verify their data.",
            "Upload the invitation and envelope design in **Szablony** and place the fields on it, or use a ready system template.",
            "Create the event in **Wydarzenia**, choose its templates and put guests on its list.",
            "Generate the invitations and envelopes as PDF files and print them.",
          ],
        },
        {
          type: "tip",
          text: "The guest base is shared by all your events: a guest added once can be invited to any number of events.",
        },
      ],
    },
    {
      id: "account",
      title: "Account and signing in",
      blocks: [
        {
          type: "text",
          text: "To create an account, choose **Zarejestruj się** (Sign up) on the sign-in screen, enter your email and a password of at least 8 characters twice, and press **Załóż konto** (Create account). The app sends a confirmation link to your email; open it and then sign in.",
        },
        {
          type: "figure",
          screenshot: "register",
          alt: "The sign-up form with email, password and repeated password fields and the Załóż konto button.",
          caption:
            "Signing up: after Załóż konto, confirm the address with the link from the email.",
        },
        {
          type: "text",
          text: "Sign in with your email and password and **Zaloguj się** (Sign in). If you forgot the password, choose **Nie pamiętasz hasła?** (Forgot your password?), enter your email and open the link from the message to set a new one.",
        },
        {
          type: "figure",
          screenshot: "login",
          alt: "The sign-in form with email and password fields, a forgotten password link and a sign-up link.",
          caption: "The sign-in screen.",
        },
        {
          type: "text",
          text: "At the bottom of the sidebar you see your email, the colour theme switch (light, dark or the system setting) and **Wyloguj się** (Sign out).",
        },
      ],
    },
    {
      id: "settings",
      title: "Sender settings",
      blocks: [
        {
          type: "text",
          text: "In **Ustawienia** fill in **Nadawca** (Sender): **Nazwa nadawcy** (the person or organisation sending the invitations) and **Adres zwrotny** (return address). The name signs the invitations and the address is printed on the envelopes. Save with **Zapisz** (Save).",
        },
        {
          type: "figure",
          screenshot: "settings",
          alt: "The settings page with the sender name, return address fields and the delete all data section.",
          caption: "Settings: the sender and deleting your data.",
        },
        {
          type: "text",
          text: "**Usuń wszystkie dane** (Delete all data) permanently removes your guests, templates with their files and sender data, and closes your account. To confirm, type **USUŃ** in the dialog. This cannot be undone.",
        },
      ],
    },
    {
      id: "guests",
      title: "Guests",
      blocks: [
        {
          type: "text",
          text: "**Goście** is your guest base. Each row shows the recipient with their salutation, position and institution, the postal address and the verification status. Guests without a complete address are marked **Brak adresu** (No address): they cannot get an envelope. Click a guest's name to open it. Search by surname or institution with the field above the list.",
        },
        {
          type: "figure",
          screenshot: "guests",
          alt: "The guest list with ten guests, a search field, buttons for restoring, importing and adding guests, and verification badges.",
          caption: "The guest base.",
        },
        {
          type: "text",
          text: "**Dodaj gościa** (Add guest) opens an empty form. The name in the header is **Imię i nazwisko** (full name with titles, e.g. “prof. dr hab. Jan Nowak”); leave it empty to invite a whole institution. Then fill in **Stanowisko** (position), **Instytucja** (institution), **Zwrot grzecznościowy** (salutation, e.g. “Szanowna Pani Dyrektor”) and the postal address.",
        },
        {
          type: "figure",
          screenshot: "guestEdit",
          alt: "The guest dialog with the name in the header, position, institution, salutation and postal address fields and a Zapisz button.",
          caption: "Editing a guest. The name is edited in the dialog's header.",
        },
        {
          type: "tip",
          text: "Closing a form with unsaved changes asks first: **Wróć do edycji** (Keep editing) or **Wyjdź bez zapisywania** (Leave without saving).",
        },
      ],
    },
    {
      id: "import",
      title: "Importing guests from a spreadsheet",
      blocks: [
        {
          type: "text",
          text: "**Importuj** (Import) adds many guests at once from a CSV or XLSX file of up to 2 MB and 2000 guests. The first row holds the column headers in Polish, e.g. “Imię i nazwisko”, “Stanowisko”, “Instytucja”, “Zwrot grzecznościowy”, “Ulica i numer”, “Kod pocztowy”, “Miejscowość”.",
        },
        {
          type: "steps",
          items: [
            "Choose the file and press **Sprawdź plik** (Check file). Nothing is saved yet.",
            "Read the summary: **Do dodania** (to be added), **Już na liście** (already in your base, skipped) and **Z błędami** (rows with errors, skipped, each with its row number and the reason). Columns the app does not recognise are listed and ignored.",
            "Fix the file and check it again if needed, then press **Importuj N gości** (Import N guests).",
          ],
        },
        {
          type: "figure",
          screenshot: "guestsImport",
          alt: "The import dialog after checking a file: 3 guests to add, 1 already on the list, 1 row with errors, an ignored Telefon column and a preview table.",
          caption: "The check before importing shows what will be added and what will be skipped.",
        },
      ],
    },
    {
      id: "verification",
      title: "Verifying guest data",
      blocks: [
        {
          type: "text",
          text: "Invitations go to people who notice a wrong title or a misspelt institution, so every guest has a verification status. Click the badge in the **Weryfikacja** (Verification) column to change it:",
        },
        {
          type: "terms",
          items: [
            { term: "Do weryfikacji", description: "To verify: nobody has checked the data yet." },
            {
              term: "Zweryfikowany (AI)",
              description: "Verified by AI: the AI check found nothing to correct.",
            },
            {
              term: "Zweryfikowany",
              description: "Verified: you approved the data yourself.",
            },
            {
              term: "Wymaga przejrzenia",
              description: "Needs review: the AI suggests corrections that wait for your decision.",
            },
            {
              term: "Błąd weryfikacji",
              description:
                "Verification error: the AI check could not run. The reason is shown in the menu and in the guest's dialog, with **Spróbuj ponownie** (Try again).",
            },
          ],
        },
        {
          type: "figure",
          screenshot: "guestVerificationMenu",
          alt: "The verification menu of a guest who needs review, with the options to review the AI result, verify with AI and approve manually.",
          caption: "The verification menu of one guest.",
        },
        {
          type: "list",
          items: [
            "**Zweryfikuj z AI** (Verify with AI) checks titles, names, the institution and the address, and suggests a salutation.",
            "**Zatwierdź ręcznie** (Approve manually) marks the data as correct without the AI.",
            "**Przejrzyj wynik AI** (Review the AI result) shows each suggestion next to the current value with the AI's explanation.",
          ],
        },
        {
          type: "text",
          text: "In the review, tick **Przyjmij** (Accept) next to the suggestions you want and press **Zatwierdź** (Approve): the accepted values replace the current ones and the guest becomes verified. Untick a suggestion to keep your own value.",
        },
        {
          type: "figure",
          screenshot: "guestAiReview",
          alt: "The AI review dialog proposing a different salutation for a university rector, with the current value struck through and an Accept checkbox.",
          caption: "Reviewing an AI suggestion before accepting it.",
        },
        {
          type: "text",
          text: "**Zweryfikuj wszystkich** (Verify all) above the list checks every guest who is not verified yet, with AI or by manual approval. The AI run shows its progress and can be stopped with **Przerwij** (Stop); guests already checked keep their result.",
        },
        {
          type: "figure",
          screenshot: "guestsVerify",
          alt: "The dialog asking how to verify the data, with the AI check and manual approval options.",
          caption: "Verifying many guests at once.",
        },
      ],
    },
    {
      id: "selection",
      title: "Working with many guests",
      blocks: [
        {
          type: "text",
          text: "Tick guests in the first column (the header checkbox ticks the whole page). The selection stays when you change the page or search. The toolbar above the list then works on the selected guests only:",
        },
        {
          type: "list",
          items: [
            "**Zweryfikuj zaznaczonych** (Verify selected): verification as above, for the selection.",
            "**Dodaj do wydarzenia** (Add to event): puts the selected guests on the list of the event you choose. Guests already on it are skipped.",
            "**Usuń** (Delete): moves the selected guests to deleted guests.",
          ],
        },
        {
          type: "figure",
          screenshot: "guestsSelection",
          alt: "The guest list with three guests ticked and the toolbar saying Zaznaczono 3 gości with verify, add to event and delete buttons.",
          caption: "Three guests selected; the toolbar acts on them.",
        },
        {
          type: "text",
          text: "Deleting asks whether to **Przenieś do usuniętych** (Move to deleted) or **Usuń na stałe** (Delete permanently). Deleted guests can be brought back with **Przywróć** (Restore) in the page header. At most 1000 guests can be selected at once.",
        },
      ],
    },
    {
      id: "templates",
      title: "Templates",
      blocks: [
        {
          type: "text",
          text: "A template is a PDF design of an invitation or an envelope with fields placed on it, e.g. the salutation, the recipient or the event's date. **Szablony systemowe** (System templates) are blank pages with a ready layout of fields, for testing and for printing on your own paper. **Moje szablony** (My templates) are your uploads and copies.",
        },
        {
          type: "figure",
          screenshot: "templates",
          alt: "The templates page with two own templates and two system templates, each with a preview, its kind, page size, number of fields and Open, Copy and Delete buttons.",
          caption: "Your templates and the system templates.",
        },
        {
          type: "text",
          text: "**Wgraj PDF** (Upload PDF) adds a design you got from a graphic designer or a print shop: a PDF of up to 4 pages and 15 MB, without guest data. Give it a **Nazwa** (name) and choose the **Rodzaj** (kind): **Zaproszenie** (invitation) or **Koperta** (envelope).",
        },
        {
          type: "figure",
          screenshot: "templateUpload",
          alt: "The upload dialog with a PDF file field, a name field and a kind select.",
          caption: "Uploading a PDF design.",
        },
        {
          type: "text",
          text: "**Otwórz** (Open) shows the template in the editor, **Kopiuj** (Copy) makes your own copy, and **Usuń** (Delete) removes one of your templates. System templates are read-only: to change one, use **Kopiuj i edytuj** (Copy and edit) in the editor.",
        },
      ],
    },
    {
      id: "editor",
      title: "The template editor",
      blocks: [
        {
          type: "text",
          text: "The editor shows the page with sample data on the left and the list of **Pola** (Fields) on the right. A template with several pages has a page switch in the header. Rename the template in the header field.",
        },
        {
          type: "figure",
          screenshot: "templateEditor",
          alt: "The template editor with an A5 invitation preview, dashed frames around the fields, and the list of fields with an Add field button.",
          caption: "The editor: the page preview and its fields.",
        },
        {
          type: "list",
          items: [
            "**Dodaj pole** (Add field) offers ready fields: salutation, recipient, envelope address block, event name, date and time, venue, invitation text, or your own text.",
            "Click a frame on the preview or a field in the list to edit it. Drag the frame to move it and drag the handle on its right to change its width. Long text wraps within the field's width.",
            "**Wszystkie pola** (All fields) goes back to the list, **Usuń pole** (Delete field) removes the field.",
          ],
        },
        {
          type: "figure",
          screenshot: "templateField",
          alt: "A selected salutation field with its text, the buttons for inserting guest, event and sender data, and the font settings.",
          caption: "Editing one field: its text, the data to insert and its look.",
        },
        {
          type: "terms",
          items: [
            {
              term: "Treść",
              description:
                "Content: the field's text. **Wstaw dane** (Insert data) inserts guest, event or sender data at the cursor, e.g. {Zwrot grzecznościowy} or {Nazwa wydarzenia}. Hover a button to see an example.",
            },
            {
              term: "Odmiana i data",
              description:
                "Declension and date: shown when the field uses names or a date. Choose the grammatical case of a name or title (e.g. the genitive “prof. dr. hab. Jana Kowalskiego”) and the date format (e.g. “15 października 2026 r.” or “15.10.2026”). Names are declined with the Morfeusz 2 dictionary.",
            },
            {
              term: "Wygląd",
              description: "Look: font, size in points, line height, alignment and colour.",
            },
            {
              term: "Położenie",
              description:
                "Position: distance from the left and top edge of the page and the width, in millimetres.",
            },
          ],
        },
        {
          type: "text",
          text: "Save with **Zapisz**. A field cannot stay empty: fill it in or delete it before saving. A template can have at most 50 fields.",
        },
      ],
    },
    {
      id: "events",
      title: "Events",
      blocks: [
        {
          type: "text",
          text: "**Wydarzenia** lists your events with the date, the venue and the number of guests on the list. Past events are marked **Zakończone** (Finished). Click an event's name to open it.",
        },
        {
          type: "figure",
          screenshot: "events",
          alt: "The events list with three events; the past one is marked Zakończone.",
          caption: "The list of events.",
        },
        {
          type: "text",
          text: "**Dodaj wydarzenie** (Add event) asks for the **Nazwa wydarzenia** (event name, in the header), **Data i godzina** (date and time, picked from a calendar, in Polish time), the venue with its address, and the **Treść zaproszenia** (invitation text), which is placed in the template's invitation text field. Create it with **Utwórz** (Create). A new event starts with the system templates.",
        },
        {
          type: "figure",
          screenshot: "eventNew",
          alt: "The new event dialog with the name, date and time, venue, address and invitation text fields and the Utwórz button.",
          caption: "A new event.",
        },
        {
          type: "text",
          text: "An opened event has three sections switched in the header: **Szczegóły** (Details), **Szablony** (Templates) and **Goście** (Guests). Details and templates are saved together with one **Zapisz**; the dialog stays open and says **Zapisano.** (Saved.).",
        },
        {
          type: "text",
          text: "Above every section, **Przed drukiem** (Before printing) lists what is still missing, each with a button that takes you to the fix: no guests on the list, no template chosen, unverified guests, guests without a full address, or an incomplete sender.",
        },
        {
          type: "figure",
          screenshot: "eventDetails",
          alt: "An event's details with the Przed drukiem notice saying two guests are not verified and a button to go to the guests.",
          caption: "Event details with the warnings before printing.",
        },
        {
          type: "text",
          text: "In **Szablony** choose the **Szablon zaproszenia** (invitation template) and the **Szablon koperty** (envelope template). The previews show this event, your sender data and a sample guest, and they change as soon as you pick another template. Choosing **Brak** (None) means that document cannot be printed.",
        },
        {
          type: "figure",
          screenshot: "eventTemplates",
          alt: "The event's templates section with an invitation preview showing the event's name, text and date, and an envelope preview with the sender and a sample recipient.",
          caption: "Choosing templates with a live preview.",
        },
      ],
    },
    {
      id: "event-guests",
      title: "The event's guest list",
      blocks: [
        {
          type: "text",
          text: "In the **Goście** section, **Dodaj gości** (Add guests) opens a picker of guests from your base who are not on the list yet. Search, tick guests and press **Dodaj (N)** (Add), or **Dodaj wszystkich pasujących** (Add all matching) to add everyone the search finds.",
        },
        {
          type: "figure",
          screenshot: "eventGuestsAdd",
          alt: "The guest picker with two guests ticked, the Dodaj (2) button, and the event's guest list with invitation statuses below.",
          caption: "Adding guests from the base to the event.",
        },
        {
          type: "text",
          text: "Each guest on the list has an invitation status, which you change in the **Status zaproszenia** column. The × button takes a guest off this list; they stay in your guest base.",
        },
        {
          type: "terms",
          items: [
            { term: "Dodany", description: "Added: on the list, nothing printed yet." },
            {
              term: "Wygenerowane",
              description: "Generated: the invitation was generated (set automatically).",
            },
            { term: "Wysłane", description: "Sent: you sent the invitation." },
            { term: "Przyjęte", description: "Accepted: the guest is coming." },
            { term: "Odrzucone", description: "Declined: the guest is not coming." },
          ],
        },
      ],
    },
    {
      id: "printing",
      title: "Printing invitations and envelopes",
      blocks: [
        {
          type: "text",
          text: "**Do druku** (For printing) in the event's header offers **Zaproszenia (PDF)** (Invitations) and **Koperty (PDF)** (Envelopes). The app creates one PDF with the template's pages for every guest on the list and downloads it; print it on the paper or envelopes the template was designed for.",
        },
        {
          type: "figure",
          screenshot: "eventPrintMenu",
          alt: "The opened Do druku menu with the Zaproszenia (PDF) and Koperty (PDF) options.",
          caption: "Generating the files for printing.",
        },
        {
          type: "list",
          items: [
            "With unsaved changes, the app asks first: **Zapisz i generuj** (Save and generate), **Generuj bez zapisywania** (Generate without saving) or **Wróć** (Back). The file is made from the saved event.",
            "When guests are not verified or the sender is incomplete, the app lists the problems and asks: **Generuj mimo to** (Generate anyway) or **Wróć**.",
            "Without guests or without a template, nothing is generated and the header says what to fix.",
            "After generating invitations, guests with the status **Dodany** change to **Wygenerowane**.",
          ],
        },
      ],
    },
    {
      id: "deleting",
      title: "Deleting and restoring",
      blocks: [
        {
          type: "text",
          text: "The bin icon on an event's or guest's row offers two choices: **Przenieś do usuniętych** (Move to deleted), which can be undone, and **Usuń na stałe** (Delete permanently), which cannot. A deleted event takes its guest list with it, but the guests stay in your base.",
        },
        {
          type: "text",
          text: "**Przywróć** (Restore) in the header of **Wydarzenia** and **Goście** lists what was moved to deleted: bring it back or delete it permanently from there.",
        },
      ],
    },
    {
      id: "accessibility",
      title: "Devices and accessibility",
      blocks: [
        {
          type: "list",
          items: [
            "The app is made for computers: use it in a desktop browser. Phones and tablets are not supported.",
            "It works with the keyboard and screen readers, and at a browser zoom of up to 200% on a typical laptop screen.",
            "Content is not reflowed for very narrow windows (320 px wide, as on a phone); this is a deliberate decision of a desktop-only product.",
            "The light, dark or system theme is chosen at the bottom of the sidebar.",
          ],
        },
      ],
    },
  ],
};
