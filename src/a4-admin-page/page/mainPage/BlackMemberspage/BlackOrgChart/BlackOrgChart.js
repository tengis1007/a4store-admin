import React, { useState, useEffect, useRef, useMemo } from "react";
import OrganizationChart from "@dabeng/react-orgchart";
import MyNode from "./my-node";
import "./my-node.css";
import {
  Typography,
  useTheme,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { ref, onValue } from "firebase/database";
import { db } from "refrence/realConfig";
const CustomNodeChart = () => {
  const orgchart = useRef();
  const globalTheme = useTheme(); //(optional) if you already have a theme defined in your app root, you can import here
  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: globalTheme.palette.mode, //let's use the same dark/light mode as the global theme
          primary: globalTheme.palette.secondary, //swap in the secondary color as the primary for the table
          info: {
            main: "rgb(255,122,0)", //add in a custom color for the toolbar alert background stuff
          },
          background: {
            default:
              globalTheme.palette.mode === "light"
                ? "rgb(254,255,244)" //random light yellow color for the background in light mode
                : "#000", //pure black table in dark mode for fun
          },
        },
        typography: {
          button: {
            textTransform: "none", //customize typography styles for all buttons in table by default
            fontSize: "1.2rem",
          },
        },
        components: {
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontSize: "1.1rem", //override to make tooltip font size larger
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              thumb: {
                color: "pink", //change the color of the switch thumb in the columns show/hide menu to pink
              },
            },
          },
        },
      }),
    [globalTheme]
  );
  const [hierarchy, setHierarchy] = useState({
    inviterId: "",
    inviterName: "",
    MemberId: 77577999,
    QuantityName: "Wannabe",
    RankName: "БТ",
    System:false,
    SponsorId: null,
    SponsorName: null,
    children: [],
    id: "1",
    timeStamp: "09/05/2024 10:18",
  });

  useEffect(() => {
    const userRef = ref(db, "BlackMembers/userInfo");
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      const fetchedResults = [];
      let rawData = data;
      for (let key in rawData) {
        fetchedResults.unshift({
          ...rawData[key],
          id: key,
        });
      }

      let rest = buildNestedStructure(fetchedResults);

      const hierarchicalData2 = rest[0];
      console.log("asdads",hierarchicalData2);
      setHierarchy(hierarchicalData2);
    });
  }, []);

  const buildNestedStructure = (arr) => {
    let map = {};
    let roots = [];
    // Ensure root node starts with null values
    arr[0].SponsorId = null;
    arr[0].SponsorName = null;

    // Build the map
    arr.forEach((item) => {
      map[item.QuantityName + item.MemberId] = {
        ...item,
        children: [],
      };
    });

    // Build the hierarchy
    arr.forEach((item) => {
      if (item.SponsorName === null) {
        roots.push(map[item.QuantityName + item.MemberId]);
      } else {
        console.log("item", item);
        map[item.SponsorName + item.SponsorId].children.push(
          map[item.QuantityName + item.MemberId]
        );
      }
    });
    return roots;
  };

  return (
    <ThemeProvider theme={tableTheme}>
      <div
        className="p-4"
        style={{
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Typography color="inherit" variant="h4">
          Блэк Багийн бүтэц
        </Typography>
        <OrganizationChart
          ref={orgchart}
          datasource={hierarchy}
          chartClass="myChart"
          NodeTemplate={MyNode}
          pan={true}
          style={{
            width: "100%",
            height: "5000px",
            backgroundColor: "#fff",
            border: "2px dashed #aaa",
            borderRadius: "5px",
            overflow: "auto",
            textAlign: "center",
          }}
          //collapsible={true}
        />
      </div>
    </ThemeProvider>
  );
};

export default CustomNodeChart;
