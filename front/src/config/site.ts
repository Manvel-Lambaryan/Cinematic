/**
 * Կայքի կոնտակտային տվյալներ — փոխել ձեր տվյալներով
 */
export const siteConfig = {
  name: "CINEMATIC",
  tagline: "Your cinema experience",
  logo: "/logo.png",
  email: "manwellllamabryaniii@gmail.com",
  phone: "+374 91 552 267",
  address: "Yerevan, Armenia",
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    telegram: "https://t.me",
  },
  copyright: `© ${new Date().getFullYear()} Cinematic. All rights reserved.`,
} as const;
