"use client";

import { Heading } from "@/components/Heading";
import { type DeckItem, type WheelItem, type MetalItem } from "@/data/boardCustomizer";
import clsx from "clsx";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import { useCustomizerControls } from "./context";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { FaCamera, FaSliders, FaRotate } from "react-icons/fa6";

type Props = {
  wheels: WheelItem[];
  decks: DeckItem[];
  metals: MetalItem[];
  className?: string;
};

export default function Controls({ wheels, decks, metals, className }: Props) {
  const router = useRouter();
  const { t } = useLanguage();

  const {
    setBolt, setDeck, setTruck, setWheel,
    selectedBolt, selectedDeck, selectedTruck, selectedWheel,
  } = useCustomizerControls();

  const [customDeckUrl, setCustomDeckUrl] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const url = new URL(window.location.href);
      
      if (selectedWheel?.uid) url.searchParams.set("wheel", selectedWheel.uid);
      if (selectedDeck?.uid) url.searchParams.set("deck", selectedDeck.uid);
      if (selectedTruck?.uid) url.searchParams.set("truck", selectedTruck.uid);
      if (selectedBolt?.uid) url.searchParams.set("bolt", selectedBolt.uid);
      
      router.replace(url.href, { scroll: false });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [router, selectedWheel, selectedDeck, selectedTruck, selectedBolt]);

  function handleCustomUserPhotoUpload(imageUrl: string) {
    setCustomDeckUrl(imageUrl);
    const userDeckItem: DeckItem = {
      uid: t("build.yourPattern"),
      textureUrl: imageUrl,
    };
    setDeck(userDeckItem);
  }

  const isUserCustomDeckSelected =
    selectedDeck?.textureUrl?.startsWith("blob:") ||
    selectedDeck?.textureUrl?.startsWith("data:") ||
    selectedDeck?.uid === t("build.yourPattern") ||
    selectedDeck?.uid === "Twój Własny Wzór" ||
    selectedDeck?.uid === "Your custom design";

  return (
    <div className={clsx("flex flex-col gap-6", className)}>
      {/* DECK SELECTION (Includes Custom Photo Upload Button & Photo Alignment Sliders) */}
      <Options title={t("build.deck")} selectedName={selectedDeck?.uid}>
        {/* Custom Uploaded Deck Thumbnail if available */}
        {customDeckUrl && (
          <Option
            key="custom-deck"
            imageSrc={customDeckUrl}
            selected={selectedDeck?.textureUrl === customDeckUrl}
            onClick={() => setDeck({ uid: t("build.yourPattern"), textureUrl: customDeckUrl })}
            isDeck
          >
            {t("build.yourPattern")}
          </Option>
        )}

        {/* User Photo Upload Button */}
        <UploadCustomDeckButton
          selected={selectedDeck?.textureUrl === customDeckUrl && customDeckUrl !== null}
          onUpload={handleCustomUserPhotoUpload}
        />

        {decks.map((deck) => (
          <Option
            key={deck.uid}
            imageSrc={deck.textureUrl}
            selected={deck.uid === selectedDeck?.uid}
            onClick={() => setDeck(deck)}
            isDeck
          >
            {deck.uid.replace(/-/g, " ")}
          </Option>
        ))}

        {/* Photo Adjustment Controls Panel (Shown when custom deck is selected) */}
        {isUserCustomDeckSelected && <PhotoTransformControls />}
      </Options>

      {/* WHEEL SELECTION */}
      <Options title={t("build.wheels")} selectedName={selectedWheel?.uid}>
        {wheels.map((wheel) => (
          <Option
            key={wheel.uid}
            imageSrc={wheel.textureUrl}
            selected={wheel.uid === selectedWheel?.uid}
            onClick={() => setWheel(wheel)}
          >
            {wheel.uid.replace(/-/g, " ")}
          </Option>
        ))}
      </Options>

      {/* TRUCK SELECTION */}
      <Options title={t("build.trucks")} selectedName={selectedTruck?.uid}>
        {metals.map((metal) => (
          <Option
            key={metal.uid}
            color={metal.color}
            selected={metal.uid === selectedTruck?.uid}
            onClick={() => setTruck(metal)}
          >
            {metal.uid.replace(/-/g, " ")}
          </Option>
        ))}
        <PaletteButton 
          selected={selectedTruck?.uid?.startsWith("#") ?? false} 
          onClick={(color) => setTruck({ uid: color, color })}
        />
      </Options>

      {/* BOLT SELECTION */}
      <Options title={t("build.bolts")} selectedName={selectedBolt?.uid}>
        {metals.map((metal) => (
          <Option
            key={metal.uid}
            color={metal.color}
            selected={metal.uid === selectedBolt?.uid}
            onClick={() => setBolt(metal)}
          >
            {metal.uid.replace(/-/g, " ")}
          </Option>
        ))}
        <PaletteButton 
          selected={selectedBolt?.uid?.startsWith("#") ?? false} 
          onClick={(color) => setBolt({ uid: color, color })}
        />
      </Options>
    </div>
  );
}

