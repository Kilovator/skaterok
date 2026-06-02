import { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 360 80"
      {...props}
    >
      <title>SKET-OK Skate Logo</title>
      <text
        fill="currentColor"
        x="2"
        y="66"
        style={{
          fontFamily:
            "var(--font-bowlby-sc), 'Impact', 'Arial Black', sans-serif",
          fontSize: "68px",
          letterSpacing: "3px",
        }}
      >
        SKET-OK
      </text>
    </svg>
  );
}
