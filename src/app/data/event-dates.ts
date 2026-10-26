// Has a one-off event already happened?
//
// Event pages, the home Booster Bash band, the Hall of Fame ceremony strip and
// the volunteer list all switch from "come to this" to "thanks for coming"
// once the day is over (#260). They share this one test so they flip together.
//
// Pages are static, so this runs at build time: a page flips on the first
// deploy after the event day. The weekly events cron redeploys several times a
// week, so the lag is a few days at most. An event is still upcoming on its
// own day and counts as past from the following morning.

const TODAY_MIDNIGHT = new Date();
TODAY_MIDNIGHT.setHours(0, 0, 0, 0);

export function hasPassed(isoDate?: string): boolean {
  if (!isoDate) return false;
  const day = new Date(isoDate);
  if (Number.isNaN(day.getTime())) return false;
  day.setHours(0, 0, 0, 0);
  return day < TODAY_MIDNIGHT;
}
