import env from "$lib/server/env";

export function getCurrentDay() {
  const startingDate = new Date(env.server.STARTING_DATE);
  const currentDate = new Date();
  const currentDay = Math.ceil(
    (currentDate.getTime() - startingDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  return currentDay;
}

export function getNextDayDateTime(day: number) {
  const startingDate = new Date(env.server.STARTING_DATE);
  const nextDayDateTime = new Date(
    startingDate.getTime() + day * 24 * 60 * 60 * 1000,
  );
  return nextDayDateTime;
}

export function getProjectedDate(day: number) {
  const startingDate = new Date(env.server.STARTING_DATE);
  const projectedDate = new Date(
    startingDate.getTime() + day * 24 * 60 * 60 * 1000,
  );
  return projectedDate;
}
