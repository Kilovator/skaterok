"use client";

import { Bounded } from "@/components/Bounded";
import clsx from "clsx";
import { useEffect, useRef, useState, useCallback } from "react";

const MASK_CLASSES =
  "[mask-image:url(/video-mask.png)] [mask-mode:alpha] [mask-position:center_center] [mask-repeat:no-repeat] [mask-size:100%_auto]";

// GIFs with exact durations (measured per-file)
const GIFS: { src: string; durationMs: number }[] = [
  { src: "/gif/1a3X.gif", durationMs: 1600 },
  { src: "/gif/1FAL.gif", durationMs: 3650 },
  { src: "/gif/1pB8.gif", durationMs: 3520 },
  { src: "/gif/2D9k.gif", durationMs: 1300 },
  { src: "/gif/3INl.gif", durationMs: 15120 },
  { src: "/gif/4CpC.gif", durationMs: 2800 },
  { src: "/gif/4HnT.gif", durationMs: 2400 },
  { src: "/gif/7EeB.gif", durationMs: 2400 },
  { src: "/gif/7f1H.gif", durationMs: 3060 },
  { src: "/gif/AsXD.gif", durationMs: 1760 },
  { src: "/gif/FgLG.gif", durationMs: 3800 },
  { src: "/gif/IGCe.gif", durationMs: 3000 },
  { src: "/gif/PJc.gif",  durationMs: 900  },
  { src: "/gif/QtRA.gif", durationMs: 1200 },
  { src: "/gif/Y6Jn.gif", durationMs: 3300 },
  { src: "/gif/YWa4.gif", durationMs: 1800 },
];

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function GifPlayer() {
  const [gifSrc, setGifSrc] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(1);
  const queueRef = useRef<typeof GIFS>([]);
  const indexRef = useRef(0);

  const getNext = useCallback(() => {
    if (indexRef.current >= queueRef.current.length) {
      queueRef.current = shuffled(GIFS);
      indexRef.current = 0;
    }
    return queueRef.current[indexRef.current++];
  }, []);

  useEffect(() => {
    queueRef.current = shuffled(GIFS);
    indexRef.current = 0;

    let timeoutId: ReturnType<typeof setTimeout>;

    function playNext() {
      const gif = getNext();
      setOpacity(0);
      timeoutId = setTimeout(() => {
        setGifSrc(`${gif.src}?t=${Date.now()}`);
        setOpacity(1);
        timeoutId = setTimeout(playNext, gif.durationMs);
      }, 300);
    }

    const first = getNext();
    setGifSrc(`${first.src}?t=${Date.now()}`);
    timeoutId = setTimeout(playNext, first.durationMs);

    return () => clearTimeout(timeoutId);
  }, [getNext]);

  if (!gifSrc) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={gifSrc}
      alt="skateboard trick"
      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
      style={{ opacity }}
    />
  );
}

const VideoBlock = (): JSX.Element => {
  return (
    <Bounded className="bg-texture bg-zinc-900">
      <h2 className="sr-only">Video Reel</h2>
      <div className="relative aspect-video">
        {/* Masks / shadow layers */}
        <div
          className={clsx(
            MASK_CLASSES,
            "bg-brand-amethyst absolute inset-0 ~translate-x-2/3 ~translate-y-2/3"
          )}
        />
        <div
          className={clsx(
            MASK_CLASSES,
            "bg-white absolute inset-0 ~translate-x-1/3 ~translate-y-1/2"
          )}
        />
        <div
          className={clsx(
            MASK_CLASSES,
            "bg-white absolute inset-0 ~translate-x-1/2 ~-translate-y-1/3"
          )}
        />

        {/* GIFs inside the mask */}
        <div className={clsx(MASK_CLASSES, "relative h-full bg-zinc-900")}>
          <GifPlayer />
        </div>

        {/* Animated squiggle border — same effect as on skater cards */}
        <svg
          viewBox="0 0 800 450"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-squiggle pointer-events-none absolute inset-0 h-full w-full text-brand-amethyst"
          preserveAspectRatio="none"
        >
          <rect
            x="6"
            y="6"
            width="788"
            height="438"
            rx="12"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Bounded>
  );
};

export default VideoBlock;

