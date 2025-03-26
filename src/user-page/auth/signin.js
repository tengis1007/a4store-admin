import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
  styled,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  MdPhone,
  MdEmail,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, firestore } from "../../refrence/storeConfig";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword,signInWithCustomToken } from "firebase/auth";
import AlertComponent from "components/alert";
import axios from "../../storeaxios";
import { logout } from "./Logout";
const StyledCard = styled(Card)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.9)",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
  padding: theme.spacing(4),
  maxWidth: 450,
  width: "100%",
}));

const Background = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
});

const LoginPage = () => {
  const navigation = useNavigate();  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "", // Can be 'success' or 'error'
  });

//   const token = queryParams.get("token"); // Extract the token 
  // Listen to authentication state changes
  const token = new URLSearchParams(window.location.search).get("token");
  const user = auth.currentUser;

  const handleSignIns = async () => {
    console.log("Token from query params:", token);
    setLoading(true);
    try {
      const response = await axios.post(
        "/createCustomToken",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );            
  
      if (response.data.customToken) {
        const userCredential = await signInWithCustomToken(
          auth,
          response.data.customToken
        );
        console.log("User Credential:", userCredential);
        navigation("/wallet");
      }
    } catch (error) {
      console.error("Error creating custom token:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      handleSignIns();
    }
  }, [token]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Нууц үг оруулна уу";
    } else if (formData.password.length < 6) {
      newErrors.password = "Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой";
    }
    if (useEmail) {
      if (!formData.email) {
        newErrors.email = "Имэйл хаяг оруулна уу";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Зөв имэйл хаяг оруулна уу";
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = "Утасны дугаар оруулна уу";
      } else if (formData.phone.length !== 8) {
        newErrors.phone = "Утасны дугаар 8 оронтой байх ёстой";
      }
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const signIn = async ({ email, password }) => {
    if (!email || !password) {
      setErrors("Email and password are required.");
      return;
    }
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      // Fetch user data from Firestore
      const userRef = doc(firestore, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Fix: Check if the document exists
        setErrors("Та бүртгэлгүй байна.");
        setLoading(false);
        return;
      }

      const userData = userSnap.data(); // Fix: Get the user data correctly
      delete userData.password;
      console.log("userData", userData);
      const docRef = doc(firestore, "users", uid, "point", "balance");
      async function fetchPointBalance() {
        try {
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const pointBalance = docSnap.data().balance; // Assuming the balance field exists
            return pointBalance;
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching document: ", error);
        }
      }

      const pointBalance = await fetchPointBalance();
      localStorage.setItem(
        "user",
        JSON.stringify({ ...userData, id: uid, point: pointBalance })
      );
      navigation("/wallet");
      // Example: Check user role
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = ""; // Define errorMessage

      if (errorCode === "auth/user-not-found") {
        errorMessage = "Бүртгэлгүй хэрэглэгч байна.";
      } else if (errorCode === "auth/wrong-password") {
        errorMessage = "Нууц үг алдаатай байна.";
      } else if (errorCode === "permission-denied") {
        // Firestore rule error
        errorMessage = "Нэвтэрч чадсангүй. Дахин оролдоно уу.";
      } else {
        errorMessage = "Нэвтэрч чадсангүй. Дахин оролдоно уу.";
      }
      setAlertState({
        open: true,
        message: errorMessage, // Use errorMessage variable here
        severity: "warning",
      });
      setErrors(errorMessage);
      console.log(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (useEmail) {
        signIn({ email: formData.email, password: formData.password });
      } else {
        const mail = `${formData.phone}@a4you.com`;
        signIn({ email: mail, password: formData.password });
      }
    }
  };
  const handleCloseAlert = () => {
    setAlertState((prevState) => ({
      ...prevState,
      open: false,
    }));
  };
  return (
    <>
      <Background>
        <Container component="main" maxWidth="xs">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StyledCard>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/a4youandme-store.firebasestorage.app/o/789456.png?alt=media&token=f8572a7a-cf71-4de3-908d-66da285897a3"
                    style={{
                      width: 150,
                      height: 100,
                    }}
                  />
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Typography
                    component="h1"
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 700 }}
                  >
                    Тавтай морил
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Үргэлжлүүлэхийн тулд нэвтэрнэ үү
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useEmail}
                        onChange={() => setUseEmail(!useEmail)}
                      />
                    }
                    label={useEmail ? "Имэйлээр нэвтрэх" : "Утсаар нэвтрэх"}
                  />
                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{ mt: 3, width: "100%" }}
                  >
                    {useEmail ? (
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Имэйл"
                        name="email"
                        placeholder="Имэйл"
                        autoComplete="email"
                        autoFocus
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MdEmail />
                            </InputAdornment>
                          ),
                        }}
                      />
                    ) : (
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="phone"
                        label="Утас"
                        name="phone"
                        placeholder="Утас"
                        autoComplete="tel"
                        autoFocus
                        value={formData.phone}
                        onChange={handleChange}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MdPhone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Нууц үг"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? (
                                <MdVisibilityOff />
                              ) : (
                                <MdVisibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2, height: 48 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Нэвтрэх"
                      )}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </motion.div>
        </Container>
      </Background>
      <AlertComponent
        open={alertState.open}
        message={alertState.message}
        severity={alertState.severity}
        onClose={handleCloseAlert}
      />
    </>
  );
};

export default LoginPage;
