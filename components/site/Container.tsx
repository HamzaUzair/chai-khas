import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

const sizeMap = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

const Container: React.FC<ContainerProps> = ({
  size = "xl",
  className = "",
  children,
  ...rest
}) => {
  return (
    <div
      className={`${sizeMap[size]} mx-auto px-5 sm:px-6 lg:px-8 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Container;