type OptionsProps = {
  title?: ReactNode;
  selectedName?: string;
  children?: ReactNode;
};

function Options({ title, selectedName, children }: OptionsProps) {
  const formattedName = selectedName?.replace(/-/g, " ");
  return (
    <div>
      <div className="flex">
        <Heading as="h2" size="xs" className="mb-2">
          {title}
        </Heading>
        <p className="ml-3 text-brand-pale">
          <span className="select-none text-brand-silver">| </span>
          {formattedName}
        </p>
      </div>
      <ul className="mb-1 flex flex-wrap gap-2">{children}</ul>
    </div>
  );
}

type OptionProps = Omit<ComponentProps<"button">, "children"> & {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
  isDeck?: boolean;
} & ({ imageSrc: string; color?: never } | { color: string; imageSrc?: never });

function Option({ children, selected, imageSrc, color, onClick, isDeck }: OptionProps) {
  return (
    <li>
      <button
        className={clsx(
          "size-10 cursor-pointer rounded-full bg-brand-black p-0.5 outline-2 outline-brand-amethyst transition-transform hover:scale-110 shadow-md",
          selected && "outline scale-105"
        )}
        onClick={onClick}
      >
        {imageSrc ? (
          <div className="relative h-full w-full overflow-hidden rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              onError={() => {}}
              className={clsx(
                "pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-300",
                isDeck ? "scale-[1.65] translate-x-[36%] translate-y-[10%] object-center" : "scale-[1.25] object-center translate-x-[9%] translate-y-[10%]"
              )}
              alt=""
            />
          </div>
        ) : (
          <div
            className="h-full w-full rounded-full border border-white/10 shadow-inner"
            style={{ backgroundColor: color ?? undefined }}
          />
        )}
        <span className="sr-only">{children}</span>
      </button>
    </li>
  );
}

{/* User Photo Upload Button for Custom Deck Graphics */}
function UploadCustomDeckButton({ onUpload, selected }: { onUpload: (url: string) => void; selected: boolean }) {
  const { t } = useLanguage();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          onUpload(base64Url);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <li>
      <label
        title={t("build.uploadPhoto")}
        className={clsx(
          "relative size-10 cursor-pointer rounded-full bg-brand-black p-0.5 outline-2 outline-amber-400 flex items-center justify-center border border-white/20 hover:border-amber-400 transition-all hover:scale-105 group shadow-lg",
          selected && "outline"
        )}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="h-full w-full rounded-full bg-gradient-to-br from-purple-600 via-brand-amethyst to-amber-500 flex items-center justify-center text-white">
          <FaCamera className="size-4 text-white group-hover:scale-110 transition-transform" />
        </div>
      </label>
    </li>
  );
}

