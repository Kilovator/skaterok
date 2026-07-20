"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Skateboard } from "./Skateboard";
import {
  Bodies,
  Engine,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  World,
} from "matter-js";

type FooterPhysicsProps = {
  boardTextureURLs: string[];
  className?: string;
};

export function FooterPhysics({
  boardTextureURLs = [],
  className,
}: FooterPhysicsProps) {
  // The div we'll inject our canvas into
  const scene = useRef<HTMLDivElement>(null);
  // Engine handles the physics simulations
  const engine = useRef(Engine.create());
  // Intersection Observer state
  const [inView, setInView] = useState(false);
  const [boards, setBoards] = useState<Matter.Body[]>([]);
  // We show fewer boards on mobile
  const [isMobile, setIsMobile] = useState(false);

  // Handle mobile detection
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

  // Fewer boards on mobile
  const limitedBoardTextures = isMobile
    ? boardTextureURLs.slice(0, 5)
    : boardTextureURLs;

  // Intersection Observer to start/stop the physics simulation
  useEffect(() => {
    const currentScene = scene.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.5 } // Trigger at 50% so users see the boards drop
    );

    if (currentScene) observer.observe(currentScene);

    return () => {
      if (currentScene) observer.unobserve(currentScene);
    };
  }, []);

  useEffect(() => {
    if (!scene.current || !inView) return;

    // If the user prefers reduced motion, don't run the physics simulation
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const cw = scene.current.clientWidth;
    const ch = scene.current.clientHeight;

    engine.current.gravity.y = 0.5; // Gravity on vertical axis

    // Create Matter.js renderer
    const render = Render.create({
      element: scene.current, // attach to our scene div
      engine: engine.current,
      options: {
        width: cw,
        height: ch,
        pixelRatio: window.devicePixelRatio,
        wireframes: false,
        background: "transparent",
      },
    });

    // Add boundaries to the scene
    let boundaries = createBoundaries(cw, ch);
    World.add(engine.current.world, boundaries);

    // Add mouse interaction for dragging boards
    const mouse = Mouse.create(render.canvas);
    // @ts-expect-error - matter.js has incorrect types
    mouse.element.removeEventListener("wheel", mouse.mousewheel);

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

      // Update canvas and renderer dimensions
      render.canvas.width = cw;
      render.canvas.height = ch;
      render.options.width = cw;
      render.options.height = ch;
      Render.setPixelRatio(render, window.devicePixelRatio);

      World.remove(engine.current.world, boundaries);
      boundaries = createBoundaries(cw, ch);
      World.add(engine.current.world, boundaries);
    }

    // Create walls/boundaries around the scene to keep boards in
    function createBoundaries(width: number, height: number) {
      return [
        Bodies.rectangle(width / 2, -10, width, 20, { isStatic: true }), // Top
        Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true }), // Left
        Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true }), // Bottom
        Bodies.rectangle(width + 10, height / 2, 20, height, {
          isStatic: true,
        }), // Right
      ];
    }

    // Runner manages the animation loop and updates engine 60 times per second
    const runner = Runner.create();
    Runner.run(runner, engine.current);
    Render.run(render);

    const currentEngine = engine.current;

    // Clean up
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
  }, [inView]);

  // Add boards to the scene
  useEffect(() => {
    if (!scene.current || !inView) return;

    const world = engine.current.world;
    const cw = scene.current.clientWidth;
    const ch = scene.current.clientHeight;

    const boardsArray = limitedBoardTextures.map((texture) => {
      // Randomize board position and rotation
      const x = Math.random() * cw;
      const y = Math.random() * (ch / 2 - 100) + 50;
      const rotation = ((Math.random() * 100 - 50) * Math.PI) / 180;

      return Bodies.rectangle(x, y, 56, 200, {
        chamfer: { radius: 28 }, // Rounded corners for accurate collision
        angle: rotation,
        restitution: 0.8, // Bounciness
        friction: 0.005, // minimal friction
        render: {
          visible: false, // Hide the 2D sprite
        },
      });
    });

    if (boardsArray.length > 0) {
      World.add(engine.current.world, boardsArray); // Add boards to the world
      setBoards(boardsArray);
    }

    return () => {
      World.remove(world, boardsArray);
      setBoards([]);
    };
  }, [limitedBoardTextures, inView]);

  return (
    <div ref={scene} className={className}>
      {boards.map((body, i) => (
        <Board3D
          key={body.id}
          body={body}
          textureURL={limitedBoardTextures[i]}
        />
      ))}
    </div>
  );
}

function Board3D({
  body,
  textureURL,
}: {
  body: Matter.Body;
  textureURL: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  
  // Create a random initial tilt for the 3D board so they don't all look perfectly identical
  const [randomY] = useState(() => (Math.random() - 0.5) * (Math.PI / 3));

  useEffect(() => {
    let frameId: number;
    const update = () => {
      if (divRef.current) {
        const { x, y } = body.position;
        const angle = body.angle;
        divRef.current.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}rad)`;
      }
      frameId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frameId);
  }, [body]);

  return (
    <div
      ref={divRef}
      className="absolute top-0 left-0 w-[120px] h-[350px] pointer-events-none"
    >
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} className="pointer-events-none">
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        {/* Tilt the board to reveal the bottom (trucks, wheels) with a 2.5D perspective */}
        <group scale={3.5} rotation={[Math.PI / 2 - 0.3, Math.PI / 6 + randomY, 0]}>
          <Skateboard
            deckTextureURL={textureURL}
            deckTextureURLs={[textureURL]}
            wheelTextureURL="/skateboard/SkateWheel1.png"
            wheelTextureURLs={["/skateboard/SkateWheel1.png"]}
            truckColor="#aaaaaa"
            boltColor="#000000"
            constantWheelSpin
          />
        </group>
      </Canvas>
    </div>
  );
}
