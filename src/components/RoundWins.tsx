import { useGameData } from "@/hooks/useGame";
import { useTeams } from "@/hooks/useTeams";
import clsx from "clsx";
import { useTime } from "./providers/TimeContext";

type Props = {
  event: GameRoundWin;
  currentTeam: string;
  i: number;
};

const RoundWinCheck: React.FC<Props> = (props) => {
  const { event, currentTeam, i } = props;

  // Janky half time support
  if (event.team != currentTeam && i <= 14) return <span>&nbsp;</span>;
  if (event.team == currentTeam && i >= 15) return <span>&nbsp;</span>;

  switch (event.method) {
    case "Bomb_Defused":
      return <span>Defused</span>;
    case "Target_Bombed":
      return <span>Explosion</span>;
    default:
      return <span>Win</span>;
  }
};

function isGameRoundWin(event: LogEvent): event is GameRoundWin {
  return event.type === "GameRoundWin";
}

const RoundWins = () => {
  const teams = useTeams();
  const { scrubToEpoch, currentFilter } = useTime();
  const { data: roundWinData } = useGameData({
    select: (data) => data.filter(isGameRoundWin),
  });

  if (!roundWinData || !teams) return <></>; // TODO: add skeleton loader

  return (
    <div className="bg-slate-200 max-w-screen overflow-auto sm:rounded-lg ring-1 ring-black ring-opacity-5">
      {Object.keys(teams).map((currentTeam) => (
        <div key={currentTeam} className="grid grid-flow-col">
          <span className="bg-gray-50 p-2 w-28">{teams[currentTeam]}</span>
          {roundWinData.map((event, i) => (
            <div
              key={event.time}
              className={clsx(
                event.time >= currentFilter + 1 ? "invisible" : "",
                "flex items-center text-xs justify-center w-12"
              )}
            >
              <RoundWinCheck event={event} currentTeam={currentTeam} i={i} />
            </div>
          ))}
        </div>
      ))}
      <div className="grid grid-flow-col">
        <span className="bg-gray-50 p-2 w-28"></span>
        {roundWinData.map((event) => (
          <button
            key={event.time}
            onClick={() => scrubToEpoch(event.time)}
            className="w-12 rounded-sm bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {event.round}
          </button>
        ))}
      </div>
    </div>
    // <pre>{JSON.stringify(roundWinData, null, 2)}</pre>
  );
};

export default RoundWins;
