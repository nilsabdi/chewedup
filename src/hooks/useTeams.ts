import { useGameData } from "./useGame";

type teamNames = {
  [x: string]: string;
};

function isTeamSide(event: LogEvent): event is TeamSide {
  return event.type === "TeamSide";
}

export const useTeams = () => {
  const { data: allData } = useGameData({
    select: (data) => data.filter(isTeamSide),
  });

  if (!allData) return null;

  // Construct an object containing team names. This will be used to determine which team a player is on
  const teamNames: teamNames = {
    [allData[0].team]: allData[0].name,
    [allData[1].team]: allData[1].name,
  };

  return teamNames;
};
