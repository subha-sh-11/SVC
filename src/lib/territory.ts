/** A release territory, said briefly enough for a caption under a poster. */
export function territoryShort(t: string | null) {
  if (!t || /not specified/i.test(t)) return "Territory not reported";
  if (/^andhra pradesh and telangana/i.test(t)) return "AP & Telangana";
  if (/^andhra pradesh telangana and karnataka/i.test(t)) return "AP, Telangana & Karnataka";
  if (/^telugu states/i.test(t)) return "Telugu states";
  if (/^telugu-language release/i.test(t)) return "Telugu release";
  if (/^domestic rights/i.test(t)) return "Domestic rights";
  return t.replace(", ", " & ");
}
