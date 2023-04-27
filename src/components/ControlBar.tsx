import { formatHumanTime } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { RewindButton } from "./ControlPanel/BackButton";
import { ForwardButton } from "./ControlPanel/ForwardButton";
import { PlayButton } from "./ControlPanel/PlayButton";
import { Slider } from "./ControlPanel/Slider";
import { useTime } from "./providers/TimeContext";

export const ControlBar = () => {
  const { currentTime, currentFilter, isPlaying, maxTime, play, pause, scrub } =
    useTime();
  const [scrubTime, setScrubTime] = useState<number | null>(currentTime);
  const wasPlayingRef = useRef(false);

  useEffect(() => {
    setScrubTime(null);
  }, [currentTime]);
  return (
    <div className="fixed w-full bottom-0 flex items-center gap-6 bg-white/90 px-4 py-4 shadow shadow-slate-200/80 ring-1 ring-slate-900/5 backdrop-blur-sm md:px-6">
      <div className="flex flex-none items-center gap-4">
        <RewindButton scrub={() => scrub(currentTime - 10)} />
        <PlayButton size="medium" />
        <ForwardButton scrub={() => scrub(currentTime + 10)} />
      </div>
      <Slider
        label="Current time"
        maxValue={maxTime}
        step={1}
        value={[scrubTime ?? currentTime]}
        onChange={(v: number) => setScrubTime(v)}
        onChangeEnd={(value: number[]) => {
          scrub(value[0]);
          if (wasPlayingRef.current) {
            play();
          }
        }}
        numberFormatter={{ format: formatHumanTime }}
        onChangeStart={() => {
          wasPlayingRef.current = isPlaying;
          pause();
        }}
      />
    </div>
  );
};
