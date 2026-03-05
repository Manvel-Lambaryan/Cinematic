import { useTranslation } from "react-i18next";

export const useMovieTranslation = () => {
  const { t } = useTranslation();

  const getMovieTitle = (title: string) => {
    if (!title) return "";

    const movieKey = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w\s]/gi, "");

    // Վերադարձնում ենք թարգմանությունը կամ բնօրինակը
    return t(`movies_data.${movieKey}_title`, { defaultValue: title });
  };

  const getMovieDesc = (title: string, defaultDesc: string) => {
    if (!title) return defaultDesc;
    const movieKey = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w\s]/gi, "");
    return t(`movies_data.${movieKey}_desc`, { defaultValue: defaultDesc });
  };

  return { getMovieTitle, getMovieDesc, t };
};
