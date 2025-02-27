import React, { useState } from "react";
import { Box, TextField, Typography, LinearProgress } from "@mui/material";
import { ref, get } from "firebase/database";
import { LoadingButton } from "@mui/lab";
import * as XLSX from "xlsx";
import { db } from "refrence/realConfig";
import { RiFileExcel2Fill } from "react-icons/ri";

const Export = () => {
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);

  const downloadExcel = async () => {
    setLoading(true);
    console.log();
    if (!path.length) {
      alert("Path хэсгийг тодорхойлно уу.");
      setLoading(false);
      return;
    }
    try {
      const dbRef = ref(db, path);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const data = snapshot.val();

        // Convert data to an array for XLSX
        const dataArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Convert array to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(dataArray);

        // Create a new workbook and add the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Download the Excel file
        XLSX.writeFile(workbook, "data.xlsx");
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error downloading data: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Файл экспорт</Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ width: "100%", marginTop: 2 }}>
          {loading && <LinearProgress />}
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <TextField
          variant="standard"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          label="Path"
        />
        <LoadingButton
          variant="outlined"
          startIcon={<RiFileExcel2Fill />}
          onClick={downloadExcel}
          loading={loading}
        >
          Download Excel
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default Export;
