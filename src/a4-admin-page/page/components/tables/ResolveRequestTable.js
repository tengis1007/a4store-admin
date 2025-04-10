/* eslint-disable react/jsx-pascal-case */
import React, { useMemo, useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
//MRT Imports
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
} from "material-react-table";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  get,
  query,
  ref,
  equalTo,
  orderByChild,
  remove,
  update,
} from "firebase/database";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  MenuItem,
  lighten,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Stack,
  Grid,
  Tooltip,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { addPost } from "store/AuthStore";
import MUIStepper from "../../components/MUIStepper";
import { db } from "refrence/realConfig";
import dayjs from "dayjs";

const ReactAdvancedMaterialTable = () => {
  const [modalButtonTitle, setModalButtonTitle] = useState({});
  const [selectedWorkerMajor, setSelectedWorkerMajor] = useState("");
  const [workerList, setWorkerList] = useState([]);
  const [comment, setComment] = useState("");
  const [calc, setCalc] = useState("");
  const [bonusCalc, setBonusCalc] = useState("");
  const [count, setCount] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("user"));
  const [statementData, setStatementData] = useState([]);
  const [buyData, setBuyData] = useState([]);
  const [ebarimtData, setEbarimtData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [summary, setSummary] = useState({
    transactionCount: 0,
    ebarimtCount: 0,
    buyCount: 0,
    productCount: 0,
  });

  const columns = useMemo(
    () => [
      {
        id: "mainInfo",
        header: "Үндсэн мэдээлэл",
        columns: [
          {
            accessorKey: "Status",
            filterVariant: "autocomplete",
            header: "Төлөв",
            size: 100,
            Cell: ({ cell }) => (
              <Box
                component="span"
                sx={(theme) => ({
                  backgroundColor: theme.palette.warning.dark,
                  borderRadius: "0.25rem",
                  color: "#fff",
                  maxWidth: "9ch",
                  p: "0.25rem",
                })}
              >
                {cell.getValue()?.toLocaleString?.("mn-MN", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Box>
            ),
          },
          {
            accessorKey: "ApprovalType",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Хүсэлтийн төрөл",
            size: 100,
          },
          {
            accessorKey: "ID",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "ID",
            size: 100,
          },
          {
            accessorKey: "id",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "id",
            size: 100,
          },
          {
            accessorKey: "Name",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Нэр",
            size: 100,
          },
          {
            accessorFn: (row) => new Date(row.TimeStamps),
            id: "TimeStamps",
            header: "Үүсгэсэн огноо",
            filterVariant: "date",
            filterFn: "lessThan",
            sortingFn: "datetime",
            Cell: ({ cell }) =>
              dayjs(cell.getValue()).format("YYYY-MM-DD HH:mm:ss"),
            Header: ({ column }) => <em>{column.columnDef.header}</em>, //custom header markup
            muiFilterTextFieldProps: {
              sx: {
                minWidth: "100px",
              },
            },
          },
          {
            accessorKey: "Requester_ID",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Үүсгэсэн ажилтан",
            size: 100,
          },
        ],
      },
    ],
    []
  );

  //call CREATE hook
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateRequest();
  //call READ hook
  const {
    data: fetchedResults = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetRequest();
  //call UPDATE hook
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateRequest();
  //call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteRequest();

  //CREATE action
  const handleCreateRequest = async ({ values, table }) => {
    await createUser(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveRequest = async ({ values, table }) => {
    await updateUser(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?")) {
      console.log("inside openDeleteConfirmModal", row);
      deleteUser(row.original.id);
    }
  };
  // Choose a description depending on the userRoles
  const handleCommentRequest = (row) => {
    console.log("row", row);
    if (userInfo.role.includes("cs")) {
      setComment(row.original.Requester_Comment);
    } else if (userInfo.role === "system") {
      if (row.original.Level === 2) {
        setComment(row.original.Approver1_Comment);
      } else if (row.original.Level === 5) {
        setComment(row.original.Approver4_Comment);
      }
    } else if (userInfo.role === "finance") {
      setComment(row.original.Approver2_Comment);
    } else if (userInfo.role === "director") {
      setComment(row.original.Approver3_Comment);
    }
  };

  const getReturnWorker = (obj) => {
    let list = [];
    let newValue = "";
    Object.keys(obj).forEach((val) => {
      if (obj[val] === "Шийдвэрлэсэн" || obj[val] === "Илгээсэн") {
        newValue = val.slice(0, -6) + "Major";
        list.push(obj[newValue]);
      }
    });
    setWorkerList(list);
  };

  const handleActionSubmit = async (values, table, modalButtonTitle) => {
    const data = values.original;
    const date = new Date();
    let updateData = {};
    let addData = {};
    if (modalButtonTitle === "зөвшөөрөх") {
      if (userInfo.role === "manager") {
        if (
          ["Бусад", "Уригч солих", "Спонсор солих"].includes(data.ApprovalType)
        ) {
          updateData = {
            ...data,
            Approver1_Avatar: userInfo.photoURL,
            Approver1_Comment: comment,
            Approver1_ID: userInfo.email,
            Approver1_Status: "Шийдвэрлэсэн",
            Approver1_TimeStamps: date.getTime(),
            Approver3_Status: "Шийдвэрлэж байна",
            Level: data.Level + 1,
          };
        } else if (["Буцаалт хийх"].includes(data.ApprovalType)) {
          updateData = {
            ...data,
            Approver1_Avatar: userInfo.photoURL,
            Approver1_Comment: comment,
            Approver1_ID: userInfo.email,
            Approver1_Status: "Шийдвэрлэсэн",
            Approver1_TimeStamps: date.getTime(),
            Approver2_Status: "Шийдвэрлэж байна",
            Level: data.Level + 1,
          };
        }
      } else if (userInfo.role === "finance") {
        if (
          ["E-баримт олголт", "Бүтээгдэхүүн олголт"].includes(data.ApprovalType)
        ) {
          updateData = {
            ...data,
            Approver2_Avatar: userInfo.photoURL,
            Approver2_Comment: comment,
            Approver2_ID: userInfo.email,
            Approver2_Status: "Шийдвэрлэсэн",
            Approver2_TimeStamps: date.getTime(),
            Status: "Шийдвэрлэсэн",
          };
          if (["E-баримт олголт"].includes(data.ApprovalType)) {
            addData = {
              Requester_TimeStamps: data.Requester_TimeStamps,
              Count: data.Extra[0].ebarimt,
              TimeStamps: date.getTime(),
              ID: data.ID,
              Name: data.Name,
              Description: comment,
            };
            await addPost("ebarimt/", addData);
          } else {
            addData = {
              Requester_TimeStamps: data.Requester_TimeStamps,
              Count: data.Extra[0].productNumber,
              TimeStamps: date.getTime(),
              ID: data.ID,
              Name: data.Name,
              ProductName: data.Extra[0].productName,
              Description: comment,
              ProductCount: data.Extra[0].productNumber,
            };
            await addPost("productdelivery/", addData);
          }
        } else if (["Буцаалт хийх"].includes(data.ApprovalType)) {
          updateData = {
            ...data,
            Approver2_Avatar: userInfo.photoURL,
            Approver2_Comment: comment,
            Approver2_ID: userInfo.email,
            Approver2_Status: "Шийдвэрлэсэн",
            Approver2_TimeStamps: date.getTime(),
            Approver3_Status: "Шийдвэрлэж байна",
            Calc: calc,
            count: count,
            BonusCalc: bonusCalc,
            Level: data.Level + 1,
          };
        }
      } else if (userInfo.role === "system") {
        if (
          [
            "Нууц үг солиулах",
            "Худалдан авалт хийж болохгүй байгаа",
            "Дансны дугаар солих",
            "Овог солих",
            "Нэр солих",
            "Бусад",
            "Уригч солих",
            "Спонсор солих",
          ].includes(data.ApprovalType)
        ) {
          updateData = {
            ...data,
            Approver3_Avatar: userInfo.photoURL,
            Approver3_Comment: comment,
            Approver3_ID: userInfo.email,
            Approver3_Status: "Шийдвэрлэсэн",
            Approver3_TimeStamps: date.getTime(),
            Status: "Шийдвэрлэсэн",
          };
        } else if (["Буцаалт хийх"].includes(data.ApprovalType)) {
          updateData = {
            ...data,
            Approver3_Avatar: userInfo.photoURL,
            Approver3_Comment: comment,
            Approver3_ID: userInfo.email,
            Approver3_Status: "Шийдвэрлэсэн",
            Approver3_TimeStamps: date.getTime(),
            Status: "Шийдвэрлэсэн",
          };
          addData = {
            Requester_TimeStamps: data.Requester_TimeStamps,
            TimeStamps: data.TimeStamps,
            ConfirmedTimeStamps: date.getTime(),
            Name: data.Name,
            ID: data.ID,
            Count: data.Extra[0].count,
            Description: comment,
            Calc: data.Calc,
            BonusCalc: data.BonusCalc,
          };
          await addPost("cancelContract/", addData);
        }
      } else if (userInfo.role === "director") {
        if (["Буцаалт хийх"].includes(data.ApprovalType)) {
          updateData = {
            ...data,
            Approver4_Avatar: userInfo.photoURL,
            Approver4_Comment: comment,
            Approver4_ID: userInfo.email,
            Approver4_Status: "Шийдвэрлэсэн",
            Approver4_TimeStamps: date.getTime(),
            Level: data.Level + 1,
            Approver3_Status: "Шийдвэрлэж байна",
          };
        }
      } else if (userInfo.role === "cs") {
        updateData = {
          ...data,
          Request_Avatar: userInfo.photoURL,
          Requester_Comment: comment,
          Requester_ID: userInfo.email,
          Requester_Status: "Шийдвэрлэсэн",
          Requester_TimeStamps: date.getTime(),
          Approver1_Status: "Шийдвэрлэж байна",
          Level: data.Level + 1,
        };
      }
    } else if (modalButtonTitle === "цуцлах") {
      if (userInfo.role === "manager") {
        if (
          ["Бусад", "Уригч солих", "Спонсор солих"].includes(data.ApprovalType)
        ) {
          updateData = {
            ...data,
            Approver1_Avatar: userInfo.photoURL,
            Approver1_Comment: comment,
            Approver1_ID: userInfo.email,
            Approver1_Status: "Цуцалсан",
            Approver1_TimeStamps: date.getTime(),
            Status: "Цуцалсан",
            Approver3_Status: "Цуцлагдсан",
            Requester_Status: "Цуцлагдсан",
          };
        } else if (["Буцаалт хийх"].includes(data.ApprovalType)) {
          updateData = {
            ...data,
            Approver1_Avatar: userInfo.photoURL,
            Approver1_Comment: comment,
            Approver1_ID: userInfo.email,
            Approver1_Status: "Цуцалсан",
            Approver1_TimeStamps: date.getTime(),
            Status: "Цуцалсан",
            Approver2_Status: "Цуцлагдсан",
            Approver3_Status: "Цуцлагдсан",
            Approver4_Status: "Цуцлагдсан",
            Requester_Status: "Цуцлагдсан",
          };
        }
      } else if (userInfo.role === "finance") {
        if (
          ["E-баримт олголт", "Бүтээгдэхүүн олголт"].includes(data.ApprovalType)
        ) {
          updateData = {
            ...data,
            Approver2_Avatar: userInfo.photoURL,
            Approver2_Comment: comment,
            Approver2_ID: userInfo.email,
            Approver2_Status: "Цуцалсан",
            Approver2_TimeStamps: date.getTime(),
            Status: "Цуцалсан",
            Requester_Status: "Цуцлагдсан",
          };
        } else if (["Буцаалт хийх"].includes(data.ApprovalType)) {
          updateData = {
            ...data,
            Approver2_Avatar: userInfo.photoURL,
            Approver2_Comment: comment,
            Approver2_ID: userInfo.email,
            Approver2_Status: "Цуцалсан",
            Approver2_TimeStamps: date.getTime(),
            Status: "Цуцалсан",
            Calc: calc,
            BonusCalc: bonusCalc,
            Approver3_Status: "Цуцлагдсан",
            Approver4_Status: "Цуцлагдсан",
            Approver1_Status: "Цуцлагдсан",
            Requester_Status: "Цуцлагдсан",
          };
        }
      } else if (userInfo.role === "system") {
        if (
          [
            "Нууц үг солиулах",
            "Худалдан авалт хийж болохгүй байгаа",
            "Дансны дугаар солих",
            "Овог солих",
            "Нэр солих",
            "Бусад",
            "Уригч солих",
            "Спонсор солих",
          ].includes(data.ApprovalType)
        ) {
          updateData = {
            ...data,
            Approver3_Avatar: userInfo.photoURL,
            Approver3_Comment: comment,
            Approver3_ID: userInfo.email,
            Approver3_Status: "Цуцалсан",
            Approver3_TimeStamps: date.getTime(),
            Status: "Цуцалсан",
            Requester_Status: "Цуцлагдсан",
            Approver1_Status: "Цуцлагдсан",
          };
        } else if (["Буцаалт хийх"].includes(data.ApprovalType)) {
          updateData = {
            ...data,
            Approver3_Avatar: userInfo.photoURL,
            Approver3_Comment: comment,
            Approver3_ID: userInfo.email,
            Approver3_Status: "Цуцалсан",
            Approver3_TimeStamps: date.getTime(),
            Status: "Цуцалсан",
            Requester_Status: "Цуцлагдсан",
            Approver1_Status: "Цуцлагдсан",
            Approver2_Status: "Цуцлагдсан",
            Approver4_Status: "Цуцлагдсан",
          };
        }
      } else if (userInfo.role === "director") {
        if (["Буцаалт хийх"].includes(data.ApprovalType)) {
          updateData = {
            ...data,
            Approver4_Avatar: userInfo.photoURL,
            Approver4_Comment: comment,
            Approver4_ID: userInfo.email,
            Approver4_Status: "Цуцалсан",
            Approver4_TimeStamps: date.getTime(),
            Status: "Цуцалсан",
            Requester_Status: "Цуцлагдсан",
            Approver1_Status: "Цуцлагдсан",
            Approver2_Status: "Цуцлагдсан",
          };
        }
      } else if (userInfo.role === "cs") {
        if (
          [
            "Нууц үг солиулах",
            "Худалдан авалт хийж болохгүй байгаа",
            "Дансны дугаар солих",
            "Овог солих",
            "Нэр солих",
          ].includes(data.ApprovalType)
        ) {
          updateData = {
            ...data,
            Requester_Avatar: userInfo.photoURL,
            Requester_Comment: comment,
            Requester_ID: userInfo.email,
            Requester_Status: "Цуцалсан",
            Requester_TimeStamps: date.getTime(),
            Status: "Цуцалсан",
            Approver3_Status: "Цуцлагдсан",
          };
        } else if (
          ["Бусад", "Уригч солих", "Спонсор солих"].includes(data.ApprovalType)
        ) {
          updateData = {
            ...data,
            Requester_Avatar: userInfo.photoURL,
            Requester_Comment: comment,
            Requester_ID: userInfo.email,
            Requester_Status: "Цуцалсан",
            Requester_TimeStamps: date.getTime(),
            Status: "Цуцалсан",
            Approver1_Status: "Цуцлагдсан",
            Approver3_Status: "Цуцлагдсан",
          };
        } else if (["Буцаалт хийх"].includes(data.ApprovalType)) {
          updateData = {
            ...data,
            Requester_Avatar: userInfo.photoURL,
            Requester_Comment: comment,
            Requester_ID: userInfo.email,
            Requester_Status: "Цуцалсан",
            Requester_TimeStamps: date.getTime(),
            Status: "Цуцалсан",
            Approver1_Status: "Цуцлагдсан",
            Approver2_Status: "Цуцлагдсан",
            Approver3_Status: "Цуцлагдсан",
            Approver4_Status: "Цуцлагдсан",
          };
        }
      }
    } else if (modalButtonTitle === "буцаах") {
      if (userInfo.role === "finance") {
        if (selectedWorkerMajor === "cs") {
          updateData = {
            ...data,
            Approver2_Avatar: userInfo.photoURL,
            Approver2_Comment: comment,
            Approver2_ID: userInfo.email,
            Approver2_Status: "Буцаасан",
            Approver2_TimeStamps: date.getTime(),
            Requester_Status: "Шийдвэрлэж байна",
            Calc: calc,
            BonusCalc: bonusCalc,
            Level: 1,
          };
        } else if (selectedWorkerMajor === "cs менежер") {
          updateData = {
            ...data,
            Approver2_Avatar: userInfo.photoURL,
            Approver2_Comment: comment,
            Approver2_ID: userInfo.email,
            Approver2_Status: "Буцаасан",
            Approver2_TimeStamps: date.getTime(),
            Approver1_Status: "Шийдвэрлэж байна",
            Calc: calc,
            BonusCalc: bonusCalc,
            Level: 2,
          };
        }
      } else if (userInfo.role === "system") {
        if (selectedWorkerMajor === "cs") {
          updateData = {
            ...data,
            Approver3_Avatar: userInfo.photoURL,
            Approver3_Comment: comment,
            Approver3_ID: userInfo.email,
            Approver3_Status: "Буцаасан",
            Approver3_TimeStamps: date.getTime(),
            Requester_Status: "Шийдвэрлэж байна",
            Level: 1,
          };
        } else if (selectedWorkerMajor === "cs менежер") {
          updateData = {
            ...data,
            Approver3_Avatar: userInfo.photoURL,
            Approver3_Comment: comment,
            Approver3_ID: userInfo.email,
            Approver3_Status: "Буцаасан",
            Approver3_TimeStamps: date.getTime(),
            Approver1_Status: "Шийдвэрлэж байна",
            Level: 2,
          };
        } else if (selectedWorkerMajor === "санхүү") {
          updateData = {
            ...data,
            Approver3_Avatar: userInfo.photoURL,
            Approver3_Comment: comment,
            Approver3_ID: userInfo.email,
            Approver3_Status: "Буцаасан",
            Approver3_TimeStamps: date.getTime(),
            Approver2_Status: "Шийдвэрлэж байна",
            Level: 3,
          };
        } else if (selectedWorkerMajor === "удирдлага") {
          updateData = {
            ...data,
            Approver3_Avatar: userInfo.photoURL,
            Approver3_Comment: comment,
            Approver3_ID: userInfo.email,
            Approver3_Status: "Буцаасан",
            Approver3_TimeStamps: date.getTime(),
            Approver4_Status: "Шийдвэрлэж байна",
            Level: 4,
          };
        }
      } else if (userInfo.role === "director") {
        if (selectedWorkerMajor === "cs") {
          updateData = {
            ...data,
            Approver4_Avatar: userInfo.photoURL,
            Approver4_Comment: comment,
            Approver4_ID: userInfo.email,
            Approver4_Status: "Буцаасан",
            Approver4_TimeStamps: date.getTime(),
            Requester_Status: "Шийдвэрлэж байна",
            Level: 1,
          };
        } else if (selectedWorkerMajor === "cs менежер") {
          updateData = {
            ...data,
            Approver4_Avatar: userInfo.photoURL,
            Approver4_Comment: comment,
            Approver4_ID: userInfo.email,
            Approver4_Status: "Буцаасан",
            Approver4_TimeStamps: date.getTime(),
            Approver1_Status: "Шийдвэрлэж байна",
            Level: 2,
          };
        } else if (selectedWorkerMajor === "санхүү") {
          updateData = {
            ...data,
            Approver4_Avatar: userInfo.photoURL,
            Approver4_Comment: comment,
            Approver4_ID: userInfo.email,
            Approver4_Status: "Буцаасан",
            Approver4_TimeStamps: date.getTime(),
            Approver2_Status: "Шийдвэрлэж байна",
            Level: 3,
          };
        }
      }
    }

    await updateUser(updateData);
    table.setEditingRow(null);
  };

  const getDetailInfo = async (row) => {
    const statementRef = ref(db, "statements");
    const buyRef = ref(db, "userInfo");
    const ebarimtRef = ref(db, "ebarimt");
    const productRef = ref(db, "productdelivery");
    const statementQuery = query(
      statementRef,
      orderByChild("memberId"),
      equalTo(Number(row.original.ID))
    );
    const buyQuery = query(
      buyRef,
      orderByChild("MemberId"),
      equalTo(Number(row.original.ID))
    );
    const productQuery = query(
      productRef,
      orderByChild("ID"),
      equalTo(row.original.ID)
    );
    const ebarimtQuery = query(
      ebarimtRef,
      orderByChild("ID"),
      equalTo(row.original.ID)
    );

    const statementSnapshot = await get(statementQuery);
    const buySnapshot = await get(buyQuery);
    const ebarimtSnapshot = await get(ebarimtQuery);
    const productSnapshot = await get(productQuery);
    let buySum = 0;
    let ebarimtSum = 0;
    let statementSum = 0;
    let productSum = 0;
    let sdata = [],
      bdata = [],
      edata = [],
      pdata = [];

    if (statementSnapshot.exists()) {
      let statementSnap = statementSnapshot.val();
      for (let key in statementSnap) {
        sdata.unshift({
          ...statementSnap[key],
          id: key,
        });
        statementSum = statementSum + statementSnap[key].tranAmount;
      }
      setStatementData(sdata);
    }
    if (buySnapshot.exists()) {
      let buySnap = buySnapshot.val();
      for (let key in buySnap) {
        bdata.unshift({
          ...buySnap[key],
          id: key,
        });
      }
      buySum = Object.keys(buySnap).length;
      setBuyData(bdata);
    }
    if (ebarimtSnapshot.exists()) {
      let ebarimtSnap = ebarimtSnapshot.val();
      for (let key in ebarimtSnap) {
        edata.unshift({
          ...ebarimtSnap[key],
          id: key,
        });
        ebarimtSum = ebarimtSum + Number(ebarimtSnap[key].Count);
      }
      setEbarimtData(edata);
    }
    if (productSnapshot.exists()) {
      let productSnap = productSnapshot.val();
      for (let key in productSnap) {
        pdata.unshift({
          ...productSnap[key],
          id: key,
        });
        productSum = productSum + Number(productSnap[key].Count);
      }
      setProductData(pdata);
    }

    setSummary({
      ...summary,
      transactionCount: statementSum,
      buyCount: buySum * 1500000,
      ebarimtCount: ebarimtSum,
      productCount: productSum,
    });
  };

  const numberWithCommas = (x) => {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
    return x;
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedResults, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    getRowId: (row) => row.id,
    enableHiding: true,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableRowActions: true,
    initialState: {
      showColumnVisibility: true,
      showColumnFilters: false,
      showGlobalFilter: true,
      columnVisibility: true,
      columnPinning: {
        left: ["mrt-row-expand", "mrt-row-select"],
        right: ["mrt-row-actions"],
      },
    },
    displayColumnDefOptions: {
      "mrt-row-numbers": {
        enableHiding: true, //now row numbers are hidable too
      },
    },
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    muiSearchTextFieldProps: {
      size: "small",
      variant: "outlined",
    },
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 20, 30],
      shape: "rounded",
      variant: "outlined",
    },
    onCreatingRowSave: handleCreateRequest,
    onEditingRowSave: handleSaveRequest,
    renderDetailPanel: ({ row }) => {
      console.log("row", row.original);
      return (
        <>
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-around",
              left: "30px",
              maxWidth: "1000px",
              position: "sticky",
              width: "100%",
            }}
          >
            <MUIStepper row={row} />
          </Box>
          <Grid container flexDirection="row" spacing={{ xs: 2, md: 3 }}>
            {Object.keys(row.original.Extra[0]).map(
              (key) =>
                row.original.Extra[0][key] && (
                  <Grid size={{ xs: 12, sm: 3 }} key={key}>
                    <TextField
                      value={row.original.Extra[0][key]}
                      label={key}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                )
            )}
          </Grid>
        </>
      );
    },
    renderRowActionMenuItems: ({ table, row, closeMenu }) => [
      <MenuItem
        key={100}
        id="Detail"
        onClick={() => {
          getDetailInfo(row);
          handleCommentRequest(row);
          setModalButtonTitle("дэлгэрэнгүй");
          table.setEditingRow(row);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <MoreHorizIcon />
        </ListItemIcon>
        Дэлгэрэнгүй
      </MenuItem>,
      <MenuItem
        key={200}
        id="Confirm"
        onClick={() => {
          handleCommentRequest(row);
          setModalButtonTitle("зөвшөөрөх");
          table.setEditingRow(row);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <CheckIcon />
        </ListItemIcon>
        Зөвшөөрөх
      </MenuItem>,
      <MenuItem
        key={300}
        onClick={() => {
          handleCommentRequest(row);
          setModalButtonTitle("цуцлах");
          table.setEditingRow(row);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <ClearIcon />
        </ListItemIcon>
        Цуцлах
      </MenuItem>,
      ["finance", "director", "system"].includes(userInfo.role) && (
        <MenuItem
          key={400}
          onClick={() => {
            getReturnWorker(row.original);
            handleCommentRequest(row);
            setModalButtonTitle("буцаах");
            table.setEditingRow(row);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <KeyboardReturnIcon />
          </ListItemIcon>
          Буцаах
        </MenuItem>
      ),
      userInfo.role === "system" && (
        <MenuItem
          key={500}
          onClick={() => {
            openDeleteConfirmModal(row);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Устгах
        </MenuItem>
      ),
    ],
    renderEditRowDialogContent: ({ table, row }) => (
      <>
        <DialogTitle variant="h4">
          <Typography component="div">
            <Box sx={{ textTransform: "uppercase", textAlign: "center" }}>
              {modalButtonTitle}
            </Box>
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {modalButtonTitle === "дэлгэрэнгүй" ? (
            <Grid
              container
              spacing={1}
              columnSpacing={{ xs: 2, sm: 2, md: 3 }}
              sx={{ marginTop: 1 }}
            >
              <Grid size={{ xs: 12, sm: 12 }} justifyContent="center">
                <Box>
                  <Accordion>
                    <AccordionSummary
                      aria-controls="panel1-content"
                      id="panel11554564-header"
                    >
                      <Typography variant="body2">
                        ID: <strong>{row.original.ID}</strong>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails></AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      aria-controls="panel1-content"
                      id="panel11554564-header"
                    >
                      <Typography variant="body2">
                        Овог нэр: <strong>{row.original.Name}</strong>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails></AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      aria-controls="panel1-content"
                      id="panel3333-header"
                    >
                      <Typography variant="body2">
                        Үлдсэн дүн:{" "}
                        <strong>
                          {numberWithCommas(
                            summary.transactionCount - summary.ebarimtCount
                          )}{" "}
                          ₮
                        </strong>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails></AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ArrowDropDownIcon />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                    >
                      <Typography variant="body2">
                        Е-баримт авсан дүн:{" "}
                        <strong>
                          {numberWithCommas(summary.ebarimtCount)} ₮
                        </strong>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          width: "100%",
                          // maxWidth: 600,
                          bgcolor: "background.paper",
                          borderRadius: 2,
                          boxShadow: 3,
                          p: 2,
                          overflowX: "auto",
                          height: 300,
                        }}
                      >
                        <List>
                          <Divider />
                          {ebarimtData.map((transaction, index) => (
                            <div key={index}>
                              <ListItem
                                sx={{
                                  border: "Background.paper",
                                  backgroundColor: "#e0e0e0",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  color: "black",
                                  borderRadius: 2,
                                  mb: 1,
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                    backgroundColor: "#f3f3f3",
                                  },
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="body1"
                                      fontWeight="bold"
                                    >
                                      {transaction.Description}
                                    </Typography>
                                  }
                                  secondary={dayjs(
                                    transaction.TimeStamps
                                  ).format("YYYY-MM-DD HH:mm:ss")}
                                />
                                <Typography variant="body2" align="right">
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    fontWeight="bold"
                                  >
                                    {numberWithCommas(transaction.Count)}₮{" "}
                                  </Typography>
                                </Typography>
                              </ListItem>
                              {index < ebarimtData.length - 1 && <Divider />}
                            </div>
                          ))}
                        </List>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ArrowDropDownIcon />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                    >
                      <Typography variant="body2">
                        Бүтээгдэхүүн авсан хэмжээ:{" "}
                        <strong>
                          {numberWithCommas(summary.productCount)} ширхэг
                        </strong>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          width: "100%",
                          // maxWidth: 600,
                          bgcolor: "background.paper",
                          borderRadius: 2,
                          boxShadow: 3,
                          p: 2,
                          overflowX: "auto",
                          height: 300,
                        }}
                      >
                        <List>
                          <Divider />
                          {productData.map((transaction, index) => (
                            <div key={index}>
                              <ListItem
                                sx={{
                                  border: "Background.paper",
                                  backgroundColor: "#e0e0e0",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  color: "black",
                                  borderRadius: 2,
                                  mb: 1,
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                    backgroundColor: "#f3f3f3",
                                  },
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="body1"
                                      fontWeight="bold"
                                    >
                                      {transaction.Description}
                                    </Typography>
                                  }
                                  secondary={dayjs(
                                    transaction.TimeStamps
                                  ).format("YYYY-MM-DD HH:mm:ss")}
                                />
                                <Typography variant="body2" align="right">
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    fontWeight="bold"
                                  >
                                    {numberWithCommas(transaction.Count)}
                                    ширхэг{" "}
                                  </Typography>
                                </Typography>
                              </ListItem>
                              {index < ebarimtData.length - 1 && <Divider />}
                            </div>
                          ))}
                        </List>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ArrowDropDownIcon />}
                      aria-controls="panel2-content"
                      id="panel2-header"
                    >
                      <Typography variant="body2">
                        Худалдаж авсан дүн:{" "}
                        <strong>{numberWithCommas(summary.buyCount)} ₮</strong>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          width: "100%",
                          // maxWidth: 600,
                          bgcolor: "background.paper",
                          borderRadius: 2,
                          boxShadow: 3,
                          p: 2,
                          overflowX: "auto",
                          height: 300,
                        }}
                      >
                        <List>
                          <Divider />
                          {buyData.map((transaction, index) => (
                            <div key={index}>
                              <ListItem
                                sx={{
                                  border: "Background.paper",
                                  backgroundColor: "#e0e0e0",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  color: "black",
                                  borderRadius: 2,
                                  mb: 1,
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                    backgroundColor: "#f3f3f3",
                                  },
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="body1"
                                      fontWeight="bold"
                                    >
                                      {transaction.ProductName}
                                    </Typography>
                                  }
                                  secondary={dayjs(
                                    transaction.timeStamp
                                  ).format("YYYY-MM-DD HH:mm:ss")}
                                />
                                <Tooltip
                                  title={
                                    transaction.SponsorName +
                                    "(" +
                                    transaction.SponsorId +
                                    ")"
                                  }
                                  sx={{ marginRight: 2 }}
                                >
                                  <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                  >
                                    <Avatar
                                      variant="rounded"
                                      sx={{ bgcolor: "primary.main" }}
                                    >
                                      <AccountTreeIcon />
                                    </Avatar>
                                  </Stack>
                                </Tooltip>
                                <Tooltip
                                  title={
                                    transaction.InviterName +
                                    "(" +
                                    transaction.InviterId +
                                    ")"
                                  }
                                >
                                  <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                  >
                                    <Avatar
                                      variant="rounded"
                                      sx={{ bgcolor: "secondary.main" }}
                                    >
                                      <PersonAddIcon />
                                    </Avatar>
                                  </Stack>
                                </Tooltip>
                              </ListItem>
                              {index < ebarimtData.length - 1 && <Divider />}
                            </div>
                          ))}
                        </List>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ArrowDropDownIcon />}
                      aria-controls="panel2-content"
                      id="panel2-header"
                    >
                      <Typography variant="body2">
                        Гүйлгээний дүн:{" "}
                        <strong>
                          {numberWithCommas(summary.transactionCount)} ₮
                        </strong>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          width: "100%",
                          backgroundColor: "#e0e0e0",
                          bgcolor: "background.paper",
                          borderRadius: 2,
                          boxShadow: 3,
                          p: 2,
                          overflowX: "auto",
                          height: 300,
                        }}
                      >
                        <List>
                          <Divider />
                          {statementData.map((transaction, index) => (
                            <div key={index}>
                              <ListItem
                                sx={{
                                  border: "Background.paper",
                                  backgroundColor: "#e0e0e0",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  color: "black",
                                  borderRadius: 2,
                                  mb: 1,
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                    backgroundColor: "#f3f3f3",
                                  },
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="body1"
                                      fontWeight="bold"
                                    >
                                      {transaction.accName} {transaction.accNum}
                                    </Typography>
                                  }
                                  secondary={dayjs(
                                    transaction.tranPostedDate
                                  ).format("YYYY-MM-DD HH:mm:ss")}
                                />
                                <Typography variant="body2" align="right">
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    fontWeight="bold"
                                  >
                                    {numberWithCommas(transaction.tranAmount)}₮{" "}
                                  </Typography>
                                </Typography>
                              </ListItem>
                              {index < ebarimtData.length - 1 && <Divider />}
                            </div>
                          ))}
                        </List>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <>
              <Typography variant="body">
                Та {modalButtonTitle} үйлдлийг хийхдээ итгэлтэй байна уу?
              </Typography>
              <TextField
                id="standard-read-only-input"
                label="ID"
                defaultValue={row.original.ID}
                InputProps={{
                  readOnly: true,
                }}
                variant="standard"
              />
              <TextField
                id="standard-read-only-input"
                label="ID"
                defaultValue={row.original.Name}
                InputProps={{
                  readOnly: true,
                }}
                variant="standard"
              />
              {userInfo.role === "finance" &&
                row.original.ApprovalType === "Буцаалт хийх" && (
                  <TextField
                    id="standard-read-only-input"
                    label="Бодолт"
                    value={calc}
                    onChange={(e) => setCalc(e.target.value)}
                    variant="standard"
                    type="number"
                    multiline
                  />
                )}
              {userInfo.role === "finance" &&
                row.original.ApprovalType === "Буцаалт хийх" && (
                  <TextField
                    id="standard-read-only-input"
                    label="Бонус Бодолт"
                    value={bonusCalc}
                    onChange={(e) => setBonusCalc(e.target.value)}
                    variant="standard"
                    type="number"
                    multiline
                  />
                )}
              {userInfo.role === "finance" &&
                row.original.ApprovalType === "Буцаалт хийх" && (
                  <TextField
                    id="standard-read-only-input"
                    label="Шилжүүлэх эцсийн дүн"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    variant="standard"
                    type="number"
                    multiline
                  />
                )}
              <TextField
                id="standard-read-only-input"
                label="Тайлбар"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                variant="standard"
                multiline
              />
              {modalButtonTitle === "буцаах" && (
                <TextField
                  fullWidth
                  id="Select-approval-type"
                  select
                  variant="standard"
                  label="Буцаах ажилтан"
                  value={selectedWorkerMajor}
                  onChange={(e) => setSelectedWorkerMajor(e.target.value)}
                >
                  {workerList.map((option, index) => (
                    <MenuItem key={option + index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => table.setEditingRow(null)}>
            Буцах
          </Button>
          {modalButtonTitle !== "дэлгэрэнгүй" && (
            <Button
              variant="contained"
              onClick={() => handleActionSubmit(row, table, modalButtonTitle)}
            >
              Хадгалах
            </Button>
          )}
          {/* <MRT_EditActionButtons variant="text" table={table} row={row} /> */}
        </DialogActions>
      </>
    ),
    renderTopToolbar: ({ table }) => {
      return (
        <Box
          sx={(theme) => ({
            backgroundColor: lighten(theme.palette.background.default, 0.05),
            display: "flex",
            gap: "0.5rem",
            p: "8px",
            justifyContent: "space-between",
          })}
        >
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {/* import MRT sub-components */}
            <MRT_GlobalFilterTextField table={table} />
            <MRT_ToggleFiltersButton table={table} />
            <MRT_ShowHideColumnsButton table={table} />
            <MRT_ToggleDensePaddingButton table={table} />
            <MRT_ToggleFullScreenButton table={table} />
          </Box>
        </Box>
      );
    },

    state: {
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  //CREATE hook (post new user to api)
  function useCreateRequest() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        //send api update request here
        await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
        return Promise.resolve();
      },
      //client side optimistic update
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["users"], (prevUsers) => [
          ...prevUsers,
          {
            ...newUserInfo,
            id: (Math.random() + 1).toString(36).substring(7),
          },
        ]);
      },
      // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
    });
  }

  //READ hook (get users from api)
  function useGetRequest() {
    return useQuery({
      queryKey: ["request"],
      queryFn: async () => {
        //send api request here
        try {
          console.log("userInfo role", userInfo.role==="system");
          let approver_status;
          if (userInfo.role === "system") {
            approver_status = "Approver3_Status";
          } else if (userInfo.role === "finance") {
            approver_status = "Approver2_Status";
          } else if (userInfo.role === "manager") {
            approver_status = "Approver1_Status";
          } else if (userInfo.role === "cs") {
            approver_status = "Requester_Status";
          } else if (userInfo.role === "director") {
            approver_status = "Approver4_Status";
          }
          const fetchedResults = [];
          const que = query(
            ref(db, "request"),
            orderByChild(approver_status),
            equalTo("Шийдвэрлэж байна")
          );
   
          const snapshot = await get(que);
          snapshot.forEach((childSnapshot) => {
            let rawData = childSnapshot.val();
            rawData["id"] = childSnapshot.key;
            fetchedResults.push(rawData);
          });
          return Promise.resolve(fetchedResults.reverse());
        } catch (error) {
          console.log(error);
        }
        //await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
        //return Promise.resolve(data);
      },
      refetchOnWindowFocus: false,
    });
  }

  //UPDATE hook (put user in api)
  function useUpdateRequest() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (request) => {
        //send api update request here
        const requestRef = ref(db, `request/${request.id}/`);
        await update(requestRef, request);
        return Promise.resolve();
      },
      onMutate: (newRequestInfo) => {
        queryClient.setQueryData(["request"], (prevRequests) =>
          prevRequests?.map((prevRequest) =>
            prevRequest.id === newRequestInfo.id ? newRequestInfo : prevRequest
          )
        );
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["request"] }), //refetch users after mutation, disabled for demo
    });
  }

  //DELETE hook (delete user in api)
  function useDeleteRequest() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (requestId) => {
        //send api update request here
        try {
          await remove(ref(db, `request/${requestId}`));
          return Promise.resolve();
        } catch (error) {
          console.log(error);
        }
      },
      //client side optimistic update
      onMutate: (requestId) => {
        queryClient.setQueryData(["request"], (prevRequests) =>
          prevRequests?.filter((request) => request.id !== requestId)
        );
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["request"] }), //refetch users after mutation, disabled for demo
    });
  }

  return <MaterialReactTable table={table} />;
};

const queryClient = new QueryClient();

const ResolveRequestTable = ({ data }) => (
  //App.tsx or AppProviders file
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <QueryClientProvider client={queryClient}>
      <ReactAdvancedMaterialTable data={data} />
    </QueryClientProvider>
  </LocalizationProvider>
);

export default ResolveRequestTable;
