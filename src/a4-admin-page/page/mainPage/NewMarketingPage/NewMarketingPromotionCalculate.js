import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  ThemeProvider,
  useTheme,
  createTheme,
  lighten,
  TextField,
  MenuItem,
} from "@mui/material";
import { db } from "refrence/realConfig";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { RiFileExcel2Fill } from "react-icons/ri";
import * as XLSX from "xlsx";
import { Single, Double, Triple, bankInfo } from "./setData";
import dayjs from "dayjs";

const NewMarketingPromotionCalculate = () => {
  const [data, setData] = useState([]);
  const [currentType, setCurrentType] = useState("");
  const globalTheme = useTheme();
  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: globalTheme.palette.mode,
          primary: globalTheme.palette.secondary,
          info: { main: "rgb(255,122,0)" },
          background: {
            default:
              globalTheme.palette.mode === "light"
                ? "rgb(254,255,244)"
                : "#000",
          },
        },
        typography: {
          button: {
            textTransform: "none",
            fontSize: "1.2rem",
          },
        },
        components: {
          MuiTooltip: {
            styleOverrides: {
              tooltip: { fontSize: "1.1rem" },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              thumb: { color: "pink" },
            },
          },
        },
      }),
    [globalTheme]
  );

  const getData = async (value, selection) => {
    try {
      const dataRef = ref(db, "newMarketing/UserInfo");
      const Ref = await get(dataRef);
      const fetchedData = Ref.val();

      const dataRef2 = query(
        ref(db, "newMarketing/promotionTransaction"),
        orderByChild("Set"),
        equalTo(value)
      );
      const Ref2 = await get(dataRef2); // Fix: Use dataRef2 instead of dataRef
      const fetchedData2 = Ref2.val();

      if (fetchedData && fetchedData2) {
        const promotion = generateSummary(
          Object.entries(fetchedData2).map(([id, data]) => ({
            id,
            ...data,
          }))
        );
        const userinfo = getSponsorLevel(
          Object.entries(fetchedData).map(([id, data]) => ({
            id,
            ID: data.phoneNumber,
            ...data,
          }))
        );
        console.log("userinfo", userinfo);
        console.log("promotion", promotion);
        const mergedArray = userinfo.map((item1) => {
          const matchingItem = promotion.find((item2) => item2.ID === item1.ID);
          return matchingItem
            ? { ...matchingItem, ...item1 }
            : {
                ...item1,
                invite1person: 0,
                invite2person: 0,
                invite3person: 0,
                invite4person: 0,
                promoEffort: 0,
                promoSale: 0,
                promoSuccess: 0,
              };
        });
        console.log("mergedArray", mergedArray);
        setData(processedData(mergedArray, selection));
      } else {
        console.log("No data found");
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data: " + error.message);
    }
  };

  const generateSummary = (data) => {
    const typeMapping = {
      "Борлуулалтын урамшуулал": "promoSale",
      "Идэвхийн урамшуулал": "promoEffort",
      "Амжилтын урамшуулал": "promoSuccess",
      "1-р хүн урьсан урамшуулал": "invite1person",
      "2-р хүн урьсан урамшуулал": "invite2person",
      "3-р хүн урьсан урамшуулал": "invite3person",
      "4-р хүн урьсан урамшуулал": "invite4person",
    };
    return Object.values(
      data.reduce((acc, { Debit, ID, Type }) => {
        if (!acc[ID]) {
          acc[ID] = {
            ID,
            promoSale: 0,
            promoEffort: 0,
            promoSuccess: 0,
            invite1person: 0,
            invite2person: 0,
            invite3person: 0,
            invite4person: 0,
          };
        }

        const category = typeMapping[Type]; // Map Type to the correct category
        if (category) {
          acc[ID][category] += Debit; // Accumulate Debit to the correct category
        }

        return acc;
      }, {})
    );
  };

  const getSponsorLevel = (data) => {
    return data.map((item) => {
      const output = {
        ID: item.ID,
        Name: item.Name,
        bankName: item.bankName,
        bankNumber: item.bankNumber,
        Level: item.Level,
        type: item.type,
        Invite1Level: 0,
        Invite2Level: 0,
        Invite3Level: 0,
        Invite4Level: 0,
      };

      let levelCount = 1;

      data.forEach((sponsor) => {
        if (sponsor.SponsorId === item.ID && levelCount <= 4) {
          output[`Invite${levelCount}Level`] = sponsor.Level;
          levelCount++;
        }
      });

      return output;
    });
  };

  const handleSelectedType = (e) => {
    const { value } = e.target;
    setCurrentType(value);
    const selection =
      value === "Single" ? Single : value === "Double" ? Double : Triple;
    getData(value, selection);
  };

  const getBankCode = (bankName) => {
    const bank = bankInfo.find((bank) => bank.bankName === bankName);
    return bank ? bank.bankCode : null; // returns code or null if not found
  };

  const processedData = (SummaryPromotion, Single) => {
    let array = [];
    let sum = {
      promoSale: 0,
      promoEffort: 0,
      promoSuccess: 0,
      invite1person: 0,
      invite2person: 0,
      invite3person: 0,
      invite4person: 0,
    };
    for (let s = 0; s <= SummaryPromotion.length - 1; s++) {
      sum = {
        promoSale: 0,
        promoEffort: 0,
        promoSuccess: 0,
        invite1person: 0,
        invite2person: 0,
        invite3person: 0,
        invite4person: 0,
      };
      for (let i = 0; i <= Single.length - 1; i++) {
        sum.promoSale = sum.promoSale + Single[i].promoSale;
        sum.promoEffort = sum.promoEffort + Single[i].promoEffort;
        sum.promoSuccess = sum.promoSuccess + Single[i].promoSuccess;
        if (SummaryPromotion[s].Invite1Level >= Single[i].level) {
          sum.invite1person = sum.invite1person + Single[i].invite1person;
        }
        if (SummaryPromotion[s].Invite2Level >= Single[i].level) {
          sum.invite2person = sum.invite2person + Single[i].invite2person;
        }
        if (SummaryPromotion[s].Invite3Level >= Single[i].level) {
          sum.invite3person = sum.invite3person + Single[i].invite3person;
        }
        if (SummaryPromotion[s].Invite4Level >= Single[i].level) {
          sum.invite4person = sum.invite4person + Single[i].invite4person;
        }
        //             2                        2
        console.log(
          "check",
          SummaryPromotion[s].ID,
          SummaryPromotion[s].Level,
          Single[i].level,
          sum.promoSale,
          SummaryPromotion[s].promoSale
        );
        if (SummaryPromotion[s].Level <= Single[i].level) {
          // promoSale
          if (sum.promoSale >= SummaryPromotion[s].promoSale) {
            if (sum.promoSale - SummaryPromotion[s].promoSale > 0) {
              array.push({
                id: SummaryPromotion[s].bankName === "Хаан банк" ? 20 : 10,
                userBankName: getBankCode(SummaryPromotion[s].bankName),
                userAccountNumber: SummaryPromotion[s].bankNumber,
                Wallet: "MNT",
                QuantityName: SummaryPromotion[s].Name,
                amount: sum.promoSale - SummaryPromotion[s].promoSale,
                orderwallet: "MNT",
                utga: `${SummaryPromotion[s].type.charAt(0)} bor-t uram-lal ${
                  SummaryPromotion[s].ID
                }`,
                type: "Борлуулалтын урамшуулал",
                set: SummaryPromotion[s].type,
                phoneNumber: SummaryPromotion[s].ID,
              });
            }
          }
          // promoEffort
          if (sum.promoEffort >= SummaryPromotion[s].promoEffort) {
            if (sum.promoEffort - SummaryPromotion[s].promoEffort > 0) {
              array.push({
                id: SummaryPromotion[s].bankName === "Хаан банк" ? 20 : 10,
                userBankName: getBankCode(SummaryPromotion[s].bankName),
                userAccountNumber: SummaryPromotion[s].bankNumber,
                Wallet: "MNT",
                QuantityName: SummaryPromotion[s].Name,
                amount: sum.promoEffort - SummaryPromotion[s].promoEffort,
                orderwallet: "MNT",
                utga: `${SummaryPromotion[s].type.charAt(0)} idevhiin uram-lal ${
                  SummaryPromotion[s].ID
                }`,
                type: "Идэвхийн урамшуулал",
                set: SummaryPromotion[s].type,
                phoneNumber: SummaryPromotion[s].ID,
              });
            }
          }
          // promoSuccess
          if (sum.promoSuccess >= SummaryPromotion[s].promoSuccess) {
            if (sum.promoSuccess - SummaryPromotion[s].promoSuccess > 0) {
              array.push({
                id: SummaryPromotion[s].bankName === "Хаан банк" ? 20 : 10,
                userBankName: getBankCode(SummaryPromotion[s].bankName),
                userAccountNumber: SummaryPromotion[s].bankNumber,
                Wallet: "MNT",
                QuantityName: SummaryPromotion[s].Name,
                amount: sum.promoSuccess - SummaryPromotion[s].promoSuccess,
                orderwallet: "MNT",
                utga: `${SummaryPromotion[s].type.charAt(0)} amj-t uram-lal ${
                  SummaryPromotion[s].ID
                }`,
                type: "Амжилтын урамшуулал",
                set: SummaryPromotion[s].type,
                phoneNumber: SummaryPromotion[s].ID,
              });
            }
          }
          //  invite 1
          if (sum.invite1person >= SummaryPromotion[s].invite1person) {
            if (sum.invite1person - SummaryPromotion[s].invite1person > 0) {
              array.push({
                id: SummaryPromotion[s].bankName === "Хаан банк" ? 20 : 10,
                userBankName: getBankCode(SummaryPromotion[s].bankName),
                userAccountNumber: SummaryPromotion[s].bankNumber,
                Wallet: "MNT",
                QuantityName: SummaryPromotion[s].Name,
                amount: sum.invite1person - SummaryPromotion[s].invite1person,
                orderwallet: "MNT",
                utga: `${SummaryPromotion[s].type.charAt(0)} 1 hun uram-lal ${
                  SummaryPromotion[s].ID
                }`,
                type: "1-р хүн урьсан урамшуулал",
                set: SummaryPromotion[s].type,
                phoneNumber: SummaryPromotion[s].ID,
              });
            }
          }
          // invite 2
          if (sum.invite2person >= SummaryPromotion[s].invite2person) {
            if (sum.invite2person - SummaryPromotion[s].invite2person > 0) {
              array.push({
                id: SummaryPromotion[s].bankName === "Хаан банк" ? 20 : 10,
                userBankName: getBankCode(SummaryPromotion[s].bankName),
                userAccountNumber: SummaryPromotion[s].bankNumber,
                Wallet: "MNT",
                QuantityName: SummaryPromotion[s].Name,
                amount: sum.invite2person - SummaryPromotion[s].invite2person,
                orderwallet: "MNT",
                utga: `${SummaryPromotion[s].type.charAt(0)} 2 hun uram-lal ${
                  SummaryPromotion[s].ID
                }`,
                type: "2-р хүн урьсан урамшуулал",
                set: SummaryPromotion[s].type,
                phoneNumber: SummaryPromotion[s].ID,
              });
            }
          }
          // invite 3
          if (sum.invite3person >= SummaryPromotion[s].invite3person) {
            if (sum.invite3person - SummaryPromotion[s].invite3person > 0) {
              array.push({
                id: SummaryPromotion[s].bankName === "Хаан банк" ? 20 : 10,
                userBankName: getBankCode(SummaryPromotion[s].bankName),
                userAccountNumber: SummaryPromotion[s].bankNumber,
                Wallet: "MNT",
                QuantityName: SummaryPromotion[s].Name,
                amount: sum.invite3person - SummaryPromotion[s].invite3person,
                orderwallet: "MNT",
                utga: `${SummaryPromotion[s].type.charAt(0)} 3 hun uram-lal ${
                  SummaryPromotion[s].ID
                }`,
                type: "3-р хүн урьсан урамшуулал",
                set: SummaryPromotion[s].type,
                phoneNumber: SummaryPromotion[s].ID,
              });
            }
          }
          // invite 4
          if (sum.invite4person >= SummaryPromotion[s].invite4person) {
            if (sum.invite4person - SummaryPromotion[s].invite4person > 0) {
              array.push({
                id: SummaryPromotion[s].bankName === "Хаан банк" ? 20 : 10,
                userBankName: getBankCode(SummaryPromotion[s].bankName),
                userAccountNumber: SummaryPromotion[s].bankNumber,
                Wallet: "MNT",
                QuantityName: SummaryPromotion[s].Name,
                amount: sum.invite4person - SummaryPromotion[s].invite4person,
                orderwallet: "MNT",
                utga: `${SummaryPromotion[s].type.charAt(0)} 4 hun uram-lal ${
                  SummaryPromotion[s].ID
                }`,
                type: "4-р хүн урьсан урамшуулал",
                set: SummaryPromotion[s].type,
                phoneNumber: SummaryPromotion[s].ID,
              });
            }
          }

          break;
        }
      }
    }
    return array;
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "Гүйлгээний төрөл" },
      { accessorKey: "userBankName", header: "Хүлээн авагч банкны код" },
      { accessorKey: "userAccountNumber", header: "Хүлээн авагчийн данс" },
      { accessorKey: "Wallet", header: "Хүлээн авагчийн дансны валют" },
      { accessorKey: "QuantityName", header: "Хүлээн авагчийн нэр" },
      { accessorKey: "amount", header: "Гүйлгээний дүн" },
      { accessorKey: "orderwallet", header: "Гүйлгээний валют" },
      { accessorKey: "utga", header: "Гүйлгээний утга" },
      { accessorKey: "type", header: "Төрөл" },
      { accessorKey: "set", header: "Багц" },
      { accessorKey: "phoneNumber", header: "Утас" },
    ],
    []
  );

  const handleExport = async () => {
    try {
      const columnHeaders = [
        "Гүйлгээний төрөл",
        "Хүлээн авагч банкны код",
        "Хүлээн авагчийн данс",
        "Хүлээн авагчийн дансны валют",
        "Хүлээн авагчийн нэр",
        "Гүйлгээний дүн",
        "Гүйлгээний валют",
        "Гүйлгээний утга",
        "Төрөл",
        "Багц",
        "Утас",
      ];
      const mappedData = data.map((item) => ({
        "Гүйлгээний төрөл": item.id,
        "Хүлээн авагч банкны код": item.userBankName,
        "Хүлээн авагчийн данс": item.userAccountNumber,
        "Хүлээн авагчийн дансны валют": item.Wallet,
        "Хүлээн авагчийн нэр": item.QuantityName,
        "Гүйлгээний дүн": item.amount,
        "Гүйлгээний валют": item.orderwallet,
        "Гүйлгээний утга": item.utga,
        Төрөл: item.type,
        Багц: item.set,
        Утас: item.phoneNumber,
      }));

      const ws = XLSX.utils.json_to_sheet(mappedData, {
        header: columnHeaders,
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      const file = new Blob([excelBuffer], {
        bookType: "xlsx",
        type: "application/octet-stream",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = `Урамшуулал тооцоолол${dayjs().format(
        "YYYY-MM-DD HH:mm:ss"
      )}.xlsx`;
      link.click();
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: data,
    enableEditing: false,
    renderTopToolbar: () => {
      return (
        <Box
          sx={(theme) => ({
            backgroundColor: lighten(theme.palette.background.default, 0.05),
            display: "flex",
            gap: "0.5rem",
            p: "8px",
            justifyContent: "space-between",
          })}
        >
          <form>
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              <TextField
                id="selectType"
                select
                fullWidth
                label="Төрөл сонгох"
                defaultValue=""
                value={currentType}
                onChange={handleSelectedType}
                sx={{ width: "200px" }}
              >
                {["", "Single", "Double", "Triple"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                color="primary"
                disabled={!currentType}
                onClick={handleExport}
                startIcon={<RiFileExcel2Fill />}
              >
                Татаж авах
              </Button>
            </Box>
          </form>
        </Box>
      );
    },
  });

  return (
    <Box>
      <Typography variant="h4">Урамшуулал тооцоолол</Typography>
      <ThemeProvider theme={tableTheme}>
        <MaterialReactTable table={table} />
      </ThemeProvider>
    </Box>
  );
};

export default NewMarketingPromotionCalculate;
