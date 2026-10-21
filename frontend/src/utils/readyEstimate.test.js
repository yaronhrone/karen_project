import { addBusinessDays, readyEstimate, isHoliday } from './readyEstimate';

const d = (y, m, day) => new Date(y, m - 1, day);
const iso = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

describe('addBusinessDays (Sunday-Thursday)', () => {
  test('Sunday + 2 = Tuesday, + 5 = next Sunday', () => {
    const sunday = d(2026, 10, 18);
    expect(iso(addBusinessDays(sunday, 2))).toBe('2026-10-20');
    expect(iso(addBusinessDays(sunday, 5))).toBe('2026-10-25');
  });

  test('Wednesday + 2 skips Friday and Saturday -> Sunday', () => {
    expect(iso(addBusinessDays(d(2026, 10, 21), 2))).toBe('2026-10-25');
  });

  test('ordering on Friday or Saturday starts counting from Sunday', () => {
    expect(iso(addBusinessDays(d(2026, 10, 23), 1))).toBe('2026-10-25');
    expect(iso(addBusinessDays(d(2026, 10, 24), 1))).toBe('2026-10-25');
  });

  test('result is never a Friday or Saturday', () => {
    for (let i = 0; i < 14; i++) {
      const start = d(2026, 10, 18 + i);
      for (const n of [2, 5]) {
        const day = addBusinessDays(start, n).getDay();
        expect([5, 6]).not.toContain(day);
      }
    }
  });

  test('does not mutate the input date', () => {
    const start = d(2026, 10, 21);
    addBusinessDays(start, 5);
    expect(iso(start)).toBe('2026-10-21');
  });
});

test('readyEstimate returns earliest before latest', () => {
  const { earliest, latest } = readyEstimate(d(2026, 10, 21));
  expect(iso(earliest)).toBe('2026-10-25');
  expect(iso(latest)).toBe('2026-10-28');
});

describe('Jewish holidays are skipped', () => {
  test('isHoliday recognises the main non-working days', () => {
    expect(isHoliday(d(2026, 9, 12))).toBe(true); // Rosh Hashana 1
    expect(isHoliday(d(2026, 9, 13))).toBe(true); // Rosh Hashana 2
    expect(isHoliday(d(2026, 9, 21))).toBe(true); // Yom Kippur
    expect(isHoliday(d(2027, 4, 22))).toBe(true); // Pesach 1
    expect(isHoliday(d(2027, 4, 28))).toBe(true); // Pesach 7
    expect(isHoliday(d(2027, 6, 11))).toBe(true); // Shavuot
    expect(isHoliday(d(2026, 10, 21))).toBe(false); // ordinary Wednesday
  });

  test('second day of Rosh Hashana (a Sunday) does not count', () => {
    // Thursday 10 Sep: Fri/Sat off, Sun 13 holiday -> Mon 14 is day 1, Tue 15 is day 2
    expect(iso(addBusinessDays(d(2026, 9, 10), 2))).toBe('2026-09-15');
  });

  test('Yom Kippur (a Monday) is skipped', () => {
    expect(iso(addBusinessDays(d(2026, 9, 20), 1))).toBe('2026-09-22');
  });

  test('Pesach day 1 (a Thursday) pushes to Sunday', () => {
    expect(iso(addBusinessDays(d(2027, 4, 21), 1))).toBe('2027-04-25');
  });
});
