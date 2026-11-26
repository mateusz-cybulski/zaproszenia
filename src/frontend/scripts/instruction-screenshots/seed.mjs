// Sample data for the screenshots, on top of the guests app.seed adds to a fresh local API.
import { api } from "./lib.mjs";

const EXTRA_GUESTS = [
  {
    full_name: "dr Ewa Mazur",
    position: "Dyrektor",
    institution: "Biblioteka Narodowa",
    salutation: "Szanowna Pani Dyrektor",
    street: "al. Niepodległości 213",
    postal_code: "02-086",
    city: "Warszawa",
  },
  {
    full_name: "Marek Dąbrowski",
    position: "Prezes Zarządu",
    institution: "Polskie Towarzystwo Historyczne",
    salutation: "Szanowny Panie Prezesie",
    street: "Rynek Starego Miasta 29/31",
    postal_code: "00-272",
    city: "Warszawa",
  },
  {
    full_name: "Agnieszka Wójcik",
    position: "Kurator",
    institution: "Muzeum Sztuki w Łodzi",
    salutation: "Szanowna Pani",
    street: "ul. Więckowskiego 36",
    postal_code: "90-734",
    city: "Łódź",
  },
  {
    full_name: "Michał Kamiński",
    position: "Wojewoda",
    institution: "Mazowiecki Urząd Wojewódzki",
    salutation: "Szanowny Panie Wojewodo",
    street: "pl. Bankowy 3/5",
    postal_code: "00-950",
    city: "Warszawa",
  },
];

const GALA_GUESTS = {
  "Anna Kowalska": "accepted",
  "prof. dr hab. Jan Nowak": "sent",
  "Piotr Wiśniewski": "added",
  "dr Ewa Mazur": "sent",
  "Marek Dąbrowski": "declined",
  "Michał Kamiński": "added",
};

const VERIFIED_MANUALLY = ["dr Ewa Mazur", "Marek Dąbrowski", "Michał Kamiński"];
// Asked in this order until one of them needs a review: the AI's answer is not always the same.
const VERIFIED_WITH_AI = [
  "prof. dr hab. Jan Nowak",
  "Tomasz Lewandowski",
  "Piotr Wiśniewski",
  "Redakcja Radia Kraków",
];

const existing = await api("GET", "/guests?page_size=100");
if (existing.total > 6) {
  throw new Error("The database already has more than the sample guests: start from a fresh one.");
}

await api("PUT", "/me", {
  sender_name: "Fundacja Kultury Polskiej",
  street: "ul. Długa 12",
  postal_code: "00-238",
  city: "Warszawa",
  country: "PL",
});

for (const guest of EXTRA_GUESTS) {
  await api("POST", "/guests", { country: "PL", ...guest });
}
const guests = (await api("GET", "/guests?page_size=100")).items;
const guestId = (name) => {
  const guest = guests.find((item) => (item.full_name ?? item.institution) === name);
  if (!guest) throw new Error(`No sample guest named ${name}.`);
  return guest.id;
};

const templates = await api("GET", "/templates");
const systemTemplate = (kind) => templates.find((item) => item.is_system && item.kind === kind);
const invitation = await api("POST", `/templates/${systemTemplate("invitation").id}/copy`);
await api("PATCH", `/templates/${invitation.id}`, { name: "Zaproszenie na galę" });
const envelope = await api("POST", `/templates/${systemTemplate("envelope").id}/copy`);
await api("PATCH", `/templates/${envelope.id}`, { name: "Koperta DL fundacji" });

const gala = await api("POST", "/events", {
  name: "Gala 30-lecia Fundacji",
  starts_at: "2027-03-12T19:00:00",
  venue_name: "Zamek Królewski w Warszawie",
  street: "pl. Zamkowy 4",
  postal_code: "00-277",
  city: "Warszawa",
  country: "PL",
  invitation_text:
    "Z okazji 30-lecia Fundacji Kultury Polskiej mamy zaszczyt zaprosić na uroczystą galę, koncert i kolację.",
  invitation_template_id: invitation.id,
  envelope_template_id: envelope.id,
});
await api("POST", "/events", {
  name: "Wernisaż „Światło Północy”",
  starts_at: "2027-01-21T18:00:00",
  venue_name: "Muzeum Sztuki w Łodzi",
  street: "ul. Więckowskiego 36",
  postal_code: "90-734",
  city: "Łódź",
  country: "PL",
});
await api("POST", "/events", {
  name: "Koncert noworoczny",
  starts_at: "2026-01-10T19:00:00",
  venue_name: "Filharmonia Narodowa",
  street: "ul. Jasna 5",
  postal_code: "00-950",
  city: "Warszawa",
  country: "PL",
});

await api("POST", `/events/${gala.id}/guests`, {
  guest_ids: Object.keys(GALA_GUESTS).map(guestId),
});
for (const [name, status] of Object.entries(GALA_GUESTS)) {
  if (status !== "added") {
    await api("PATCH", `/events/${gala.id}/guests/${guestId(name)}`, { status });
  }
}

for (const name of VERIFIED_MANUALLY) {
  await api("POST", `/guests/${guestId(name)}/verification/manual`);
}

let needsReview = false;
for (const name of VERIFIED_WITH_AI) {
  const guest = await api("POST", `/guests/${guestId(name)}/verification/ai`);
  console.log(`AI check of ${name}: ${guest.verification_status}`);
  if (guest.verification_status === "needs_review") {
    needsReview = true;
    break;
  }
}
if (!needsReview) {
  throw new Error(
    "No AI check needs a review, so the review screenshots cannot be taken. Is `gcloud auth application-default login` done? Run again otherwise.",
  );
}

console.log("Sample data is in.");
