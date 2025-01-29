import React, {useEffect} from "react";
import Box from "@mui/material/Box";
import { useColorScheme } from "@mui/material/styles";

export default function ColorModeIconDropdown() {
  const { mode, setMode } = useColorScheme();

  if (!mode) {
    return (
      <Box
        data-screenshot="toggle-mode"
        sx={(theme) => ({
          verticalAlign: "bottom",
          display: "inline-flex",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: (theme.vars || theme).shape.borderRadius,
          border: "1px solid",
          borderColor: (theme.vars || theme).palette.divider,
        })}
      />
    );
  }


  return (
    <React.Fragment>
    </React.Fragment>
  );
}
