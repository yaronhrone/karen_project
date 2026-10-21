// Estimated "ready" window shown on the cart/order page: 2-5 business days.
// Business days are Sunday-Thursday (Israel); Friday, Saturday and the
// Jewish holidays below don't count. The order day itself is not counted -
// day 1 is the next business day, and a new day starts at 00:00.
export const MIN_BUSINESS_DAYS = 2;
export const MAX_BUSINESS_DAYS = 5;

// Computed from the Hebrew calendar (Intl), so there is no yearly date list to
// maintain. Rosh Hashana (2 days), Yom Kippur, Sukkot (day 1), Shemini
// Atzeret / Simchat Torah, Pesach (day 1 and 7), Shavuot. Chol HaMoed and
// Independence Day are treated as regular days.
const HOLIDAYS = {
  Tishri: [1, 2, 10, 15, 22],
  Nisan: [15, 21],
  Sivan: [6],
};
const hebrewDate = new Intl.DateTimeFormat('en-u-ca-hebrew', { day: 'numeric', month: 'long' });

export const isHoliday = (date) => {
  const parts = hebrewDate.formatToParts(date);
  const day = Number(parts.find((p) => p.type === 'day').value);
  const month = parts.find((p) => p.type === 'month').value;
  return (HOLIDAYS[month] || []).includes(day);
};

const isBusinessDay = (date) => {
  const day = date.getDay(); // 0 = Sunday ... 5 = Friday, 6 = Saturday
  return day !== 5 && day !== 6 && !isHoliday(date);
};

export const addBusinessDays = (from, days) => {
  const result = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) added += 1;
  }
  return result;
};

export const readyEstimate = (from = new Date()) => ({
  earliest: addBusinessDays(from, MIN_BUSINESS_DAYS),
  latest: addBusinessDays(from, MAX_BUSINESS_DAYS),
});

const formatDay = (date) =>
  date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'numeric' });

export const readyEstimateText = (from = new Date()) => {
  const { earliest, latest } = readyEstimate(from);
  return `ההזמנה תהיה מוכנה בערך בין ${formatDay(earliest)} ל${formatDay(latest)}`;
};
