import React, { useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Stack,
} from "@mui/material";
import { CreditCard, AttachMoney, HourglassEmpty, Cancel } from "@mui/icons-material";
import dayjs from "dayjs";

const paymentData = [
  { id: 1, date: "2025-03-10", amount: 100, method: "Credit Card", status: "Paid", type: "Income" },
  { id: 2, date: "2024-03-15", amount: 50, method: "PayPal", status: "Pending", type: "Expenditure" },
  { id: 3, date: "2024-03-18", amount: 200, method: "Bank Transfer", status: "Failed", type: "Income" },
  { id: 4, date: "2024-03-20", amount: 75, method: "Credit Card", status: "Paid", type: "Expenditure" },
];

const getStatusIcon = (status) => {
  switch (status) {
    case "Paid":
      return <AttachMoney color="success" />;
    case "Pending":
      return <HourglassEmpty color="warning" />;
    case "Failed":
      return <Cancel color="error" />;
    default:
      return null;
  }
};

const getDateFilter = (days) => dayjs().subtract(days, "day").format("YYYY-MM-DD");

const PaymentHistory = () => {
  const [dateFilter, setDateFilter] = useState(getDateFilter(7)); // Default: 1 week

  const handleFilterChange = (days) => {
    setDateFilter(getDateFilter(days));
  };

  const filteredData = paymentData.filter((payment) => dayjs(payment.date).isAfter(dateFilter));

  const totalIncome = filteredData
    .filter((payment) => payment.type === "Income")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalExpenditure = filteredData
    .filter((payment) => payment.type === "Expenditure")
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Container maxWidth="md" sx={{ mt: 4, p: 3, bgcolor: "#f9f9f9", borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Payment History
      </Typography>

      {/* Date Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => handleFilterChange(7)}>
          1 Week
        </Button>
        <Button variant="contained" color="secondary" onClick={() => handleFilterChange(30)}>
          1 Month
        </Button>
        <Button variant="contained" color="success" onClick={() => handleFilterChange(90)}>
          3 Months
        </Button>
      </Stack>

      {/* Income & Expenditure Summary */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip label={`Income: $${totalIncome}`} color="success" icon={<AttachMoney />} />
        <Chip label={`Expenditure: $${totalExpenditure}`} color="error" icon={<CreditCard />} />
      </Stack>

      {/* Payment Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#e0e0e0" }}>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount ($)</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((payment) => (
              <TableRow key={payment.id} hover>
                <TableCell>{dayjs(payment.date).format("MMM DD, YYYY")}</TableCell>
                <TableCell>${payment.amount}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>
                  <Chip label={payment.status} icon={getStatusIcon(payment.status)} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={payment.type}
                    color={payment.type === "Income" ? "success" : "error"}
                    icon={payment.type === "Income" ? <AttachMoney /> : <CreditCard />}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default PaymentHistory;
