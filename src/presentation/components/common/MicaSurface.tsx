import { type ReactNode } from "react";
import Box from "@mui/material/Box";

interface MicaSurfaceProps {
  children: ReactNode;
  className?: string;
  sx?: object;
  component?: React.ElementType;
}

export function MicaSurface({
  children,
  className,
  sx,
  component = "div",
}: MicaSurfaceProps) {
  const classes = className ? `mica-surface ${className}` : "mica-surface";
  return (
    <Box component={component} className={classes} sx={sx}>
      {children}
    </Box>
  );
}

export default MicaSurface;
