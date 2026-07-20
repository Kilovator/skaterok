"use client";

import clsx from "clsx";
import React, { useEffect, useRef, useState, useCallback } from "react";

type LocalImage = { src: string; alt: string };

// GIFs available for rotation with their exact durations
const GIFS: { src: string; durationMs: number }[] = [
  { src: "/gif/2D9k.gif", durationMs: 1300 },
  { src: "/gif/QtRA.gif", durationMs: 1200 },
  { src: "/gif/YWa4.gif", durationMs: 1800 },
];

// Shuffle array using Fisher-Yates
function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Props = {
  foregroundImage: LocalImage;
  backgroundImage: LocalImage;
  className?: string;
  id?: string;
  useGifs?: boolean;
};

export function ParallaxImage({
  foregroundImage,
  backgroundImage,
  className,
  id,
  useGifs = false,
}: Props) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);

  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });

  // GIF rotation state — start with stable value (no Date.now() on server)
  const [gifSrc, setGifSrc] = useState<string | null>(null);
  const [gifOpacity, setGifOpacity] = useState(1);
  const queueRef = useRef<typeof GIFS>([]);
  const indexRef = useRef(0);

  const getNextGif = useCallback(() => {
    if (indexRef.current >= queueRef.current.length) {
      queueRef.current = shuffled(GIFS);
      indexRef.current = 0;
    }
    return queueRef.current[indexRef.current++];
  }, []);

  // GIF rotation — runs only on client, no hydration mismatch
  useEffect(() => {
    if (!useGifs) return;

    queueRef.current = shuffled(GIFS);
    indexRef.current = 0;

    let timeoutId: ReturnType<typeof setTimeout>;

    function playNext() {
      const gif = getNextGif();

      setGifOpacity(0);

      timeoutId = setTimeout(() => {
        // Cache-buster ensures GIF restarts from frame 1 each time
        setGifSrc(`${gif.src}?t=${Date.now()}`);
        setGifOpacity(1);
        timeoutId = setTimeout(playNext, gif.durationMs);
      }, 300);
    }

    // Kick off immediately with cache-buster (safe — we're on client now)
    const first = getNextGif();
    setGifSrc(`${first.src}?t=${Date.now()}`);
    timeoutId = setTimeout(playNext, first.durationMs);

    return () => clearTimeout(timeoutId);
  }, [useGifs, getNextGif]);

  // Parallax mouse effect
  useEffect(() => {
    let frameId: number;
    window.addEventListener("mousemove", onMouseMove);
    frameId = requestAnimationFrame(animationFrame);

    function onMouseMove(event: MouseEvent) {
      const { innerWidth, innerHeight } = window;
      const xPercent = (event.clientX / innerWidth - 0.5) * 2;
      const yPercent = (event.clientY / innerHeight - 0.5) * 2;
      targetPosition.current = { x: xPercent * -20, y: yPercent * -20 };
    }

    function animationFrame() {
      const { x: targetX, y: targetY } = targetPosition.current;
      const { x: currentX, y: currentY } = currentPosition.current;

      const newX = currentX + (targetX - currentX) * 0.1;
      const newY = currentY + (targetY - currentY) * 0.1;

      currentPosition.current = { x: newX, y: newY };

      if (backgroundRef.current) {
        backgroundRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      }
      if (foregroundRef.current) {
        foregroundRef.current.style.transform = `translate(${newX * 2.5}px, ${newY * 2.5}px)`;
      }

      frameId = requestAnimationFrame(animationFrame);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const imgClassName = clsx(
    "h-full max-h-[600px] w-auto drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out group-hover:-translate-y-2",
    id === "tai-2"
      ? "scale-[1.1] md:scale-[1.15] origin-bottom group-hover:scale-[1.2]"
      : id === "tai-3"
        ? "scale-[1.2] md:scale-[1.3] origin-center object-center group-hover:scale-[1.35]"
        : "scale-[1.3] md:scale-[1.4] origin-bottom group-hover:scale-[1.45] md:group-hover:scale-[1.55]"
  );

  return (
    <div
      className={clsx(
        "grid grid-cols-1 place-items-center group relative rounded-3xl p-8 bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-500",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl opacity-50 pointer-events-none" />
      <div
        ref={backgroundRef}
        className="col-start-1 row-start-1 transition-transform relative z-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundImage.src}
          alt={backgroundImage.alt}
          className="w-11/12 drop-shadow-lg opacity-80 transition-opacity duration-500 group-hover:opacity-100"
        />
      </div>

      <div
        ref={foregroundRef}
        className="col-start-1 row-start-1 transition-transform h-full w-full place-items-center relative z-10 flex justify-center items-center"
      >
        {useGifs ? (
          gifSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gifSrc}
              alt="skateboard trick"
              className={clsx(imgClassName, "transition-opacity duration-300")}
              style={{ opacity: gifOpacity }}
            />
          )
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foregroundImage.src}
            alt={foregroundImage.alt}
            className={imgClassName}
          />
        )}
      </div>
    </div>
  );
}
