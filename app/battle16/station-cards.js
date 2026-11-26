// These identifiers are printed on classroom cards. Keep them stable across
// deployments. A card identifies a station; the student's token identifies the room.
export const PRINTED_STATION_CODES = Object.freeze([
  '68d8e7043f4fd3e73c24566f2ee26d1d',
  '8b25fd88f39ce005d0f95067bfe8b963',
  '5f5e132f010ae835cb933f4947568aa9',
  '513aa9435b3303f051a1ff854470a620',
]);

export function printedStationHref(station) {
  return '/battle16/index.html?' + new URLSearchParams({ station, code: PRINTED_STATION_CODES[station - 1] });
}

export function printedStationLinks() {
  return PRINTED_STATION_CODES.map((_, index) => {
    const station = index + 1;
    return { station, href: printedStationHref(station), qrUrl: '/api/sastera/stations/' + station + '/qr.svg' };
  });
}
