import { useTime } from "@/components/providers/TimeContext";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";

const fetchGameData = async (): Promise<AllEvents[]> => {
  const response = await axios.get('/api/game')
  return response.data
}

export const useGameData = <TData = AllEvents[]>(
  options: UseQueryOptions<AllEvents[], Error, TData> = {}
) => {
  return useQuery({
    queryKey: ["gameData"],
    queryFn: () => fetchGameData(),
    ...options,
  });
};