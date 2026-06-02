"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { type DeckItem, type WheelItem, type MetalItem } from "@/data/boardCustomizer";

type CustomizerControlsContext = {
  selectedWheel?: WheelItem;
  setWheel: (wheel: WheelItem) => void;
  selectedDeck?: DeckItem;
  setDeck: (deck: DeckItem) => void;
  selectedTruck?: MetalItem;
  setTruck: (truck: MetalItem) => void;
  selectedBolt?: MetalItem;
  setBolt: (bolt: MetalItem) => void;
};

const defaultContext: CustomizerControlsContext = {
  setWheel: () => {},
  setDeck: () => {},
  setTruck: () => {},
  setBolt: () => {},
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

  const value = useMemo(
    () => ({ selectedWheel, setWheel, selectedDeck, setDeck, selectedTruck, setTruck, selectedBolt, setBolt }),
    [selectedWheel, selectedDeck, selectedTruck, selectedBolt]
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
