"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { type DeckItem, type WheelItem, type MetalItem } from "@/data/boardCustomizer";

export type DeckTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
};

type CustomizerControlsContext = {
  selectedWheel?: WheelItem;
  setWheel: (wheel: WheelItem) => void;
  selectedDeck?: DeckItem;
  setDeck: (deck: DeckItem) => void;
  selectedTruck?: MetalItem;
  setTruck: (truck: MetalItem) => void;
  selectedBolt?: MetalItem;
  setBolt: (bolt: MetalItem) => void;
  deckTransform: DeckTransform;
  setDeckTransform: React.Dispatch<React.SetStateAction<DeckTransform>>;
};

const defaultDeckTransform: DeckTransform = {
  scale: 1.0,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
};

const defaultContext: CustomizerControlsContext = {
  setWheel: () => {},
  setDeck: () => {},
  setTruck: () => {},
  setBolt: () => {},
  deckTransform: defaultDeckTransform,
  setDeckTransform: () => {},
};

const CustomizerControlsContext = createContext(defaultContext);

type CustomizerControlsProviderProps = {
  defaultWheel?: WheelItem;
  defaultDeck?: DeckItem;
  defaultTruck?: MetalItem;
  defaultBolt?: MetalItem;
  children?: ReactNode;
};

export function CustomizerControlsProvider({
  defaultWheel,
  defaultDeck,
  defaultTruck,
  defaultBolt,
  children,
}: CustomizerControlsProviderProps) {
  const [selectedWheel, setWheel] = useState(defaultWheel);
  const [selectedDeck, setDeck] = useState(defaultDeck);
  const [selectedTruck, setTruck] = useState(defaultTruck);
  const [selectedBolt, setBolt] = useState(defaultBolt);
  const [deckTransform, setDeckTransform] = useState<DeckTransform>(defaultDeckTransform);

  const value = useMemo(
    () => ({
      selectedWheel, setWheel,
      selectedDeck, setDeck,
      selectedTruck, setTruck,
      selectedBolt, setBolt,
      deckTransform, setDeckTransform,
    }),
    [selectedWheel, selectedDeck, selectedTruck, selectedBolt, deckTransform]
  );

  return (
    <CustomizerControlsContext.Provider value={value}>
      {children}
    </CustomizerControlsContext.Provider>
  );
}

export function useCustomizerControls() {
  return useContext(CustomizerControlsContext);
}