{/* Photo Alignment & Scale Adjustment Panel */}
function PhotoTransformControls() {
  const { t } = useLanguage();
  const { deckTransform, setDeckTransform } = useCustomizerControls();

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeckTransform((prev) => ({ ...prev, scale: parseFloat(e.target.value) }));
  };

  const handleOffsetXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeckTransform((prev) => ({ ...prev, offsetX: parseFloat(e.target.value) }));
  };

  const handleOffsetYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeckTransform((prev) => ({ ...prev, offsetY: parseFloat(e.target.value) }));
  };

  const handleRotationChange = (deg: number) => {
    setDeckTransform((prev) => ({ ...prev, rotation: deg }));
  };

  const handleReset = () => {
    setDeckTransform({ scale: 1.0, offsetX: 0, offsetY: 0, rotation: 0 });
  };

  return (
    <div className="w-full mt-3 p-3.5 rounded-2xl bg-white/5 border border-amber-500/40 backdrop-blur-md flex flex-col gap-3 text-xs text-white shadow-xl animate-fade-in">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="font-bold uppercase text-[11px] tracking-wider text-amber-300 flex items-center gap-1.5">
          <FaSliders className="size-3.5" />
          <span>{t("build.photoTitle")}</span>
        </span>
        <button
          onClick={handleReset}
          className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
        >
          {t("build.photoReset")}
        </button>
      </div>

      {/* Scale / Zoom Slider */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[11px] font-bold text-white/80">
          <span>{t("build.photoScale")}</span>
          <span className="text-amber-300 font-mono">{deckTransform.scale.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0.4"
          max="3.0"
          step="0.05"
          value={deckTransform.scale}
          onChange={handleScaleChange}
          className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
        />
      </div>

      {/* Offset X (Left / Right - Inverted) */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[11px] font-bold text-white/80">
          <span>{t("build.photoPosX")}</span>
          <span className="text-amber-300 font-mono">{deckTransform.offsetX.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="-0.8"
          max="0.8"
          step="0.02"
          value={deckTransform.offsetX}
          onChange={handleOffsetXChange}
          className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
        />
      </div>

      {/* Offset Y (Up / Down) */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[11px] font-bold text-white/80">
          <span>{t("build.photoPosY")}</span>
          <span className="text-amber-300 font-mono">{deckTransform.offsetY.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="-0.8"
          max="0.8"
          step="0.02"
          value={deckTransform.offsetY}
          onChange={handleOffsetYChange}
          className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
        />
      </div>

      {/* Rotation Preset Buttons */}
      <div className="flex items-center justify-between gap-1.5 pt-1">
        <span className="text-[11px] font-bold text-white/80 flex items-center gap-1">
          <FaRotate className="size-3 text-amber-300" />
          <span>{t("build.photoRotation")}:</span>
        </span>
        {[0, 90, 180, 270].map((deg) => (
          <button
            key={deg}
            onClick={() => handleRotationChange(deg)}
            className={clsx(
              "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border",
              deckTransform.rotation === deg
                ? "bg-amber-400 text-black border-amber-300 shadow font-bold"
                : "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
            )}
          >
            {deg}°
          </button>
        ))}
      </div>
    </div>
  );
}

{/* Single Glassmorphic Color Picker Popover (No nested native popups) */}
function PaletteButton({ onClick, selected }: { onClick: (color: string) => void; selected: boolean }) {
  const { t } = useLanguage();

  return (
    <li>
      <label
        title={t("build.colorTitle")}
        className={clsx(
          "relative size-10 cursor-pointer rounded-full p-0.5 outline-2 outline-brand-amethyst hover:scale-105 transition-transform flex items-center justify-center shadow-lg",
          selected && "outline"
        )}
      >
        <div className="h-full w-full rounded-full bg-gradient-to-tr from-red-500 via-yellow-500 via-green-500 to-blue-500 shadow-md" />
        <input
          type="color"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => onClick(e.target.value)}
        />
      </label>
    </li>
  );
}
