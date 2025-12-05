import React from "react";

const AboutUsIcon = ({
  width,
  height,
  color,
}: {
  width: string;
  height: string;
  color: string;
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.33341 12.25V11.0833C9.33341 10.4645 9.08758 9.871 8.65 9.43342C8.21241 8.99583 7.61892 8.75 7.00008 8.75H3.50008C2.88124 8.75 2.28775 8.99583 1.85017 9.43342C1.41258 9.871 1.16675 10.4645 1.16675 11.0833V12.25"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33325 1.82466C9.83361 1.95438 10.2767 2.24657 10.5931 2.65536C10.9094 3.06416 11.081 3.56643 11.081 4.08333C11.081 4.60023 10.9094 5.10249 10.5931 5.51129C10.2767 5.92009 9.83361 6.21228 9.33325 6.34199"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.8333 12.25V11.0833C12.8329 10.5663 12.6608 10.0641 12.344 9.65552C12.0273 9.24692 11.5838 8.95508 11.0833 8.82584"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.25008 6.41667C6.53875 6.41667 7.58341 5.372 7.58341 4.08333C7.58341 2.79467 6.53875 1.75 5.25008 1.75C3.96142 1.75 2.91675 2.79467 2.91675 4.08333C2.91675 5.372 3.96142 6.41667 5.25008 6.41667Z"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AboutUsIcon;
