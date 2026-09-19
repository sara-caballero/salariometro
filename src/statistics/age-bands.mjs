export const AGE_BANDS = Object.freeze([
  Object.freeze({ id: "under_25", min: 16, max: 24, label: "menos de 25 años" }),
  Object.freeze({ id: "25_34", min: 25, max: 34, label: "25 a 34 años" }),
  Object.freeze({ id: "35_44", min: 35, max: 44, label: "35 a 44 años" }),
  Object.freeze({ id: "45_54", min: 45, max: 54, label: "45 a 54 años" }),
  Object.freeze({ id: "55_plus", min: 55, max: 120, label: "55 años o más" })
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
