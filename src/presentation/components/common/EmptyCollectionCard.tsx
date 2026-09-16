import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

interface EmptyCollectionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function EmptyCollectionCard({
  icon,
  title,
  description,
}: EmptyCollectionCardProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 3,
        borderRadius: 3,
        bgcolor: "action.hover",
        border: "1px dashed",
        borderColor: "divider",
        textAlign: "center",
        gap: 1.5,
      }}
    >
      <Box sx={{ fontSize: 48, color: "text.secondary", lineHeight: 1 }}>
        {icon}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        {description}
      </Typography>
    </Box>
  );
}

export default EmptyCollectionCard;
