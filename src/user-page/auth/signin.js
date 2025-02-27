import * as React from "react";
import { AppProvider } from "@toolpad/core/AppProvider";
import { useTheme } from "@mui/material/styles";
import { auth, firestore } from "../../refrence/storeConfig";
import { doc, getDoc} from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  Card,
  Typography,
} from "@mui/material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailIcon from "@mui/icons-material/Email";
import KeyIcon from "@mui/icons-material/Key";
import { useNavigate } from "react-router-dom";
const BRANDING = {
  logo: (
    <img
      src="https://firebasestorage.googleapis.com/v0/b/a4youandme-store.firebasestorage.app/o/789456.png?alt=media&token=f8572a7a-cf71-4de3-908d-66da285897a3"
      alt="a4 logo"
      style={{ height: 120 }}
    />
  ),
};

const isPasswordValid = (password) => {
  return password.length >= 6; // You can extend this check to require digits or special characters
};

export default function BrandingSignInPage() {
  const theme = useTheme();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const navigation = useNavigate();

  const signIn = async ({ email, password }) => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    const mail = `${email}@a4you.com`;
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, mail, password);
      const uid = userCredential.user.uid;
  
      // Fetch user data from Firestore
      const userRef = doc(firestore, "users", uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {  // Fix: Check if the document exists
        setError("Та бүртгэлгүй байна.");
        setLoading(false);
        return;
      }
  
      const userData = userSnap.data(); // Fix: Get the user data correctly
      delete userData.password;
      console.log("userData",userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigation("/wallet");
      // Example: Check user role

  
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = ""; // Define errorMessage
  
      if (errorCode === "auth/user-not-found") {
        errorMessage = "No user found with this email.";
      } else if (errorCode === "auth/wrong-password") {
        errorMessage = "Нууц үг алдаатай байна.";
      } else if (errorCode === "permission-denied") { // Firestore rule error
        errorMessage = "You don't have permission to access this resource.";
      } else {
        errorMessage = "Sign-in failed. Please try again.";
      }
  
      setError(errorMessage);
      console.log(errorMessage);
  
    } finally {
      setLoading(false);
    }
  };
  

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(""); // Clear error when user starts typing
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(""); // Clear error when user starts typing
  };

  const isEmailValid = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };
  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };
  return (
    <AppProvider branding={BRANDING} theme={theme}>
      <div
        style={{
          display: "flex",

          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          padding: "16px",
          boxSizing: "border-box",
          background: "#f4f4f4",
        }}
      >
        <Card
          elevation={10}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "400px",
            padding: "24px",
            boxSizing: "border-box",
            backgroundColor: "#fff",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              marginBottom: "24px",
              textAlign: "center",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {BRANDING.logo}
            <div>{BRANDING.title}</div>
          </div>

          <Typography
            variant="h5"
            component="div"
            style={{
              marginBottom: "16px",
              fontWeight: "bold",
              textAlign: "center",
              color: "#1769aa",
            }}
          >
            Нэвтрэх
          </Typography>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: "16px",
            }}
          >
            <TextField
              label="И-мэйл хаяг"
              variant="outlined"
              value={email}
              onChange={handleEmailChange}
              placeholder="Жишээ: example@gmail.com"
              fullWidth
              required
              autoFocus
              inputProps={{
                style: { fontSize: "14px", padding: "12px" },
              }}
              style={{ backgroundColor: "#fff" }}
              error={!!emailError || (email && !isEmailValid())}
              helperText={
                emailError ||
                (email && !isEmailValid() && "N-мэйл алдаатай байна")
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Нууц үг"
              variant="outlined"
              type={passwordVisible ? "text" : "password"} // Toggle between text and password
              value={password}
              onChange={handlePasswordChange}
              fullWidth
               placeholder="Нууц үг"
              required
              inputProps={{
                style: { fontSize: "14px", padding: "12px" },
              }}
              style={{ backgroundColor: "#fff" }}
              error={!!passwordError || !isPasswordValid(password)}
              helperText={
                passwordError || (password && !isPasswordValid(password))
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {passwordVisible ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={() => signIn({ email, password })}
              fullWidth
              disabled={
                loading ||  !isPasswordValid(password)
              }
              style={{
                marginTop: "16px",
                fontSize: "16px",
                fontWeight: "bold",
                padding: "12px",
                transition: "background-color 0.3s ease",
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Нэвтрэх"
              )}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigation("/signup")}
              fullWidth
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                textAlign: "center",
                padding: "12px",
                transition: "background-color 0.3s ease",
              }}
            >
              Бүртгүүлэх
            </Button>
          </div>
        </Card>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={() => setError("")} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </div>
    </AppProvider>
  );
}

