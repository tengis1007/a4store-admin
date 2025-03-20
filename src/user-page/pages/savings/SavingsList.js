import React, { useEffect, useState } from "react";
import axios from "../../../axios";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  CardActions,
  Typography,
  Grid2,
  Button,
  Chip,
} from "@mui/material";
import dayjs from "dayjs"; // For date formatting

const statusMap = {
  active: "Идэвхтэй",
  pending: "Хүлээгдэж байна",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
  failed: "Амжилтгүй",
};

const DepositCardList = ({ user }) => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userInfoString = localStorage.getItem("user"); // Get the string from localStorage
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null; // Parse JSON

  useEffect(() => {
    getDeposits();
  }, []);

  const getDeposits = async () => {
    try {
      const result = await axios.post(
        "/getDepositPoint",
        { pointId: userInfo?.pointId },
        { headers: { Authorization: `Bearer ${user?.accessToken}` } }
      );
      console.log("result2", result.data.deposits);
      result.data.deposits.sort((a, b) => b.startDate - a.startDate);
      setDeposits(result.data.deposits || []);
    } catch (error) {
      console.error("Error fetching deposits:", error);
      setError("Failed to fetch deposit data.");
    } finally {
      setLoading(false);
    }
  };

  const cancelDeposit = async (depositId) => {
    console.log("depositId", depositId);
    try {
      setLoading(true);
      const result = await axios.post(
        "/cancelDepositPoint",
        { depositId, pointId: userInfo?.pointId },
        { headers: { Authorization: `Bearer ${user?.accessToken}` } }
      );
      console.log("result", result.data);
      alert("Таны хадгаламж амжилттай цуцлагдлаа.");
      getDeposits();
    } catch (error) {
      console.error("Error cancelling deposit:", error);
      alert("Failed to cancel deposit.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
      >
        <CircularProgress />
      </Box>
    );
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Хадгалалтын түүх
      </Typography>
      <Grid2 container spacing={2}>
        {deposits.length > 0 ? (
          deposits.map((deposit) => (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={deposit.id}>
              <Card sx={{ minWidth: 250, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {deposit.amount} pts
                  </Typography>
                  <Typography variant="body2">
                    Хадгалах хугацаа: {deposit.duration.replace("m", "")} сар
                  </Typography>
                  <Typography variant="body2">
                    Бонус хэмжээ: {deposit.interestRate}%
                  </Typography>
                  <Typography variant="body2">
                    Эхлэх огноо: {dayjs(deposit.startDate).format("YYYY-MM-DD")}
                  </Typography>
                  <Typography variant="body2">
                    Дуусах огноо: {dayjs(deposit.endDate).format("YYYY-MM-DD")}
                  </Typography>
                  <Chip
                    label={statusMap[deposit.status] || "Тодорхойгүй"}
                    color={
                      deposit.status === "active"
                        ? "success"
                        : deposit.status === "pending"
                          ? "warning"
                          : "error"
                    }
                    sx={{ mt: 1 }}
                  />
                </CardContent>
                <CardActions>
                  {deposit.status === "active" && (
                    <Button
                      size="small"
                      onClick={() => cancelDeposit(deposit.id)}
                      autoFocus
                      disabled={loading} // Disable when loading
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={24} sx={{ marginRight: 1 }} />
                        </>
                      ) : (
                        "Цуцлах"
                      )}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid2>
          ))
        ) : (
          <Typography>Жагсаалт олдсонгүй.</Typography>
        )}
      </Grid2>
    </Box>
  );
};

export default DepositCardList;
