import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import React from "react";

const Card = ({
  bgColor,
  Icon,
  value,
  text,
  percentage,
  containerStyle,
}: {
  bgColor: string;
  Icon: React.ComponentType<any>;
  value: string | number;
  text: string;
  percentage?: number;
  containerStyle?: React.CSSProperties;
}) => {
  return (
    <div
      style={{
        backgroundColor: bgColor,
        borderRadius: "14px",
        width: "16.5rem",
        height: "147px",
        padding: "21px",
        position: "relative",
        ...containerStyle,
      }}
    >
      <div className="flex flex-col gap-[5px]">
        <div
          style={{
            padding: "7px",
            marginBottom: "8px",
            backgroundColor: "#ffffff33",
            width: "fit-content",
            borderRadius: "7px",
          }}
        >
          <Icon />
        </div>
        <div
          style={{
            fontSize: "26px",
            fontWeight: "700",
            lineHeight: "32px",
            color: "white",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "500",
            lineHeight: "18px",
            color: "white",
          }}
        >
          {text}
        </div>
      </div>
      <div
        style={{
          height: "84px",
          width: "84px",
          position: "absolute",
          right: "-16px",
          bottom: "-16px",
          backgroundColor: "#ffffff33",
          borderRadius: "999px",
        }}
      ></div>
      {percentage && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "16px",
            backgroundColor: "#ffffff33",
            padding: "4px 7px",
            borderRadius: "999px",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            color: "white",
          }}
        >
          {percentage > 0 ? (
            <ArrowUpRight width={14} height={14} />
          ) : (
            <ArrowDownRight width={14} height={14} />
          )}

          <div
            style={{
              fontWeight: "600",
              fontSize: "10.5px",
              lineHeight: "14px",
            }}
          >
            {percentage < 0 ? "" : "+"}
            {percentage}%
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
