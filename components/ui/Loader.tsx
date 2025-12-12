"use client";

import React from "react";

type LoaderSize = "small" | "medium" | "large";

type LoaderProps = {
  size?: LoaderSize;
  color?: string; // can be hex or tailwind color via class
  thickness?: number;
  className?: string;
};

const SIZE_MAP: Record<LoaderSize, number> = {
  small: 24,
  medium: 40,
  large: 64,
};

export const Loader = ({
  size = "medium",
  color = "#6b7280", // Tailwind text-gray-500
  thickness = 4,
  className = "",
}: LoaderProps) => {
  const pixelSize = SIZE_MAP[size];

  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 50 50"
        className="animate-spin"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray="100"
          strokeDashoffset="60"
        />
      </svg>
    </span>
  );
};
