// Career start: October 2020 (months are 0-indexed).
const CAREER_START = new Date(2020, 9, 1);

export function getYearsOfExperience(now: Date = new Date()): number {
  let years = now.getFullYear() - CAREER_START.getFullYear();
  if (now.getMonth() < CAREER_START.getMonth()) years -= 1;
  return years;
}
