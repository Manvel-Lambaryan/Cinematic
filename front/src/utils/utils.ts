import { CARD_CONFIG as ICardConfig, CardName } from "../types/type";

/**
 * Կառուցում է նկարի ամբողջական URL-ը:
 */
export const getImageUrl = (path?: string): string => {
  if (!path) {
    return "";
  }
  if (path.startsWith("http")) {
    return path;
  }

  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};

/**
 * Որոշում է քարտի տեսակը (Visa, MasterCard, Amex):
 * Ուղղված է card.regex.test սխալը:
 */
export const getCardType = (
  number: string,
  config: ICardConfig[],
): CardName | null => {
  const cleanNumber = number.replace(/\s+/g, "");

  if (!cleanNumber) return null;

  for (const card of config) {
    // Եթե regex-ը string է, վերածում ենք RegExp օբյեկտի
    const re =
      typeof card.regex === "string" ? new RegExp(card.regex) : card.regex;

    if (re instanceof RegExp && re.test(cleanNumber)) {
      return card.name;
    }
  }

  return null;
};

/**
 * Ֆորմատավորում է քարտի համարը (#### #### #### ####)
 */
export const formatCreditCardNumber = (value: string): string => {
  const cleanValue = value.replace(/\D/g, ""); // Հեռացնում ենք ամեն ինչ, բացի թվերից
  const parts = [];

  for (let i = 0; i < cleanValue.length; i += 4) {
    parts.push(cleanValue.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(" ").slice(0, 19); // 16 թիվ + 3 պրոբել
  }

  return cleanValue;
};

/**
 * Ֆորմատավորում է վավերականության ժամկետը (MM/YY)
 */
export const formatExpirationDate = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "");
  if (cleanValue.length >= 3) {
    return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
  }
  return cleanValue.slice(0, 5);
};

/**
 * Ֆորմատավորում է CVC կոդը
 */
export const formatCVC = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "");
  return cleanValue.slice(0, 4);
};
