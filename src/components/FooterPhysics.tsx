"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bodies,
  Body,
  Engine,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  World,
} from "matter-js";

type FooterPhysicsProps = {
  boardTextureURLs?: string[];
  className?: string;
};

export function FooterPhysics({
  boardTextureURLs = [],
  className,
}: FooterPhysicsProps) {
  const scene = useRef<HTMLDivElement>(null);
  const engine = useRef(Engine.create());
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});
  const [randomMobileTextures, setRandomMobileTextures] = useState<string[]>([]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.matchMedia("(max-width: 768px)").matches);
      }
    };

    handleResize(); // Run on mount
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (boardTextureURLs.length > 0 && isMobile && randomMobileTextures.length === 0) {
      const shuffled = [...boardTextureURLs].sort(() => 0.5 - Math.random());
      setRandomMobileTextures(shuffled.slice(0, Math.min(2, shuffled.length)));
    }
  }, [boardTextureURLs, isMobile, randomMobileTextures]);

  const limitedBoardTextures = useMemo(() => {
    return isMobile
      ? randomMobileTextures
      : boardTextureURLs;
  }, [isMobile, randomMobileTextures, boardTextureURLs]);

  // Pre-load all textures before initializing the physics engine
  useEffect(() => {
    if (limitedBoardTextures.length === 0) return;

    let loadedCount = 0;
    const textures = limitedBoardTextures;
    const newLoadedImages: Record<string, HTMLImageElement> = {};

    textures.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        newLoadedImages[src] = img;
        loadedCount++;
        if (loadedCount === textures.length) {
          setLoadedImages(newLoadedImages);
        }
      };
      img.onerror = () => {
        // Still count it to prevent blocking
        loadedCount++;
        if (loadedCount === textures.length) {
          setLoadedImages(newLoadedImages);
        }
      };
    });
  }, [limitedBoardTextures]);

  useEffect(() => {
    const currentScene = scene.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.5 },
    );

    if (currentScene) observer.observe(currentScene);

    return () => {
      if (currentScene) observer.unobserve(currentScene);
    };
  }, []);

  // Main physics loop - wait until inView and all textures are loaded
  useEffect(() => {
    if (!scene.current || !inView || Object.keys(loadedImages).length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const cw = scene.current.clientWidth;
    const ch = scene.current.clientHeight;

    engine.current.gravity.y = 0.5;

    const render = Render.create({
      element: scene.current,
      engine: engine.current,
      options: {
        width: cw,
        height: ch,
        pixelRatio: window.devicePixelRatio,
        wireframes: false,
        background: "transparent",
      },
    });

    // Populate the texture cache to prevent matter-js drawImage crash on async load
    Object.entries(loadedImages).forEach(([src, img]) => {
      render.textures[src] = img;
    });

    let boundaries = createBoundaries(cw, ch);
    World.add(engine.current.world, boundaries);

    const mouse = Mouse.create(render.canvas);
    // @ts-expect-error - matter-js has incorrect types
    mouse.element.removeEventListener("wheel", mouse.mousewheel);

    // Set pixel ratio on mouse to align with High-DPI rendering (fixes offset click boxes)
    mouse.pixelRatio = window.devicePixelRatio;

    const mouseConstraint = MouseConstraint.create(engine.current, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    World.add(engine.current.world, mouseConstraint);

    window.addEventListener("resize", onResize);

    function onResize() {
      if (!scene.current) return;

      const cw = scene.current.clientWidth;
      const ch = scene.current.clientHeight;

      render.canvas.width = cw;
      render.canvas.height = ch;
      render.options.width = cw;
      render.options.height = ch;
      Render.setPixelRatio(render, window.devicePixelRatio);
      mouse.pixelRatio = window.devicePixelRatio;

      World.remove(engine.current.world, boundaries);
      boundaries = createBoundaries(cw, ch);
      World.add(engine.current.world, boundaries);
    }

    function createBoundaries(width: number, height: number) {
      return [
        Bodies.rectangle(width / 2, -10, width, 20, { isStatic: true }),
        Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true }),
        Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true }),
        Bodies.rectangle(width + 10, height / 2, 20, height, {
          isStatic: true,
        }),
      ];
    }

    const runner = Runner.create();
    Runner.run(runner, engine.current);
    Render.run(render);

    const currentEngine = engine.current;

    return () => {
      window.removeEventListener("resize", onResize);

      Render.stop(render);
      Runner.stop(runner);
      if (currentEngine) {
        World.clear(currentEngine.world, false);
        Engine.clear(currentEngine);
      }
      render.canvas.remove();
      render.textures = {};
    };
  }, [inView, loadedImages]);

  // Create bodies once textures are loaded and physics is ready
  useEffect(() => {
    if (!scene.current || !inView || Object.keys(loadedImages).length === 0) return;

    const world = engine.current.world;
    const cw = scene.current.clientWidth;
    const ch = scene.current.clientHeight;

    // Only render textures that successfully loaded to prevent crashes
    const activeTextures = limitedBoardTextures.filter((src) => loadedImages[src]);

    const boards = activeTextures.map((texture) => {
      const x = Math.random() * cw;
      const y = Math.random() * (ch / 2 - 100) + 50;
      const rotation = ((Math.random() * 100 - 50) * Math.PI) / 180;

      const img = loadedImages[texture];
      const imgWidth = img ? img.naturalWidth : 1;
      const imgHeight = img ? img.naturalHeight : 1;

      const scaleFactor = isMobile ? 0.55 : 1;
      const bodyWidth = 370 * scaleFactor;
      const bodyHeight = 92 * scaleFactor;
      
      // Calculate sprite scale dynamically to fit the standard size.
      // We scale the visual sprite slightly larger (8-15%) than the physical body 
      // so they can overlap organically without looking like they are separated by invisible walls.
      const xScale = (bodyWidth * 1.08) / imgWidth;
      const yScale = (bodyHeight * 1.15) / imgHeight;

      const body = Bodies.rectangle(x, y, bodyWidth, bodyHeight, {
        // Chamfer radius rounds the corners of the rectangle
        chamfer: { radius: bodyHeight * 0.48 },
        angle: rotation,
        restitution: isMobile ? 0.15 : 0.7 + Math.random() * 0.2, // Less bouncy on mobile
        friction: 0.001 + Math.random() * 0.009, // Randomize friction slightly
        frictionAir: isMobile ? 0.05 : 0.005 + Math.random() * 0.015, // More air resistance on mobile to slow it down
        render: {
          sprite: {
            texture,
            xScale,
            yScale,
          },
        },
      });

      // Apply a random initial spin and horizontal nudge to make them unpredictable
      const speedScale = isMobile ? 0.2 : 1;
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15 * speedScale);
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 3 * speedScale, y: 0 });

      return body;
    });

    if (boards.length > 0) {
      World.add(engine.current.world, boards);
    }

    return () => {
      World.remove(world, boards);
    };
  }, [limitedBoardTextures, inView, loadedImages, isMobile]);

  return <div ref={scene} className={className} />;
}
