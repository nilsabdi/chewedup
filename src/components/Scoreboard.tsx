import { useGameData } from "@/hooks/useGame";
import { useTeams } from "@/hooks/useTeams";
import React, { useMemo } from "react";
import { useTime } from "./providers/TimeContext";

type ScoreboardRow = {
  name: string;
  teamName: string;
  kills: number;
  headshots: number;
  deaths: number;
  assists: number;
};

function isPlayerLeftBuyzone(event: LogEvent): event is PlayerLeftBuyzone {
  return event.type === "PlayerLeftBuyzone";
}

const Scoreboard: React.FC = () => {
  const { currentFilter } = useTime();
  const { data: allData, isLoading } = useGameData();
  const teams = useTeams();

  const tableData = useMemo(() => {
    if (!allData || !teams) return null;

    const uniquePlayers = [
      ...new Set(
        allData.filter(isPlayerLeftBuyzone).map((event) => event.player.name)
      ),
    ];

    // Decorate the players with their team name
    const playersDecoratedWithTeams = uniquePlayers.map(
      (name): ScoreboardRow => {
        const playerLeftBuyzone = allData
          .filter(isPlayerLeftBuyzone)
          .find((event) => event.player.name === name);

        if (!playerLeftBuyzone) {
          throw new Error(`Could not find PlayerLeftBuyzone event for ${name}`);
        }

        const playerKills = allData.filter(
          (event) =>
            currentFilter >= event.time &&
            event.type === "PlayerKill" &&
            event?.attacker?.name === name
        );
        const playerAssists = allData.filter(
          (event) =>
            currentFilter >= event.time &&
            event.type === "PlayerKillAssist" &&
            event?.attacker?.name === name
        );
        const playerDeaths = allData.filter(
          (event) =>
            currentFilter >= event.time &&
            event.type === "PlayerKill" &&
            event.victim?.name === name
        );
        const playerHeadshots = playerKills.filter(
          (event) => event.type === "PlayerKill" && event.headshot
        );

        return {
          name,
          teamName: teams[playerLeftBuyzone.player.team],
          kills: playerKills.length,
          assists: playerAssists.length,
          deaths: playerDeaths.length,
          headshots: playerHeadshots.length,
        };
      }
    );

    const groupedPlayers = playersDecoratedWithTeams.reduce((acc, player) => {
      const { teamName } = player;
      if (!acc[teamName]) {
        acc[teamName] = [];
      }
      acc[teamName].push(player);
      return acc;
    }, {} as Record<string, ScoreboardRow[]>);

    return groupedPlayers;
  }, [allData, currentFilter, teams]);

  if (isLoading) return <></>; // TODO: add skeleton loader

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-4">
      {tableData &&
        Object.keys(tableData).map((teamName) => {
          return (
            <div
              key={teamName}
              className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg"
            >
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      {teamName}
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Kills
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Assists
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Deaths
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Headshots
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tableData[teamName].map((player: ScoreboardRow) => {
                    return (
                      <tr key={player.name}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {player.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {player.kills}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {player.assists}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {player.deaths}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {player.headshots}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
    </div>
  );
};

export default Scoreboard;
