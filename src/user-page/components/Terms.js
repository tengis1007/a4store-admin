import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Markdown from "./Markdown";
import { Typography } from "@mui/material";
import { getUserData } from "../../utils/functions";

const Terms = ({ termsmd, title }) => {
  const [terms, setTerms] = useState("");
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  const userInfo = getUserData();

  useEffect(() => {
    fetch(termsmd)
      .then((res) => res.text())
      .then((text) =>
        setTerms(
          text
            .replace(/{{year}}/g, year ?? "")
            .replace(/{{month}}/g, month ?? "")
            .replace(/{{day}}/g, day ?? "")
            .replace(/{{phone}}/g, userInfo.phone ?? "")
            .replace(/{{lastName}}/g, userInfo.lastName ?? "")
            .replace(/{{firstName}}/g, userInfo.firstName ?? "")
            .replace(/{{email}}/g, userInfo.email ?? "")
        )
      );
  }, [
    year,
    month,
    day,
    userInfo.firstName,
    userInfo.lastName,
    userInfo.phone,
    userInfo.email,
    termsmd,
  ]);

  return (
    <React.Fragment>
      <Container
        sx={{
          backgroundColor: "#fff",
          overflow: "scroll",
          marginTop: 1,
        }}
      >
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="h4"
            color="common.black"
            gutterBottom
            marked="center"
            align="center"
          >
            {title}
          </Typography>
          <Markdown>{terms}</Markdown>
        </Box>
      </Container>
    </React.Fragment>
  );
};

export default Terms;
