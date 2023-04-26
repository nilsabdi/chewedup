import { useGameData } from "@/hooks/useGame";
import React, { createContext, useContext, useState, useEffect } from "react";

interface TimeState {
  currentTime: number;
  currentFilter: number;
  isPlaying: boolean;
  maxTime: number;
  play: () => void;
  pause: () => void;
  scrub: (time: number) => void;
  scrubToEpoch: (time: number) => void;
  setMaxTime: (time: number) => void;
}

const TimeContext = createContext<TimeState | null>(null);

const useTimeProvider = (): TimeState => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [maxTime, setMaxTime] = useState(0);
  const { data: allEvents } = useGameData();

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        if (currentTime <= maxTime) {
          setCurrentTime((prevTime) => prevTime + 1);
        } else {
          pause();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxTime, currentTime]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const scrub = (time: number) => {
    setCurrentTime(Math.min(Math.max(time, 0), maxTime));
  };
  const scrubToEpoch = (time: number) => {
    if (!allEvents) return;
    console.log("scrubToEpoch", time);
    console.log("maxTime", maxTime);
    console.log(allEvents[allEvents.length - 1].time - time);
    setCurrentTime(time - allEvents[0].time);
  };
  // on load, set max time to the last event
  allEvents &&
    !maxTime &&
    setMaxTime(allEvents[allEvents.length - 1].time - allEvents[0].time);
  const currentFilter = (allEvents && allEvents[0].time + currentTime) ?? 0;

  return {
    currentTime,
    currentFilter,
    isPlaying,
    play,
    pause,
    scrub,
    scrubToEpoch,
    setMaxTime,
    maxTime,
  };
};

export const useTime = (): TimeState => {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error("useTimeProvider must be used within a TimeProvider");
  }
  return context;
};

export const TimeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const time = useTimeProvider();
  return <TimeContext.Provider value={time}>{children}</TimeContext.Provider>;
};
