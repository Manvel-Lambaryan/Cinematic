import { useState } from "react";
import { Axios } from "../../config/axios";

export const useDeleteMovie = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteMovie = async (id: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await Axios.delete(`/movie/${id}`);

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
      console.error("Delete Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { deleteMovie, loading, error };
};
