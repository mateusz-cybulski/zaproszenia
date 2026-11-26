import type { InstructionContent } from "../model/instruction-content";

export const POLISH_CONTENT: InstructionContent = {
  language: "pl",
  title: "Instrukcja obsługi",
  intro:
    "Zaproszenia przygotowują drukowane zaproszenia i koperty na wydarzenia: prowadzisz listę gości, układasz zaproszenie i kopertę na szablonie PDF, a aplikacja wstawia imię i nazwisko, zwrot grzecznościowy i adres każdego gościa.",
  contentsLabel: "Spis treści",
  backToApp: "Otwórz aplikację",
  languageLabel: "Język",
  sections: [
    {
      id: "overview",
      title: "Jak to działa",
      blocks: [
        {
          type: "text",
          text: "Menu z lewej ma cztery części: **Wydarzenia**, **Goście**, **Szablony** i **Ustawienia**. Typowa wysyłka zaproszeń wygląda tak:",
        },
        {
          type: "steps",
          items: [
            "Uzupełnij nadawcę w **Ustawieniach**: drukujemy go jako adres zwrotny i podpis.",
            "Dodaj gości do bazy w zakładce **Goście**, pojedynczo albo z arkusza, i zweryfikuj ich dane.",
            "W zakładce **Szablony** wgraj projekt zaproszenia i koperty i ułóż na nim pola albo użyj gotowego szablonu systemowego.",
            "Utwórz wydarzenie w zakładce **Wydarzenia**, wybierz jego szablony i dodaj gości do jego listy.",
            "Wygeneruj zaproszenia i koperty jako pliki PDF i wydrukuj je.",
          ],
        },
        {
          type: "tip",
          text: "Baza gości jest wspólna dla wszystkich wydarzeń: gościa dodanego raz zaprosisz na dowolnie wiele wydarzeń.",
        },
      ],
    },
    {
      id: "account",
      title: "Konto i logowanie",
      blocks: [
        {
          type: "text",
          text: "Aby założyć konto, wybierz **Zarejestruj się** na ekranie logowania, podaj e-mail i dwa razy hasło (co najmniej 8 znaków) i naciśnij **Załóż konto**. Na Twój adres przyjdzie link potwierdzający: otwórz go, a potem zaloguj się.",
        },
        {
          type: "figure",
          screenshot: "register",
          alt: "Formularz rejestracji z polami e-mail, hasło i powtórz hasło oraz przyciskiem Załóż konto.",
          caption: "Rejestracja: po „Załóż konto” potwierdź adres linkiem z e-maila.",
        },
        {
          type: "text",
          text: "Zaloguj się e-mailem i hasłem przyciskiem **Zaloguj się**. Jeśli nie pamiętasz hasła, wybierz **Nie pamiętasz hasła?**, podaj e-mail i otwórz link z wiadomości, by ustawić nowe.",
        },
        {
          type: "figure",
          screenshot: "login",
          alt: "Formularz logowania z polami e-mail i hasło, linkiem do resetu hasła i linkiem do rejestracji.",
          caption: "Ekran logowania.",
        },
        {
          type: "text",
          text: "Na dole menu widzisz swój e-mail, przełącznik motywu (jasny, ciemny albo jak w systemie) i **Wyloguj się**.",
        },
      ],
    },
    {
      id: "settings",
      title: "Ustawienia nadawcy",
      blocks: [
        {
          type: "text",
          text: "W **Ustawieniach** uzupełnij sekcję **Nadawca**: **Nazwa nadawcy** (osoba lub organizacja, która zaprasza) i **Adres zwrotny**. Nazwa podpisuje zaproszenia, a adres trafia na koperty. Zapisz przyciskiem **Zapisz**.",
        },
        {
          type: "figure",
          screenshot: "settings",
          alt: "Strona ustawień z nazwą nadawcy, adresem zwrotnym i sekcją usuwania wszystkich danych.",
          caption: "Ustawienia: nadawca i usuwanie danych.",
        },
        {
          type: "text",
          text: "**Usuń wszystkie dane** trwale usuwa gości, szablony z plikami i dane nadawcy oraz zamyka konto. Aby potwierdzić, wpisz w oknie **USUŃ**. Tego nie da się cofnąć.",
        },
      ],
    },
    {
      id: "guests",
      title: "Goście",
      blocks: [
        {
          type: "text",
          text: "Zakładka **Goście** to Twoja baza gości. Każdy wiersz pokazuje adresata ze zwrotem grzecznościowym, stanowisko i instytucję, adres pocztowy i stan weryfikacji. Goście bez pełnego adresu mają oznaczenie **Brak adresu**: nie da się dla nich wydrukować koperty. Kliknij nazwisko, by otworzyć gościa. Pole nad listą szuka po nazwisku lub instytucji.",
        },
        {
          type: "figure",
          screenshot: "guests",
          alt: "Lista dziesięciu gości z polem wyszukiwania, przyciskami Przywróć, Importuj i Dodaj gościa oraz oznaczeniami weryfikacji.",
          caption: "Baza gości.",
        },
        {
          type: "text",
          text: "**Dodaj gościa** otwiera pusty formularz. W nagłówku wpisz **Imię i nazwisko** z tytułami (np. „prof. dr hab. Jan Nowak”); zostaw je puste, jeśli zapraszasz całą instytucję. Potem uzupełnij **Stanowisko**, **Instytucję**, **Zwrot grzecznościowy** (np. „Szanowna Pani Dyrektor”) i adres pocztowy.",
        },
        {
          type: "figure",
          screenshot: "guestEdit",
          alt: "Okno gościa z imieniem i nazwiskiem w nagłówku, polami stanowiska, instytucji, zwrotu grzecznościowego i adresu oraz przyciskiem Zapisz.",
          caption: "Edycja gościa. Imię i nazwisko zmieniasz w nagłówku okna.",
        },
        {
          type: "tip",
          text: "Zamknięcie formularza z niezapisanymi zmianami najpierw pyta: **Wróć do edycji** czy **Wyjdź bez zapisywania**.",
        },
      ],
    },
    {
      id: "import",
      title: "Import gości z arkusza",
      blocks: [
        {
          type: "text",
          text: "**Importuj** dodaje wielu gości naraz z pliku CSV albo XLSX (do 2 MB i 2000 gości). Pierwszy wiersz to nagłówki kolumn, np. „Imię i nazwisko”, „Stanowisko”, „Instytucja”, „Zwrot grzecznościowy”, „Ulica i numer”, „Kod pocztowy”, „Miejscowość”.",
        },
        {
          type: "steps",
          items: [
            "Wybierz plik i naciśnij **Sprawdź plik**. Nic jeszcze nie zostaje zapisane.",
            "Przeczytaj podsumowanie: **Do dodania**, **Już na liście** (są już w bazie, pomijani) i **Z błędami** (pomijani, każdy z numerem wiersza i przyczyną). Nierozpoznane kolumny są wymienione i pominięte.",
            "W razie potrzeby popraw plik i sprawdź go ponownie, a potem naciśnij **Importuj N gości**.",
          ],
        },
        {
          type: "figure",
          screenshot: "guestsImport",
          alt: "Okno importu po sprawdzeniu pliku: 3 gości do dodania, 1 już na liście, 1 wiersz z błędami, pominięta kolumna Telefon i tabela podglądu.",
          caption: "Sprawdzenie przed importem pokazuje, kto zostanie dodany, a kto pominięty.",
        },
      ],
    },
    {
      id: "verification",
      title: "Weryfikacja danych gości",
      blocks: [
        {
          type: "text",
          text: "Zaproszenia trafiają do osób, które zauważą błędny tytuł czy przekręconą nazwę instytucji, dlatego każdy gość ma stan weryfikacji. Kliknij oznaczenie w kolumnie **Weryfikacja**, by go zmienić:",
        },
        {
          type: "terms",
          items: [
            { term: "Do weryfikacji", description: "Nikt jeszcze nie sprawdził danych." },
            {
              term: "Zweryfikowany (AI)",
              description: "Sprawdzenie AI nie znalazło nic do poprawienia.",
            },
            { term: "Zweryfikowany", description: "Dane zatwierdziłeś samodzielnie." },
            {
              term: "Wymaga przejrzenia",
              description: "AI proponuje poprawki, które czekają na Twoją decyzję.",
            },
            {
              term: "Błąd weryfikacji",
              description:
                "Sprawdzenie AI się nie udało. Przyczynę widać w menu i w oknie gościa, razem z przyciskiem **Spróbuj ponownie**.",
            },
          ],
        },
        {
          type: "figure",
          screenshot: "guestVerificationMenu",
          alt: "Menu weryfikacji gościa, który wymaga przejrzenia, z opcjami przejrzenia wyniku AI, weryfikacji z AI i ręcznego zatwierdzenia.",
          caption: "Menu weryfikacji jednego gościa.",
        },
        {
          type: "list",
          items: [
            "**Zweryfikuj z AI** sprawdza tytuły, nazwy, instytucję i adres oraz proponuje zwrot grzecznościowy.",
            "**Zatwierdź ręcznie** oznacza dane jako poprawne bez udziału AI.",
            "**Przejrzyj wynik AI** pokazuje każdą propozycję obok obecnej wartości, z wyjaśnieniem AI.",
          ],
        },
        {
          type: "text",
          text: "W przeglądzie zaznacz **Przyjmij** przy propozycjach, które chcesz zachować, i naciśnij **Zatwierdź**: przyjęte wartości zastąpią obecne, a gość stanie się zweryfikowany. Odznacz propozycję, by zostawić swoją wartość.",
        },
        {
          type: "figure",
          screenshot: "guestAiReview",
          alt: "Okno wyniku weryfikacji AI z propozycją innego zwrotu do rektora uczelni, obecną wartością przekreśloną i polem Przyjmij.",
          caption: "Przegląd propozycji AI przed jej przyjęciem.",
        },
        {
          type: "text",
          text: "**Zweryfikuj wszystkich** nad listą sprawdza każdego niezweryfikowanego gościa, z AI albo przez ręczne zatwierdzenie. Sprawdzanie z AI pokazuje postęp i można je zatrzymać przyciskiem **Przerwij**; już sprawdzeni goście zachowują wynik.",
        },
        {
          type: "figure",
          screenshot: "guestsVerify",
          alt: "Okno z pytaniem, jak zweryfikować dane, z opcjami sprawdzenia z AI i ręcznego zatwierdzenia.",
          caption: "Weryfikacja wielu gości naraz.",
        },
      ],
    },
    {
      id: "selection",
      title: "Działania na wielu gościach",
      blocks: [
        {
          type: "text",
          text: "Zaznacz gości w pierwszej kolumnie (pole w nagłówku zaznacza całą stronę). Zaznaczenie zostaje po zmianie strony i wyszukiwania. Pasek nad listą działa wtedy tylko na zaznaczonych:",
        },
        {
          type: "list",
          items: [
            "**Zweryfikuj zaznaczonych**: weryfikacja jak wyżej, dla zaznaczonych gości.",
            "**Dodaj do wydarzenia**: dodaje zaznaczonych do listy wybranego wydarzenia. Ci, którzy już na niej są, zostaną pominięci.",
            "**Usuń**: przenosi zaznaczonych do usuniętych.",
          ],
        },
        {
          type: "figure",
          screenshot: "guestsSelection",
          alt: "Lista gości z trzema zaznaczonymi i paskiem „Zaznaczono 3 gości” z przyciskami weryfikacji, dodania do wydarzenia i usunięcia.",
          caption: "Trzech zaznaczonych gości; pasek działa na nich.",
        },
        {
          type: "text",
          text: "Usuwanie pyta, czy **Przenieś do usuniętych**, czy **Usuń na stałe**. Usuniętych gości przywrócisz przyciskiem **Przywróć** w nagłówku strony. Naraz można zaznaczyć najwyżej 1000 gości.",
        },
      ],
    },
    {
      id: "templates",
      title: "Szablony",
      blocks: [
        {
          type: "text",
          text: "Szablon to projekt zaproszenia albo koperty w PDF z ułożonymi na nim polami, np. zwrotem grzecznościowym, adresatem czy datą wydarzenia. **Szablony systemowe** to puste strony z gotowym układem pól: do testów i do druku na własnym papierze. **Moje szablony** to Twoje wgrane pliki i kopie.",
        },
        {
          type: "figure",
          screenshot: "templates",
          alt: "Strona szablonów z dwoma własnymi i dwoma systemowymi szablonami, każdy z podglądem, rodzajem, rozmiarem strony, liczbą pól i przyciskami Otwórz, Kopiuj i Usuń.",
          caption: "Twoje szablony i szablony systemowe.",
        },
        {
          type: "text",
          text: "**Wgraj PDF** dodaje projekt od grafika albo drukarni: plik PDF do 4 stron i 15 MB, bez danych gości. Nadaj mu **Nazwę** i wybierz **Rodzaj**: **Zaproszenie** albo **Koperta**.",
        },
        {
          type: "figure",
          screenshot: "templateUpload",
          alt: "Okno wgrywania z polem pliku PDF, polem nazwy i wyborem rodzaju.",
          caption: "Wgrywanie projektu PDF.",
        },
        {
          type: "text",
          text: "**Otwórz** pokazuje szablon w edytorze, **Kopiuj** tworzy Twoją kopię, a **Usuń** usuwa Twój szablon. Szablony systemowe są tylko do odczytu: aby zmienić taki szablon, użyj w edytorze przycisku **Kopiuj i edytuj**.",
        },
      ],
    },
    {
      id: "editor",
      title: "Edytor szablonu",
      blocks: [
        {
          type: "text",
          text: "Edytor pokazuje z lewej stronę z przykładowymi danymi, a z prawej listę **Pól**. Szablon z kilkoma stronami ma w nagłówku przełącznik stron. Nazwę szablonu zmienisz w polu w nagłówku.",
        },
        {
          type: "figure",
          screenshot: "templateEditor",
          alt: "Edytor szablonu z podglądem zaproszenia A5, przerywanymi ramkami pól i listą pól z przyciskiem Dodaj pole.",
          caption: "Edytor: podgląd strony i jej pola.",
        },
        {
          type: "list",
          items: [
            "**Dodaj pole** proponuje gotowe pola: zwrot grzecznościowy, adresata, blok adresowy na kopertę, nazwę wydarzenia, datę i godzinę, miejsce, treść zaproszenia albo własny tekst.",
            "Kliknij ramkę na podglądzie albo pole na liście, by je edytować. Przeciągnij ramkę, by ją przesunąć, i złap uchwyt z prawej, by zmienić szerokość. Długi tekst łamie się w szerokości pola.",
            "**Wszystkie pola** wraca do listy, **Usuń pole** usuwa pole.",
          ],
        },
        {
          type: "figure",
          screenshot: "templateField",
          alt: "Zaznaczone pole zwrotu grzecznościowego z jego tekstem, przyciskami wstawiania danych gościa, wydarzenia i nadawcy oraz ustawieniami czcionki.",
          caption: "Edycja jednego pola: tekst, wstawiane dane i wygląd.",
        },
        {
          type: "terms",
          items: [
            {
              term: "Treść",
              description:
                "Tekst pola. **Wstaw dane** wstawia w miejscu kursora dane gościa, wydarzenia albo nadawcy, np. {Zwrot grzecznościowy} czy {Nazwa wydarzenia}. Najedź na przycisk, by zobaczyć przykład.",
            },
            {
              term: "Odmiana i data",
              description:
                "Pojawia się, gdy pole używa nazw albo daty. Wybierz przypadek nazwy lub tytułu (np. dopełniacz: „prof. dr. hab. Jana Kowalskiego”) i format daty (np. „15 października 2026 r.” albo „15.10.2026”). Nazwy odmienia słownik Morfeusz 2.",
            },
            {
              term: "Wygląd",
              description: "Czcionka, rozmiar w punktach, interlinia, wyrównanie i kolor.",
            },
            {
              term: "Położenie",
              description:
                "Odległość od lewej i górnej krawędzi strony oraz szerokość, w milimetrach.",
            },
          ],
        },
        {
          type: "text",
          text: "Zapisz przyciskiem **Zapisz**. Pole nie może zostać puste: uzupełnij je albo usuń przed zapisem. Szablon może mieć najwyżej 50 pól.",
        },
      ],
    },
    {
      id: "events",
      title: "Wydarzenia",
      blocks: [
        {
          type: "text",
          text: "Zakładka **Wydarzenia** pokazuje Twoje wydarzenia z terminem, miejscem i liczbą gości na liście. Minione wydarzenia mają oznaczenie **Zakończone**. Kliknij nazwę, by otworzyć wydarzenie.",
        },
        {
          type: "figure",
          screenshot: "events",
          alt: "Lista trzech wydarzeń; minione ma oznaczenie Zakończone.",
          caption: "Lista wydarzeń.",
        },
        {
          type: "text",
          text: "**Dodaj wydarzenie** pyta o **Nazwę wydarzenia** (w nagłówku), **Datę i godzinę** (wybierane z kalendarza, czas polski), miejsce z adresem i **Treść zaproszenia**, którą szablon wstawia w pole „Treść zaproszenia”. Utwórz je przyciskiem **Utwórz**. Nowe wydarzenie dostaje szablony systemowe.",
        },
        {
          type: "figure",
          screenshot: "eventNew",
          alt: "Okno nowego wydarzenia z polami nazwy, daty i godziny, miejsca, adresu i treści zaproszenia oraz przyciskiem Utwórz.",
          caption: "Nowe wydarzenie.",
        },
        {
          type: "text",
          text: "Otwarte wydarzenie ma trzy sekcje przełączane w nagłówku: **Szczegóły**, **Szablony** i **Goście**. Szczegóły i szablony zapisuje jeden przycisk **Zapisz**; okno zostaje otwarte i pokazuje **Zapisano.**",
        },
        {
          type: "text",
          text: "Nad każdą sekcją ramka **Przed drukiem** wymienia, czego jeszcze brakuje, każdy brak z przyciskiem, który prowadzi do poprawki: brak gości na liście, niewybrany szablon, niezweryfikowani goście, goście bez pełnego adresu albo niepełne dane nadawcy.",
        },
        {
          type: "figure",
          screenshot: "eventDetails",
          alt: "Szczegóły wydarzenia z ramką Przed drukiem: dwóch gości nie jest zweryfikowanych, z przyciskiem przejścia do gości.",
          caption: "Szczegóły wydarzenia z ostrzeżeniami przed drukiem.",
        },
        {
          type: "text",
          text: "W sekcji **Szablony** wybierz **Szablon zaproszenia** i **Szablon koperty**. Podglądy pokazują to wydarzenie, Twoje dane nadawcy i przykładowego gościa i zmieniają się od razu po wyborze innego szablonu. **Brak** oznacza, że tego dokumentu nie wydrukujesz.",
        },
        {
          type: "figure",
          screenshot: "eventTemplates",
          alt: "Sekcja szablonów wydarzenia z podglądem zaproszenia z nazwą, treścią i datą wydarzenia oraz podglądem koperty z nadawcą i przykładowym adresatem.",
          caption: "Wybór szablonów z podglądem na żywo.",
        },
      ],
    },
    {
      id: "event-guests",
      title: "Lista gości wydarzenia",
      blocks: [
        {
          type: "text",
          text: "W sekcji **Goście** przycisk **Dodaj gości** otwiera wybór gości z bazy, których nie ma jeszcze na liście. Wyszukaj, zaznacz gości i naciśnij **Dodaj (N)** albo **Dodaj wszystkich pasujących**, by dodać wszystkich znalezionych.",
        },
        {
          type: "figure",
          screenshot: "eventGuestsAdd",
          alt: "Wybór gości z dwoma zaznaczonymi i przyciskiem Dodaj (2), a pod nim lista gości wydarzenia ze statusami zaproszeń.",
          caption: "Dodawanie gości z bazy do wydarzenia.",
        },
        {
          type: "text",
          text: "Każdy gość na liście ma status zaproszenia, który zmieniasz w kolumnie **Status zaproszenia**. Przycisk × zdejmuje gościa z tej listy; w bazie gości zostaje.",
        },
        {
          type: "terms",
          items: [
            { term: "Dodany", description: "Jest na liście, nic jeszcze nie wydrukowano." },
            {
              term: "Wygenerowane",
              description: "Zaproszenie zostało wygenerowane (ustawiane samo).",
            },
            { term: "Wysłane", description: "Zaproszenie zostało wysłane." },
            { term: "Przyjęte", description: "Gość przyjdzie." },
            { term: "Odrzucone", description: "Gość nie przyjdzie." },
          ],
        },
      ],
    },
    {
      id: "printing",
      title: "Druk zaproszeń i kopert",
      blocks: [
        {
          type: "text",
          text: "Menu **Do druku** w nagłówku wydarzenia ma **Zaproszenia (PDF)** i **Koperty (PDF)**. Aplikacja tworzy jeden plik PDF ze stronami szablonu dla każdego gościa z listy i go pobiera; wydrukuj go na papierze lub kopertach, dla których powstał szablon.",
        },
        {
          type: "figure",
          screenshot: "eventPrintMenu",
          alt: "Otwarte menu Do druku z opcjami Zaproszenia (PDF) i Koperty (PDF).",
          caption: "Generowanie plików do druku.",
        },
        {
          type: "list",
          items: [
            "Przy niezapisanych zmianach aplikacja najpierw pyta: **Zapisz i generuj**, **Generuj bez zapisywania** albo **Wróć**. Plik powstaje z zapisanego wydarzenia.",
            "Gdy goście nie są zweryfikowani albo brakuje danych nadawcy, aplikacja wymienia braki i pyta: **Generuj mimo to** albo **Wróć**.",
            "Bez gości albo bez szablonu plik nie powstanie, a nagłówek powie, co poprawić.",
            "Po wygenerowaniu zaproszeń goście ze statusem **Dodany** dostają status **Wygenerowane**.",
          ],
        },
      ],
    },
    {
      id: "deleting",
      title: "Usuwanie i przywracanie",
      blocks: [
        {
          type: "text",
          text: "Ikona kosza w wierszu wydarzenia albo gościa daje dwa wybory: **Przenieś do usuniętych**, co da się cofnąć, i **Usuń na stałe**, czego cofnąć się nie da. Usunięte wydarzenie zabiera ze sobą swoją listę gości, ale goście zostają w bazie.",
        },
        {
          type: "text",
          text: "**Przywróć** w nagłówku zakładek **Wydarzenia** i **Goście** pokazuje to, co przeniesiono do usuniętych: stamtąd przywrócisz element albo usuniesz go na stałe.",
        },
      ],
    },
    {
      id: "accessibility",
      title: "Urządzenia i dostępność",
      blocks: [
        {
          type: "list",
          items: [
            "Aplikacja jest przeznaczona na komputery: korzystaj z niej w przeglądarce na komputerze. Telefony i tablety nie są obsługiwane.",
            "Działa z klawiaturą i czytnikami ekranu oraz przy powiększeniu przeglądarki do 200% na typowym ekranie laptopa.",
            "Treść nie jest przystosowana do bardzo wąskich okien (320 px szerokości, jak na telefonie); to świadoma decyzja dla aplikacji tylko na komputery.",
            "Motyw jasny, ciemny albo systemowy wybierasz na dole menu.",
          ],
        },
      ],
    },
  ],
};
