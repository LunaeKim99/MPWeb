import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";

interface SectionHeaderProps {
  title: string;
  seeAllTo?: string;
  seeAllLabel?: string;
}

export function SectionHeader({
  title,
  seeAllTo,
  seeAllLabel = "See all",
}: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        mb: 1.5,
      }}
    >
      <Typography variant="h6">{title}</Typography>
      {seeAllTo && (
        <Button
          component={Link}
          to={seeAllTo}
          size="small"
          sx={{ color: "text.secondary", textTransform: "none" }}
        >
          {seeAllLabel}
        </Button>
      )}
    </Box>
  );
}

export default SectionHeader;
