import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { createTheme } from "@mui/material/styles";
import CloudCircleIcon from "@mui/icons-material/CloudCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import { useDemoRouter } from "@toolpad/core/internal";
import Avatar from "@mui/material/Avatar";
import { Menu, MenuItem } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig"; // Assuming you have a firebase.js file for Firebase config
import { useNavigate } from "react-router-dom";
import InventoryIcon from '@mui/icons-material/Inventory';
import AddProduct from "../products/addProduct";
import Category from "../Category/category";
import TotalProducts from "../products/totalProduct"
import OrderHistory from "../Order/OrderHistory"
const NAVIGATION = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "order",
    title: "Захиалга",
    icon: <ShoppingCartIcon />,
    children: [
      {
        segment: "orderhistory",
        title: "Захиалгын түүх",
        icon: <CheckCircleIcon />,
      },
    ],
  },
  {
    segment: "products",
    title: "Бүтээгдэхүүн",
    icon: <InventoryIcon />,
    children: [
      {
        segment: "totalProduct",
        title: "Нийт бүтээгдэхүүн",
        icon: <InventoryIcon />,
      },
      {
        segment: "new",
        title: "Бүтээгдэхүүн нэмэх",
        icon: <ShoppingCartIcon />,
      },
      {
        segment: "category",
        title: "Төрөл",
        icon: <CheckCircleIcon />,
      },
    ],
  },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DemoPageContent({ pathname }) {
  console.log(pathname);
  return (
    <div>
      {pathname === "/products/new" && <AddProduct />}  {/* Check for the full path */}
      {pathname === "/products/category" && <Category />}
      {pathname === "/products/totalProduct" && <TotalProducts />}
      {pathname === "/order/orderhistory" && <OrderHistory />}
      
    </div>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function ToolbarActionsSearch() {
  const [userData, setUserData] = React.useState({
    firstName: "Not Available",
    lastName: "Not Available",
  });
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
  }, []);

  const { firstName, lastName } = userData;

  // Handle opening and closing of the menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };
  
  const navigate = useNavigate();
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        localStorage.clear();
        navigate("/"); // Redirect to login page after logout
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id="menu-id"
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
      <MenuItem onClick={handleLogout}>Гарах</MenuItem>
    </Menu>
  );

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {/* User's Name */}
      {/* Avatar or Account Icon to trigger the menu */}
      <IconButton onClick={handleMenuOpen}>
        <AccountCircleIcon sx={{ fontSize: 40 }} />
      </IconButton>

      {renderMenu}

      {/* ThemeSwitcher Component */}
      <ThemeSwitcher />
    </Stack>
  );
}

function SidebarFooter({ mini }) {
  return (
    <Typography
      variant="caption"
      sx={{
        m: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textAlign: "center", // Centers text horizontally
        // Ensure it takes the full width of its container
      }}
    >
      {mini ? "A4" : `A4STORE ${new Date().getFullYear()}`}
    </Typography>
  );
}

SidebarFooter.propTypes = {
  mini: PropTypes.bool.isRequired,
};

function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {/* Image with link */}
      {/* Chip Label */}
      <Chip size="medium" label="A4 STORE" color="info" />
    </Stack>
  );
}

function DashboardLayoutSlots(props) {
  const { window } = props;

  const router = useDemoRouter("/dashboard");

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout
        slots={{
          appTitle: CustomAppTitle,
          toolbarActions: ToolbarActionsSearch,
          sidebarFooter: SidebarFooter,
        }}
      >
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}

DashboardLayoutSlots.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardLayoutSlots;
