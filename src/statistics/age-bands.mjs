export const AGE_BANDS = Object.freeze([
  Object.freeze({ id: "under_20", min: 16, max: 19, label: "menos de 20 años" }),
  Object.freeze({ id: "20_29", min: 20, max: 29, label: "20 a 29 años" }),
  Object.freeze({ id: "30_39", min: 30, max: 39, label: "30 a 39 años" }),
  Object.freeze({ id: "40_49", min: 40, max: 49, label: "40 a 49 años" }),
  Object.freeze({ id: "50_59", min: 50, max: 59, label: "50 a 59 años" }),
  Object.freeze({ id: "60_plus", min: 60, max: 120, label: "60 años o más" })
]);

export function ageToBand(age) {
  if (!Number.isInteger(age) || age < 16 || age > 120) {
    return null;
  }

  return AGE_BANDS.find((band) => age >= band.min && age <= band.max) ?? null;
}

export function getAgeBand(id) {
  return AGE_BANDS.find((band) => band.id === id) ?? null;
}

