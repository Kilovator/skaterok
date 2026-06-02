export type IrisPalette = "spectral" | "violet" | "cyan";

export interface IrisConfig {
  palette: IrisPalette;
  bloomCount: number;
  glow: number;
  bloomStrength: number;
  rotateSpeed: number;
}

export const DEFAULT_IRIS_CONFIG: IrisConfig = {
  palette: "spectral",
  bloomCount: 3,
  glow: 0.35,
  bloomStrength: 0.62,
  rotateSpeed: 0.5,
};

let config: IrisConfig = { ...DEFAULT_IRIS_CONFIG };

export function getIrisConfig(): IrisConfig {
  return config;
}

export function setIrisConfig(partial: Partial<IrisConfig>): void {
  config = { ...config, ...partial };
}

export const VARIANT_ACCENTS: Record<
  IrisPalette,
  { a: string; b: string }
> = {
  spectral: { a: "#43c9ff", b: "#9a6bff" },
  violet: { a: "#b08cff", b: "#ff9e7a" },
  cyan: { a: "#39e6cf", b: "#7fd6ff" },
};
