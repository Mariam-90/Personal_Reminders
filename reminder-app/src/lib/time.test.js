import { fromInputs, relativeTime, reminderStatus, toDateInput, toTimeInput, dayLabel } from './time';

const at = (h, m = 0) => new Date(2026, 9, 15, h, m);

describe('fromInputs / toInputs', () => {
  it('round-trips local date and time', () => {
    const d = fromInputs('2026-10-15', '09:05');
    expect(d.getHours()).toBe(9);
    expect(d.getMinutes()).toBe(5);
    expect(toDateInput(d)).toBe('2026-10-15');
    expect(toTimeInput(d)).toBe('09:05');
  });

  it('rejects missing values', () => {
    expect(fromInputs('', '09:00')).toBeNull();
    expect(fromInputs('2026-10-15', '')).toBeNull();
  });
});

describe('reminderStatus', () => {
  const now = at(12);
  it('is done when completed', () => {
    expect(reminderStatus({ isCompleted: true, executionDate: at(8) }, now)).toBe('done');
  });
  it('is upcoming before its time', () => {
    expect(reminderStatus({ executionDate: at(13) }, now)).toBe('upcoming');
  });
  it('is due right after its time', () => {
    expect(reminderStatus({ executionDate: at(11, 30) }, now)).toBe('due');
  });
  it('is missed an hour later', () => {
    expect(reminderStatus({ executionDate: at(10) }, now)).toBe('missed');
  });
  it('uses the snooze time when set', () => {
    expect(reminderStatus({ executionDate: at(10), snoozeUntil: at(12, 10) }, now)).toBe('upcoming');
  });
});

describe('relativeTime', () => {
  const now = at(12);
  it('speaks Hebrew', () => {
    expect(relativeTime(at(12, 20), now)).toBe('בעוד 20 דקות');
    expect(relativeTime(at(14), now)).toBe('בעוד שעתיים');
    expect(relativeTime(at(11), now)).toBe('לפני שעה');
  });
});

describe('dayLabel', () => {
  const now = at(12);
  it('names nearby days', () => {
    expect(dayLabel(at(18), now)).toBe('היום');
    expect(dayLabel(new Date(2026, 9, 16, 9), now)).toBe('מחר');
    expect(dayLabel(new Date(2026, 9, 14, 9), now)).toBe('אתמול');
  });
});
