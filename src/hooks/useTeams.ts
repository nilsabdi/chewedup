import { useGameData } from "./useGame";

export const useTeams = () => {
  const { data: allData } = useGameData();

  if (!allData) return null;

    // Construct an object containing team names. This will be used to determine which team a player is on
  const firstTeamIndex = allData.findIndex((event) => event?.type === 'TeamSide');
  const secondTeamIndex = allData.findIndex((event, i) => event?.type === 'TeamSide' && i > firstTeamIndex);
  const teamNames = {
    [allData[firstTeamIndex].team]: allData[firstTeamIndex].name,
    [allData[secondTeamIndex].team]: allData[secondTeamIndex].name,
  }

  return teamNames;
}