import { type ReactNode } from "react";
import Box from "@mui/material/Box";

interface MicaSurfaceProps {
  children: ReactNode;
  className?: string;
}

export function MicaSurface({ children, className }: MicaSurfaceProps) {
  const classes = className ? `mica-surface ${className}` : "mica-surface";
  return <Box className={classes}>{children}</Box>;
}

export default MicaSurface;
