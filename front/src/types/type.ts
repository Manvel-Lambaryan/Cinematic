export interface IMovie {
  _id: string;
  title: string;
  description: string;
  posterUrl: string;
  imageUrl: string;
  videoUrl: string;
  genre: string;
  rating: number;
  
  cinema: string; 
  price: number;
  releaseDate: string;
  showTime?: string;
}

export interface IUser {
  _id : string,
  name : string,
  email: string,
  login: string,
  password: string
  role: string
}

export const CardName = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  AMERICAN_EXPRESS: "American Express",
  UNKNOWN: "Card",
} as const;

export type CardName = (typeof CardName)[keyof typeof CardName];

export interface Card {
  name: CardName;
  regex: string;
  pattern: string;
  card_length: number;
  cvc_length: number;
}

export interface State {
  issuer: string;
  cvc: string;
  expiry: string;
  name: string;
  number: string;
  [key: string]: string;
}

export const INPUT_CONFIG = [
  {
    id: "card-holder",
    name: "name",
    placeholder: "Card Holder",
    type: "text",
    maxLength: 30,
  },
  {
    id: "card-number",
    name: "number",
    placeholder: "Card Number",
    type: "text",
    pattern: "d*",
    maxLength: 22,
  },
  {
    id: "card-expiry",
    name: "expiry",
    placeholder: "MM/YY",
    type: "text",
    pattern: "d*",
    maxLength: 5,
  },
  {
    id: "card-cvc",
    name: "cvc",
    placeholder: "CVC",
    type: "text",
    pattern: "d*",
    maxLength: 4,
  },
] as const;

export const CARD_CONFIG: Card[] = [
  {
    name: CardName.VISA,
    regex: "^4",
    pattern: "#### #### #### ####",
    card_length: 16,
    cvc_length: 3,
  },
  {
    name: CardName.MASTERCARD,
    regex: "^(5[1-5]|2[2-7])",
    pattern: "#### #### #### ####",
    card_length: 16,
    cvc_length: 3,
  },
  {
    name: CardName.AMERICAN_EXPRESS,
    regex: "^3[47]",
    pattern: "#### ###### #####",
    card_length: 15,
    cvc_length: 4,
  },
];
