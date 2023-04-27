import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";

const fetchGameData = async (): Promise<LogEvent[]> => {
  const response = await axios.get("/api/game");
  return response.data;
};

export const useGameData = <TData = LogEvent[]>(
  options: UseQueryOptions<LogEvent[], Error, TData> = {}
) => {
  return useQuery({
    queryKey: ["gameData"],
    queryFn: () => fetchGameData(),
    ...options,
  });
};
