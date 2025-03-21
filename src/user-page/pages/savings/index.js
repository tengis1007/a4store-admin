import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  styled,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogActions,
  DialogContent,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, firestore } from "refrence/storeConfig";
import Terms from "../../components/Terms";
import SignaturePad from "../../components/SignaturePad";
import savings3month from "../../../savings-3month.md";
import savings6month from "../../../savings-6month.md";
import savings12month from "../../../savings-12month.md";
import { FaCoins } from "react-icons/fa";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import axios from "../../../axios";
import SavingsList from "./SavingsList";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.3s ease-in-out",
  maxWidth: "1170px",
  margin: "auto",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const LogoWrapper = styled(Box)({
  position: "absolute",
  top: 0,
  right: 16,
});

const ContentWrapper = styled(CardContent)({
  padding: "32px 24px",
  color: "#fff",
});

const PointsWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 10,
});

const DepositPoints = () => {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(0); // Жишээ одоогийн пойнт баланс
  const [depositAmount, setDepositAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState("3"); // Сонгосон хугацаа (3, 6, 12 сар)
  const theme = useTheme();
  const [signature, setSignature] = useState(null);
  const [termsmd, setTermsmd] = useState(savings3month);
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const user = auth.currentUser;
  const userInfoString = localStorage.getItem("user"); // Get the string from localStorage
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null; // Parse JSON
  

  const navigation = useNavigate();

  useEffect(() => {
    const balanceRef = doc(firestore, "users", user.uid, "point", "balance");

    // Subscribe to real-time updates with onSnapshot
    const unsubscribe = onSnapshot(balanceRef, (docSnap) => {
      if (docSnap.exists()) {
        setBalance(docSnap.data().balance); // Update state with new balance
      } else {
        console.log("No such document!");
        setBalance(null);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [user.uid]);

  const handleOpenDialog = () => {
    const amount = parseInt(depositAmount, 10);
    if (amount < 100000) {
      alert("Хамгийн багадаа 100000 пойнт хадгалах боломжтой.");
    } else if (amount > balance) {
      alert("Таны пойнт баланс хадгаламж үүсгэх дүнгээс их байна.");
    } else {
      setBalance((prev) => prev - amount);
      setOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleDeposit = async () => {
    if (!selectedTerm) {
      alert("Хадгалах хугацааг сонгоно уу.");
    } else if (!signature) {
      alert("Гэрээнд гарын үсэг зураад хадгалах товчийг дарна уу.");
    } else {
      try {
        setLoading(true);
        const result = await axios.post(
          "/createDepositPoint",
          {
            amount: Number(depositAmount),
            duration: selectedTerm + "m",
            pointId: userInfo.pointId,
          },
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
        console.log("result", result.data);
        alert("Хадгаламж амжилттай үүслээ.");
        setBalance((prev) => prev - depositAmount);
        handleCloseDialog();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectTerm = (term) => {
    setSelectedTerm(term);
    switch (term) {
      case "3":
        setTermsmd(savings3month);
        break;
      case "6":
        setTermsmd(savings6month);
        break;
      case "12":
        setTermsmd(savings12month);
        break;
      default:
        setTermsmd(savings3month);
    }
  };

  const handleBackWallet = () => {
    // Navigate to the wallet route
    navigation("/wallet");
  };

  return (
    <Box>
      <Box sx={{ margin: "10px", marginBottom: "70px" }}>
        <Box sx={{ maxWidth: "1170px", margin: "auto", marginBottom: "10px" }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackWallet}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <StyledCard>
          <LogoWrapper>
            <img
              src={"/assets/pointLogos.png"}
              alt="Credit Card Icon"
              style={{
                width: "130px",
                height: "60px",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </LogoWrapper>
          <ContentWrapper>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
              {userInfo.lastName} {userInfo.firstName}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
              Бонус пойнт үйлчилгээ
            </Typography>
            <PointsWrapper>
              <FaCoins size={24} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {balance}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                pts
              </Typography>
            </PointsWrapper>

            <TextField
              label="Хадгалах хэмжээ"
              variant="outlined"
              fullWidth
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              sx={{
                my: 2,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.6)" },
                  "&:hover fieldset": { borderColor: "#fff" },
                  "&.Mui-focused fieldset": { borderColor: "#fff" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
                "& .MuiOutlinedInput-input": { color: "#fff" }, // Оруулсан текстийн өнгө
                "& .MuiOutlinedInput-root .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.6)", // Placeholder-ийн өнгө
                },
              }}
            />

            <Typography variant="subtitle1">Хадгалах хугацаа:</Typography>
            <RadioGroup
              row
              value={selectedTerm}
              onChange={(e) => handleSelectTerm(e.target.value)}
              sx={{
                color: "inherit", // Радио группын үндсэн өнгийг удамшуулах
                "& .MuiFormControlLabel-label": { color: "inherit" }, // Радио сонголтын текстийн өнгө
                "& .MuiRadio-root": {
                  color: "inherit", // Радио товчны өнгийг удамшуулах
                },
                "& .Mui-checked": {
                  color: "inherit", // Сонгогдсон радио товчны өнгө
                },
              }}
            >
              <FormControlLabel value="3" control={<Radio />} label="3 сар (3%)" />
              <FormControlLabel value="6" control={<Radio />} label="6 сар (12%)" />
              <FormControlLabel value="12" control={<Radio />} label="12 сар (36%)" />
            </RadioGroup>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleOpenDialog}
            >
              Хадгалуулах
            </Button>
          </ContentWrapper>
        </StyledCard>
      </Box>

      {!open && <SavingsList user={user} />}
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogContent>
          <Terms termsmd={termsmd} title="Урамшууллын гэрээ" />
          <SignaturePad signature={signature} setSignature={setSignature} />
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={handleCloseDialog}
            disabled={loading} // Disable when loading
          >
            Татгалзах
          </Button>
          <Button
            onClick={handleDeposit}
            autoFocus
            disabled={loading} // Disable when loading
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ marginRight: 1 }} />
              </>
            ) : (
              "Зөвшөөрөх"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default DepositPoints;
