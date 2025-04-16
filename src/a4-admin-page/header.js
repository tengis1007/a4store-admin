import React, { useState } from "react";
import PropTypes from "prop-types";

// MUI Components
import { Stack, Chip, Typography, Menu, MenuItem } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "refrence/storeConfig"; // Use the pre-configured Firebase auth instance
// MUI Icons
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import CalculateIcon from "@mui/icons-material/Calculate";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import DisplaySettingsIcon from "@mui/icons-material/DisplaySettings";
import FeedbackIcon from "@mui/icons-material/Feedback";
import FeedIcon from "@mui/icons-material/Feed";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import DeleteIcon from "@mui/icons-material/Delete";
import Groups2Icon from "@mui/icons-material/Groups2";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import CurrencyRubleIcon from "@mui/icons-material/CurrencyRuble";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
// MUI Theming
import { createTheme, CssVarsProvider } from "@mui/material/styles";
// Toolpad Core
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useDemoRouter } from "@toolpad/core/internal";

//page import
import {
  RequestTab,
  OrderTab,
  BonusTab,
  CancelMemberTab,
  FeedbackTab,
  DeleteTab,
  ExportImportTab,
  BlackTab,
  NewMarketingTab,
  PointTab,
} from "./page/topTabs";
import News from "./page/mainPage/news";
import Organizations from "./page/mainPage/Organizations";
import Product from "./page/mainPage/Product";

const NAVIGATION = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    segment: "dashboard",
    title: "Хяналтын самбар",
    icon: <DashboardIcon />,
  },
  {
    segment: "member",
    title: "Гишүүн",
    icon: <AccountCircleIcon />,
    children: [
      {
        segment: "request",
        title: "Хүсэлт",
        icon: <MarkChatUnreadIcon />,
      },
      {
        segment: "Order",
        title: "Худалдан авалт",
        icon: <LocalGroceryStoreIcon />,
      },

      {
        segment: "bonus",
        title: "Урамшуулал",
        icon: <CalculateIcon />,
      },
      {
        segment: "return",
        title: "Буцаалт",
        icon: <PersonRemoveIcon />,
      },
    ],
  },
  {
    segment: "home",
    title: "Нүүр хуудас",
    icon: <DisplaySettingsIcon />,
    children: [
      {
        segment: "feedback",
        title: "Санал хүсэлт",
        icon: <FeedbackIcon />,
      },
      {
        segment: "news",
        title: "Мэдээ мэдээлэл",
        icon: <FeedIcon />,
      },

      {
        segment: "organization",
        title: "Хамтрагч байгуулга",
        icon: <CorporateFareIcon />,
      },
      {
        segment: "product",
        title: "Бүтээгдэхүүн",
        icon: <ShoppingBasketIcon />,
      },
    ],
  },
  {
    segment: "out",
    title: "Гаралт",
    icon: <SettingsInputComponentIcon />,
    children: [
      {
        segment: "importExport",
        title: "Файл, экспорт, импорт",
        icon: <ImportExportIcon />,
      },
      {
        segment: "delete",
        title: "Хогийн сав",
        icon: <DeleteIcon />,
      },
    ],
  },

  {
    segment: "black",
    title: "Блак",
    icon: <Groups2Icon />,
  },
  {
    segment: "newmarketing",
    title: "Шинэ маркетинг",
    icon: <FiberNewIcon />,
  },
  {
    segment: "pointSystem",
    title: "Онооны систем",
    icon: <CurrencyRubleIcon />,
  },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        primary: {
          main: "#1976d2",
        },
      },
    },
    dark: {
      palette: {
        mode: "dark",
        primary: {
          main: "#1976d2",
        },
      },
    },
  },
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
  return (
    <div>
      {pathname === "/dashboard" && "Dashboard"}
      {pathname === "/member/request" && <RequestTab />}
      {pathname === "/member/Order" && <OrderTab />}
      {pathname === "/member/bonus" && <BonusTab />}
      {pathname === "/member/return" && <CancelMemberTab />}
      {pathname === "/home/feedback" && <FeedbackTab />}
      {pathname === "/out/importExport" && <ExportImportTab />}
      {pathname === "/out/delete" && <DeleteTab />}
      {pathname === "/black" && <BlackTab />}
      {pathname === "/newmarketing" && <NewMarketingTab />}
      {pathname === "/pointSystem" && <PointTab />}
      {pathname === "/home/news" && <News />}
      {pathname === "/home/organization" && <Organizations />}
      {pathname === "/home/product" && <Product />}
    </div>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function ToolbarActionsSearch() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user"));
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    signOut(auth)
      .then(() => {
        window.location.href = "/signin";
        localStorage.removeItem("user");
        handleMenuClose();
      })
      .catch((error) => {
        console.error("Sign-out error:", error);
      });
  };

  const renderMenu = (
    <>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        id="menu-id"
        keepMounted
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleSignOut}>Гарах</MenuItem>
      </Menu>
      <Typography
        variant="subtitle1"
        sx={{
          color: "inherit",
          fontWeight: 500,
          textTransform: "capitalize",
        }}
      >
        {userData?.lastName || userData?.firstName
          ? `${userData?.lastName || ""} ${userData?.firstName || ""}`.trim()
          : "Unknown User"}
      </Typography>
    </>
  );

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar
        src={userData?.avatarUrl || "https://via.placeholder.com/40"}
        alt={userData?.lastName || "User Avatar"}
        onClick={handleMenuOpen}
        sx={{
          width: 40,
          height: 40,
          marginRight: "10px",
          backgroundColor: "primary.main",
        }}
      >
        {!userData?.avatarUrl &&
          `${userData?.lastName?.charAt(0) || ""}${userData?.firstName?.charAt(0) || ""}`.toUpperCase()}
      </Avatar>
      {renderMenu}
    </Stack>
  );
}

// function ThemeSwitcher() {
//   const { mode, setMode } = useColorScheme();

//   const toggleMode = () => {
//     setMode(mode === "light" ? "dark" : "light");
//   };

//   return (
//     <IconButton onClick={toggleMode} color="inherit">
//       {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
//     </IconButton>
//   );
// }

function SidebarFooter({ mini }) {
  return (
    <Typography
      variant="caption"
      sx={{
        m: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {mini ? "A4" : `A4YOU&ME ${new Date().getFullYear()}`}
    </Typography>
  );
}

SidebarFooter.propTypes = {
  mini: PropTypes.bool.isRequired,
};

function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Chip size="medium" label="A4YOU&ME" color="info" />
    </Stack>
  );
}

function DashboardLayoutSlots(props) {
  const { window } = props;
  const router = useDemoRouter("/dashboard");
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <CssVarsProvider theme={demoTheme}>
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
    </CssVarsProvider>
  );
}

DashboardLayoutSlots.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutSlots;
