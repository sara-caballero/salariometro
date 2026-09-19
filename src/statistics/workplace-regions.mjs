export const WORKPLACE_REGIONS = Object.freeze([
  Object.freeze({ code: "1", label: "Noroeste" }),
  Object.freeze({ code: "2", label: "Noreste" }),
  Object.freeze({ code: "3", label: "Comunidad de Madrid" }),
  Object.freeze({ code: "4", label: "Centro" }),
  Object.freeze({ code: "5", label: "Este" }),
  Object.freeze({ code: "6", label: "Sur" }),
  Object.freeze({ code: "7", label: "Canarias" })
]);

export function getWorkplaceRegion(code) {
  return WORKPLACE_REGIONS.find((region) => region.code === String(code)) ?? null;
}

