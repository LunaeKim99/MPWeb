import { type ReactNode } from "react";
import Box from "@mui/material/Box";

interface MicaSurfaceProps {
  children: ReactNode;
  className?: string;
  sx?: object;
  component?: React.ElementType;
  id?: string;
  "aria-label"?: string;
}

export function MicaSurface({
  children,
  className,
  sx,
  component = "div",
  id,
  "aria-label": ariaLabel,
}: MicaSurfaceProps) {
  const classes = className ? `mica-surface ${className}` : "mica-surface";
  return (
    <Box
      component={component}
      className={classes}
      sx={sx}
      id={id}
      aria-label={ariaLabel}
    >
      {children}
    </Box>
  );
}

export default MicaSurface;
