import * as React from "react";
import ReactMarkdown from "markdown-to-jsx";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

const options = {
  overrides: {
    h1: {
      component: Typography,
      props: {
        gutterBottom: true,
        variant: "h6",
        color:"common.black"
      },
    },
    h2: {
      component: Typography,
      props: { gutterBottom: true, variant: "body1" },
    },
    h3: {
      component: Typography,
      props: { gutterBottom: true, variant: "body2" },
    },
    h4: {
      component: Typography,
      props: {
        gutterBottom: true,
        variant: "subtitle1",
        paragraph: true,
      },
    },
    p: {
      component: Typography,
      props: { paragraph: true, color: "common.black", variant: "caption" },
    },
    a: { component: Link},
    li: {
      component: (props) => (
        <Box component="li" sx={{ mt: 1 }}>
          <Typography
            variant="caption"
            component="span"
            {...props}
            color="common.black"
          />
        </Box>
      ),
    }
  },
};

export default function Markdown(props) {
  return <ReactMarkdown options={options} {...props} />;
}
