// components/YouTubeVideo.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js';
import 'videojs-youtube';
import 'video.js/dist/video-js.css';
import { useTime } from './providers/TimeContext';

type Props = {
  videoId: string;
  options?: VideoJsPlayerOptions;
};

const gameStartSeconds = 28253.5;

const YouTubeVideo: React.FC<Props> = ({ videoId, options }) => {
  const { isPlaying, currentTime } = useTime();
  const videoRef = useRef<any>(null);
  const playerRef = useRef<VideoJsPlayer | null>();

  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }

    if (playerRef.current && currentTime) {
      // If the player and currentTime are more than 5 seconds apart, seek to the new time
      if (Math.abs(playerRef.current.currentTime() - (currentTime + gameStartSeconds)) > 1) {
        playerRef.current.currentTime(gameStartSeconds + currentTime);
      }
    }
  }, [isPlaying, currentTime]);

  const defaultOptions: VideoJsPlayerOptions = useMemo(() => {
    return {
      techOrder: ['youtube'],
      fill: true,
      controls: false,
      sources: [
        {
          src: `https://www.youtube.com/watch?v=${videoId}?autoplay=false&controls=0&rel=1&iv_load_policy=3&modestbranding=1&playsInline=1&enablejsapi=1`,
          type: 'video/youtube',
        },
      ],
    }
  }, [videoId]);

  useEffect(() => {
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");
      videoRef?.current?.appendChild(videoElement);
      const player = (playerRef.current = videojs(videoElement, {
        ...options,
        ...defaultOptions
      }, () => {
        videojs.log("player is ready");
      }));
    }
  }, [options, defaultOptions]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className='w-full h-full'
      data-vjs-player
      ref={videoRef}
    >
    </div>
  );
};

export default YouTubeVideo;
