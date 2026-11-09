// Claim numbering (D34): the backend allocates codes as `<HF code>.<program code>.<6-digit sequence>`
// for every new claim outside the Chèque Santé (CS) program. CS claims keep their manually entered code.

export const isChequeSanteProgram = (program) => {
  if ((program?.code || "").trim().toUpperCase() === "CS") return true;
  const normalizedName = (program?.nameProgram || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
  return normalizedName === "cheque sante";
};

// The program is required on a claim (see ClaimForm.canSave and the backend `program` input) and its code is
// part of the generated number, so until a program is picked the form stays in manual-code mode.
// Restored claims keep their manual code (unchanged from the previous `autoGenerateClaimCode` behaviour),
// and existing claims (with a uuid) never get a new code.
export const shouldAutoGenerateClaimCode = (claim) =>
  !!claim?.program && !claim?.uuid && !claim?.restore?.uuid && !isChequeSanteProgram(claim.program);
