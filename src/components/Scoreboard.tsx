import { useGameData } from '@/hooks/useGame';
import React, { useEffect } from 'react';
import { useTime } from './providers/TimeContext';

const TimeComponent: React.FC = () => {
  const { currentTime, currentFilter, isPlaying, play, pause, scrub } = useTime();
  const { data: kills, isLoading } = useGameData({
    select: (data) => data.filter((event) => event.time <= currentFilter && event.type === 'PlayerKill'),
  });

  if (isLoading) return <p>Loading...</p>;
  return (
    <div>
      <p>Current Time: {currentTime}</p>
      <p>Current filter: {currentFilter}</p>
      <p>Is Playing: {isPlaying ? 'Yes' : 'No'}</p>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <button onClick={() => scrub(currentTime - 60)}>- 60</button>
      <button onClick={() => scrub(currentTime - 10)}>- 10</button>
      <button onClick={() => scrub(currentTime + 10)}>+ 10</button>
      <button onClick={() => scrub(currentTime + 60)}>+ 60</button>
      <pre>{JSON.stringify(kills, null, 2)}</pre>
    </div>
  );
};

export default TimeComponent;
