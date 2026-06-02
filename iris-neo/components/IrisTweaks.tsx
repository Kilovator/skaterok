"use client";

import { useEffect } from "react";
import {
  TweaksPanel,
  TweakRadio,
  TweakSection,
  TweakSlider,
  useTweaks,
} from "@/components/tweaks-panel";
import { setIrisConfig } from "@/lib/iris-config";

const TWEAK_DEFAULTS = {
  schematic: "full" as "full" | "minimal" | "off",
  glow: 0.35,
  bloom: 0.62,
  rotateSpeed: 0.5,
  bloomCount: 4,
};

type TweakState = typeof TWEAK_DEFAULTS;

function pushConfig(t: TweakState) {
  document.body.classList.toggle("sch-minimal", t.schematic === "minimal");
  document.body.classList.toggle("sch-off", t.schematic === "off");
  setIrisConfig({
    glow: t.glow,
    bloomStrength: t.bloom,
    rotateSpeed: t.rotateSpeed,
    bloomCount: t.bloomCount,
  });
  window.dispatchEvent(
    new CustomEvent("sceneconfig", {
      detail: {
        glow: t.glow,
        bloomStrength: t.bloom,
        rotateSpeed: t.rotateSpeed,
        bloomCount: t.bloomCount,
      },
    })
  );
}

export default function IrisTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    pushConfig(t);
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Schematic" />
      <TweakRadio
        label="HUD density"
        value={t.schematic}
        options={["full", "minimal", "off"]}
        onChange={(v: string) => setTweak("schematic", v)}
      />
      <TweakSection label="Bloom" />
      <TweakRadio
        label="Flowers"
        value={String(t.bloomCount)}
        options={["3", "4"]}
        onChange={(v: string) => setTweak("bloomCount", +v)}
      />
      <TweakSlider
        label="Glow"
        value={t.glow}
        min={0}
        max={2}
        step={0.05}
        onChange={(v: number) => setTweak("glow", v)}
      />
      <TweakSlider
        label="Bloom intensity"
        value={t.bloom}
        min={0}
        max={2.2}
        step={0.05}
        onChange={(v: number) => setTweak("bloom", v)}
      />
      <TweakSlider
        label="Rotation speed"
        value={t.rotateSpeed}
        min={0}
        max={1.6}
        step={0.05}
        onChange={(v: number) => setTweak("rotateSpeed", v)}
      />
    </TweaksPanel>
  );
}
