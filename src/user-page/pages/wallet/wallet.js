import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  useTheme,
  Button,
  Stack,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaCoins } from "react-icons/fa";
import { MdHistory } from "react-icons/md";
import Rank from "../rank/rank";
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.3s ease-in-out",
  maxWidth: 400,
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

const AmountWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  marginTop: 16,
});
const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  color: "#fff",
  background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
  padding: "8px 24px",
  fontSize: "0.875rem",
  textTransform: "none",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
}));

const HistoryButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  color: "#fff",
  background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
  padding: "8px 24px",
  fontSize: "0.875rem",
  textTransform: "none",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  marginTop: 16,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
}));

const RewardsCard = () => {
  const theme = useTheme();

  return (
    <>
      <Rank />

      <Box sx={{ margin: "10px", marginBottom: "70px" }}>
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
              Овог нэр
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
              Narangerel Tengis
            </Typography>

            <PointsWrapper>
              <FaCoins size={24} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                1,000
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                pts
              </Typography>
            </PointsWrapper>

            <Typography
              variant="caption"
              sx={{ display: "block", mt: 1, opacity: 0.8 }}
            >
              1 point = $1
            </Typography>

            <AmountWrapper>
              <Typography variant="body1" sx={{ opacity: 0.8 }}>
                Багт орох эрх:
              </Typography>
              <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                1
              </Typography>
            </AmountWrapper>
          </ContentWrapper>
        </StyledCard>
        <Box sx={{ maxWidth: 400, margin: "auto", mt: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <ActionButton fullWidth variant="contained">
              Deposit
            </ActionButton>
            <ActionButton fullWidth variant="contained">
              Withdraw
            </ActionButton>
          </Stack>
          <HistoryButton
            fullWidth
            variant="contained"
            startIcon={<MdHistory />}
          >
            Transaction History
          </HistoryButton>
        </Box>
      </Box>
    </>
  );
};

export default RewardsCard;
