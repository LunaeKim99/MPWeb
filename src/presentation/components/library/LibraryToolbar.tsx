import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import type { LibrarySort } from "@/application/factories/AppFacade.ts";

const SORT_OPTIONS: { value: LibrarySort; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "title", label: "Title" },
  { value: "artist", label: "Artist" },
  { value: "album", label: "Album" },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "songs", label: "Songs" },
  { key: "albums", label: "Albums" },
  { key: "artists", label: "Artists" },
  { key: "favorites", label: "Favorites" },
] as const;

export type LibraryFilter = (typeof FILTERS)[number]["key"];

interface LibraryToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  sort: LibrarySort;
  onSortChange: (value: LibrarySort) => void;
  filter: LibraryFilter;
  onFilterChange: (value: LibraryFilter) => void;
}

export function LibraryToolbar({
  query,
  onQueryChange,
  onSearch,
  sort,
  onSortChange,
  filter,
  onFilterChange,
}: LibraryToolbarProps) {
  return (
    <Box
      sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}
    >
      <TextField
        size="small"
        placeholder="Search songs, artists, albums…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
        aria-label="Search tracks"
        sx={{ flexGrow: 1, minWidth: 220, maxWidth: 360 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start" sx={{ fontSize: 16 }}>
                🔍
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        select
        size="small"
        label="Sort"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as LibrarySort)}
        sx={{ minWidth: 160 }}
      >
        {SORT_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, width: "100%" }}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            clickable
            onClick={() => onFilterChange(f.key)}
            color={filter === f.key ? "primary" : "default"}
            variant={filter === f.key ? "filled" : "outlined"}
          />
        ))}
      </Box>
    </Box>
  );
}

export default LibraryToolbar;
