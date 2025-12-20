import { STARTING_DATE } from "$env/static/private";

export function getCurrentDay() {
  const startingDate = new Date(STARTING_DATE);
  const currentDate = new Date();
  const currentDay = Math.ceil(
    (currentDate.getTime() - startingDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  return currentDay;
}

export function getProjectedDate(day: number) {
  const startingDate = new Date(STARTING_DATE);
  const projectedDate = new Date(
    startingDate.getTime() + day * 24 * 60 * 60 * 1000,
  );
  return projectedDate;
}
