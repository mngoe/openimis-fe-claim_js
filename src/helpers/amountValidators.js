import { formatMessageWithValues } from "@openimis/fe-core";

export const monetaryError = (intl, amount) => {
  const num =
    amount === null || amount === undefined || amount === ""
      ? null
      : Number(String(amount).replace(",", "."));
  return num !== null && !isNaN(num) && num < 0
    ? formatMessageWithValues(intl, null, "validation.minValue", { min: 0 })
    : null;
};

export default monetaryError;
