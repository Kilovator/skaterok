"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import IrisTweaks from "@/components/IrisTweaks";
import { initHUD, refreshHUD } from "@/lib/iris-hud";
import { initIris } from "@/lib/iris-scene";
import {
  DEFAULT_IRIS_CONFIG,
  type IrisPalette,
  setIrisConfig,
  VARIANT_ACCENTS,
} from "@/lib/iris-config";

const VARIANTS: { id: IrisPalette; label: string; sub: string }[] = [
  { id: "spectral", label: "A", sub: "Spectral" },
  { id: "violet", label: "B", sub: "Violet Bloom" },
  { id: "cyan", label: "C", sub: "Cyan Glass" },
];

export default function IrisDossier() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [palette, setPalette] = useState<IrisPalette>("spectral");

  const setVariant = useCallback((name: IrisPalette) => {
    setPalette(name);
    setIrisConfig({ palette: name });
    const ac = VARIANT_ACCENTS[name];
    document.documentElement.style.setProperty("--accent", ac.a);
    document.documentElement.style.setProperty("--accent2", ac.b);
    window.dispatchEvent(
      new CustomEvent("sceneconfig", { detail: { palette: name } })
    );
    refreshHUD();
  }, []);

  useEffect(() => {
    setIrisConfig({ ...DEFAULT_IRIS_CONFIG });
    const ac = VARIANT_ACCENTS.spectral;
    document.documentElement.style.setProperty("--accent", ac.a);
    document.documentElement.style.setProperty("--accent2", ac.b);

    initHUD();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dispose = initIris(canvas);
    return dispose;
  }, []);

  return (
    <>
      <div id="grid" />
      <div id="stage">
        <canvas id="scene" ref={canvasRef} />
      </div>
      <div id="vignette" />

      <div className="corner tl" />
      <div className="corner tr" />
      <div className="corner bl" />
      <div className="corner br" />
      <div className="ruler-t top sch-extra">
        <svg id="svg-rt" preserveAspectRatio="none" />
      </div>
      <div className="ruler-t bot sch-extra">
        <svg id="svg-rb" preserveAspectRatio="none" />
      </div>
      <div className="ruler-l sch-extra">
        <svg id="svg-rl" preserveAspectRatio="none" />
      </div>

      <div id="hud">
        <div className="panel" id="title">
          <div className="head big">IRIS</div>
          <div className="sub">Specimen Dossier · Lumina-class</div>
          <div className="rule" />
          <div className="micro">
            SPEC-ID <span className="accent">IR-0xA7·F3</span> &nbsp; REV{" "}
            <span data-ticker="12.4" data-dec="1">
              12.4
            </span>
            <br />
            GENUS <span className="val">Iris germanica</span> [synth]
            <br />
            STATUS <span className="accent">ACTIVE · BLOOM PHASE III</span>
          </div>
        </div>

        <div className="panel" id="tr-block">
          <span className="tag">Spectral Analysis</span>
          <div className="rule" style={{ marginLeft: "auto", width: "60%" }} />
          <p className="para">
            Photonic lattice within tepal membrane refracts incident flux across a
            420–680 nm band. Sub-epidermal microchannels modulate luminance at{" "}
            <span data-ticker="7.2" data-dec="1">
              7.2
            </span>{" "}
            Hz under ambient excitation. Structural integrity nominal across all
            six perianth segments.
          </p>
        </div>

        <div className="panel sch-extra" id="topcenter">
          <span className="tag">Live Scan</span>
          <div className="barcode" id="barcode" />
          <span className="micro">PERIANTH · 60FPS</span>
        </div>

        <div className="panel sch-extra" id="burst">
          <span className="lbl">Photonic Lattice · Node Map</span>
          <svg id="svg-burst" viewBox="0 0 152 120" />
        </div>

        <div className="panel" id="ml-block">
          <span className="lbl">Growth Vector</span>
          <div className="rule" />
          <p className="para">
            Phototropic stem curvature logged at{" "}
            <span data-ticker="4.1" data-dec="1">
              0
            </span>
            °/cycle. Turgor pressure within tolerance.
          </p>
        </div>

        <div className="panel chartcard" id="chart-right">
          <span className="lbl">Luminance Spectrum · 7d</span>
          <svg className="chart" viewBox="0 0 230 90" id="svg-spectrum" />
        </div>
        <div className="panel chartcard" id="chart-left">
          <span className="lbl">Bloom Maturation</span>
          <svg className="chart" viewBox="0 0 200 80" id="svg-growth" />
        </div>
        <div className="panel chartcard sch-extra" id="chart-bars">
          <span className="lbl">Emission Channels · nm</span>
          <svg className="chart" viewBox="0 0 230 78" id="svg-bars" />
        </div>
        <div className="panel chartcard sch-extra" id="chart-scatter">
          <span className="lbl">Refraction Map · θ·φ</span>
          <svg className="chart" viewBox="0 0 230 88" id="svg-scatter" />
        </div>

        <div className="panel sch-extra" id="tr2">
          <span className="tag">Phenotype Notes</span>
          <p className="para">
            Tepal margin exhibits stochastic frill bifurcation; vein density rises
            2.3× toward the signal patch. Beard filaments self-organise into a
            hexagonal emission array.
          </p>
        </div>

        <div className="panel sch-extra" id="optics">
          <div className="drow">
            <span className="k">Phase shift</span>
            <span className="v">λ/4</span>
          </div>
          <div className="drow">
            <span className="k">Coherence</span>
            <span className="v accent" data-ticker="0.92" data-dec="2">
              0
            </span>
          </div>
          <div className="drow">
            <span className="k">Polarisation</span>
            <span className="v">circ ⟲</span>
          </div>
          <div className="drow">
            <span className="k">Q-factor</span>
            <span className="v">
              <span data-ticker="1.4" data-dec="1">
                0
              </span>
              k
            </span>
          </div>
        </div>

        <div className="panel sch-extra" id="datastream-wrap">
          <span className="lbl">Data Stream · 0xF31C</span>
          <div id="datastream" />
        </div>

        <div className="panel" id="bl-block">
          <span className="tag">Morphometrics</span>
          <div style={{ marginTop: 6 }} />
          <div className="drow">
            <span className="k">Tepal length</span>
            <span className="v">
              <span data-counter="112.4" data-suffix=" mm">
                0
              </span>
            </span>
          </div>
          <div className="drow">
            <span className="k">Falls / Standards</span>
            <span className="v">3 / 3</span>
          </div>
          <div className="drow">
            <span className="k">Beard density</span>
            <span className="v">
              <span data-counter="2.6" data-suffix=" fil/mm²">
                0
              </span>
            </span>
          </div>
          <div className="drow">
            <span className="k">Refractive idx</span>
            <span className="v accent">
              <span data-counter="1.41">0</span>
            </span>
          </div>
          <div className="drow">
            <span className="k">Emission peak</span>
            <span className="v">
              <span data-counter="486" data-suffix=" nm">
                0
              </span>
            </span>
          </div>
        </div>

        <div className="panel" id="br-block">
          <span className="tag">Telemetry Lock</span>
          <p className="micro" style={{ marginTop: 6 }}>
            LAT 47.36°N · LON 8.55°E
            <br />
            CHAMBER 04 · CYCLE 0xF31C
            <br />
            CAPTURE φ 38° · θ <span className="accent">auto-orbit</span>
            <br />
            SIGNAL <span className="accent2">▮▮▮▮▮▮▯▯</span> 74%
          </p>
        </div>

        <div
          className="callout"
          data-x="50"
          data-y="22"
          data-len="120"
          data-ang="-28"
          data-txt="STANDARD"
          data-sub="upright tepal"
        />
        <div
          className="callout"
          data-x="58"
          data-y="44"
          data-len="150"
          data-ang="12"
          data-txt="FALL"
          data-sub="signal streak"
        />
        <div
          className="callout"
          data-x="46"
          data-y="40"
          data-len="130"
          data-ang="200"
          data-txt="BEARD"
          data-sub="bio-emitter"
        />
        <div
          className="callout"
          data-x="52"
          data-y="70"
          data-len="140"
          data-ang="160"
          data-txt="PEDUNCLE"
          data-sub="phototropic"
        />

        <div className="marker sch-extra" style={{ left: "24%", top: "58%" }}>
          <svg viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="9" className="mk" />
            <line x1="22" y1="0" x2="22" y2="13" className="tickm" />
            <line x1="22" y1="31" x2="22" y2="44" className="tickm" />
            <line x1="0" y1="22" x2="13" y2="22" className="tickm" />
            <line x1="31" y1="22" x2="44" y2="22" className="tickm" />
          </svg>
          <div className="mtxt">
            NODE F-07
            <br />
            <span style={{ opacity: 0.6 }}>x.412 y.330</span>
          </div>
        </div>
        <div className="marker sch-extra" style={{ left: "71%", top: "21%" }}>
          <svg viewBox="0 0 44 44">
            <rect x="13" y="13" width="18" height="18" className="mk" />
            <line x1="22" y1="0" x2="22" y2="11" className="tickm" />
            <line x1="0" y1="22" x2="11" y2="22" className="tickm" />
          </svg>
          <div className="mtxt">
            NODE A-12
            <br />
            <span style={{ opacity: 0.6 }}>peak 486nm</span>
          </div>
        </div>
      </div>

      <div id="info-panel">
        <button
          type="button"
          className="close-btn"
          onClick={() => window.dispatchEvent(new CustomEvent("irisreset"))}
        >
          ✕
        </button>
        <div className="info-title" />
        <div className="info-sub" />
        <div className="rule" />
        <div className="info-rows" />
        <div className="info-desc" />
      </div>

      <div id="switcher">
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={palette === v.id ? "active" : undefined}
            onClick={() => setVariant(v.id)}
          >
            {v.label}
            <span className="sm">{v.sub}</span>
          </button>
        ))}
      </div>

      <div id="scanhint">
        <span className="accent">●</span> CLICK FLOWER PART TO INSPECT · DRAG TO
        ORBIT
      </div>

      <div id="tweaks-root">
        <IrisTweaks />
      </div>
    </>
  );
}
