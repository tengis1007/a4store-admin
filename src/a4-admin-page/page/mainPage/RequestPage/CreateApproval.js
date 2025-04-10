/* eslint-disable react/jsx-pascal-case */
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  Fab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Stack,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { get, ref, query, orderByChild, equalTo } from "firebase/database";
import InputAdornment from "@mui/material/InputAdornment";
import { AuthStore, addPost } from "store/AuthStore";
import { db } from "refrence/realConfig";
import "dayjs/locale/mn";
import dayjs from "dayjs";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const RequestType = [
  {
    value: "",
    label: "",
  },
  {
    value: "Уригч солих",
    label: "Уригч солих",
  },
  {
    value: "Спонсор солих",
    label: "Спонсор солих",
  },
  {
    value: "Дансны дугаар солих",
    label: "Дансны дугаар солих",
  },
  {
    value: "Овог солих",
    label: "Овог солих",
  },
  {
    value: "Нэр солих",
    label: "Нэр солих",
  },
  {
    value: "Буцаалт хийх",
    label: "Буцаалт хийх",
  },
  {
    value: "Бүтээгдэхүүн олголт",
    label: "Бүтээгдэхүүн олголт",
  },
  {
    value: "E-баримт олголт",
    label: "E-баримт олголт",
  },
  {
    value: "Нууц үг солиулах",
    label: "Нууц үг солиулах",
  },
  {
    value: "Худалдан авалт хийж болохгүй байгаа",
    label: "Худалдан авалт хийж болохгүй байгаа",
  },
  {
    value: "Бусад",
    label: "Бусад",
  },
];
const BankList = [
  "",
  "Худалдаа хөгжлийн банк",
  "Хаан банк",
  "Голомт банк",
  "Төрийн банк",
  "Тээвэр хөгжлийн банк",
  "Ариг банк",
  "Капитрон банк",
  "Үндэсний хөрөнгө оруулалтын банк",
  "Хас банк",
  "Богд банк",
  "Чингис Хаан банк",
  "М банк",
];
const cardData = [
  {
    title: "A багц",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2FA.jpg?alt=media&token=132d245e-ae96-43b2-ba27-e2ecd070da49",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2FA1.png?alt=media&token=1192838f-bb7b-496b-b238-20fbf28339cd",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: true,
    amount: 1500000,
    oldAmount: 5075000,
  },
  {
    title: "B багц",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2FB.png?alt=media&token=8e418690-1e36-42a4-90ec-760a2271e296",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2FB1.png?alt=media&token=3c8206a6-eee7-4088-94ca-33a55e21938b",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: true,
    amount: 1500000,
    oldAmount: 3700000,
  },
  {
    title: "C багц",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2FC.png?alt=media&token=19d46670-8e36-4a75-86de-70e09045dd5e",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2FC1.png?alt=media&token=563cd7ab-0852-4d2e-9ef4-1b1d0e7f50a2",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: true,
    amount: 1500000,
    oldAmount: 3750000,
  },
  {
    title: "D багц",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2FD.png?alt=media&token=b066df05-1bfa-43c4-9228-068e961e21c6",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2FD1.png?alt=media&token=6dbb2e86-42d4-4cf7-84ee-6f9459a07d30",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: true,
    amount: 1500000,
    oldAmount: 1919500,
  },
  {
    title: "E багц",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2FE.png?alt=media&token=13a9db5f-7d55-4e4d-9d26-5f41e0d4c99c",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2FE1.png?alt=media&token=5dafd432-836b-4776-b212-1065f7129a49",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: true,
    amount: 1500000,
    oldAmount: 1950000,
  },
  {
    title: "F багц",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2FF.png?alt=media&token=0bc2f12c-25f8-497d-ac98-ee68a8f2f645",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2FF1.png?alt=media&token=1933696e-c95d-4e02-92a0-952449aa0e8b",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: true,
    amount: 1500000,
    oldAmount: 2336250,
  },
  {
    title: "G багц",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2Fg%20set.png?alt=media&token=4a3a01bd-5fc8-4646-bf3c-73047c754195",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2Fg%20set.png?alt=media&token=4a3a01bd-5fc8-4646-bf3c-73047c754195",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: true,
    amount: 750000,
    oldAmount: 1500000,
  },
  {
    title: "H багц",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2Fh%20set.png?alt=media&token=1982f1b1-8a22-4d85-8e49-aacff634c2c6",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2Fh%20set.png?alt=media&token=1982f1b1-8a22-4d85-8e49-aacff634c2c6",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: true,
    amount: 750000,
    oldAmount: 1500000,
  },
  {
    title: "I багц",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2Fi%20set.png?alt=media&token=e81cc04e-b73a-4f49-be0c-394b2ddc4898",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2Fi%20set.png?alt=media&token=e81cc04e-b73a-4f49-be0c-394b2ddc4898",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: true,
    amount: 750000,
    oldAmount: 1500000,
  },
  {
    title: "Тун удахгүй",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2F462557195_1974882349646100_103679527389079329_n.jpg?alt=media&token=554554b9-5751-4ae4-ac26-986db6e70c32",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2F462557195_1974882349646100_103679527389079329_n.jpg?alt=media&token=554554b9-5751-4ae4-ac26-986db6e70c32",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: false,
    amount: 0,
  },
  {
    title: "Скин бүүстер",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2F5.png?alt=media&token=27deb464-50e2-4539-94d8-cdcc113ac991",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: false,
    amount: 1500000,
  },
  {
    title: "Exoriche нүүрний ком (3 set)",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2F3%20set.png?alt=media&token=c1e9ac09-a39a-4de0-a81f-3412ac324131",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2F3%20set.png?alt=media&token=c1e9ac09-a39a-4de0-a81f-3412ac324131",

    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: false,
    amount: 1500000,
  },
  {
    title: "Дөрвөн улирал амралт",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2F4.png?alt=media&token=be3a8f0c-a32a-4953-a3f3-a365682bf8fe",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2F4.png?alt=media&token=be3a8f0c-a32a-4953-a3f3-a365682bf8fe",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: false,
    amount: 1500000,
  },
  {
    title: "Хүн орхоодой (Үрлэн)",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2F2.png?alt=media&token=a3153983-3d90-40a2-8cca-7018c478172e",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2F2.png?alt=media&token=a3153983-3d90-40a2-8cca-7018c478172e",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: false,
    amount: 1500000,
  },
  {
    title: "Хүн орхоодой (Ваартай)",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2F1.png?alt=media&token=37c7cb45-f7d7-49f6-bbae-a974125630ba",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/products%2F1.png?alt=media&token=37c7cb45-f7d7-49f6-bbae-a974125630ba",
    buttonText: "Худалдан авах",
    navigateTo: "/buy",
    isPromotional: false,
    amount: 1500000,
  },
];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateApproval = ({ open, setOpen }) => {
  const [ID, setID] = useState("");
  const [comment, setComment] = useState("");
  const [memberInfo, setMemberInfo] = useState({});
  const [userList, setUserList] = useState([
    {
      oldID: "",
      oldLastName: "",
      oldFirstName: "",
      newID: "",
      newLastName: "",
      newFirstName: "",
      oldBankName: "",
      oldBankNumber: "",
      newBankName: "",
      newBankNumber: "",
      productName: "",     
      productNumber: "",
      count: "",
      ebarimt: "",
    },
  ]);
  const [selectedApprovalType, setSelectedApprovalType] = useState("");
  const [summary, setSummary] = useState({
    transactionCount: 0,
    ebarimtCount: 0,
    buyCount: 0,
    productCount: 0,
  });
  const { admin, loading, darkMode } = AuthStore.useState();
  const [sendData, setSendData] = useState({});
  const [isValid, setValid] = useState(false);
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });
  const [statementData, setStatementData] = useState([]);
  const [buyData, setBuyData] = useState([]);
  const [ebarimtData, setEbarimtData] = useState([]);
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    resetAllStates();
  }, [open]);

  const resetAllStates = () => {
    setUserList([
      {
        oldID: "",
        oldLastName: "",
        oldFirstName: "",
        newID: "",
        newLastName: "",
        newFirstName: "",
        oldBankName: "",
        oldBankNumber: "",
        newBankName: "",
        newBankNumber: "",
        productName: "",
        productNumber: "",
        count: "",
        ebarimt: "",
      },
    ]);
    setSendData({});
    setMemberInfo({});
    setSelectedApprovalType("");
    setID("");
    setSummary({
      transactionCount: 0,
      ebarimtCount: 0,
      buyCount: 0,
      productCount: 0,
    });
    setComment("");
    setSelectedApprovalType("");
  };

  const handleSearch = async (e, value) => {
    AuthStore.update((store) => {
      store.loading = true;
    });

    try {
      const dbRef = ref(db, "Members");
      const memberQuery = query(
        dbRef,
        orderByChild("phoneNumber"),
        equalTo(Number(value))
      );
      const snapshot = await get(memberQuery);

      if (!snapshot.exists()) {
        AuthStore.update((store) => {
          store.actionText.title = "Амжилтгүй боллоо";
          store.actionText.body = "Бизнес эрхлэгч гишүүний бүртгэлгүй байна.";
          store.actionText.status = true;
          store.loading = false;
        });
        setID("");
        return [];
      }
      const fetchedResults = [];
      let rawData = snapshot.val();
      for (let key in rawData) {
        fetchedResults.unshift({
          ...rawData[key],
          id: key,
        });
      }
      setMemberInfo(fetchedResults[0]);
      if (
        [
          "Нууц үг солиулах",
          "Худалдан авалт хийж болохгүй байгаа",
          "Дансны дугаар солих",
          "Овог солих",
          "Нэр солих",
        ].includes(e.target.value)
      ) {
        setUserList([
          {
            oldID: "",
            oldLastName:
              e.target.value === "Овог солих" ? fetchedResults[0].lastName : "",
            oldFirstName:
              e.target.value === "Нэр солих" ? fetchedResults[0].firstName : "",
            oldBankName:
              e.target.value === "Дансны дугаар солих"
                ? fetchedResults[0].bankName
                : "",
            oldBankNumber:
              e.target.value === "Дансны дугаар солих"
                ? fetchedResults[0].accountNumber
                : "",
            newID: "",
            newLastName: "",
            newFirstName: "",
            newBankName: "",
            newBankNumber: "",
            productName: "",
            productNumber: "",
            count: "",
            ebarimt: "",
          },
        ]);
        setSendData({
          Requester_ID: admin.userInfo.email,
          Requester_Status: "Илгээсэн",
          Requester_Avatar: admin.userInfo.photoURL,
          Requester_Comment: comment,
          Approver3_TimeStamps: null,
          Approver3_ID: "",
          Approver3_Status: "Шийдвэрлэж байна",
          Approver3_Avatar: "",
          Approver3_Major: "систем",
          Approver3_Comment: "",
          Version: 1,
        });
      } else if (
        ["Бүтээгдэхүүн олголт", "E-баримт олголт"].includes(e.target.value)
      ) {
        if (e.target.value === "E-баримт олголт") {
          const statementRef = ref(db, "statements");
          const buyRef = ref(db, "userInfo");
          const ebarimtRef = ref(db, "ebarimt");
          const statementQuery = query(
            statementRef,
            orderByChild("memberId"),
            equalTo(Number(ID))
          );
          const buyQuery = query(
            buyRef,
            orderByChild("MemberId"),
            equalTo(Number(ID))
          );
          const ebarimtQuery = query(
            ebarimtRef,
            orderByChild("ID"),
            equalTo(ID)
          );
          const statementSnapshot = await get(statementQuery);
          const buySnapshot = await get(buyQuery);
          const ebarimtSnapshot = await get(ebarimtQuery);
          let buySum = 0;
          let ebarimtSum = 0;
          let statementSum = 0;
          let sdata = [],
            bdata = [],
            edata = [];
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

          setSummary({
            ...summary,
            transactionCount: statementSum,
            buyCount: buySum * 1500000,
            ebarimtCount: ebarimtSum,
          });
        }
        if (e.target.value === "Бүтээгдэхүүн олголт") {
          const statementRef = ref(db, "statements");
          const buyRef = ref(db, "userInfo");
          const productRef = ref(db, "productdelivery");
          const statementQuery = query(
            statementRef,
            orderByChild("memberId"),
            equalTo(Number(ID))
          );
          const buyQuery = query(
            buyRef,
            orderByChild("MemberId"),
            equalTo(Number(ID))
          );
          const productQuery = query(
            productRef,
            orderByChild("ID"),
            equalTo(ID)
          );
          const statementSnapshot = await get(statementQuery);
          const buySnapshot = await get(buyQuery);
          const productSnapshot = await get(productQuery);
          let sdata = [],
            bdata = [],
            pdata = [];
          let buySum = 0,
            productSum = 0,
            statementSum = 0;
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
            transactionCount: statementSum / 1500000,
            buyCount: buySum,
            productCount: productSum,
          });
        }
        setSendData({
          Requester_ID: admin.userInfo.email,
          Requester_Status: "Илгээсэн",
          Requester_Avatar: admin.userInfo.photoURL,
          Approver2_TimeStamps: null,
          Approver2_ID: "",
          Approver2_Status: "Шийдвэрлэж байна",
          Approver2_Avatar: "",
          Approver2_Major: "санхүү",
          Approver2_Comment: "",
          Version: 2,
        });
      } else if (
        ["Уригч солих", "Спонсор солих", "Бусад"].includes(e.target.value)
      ) {
        setUserList([
          {
            oldID: "",
            oldLastName:
              e.target.value === "Овог солих" ? fetchedResults[0].lastName : "",
            oldFirstName:
              e.target.value === "Нэр солих" ? fetchedResults[0].firstName : "",
            oldBankName:
              e.target.value === "Дансны дугаар солих"
                ? fetchedResults[0].bankName
                : "",
            oldBankNumber:
              e.target.value === "Дансны дугаар солих"
                ? fetchedResults[0].accountNumber
                : "",
            newID: "",
            newLastName: "",
            newFirstName: "",
            newBankName: "",
            newBankNumber: "",
            productName: "",
            productNumber: "",
            count: "",
            ebarimt: "",
          },
        ]);
        setSendData({
          Requester_ID: admin.userInfo.email,
          Requester_Status: "Илгээсэн",
          Requester_Avatar: admin.userInfo.photoURL,
          Requester_Comment: comment,
          Approver1_TimeStamps: null,
          Approver1_ID: "",
          Approver1_Status: "Шийдвэрлэж байна",
          Approver1_Avatar: "",
          Approver1_Major: "cs менежер",
          Approver1_Comment: "",
          Approver3_TimeStamps: null,
          Approver3_ID: "",
          Approver3_Status: "Хүлээгдэж байна",
          Approver3_Avatar: "",
          Approver3_Major: "систем",
          Approver3_Comment: "",
          Version: 3,
        });
      } else if (["Буцаалт хийх"].includes(e.target.value)) {
        const statementRef = ref(db, "statements");
        const buyRef = ref(db, "userInfo");
        const ebarimtRef = ref(db, "ebarimt");
        const productRef = ref(db, "productdelivery");
        const statementQuery = query(
          statementRef,
          orderByChild("memberId"),
          equalTo(Number(ID))
        );
        const buyQuery = query(
          buyRef,
          orderByChild("MemberId"),
          equalTo(Number(ID))
        );
        const productQuery = query(productRef, orderByChild("ID"), equalTo(ID));
        const ebarimtQuery = query(ebarimtRef, orderByChild("ID"), equalTo(ID));

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
        // fourth version cs --> system --> finance --> director --> system
        setSendData({
          Requester_ID: admin.userInfo.email,
          Requester_Status: "Илгээсэн",
          Requester_Avatar: admin.userInfo.photoURL,
          Approver1_ID: "",
          Approver1_TimeStamps: null,
          Approver1_Status: "Шийдвэрлэж байна",
          Approver1_Avatar: "",
          Approver1_Major: "cs менежер",
          Approver1_Comment: "",
          Approver2_ID: "",
          Approver2_TimeStamps: null,
          Approver2_Status: "Хүлээгдэж байна",
          Approver2_Avatar: "",
          Approver2_Major: "санхүү",
          Approver2_Comment: "",
          Approver3_ID: "",
          Approver3_TimeStamps: null,
          Approver3_Status: "Хүлээгдэж байна",
          Approver3_Avatar: "",
          Approver3_Major: "систем",
          Approver3_Comment: "",
        });
      } else {
        setUserList([
          {
            oldID: "",
            oldLastName: "",
            oldFirstName: "",
            oldBankName: "",
            oldBankNumber: "",
            newID: "",
            newLastName: "",
            newFirstName: "",
            newBankName: "",
            newBankNumber: "",
            productName: "",
            productNumber: "",
            count: "",
            ebarimt: "",
          },
        ]);
      }
      setSelectedApprovalType(e.target.value);

      AuthStore.update((store) => {
        store.loading = false;
      });
    } catch (error) {
      console.log(error);
    } finally {
      AuthStore.update((store) => {
        store.loading = false;
      });
    }
  };
  
  const handleUserAdd = () => {
    setUserList([
      ...userList,
      {
        oldID: "",
        oldName: "",
        newID: "",
        newName: "",
        oldBankName: "",
        oldBankNumber: "",
        newBankName: "",
        newBankNumber: "",
        productName: "",
        productPrice:"",
        productNumber: "",
        count: "",
        ebarimt: "",
        calc: "",
        bonusCalc: "",
      },
    ]);
  };

  const handleUserRemove = (index) => {
    const list = [...userList];
    list.splice(index, 1);
    setUserList(list);
  };

  const handleUserChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...userList];
    list[index][name] = value;
    setUserList(list);
    setValid(validation);
  };

  const validation = () => {
    if (!Object.keys(memberInfo).length) {
      setValid(false);
      return isValid;
    } else if (!selectedApprovalType) {
      setValid(false);
      return isValid;
    }

    setValid(true);
    return isValid;
  };

  const handleSubmit = async (e, index) => {
    if (!validation) {
      AuthStore.update((store) => {
        store.actionText.title = "Амжилтгүй боллоо";
        store.actionText.body = "Мэдээллийг бүрэн бөглөнө үү.";
        store.actionText.status = true;
      });
    } else {
      const TimeStamps = Date.now();

      let sent = {
        ...sendData,
        Requester_TimeStamps: TimeStamps,
        Requester_Major: "cs",
        Requester_Comment: comment,
        Level: 2,
        Status: "Шийдвэрлэж байна",
        TimeStamps: TimeStamps,
        Name: `${memberInfo.lastName}${memberInfo.firstName}`,
        ID,
        ApprovalType: selectedApprovalType,
        Extra: userList,
      };
      console.log("sent", sent);
      AuthStore.update((store) => {
        store.loading = true;
      });

      try {
        const result = await addPost(`request/`, sent);
        result.success &&
          AuthStore.update((store) => {
            store.actionText.title = "Амжилттай";
            store.actionText.body =
              "Таны илгээсэн мэдээллийг амжилттай бүртгэлээ.";
            store.actionText.status = true;
          });
      } catch (error) {
        AuthStore.update((store) => {
          store.actionText.title = "Таны хүсэлт амжилтгүй боллоо";
          store.actionText.body = error;
          store.actionText.status = true;
        });
      } finally {
        AuthStore.update((store) => {
          store.loading = false;
        });
        setOpen(!open);
        setID("");
        setComment("");
        setSelectedApprovalType("");
        setSummary({});
      }
    }
  };

  const numberWithCommas = (x) => {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
    return x;
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        fullScreen
        open={open}
        onClose={() => {
          setOpen(!open);
          resetAllStates();
        }}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => {
                setOpen(false);
                resetAllStates();
              }}
              aria-label="close"
            >
              <CloseIcon sx={{ color: "inherit" }} />
            </IconButton>
            <Typography
              sx={{ ml: 2, flex: 1 }}
              variant="h6"
              component="div"
              color="inherit"
            >
              Шинэ хүсэлт
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            display: "flex",
            margin: 5,
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <FormControl>
              <Grid container spacing={1}>
                <Grid
                  size={{ xs: 12 }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                >
                  <Grid flexDirection="column" size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      id="search-type"
                      label="ID хайх..."
                      value={ID}
                      onChange={(e) => setID(e.target.value)}
                      type="number"
                      sx={{ marginBottom: 2 }}
                    />
                    <TextField
                      fullWidth
                      id="Select-approval-type"
                      select
                      label="Хүсэлтийн төрөл"
                      value={selectedApprovalType}
                      onChange={(e) => {
                        !ID.length
                          ? alert("Та утасны дугаарыг оруулна уу.")
                          : ID.length !== 8
                          ? alert(
                              "Та утасны дугаараа зөв оруулсан эсэхийг шалгана уу."
                            )
                          : handleSearch(e, ID);
                      }}
                    >
                      {RequestType.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  {/* <Box sx={{ position: "relative", marginLeft: 2 }}>
                    <Fab
                      aria-label="save"
                      color="primary"
                      onClick={handleSearch}
                    >
                      <SearchIcon />
                    </Fab>
                    {loading && (
                      <CircularProgress
                        size={68}
                        sx={{
                          color: grey[500],
                          position: "absolute",
                          top: -6,
                          left: -6,
                          zIndex: 1,
                        }}
                      />
                    )}
                  </Box> */}
                </Grid>
              </Grid>
              <Grid container spacing={1}>
                {selectedApprovalType === "Уригч солих" && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Grid
                        size={{ md: 12 }}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-around",
                        }}
                      >
                        <Typography
                          sx={{
                            textAlign: "center",
                            color: "primary.main",
                            margin: 1,
                          }}
                        >
                          Хуучин уригч
                        </Typography>
                        <Typography
                          sx={{
                            textAlign: "center",
                            color: "primary.main",
                            margin: 1,
                          }}
                        >
                          Шинэ уригч
                        </Typography>
                      </Grid>
                      {userList.map((singleUser, index) => (
                        <Grid
                          key={index}
                          size={{ xs: 12 }}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {/* Хуучин уригч ID */}
                          <Grid
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <TextField
                              fullWidth
                              name="oldID"
                              label="ID"
                              type="number"
                              value={singleUser.oldID}
                              onChange={(e) => handleUserChange(e, index)}
                              required
                            />
                            <TextField
                              fullWidth
                              name="oldName"
                              label="Нэр"
                              value={singleUser.oldName}
                              onChange={(e) => handleUserChange(e, index)}
                              required
                            />
                          </Grid>
                          {userList.length - 1 === index ? (
                            <Box sx={{ position: "relative" }}>
                              <Fab
                                aria-label="save"
                                color="primary"
                                size="small"
                                sx={{ margin: 1 }}
                                onClick={handleUserAdd}
                              >
                                <AddIcon />
                              </Fab>
                            </Box>
                          ) : (
                            <Box sx={{ position: "relative" }}>
                              <Fab
                                aria-label="save"
                                color="error"
                                size="small"
                                sx={{ margin: 1 }}
                                onClick={() => handleUserRemove(index)}
                              >
                                <RemoveIcon />
                              </Fab>
                            </Box>
                          )}
                          {/* Хуучин уригч ID */}
                          <Grid
                            item
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <TextField
                              fullWidth
                              name="newID"
                              label="ID"
                              type="number"
                              value={singleUser.newID}
                              onChange={(e) => handleUserChange(e, index)}
                              required
                            />
                            <TextField
                              fullWidth
                              name="newName"
                              label="Нэр"
                              value={singleUser.newName}
                              onChange={(e) => handleUserChange(e, index)}
                              required
                            />
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid container spacing={1}>
                {selectedApprovalType === "Спонсор солих" && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Grid
                        item
                        md={12}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-around",
                        }}
                      >
                        <Typography
                          sx={{
                            textAlign: "center",
                            color: "primary.main",
                            margin: 1,
                          }}
                        >
                          Хуучин спонсор
                        </Typography>
                        <Typography
                          sx={{
                            textAlign: "center",
                            color: "primary.main",
                            margin: 1,
                          }}
                        >
                          Шинэ спонсор
                        </Typography>
                      </Grid>
                      {userList.map((singleUser, index) => (
                        <Grid
                          item
                          key={index}
                          xs={12}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {/* Хуучин уригч ID */}
                          <Grid
                            item
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <TextField
                              fullWidth
                              name="oldID"
                              label="ID"
                              type="number"
                              value={singleUser.oldID}
                              onChange={(e) => handleUserChange(e, index)}
                              required
                            />
                            <TextField
                              fullWidth
                              name="oldName"
                              label="Нэр"
                              value={singleUser.oldName}
                              onChange={(e) => handleUserChange(e, index)}
                              required
                            />
                          </Grid>
                          {userList.length - 1 === index ? (
                            <Box sx={{ position: "relative" }}>
                              <Fab
                                aria-label="save"
                                color="primary"
                                size="small"
                                sx={{ margin: 1 }}
                                onClick={handleUserAdd}
                              >
                                <AddIcon />
                              </Fab>
                            </Box>
                          ) : (
                            <Box sx={{ position: "relative" }}>
                              <Fab
                                aria-label="save"
                                color="error"
                                size="small"
                                sx={{ margin: 1 }}
                                onClick={() => handleUserRemove(index)}
                              >
                                <RemoveIcon />
                              </Fab>
                            </Box>
                          )}
                          {/* Хуучин уригч ID */}
                          <Grid
                            item
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <TextField
                              fullWidth
                              name="newID"
                              label="ID"
                              type="number"
                              value={singleUser.newID}
                              onChange={(e) => handleUserChange(e, index)}
                              required
                            />
                            <TextField
                              fullWidth
                              name="newName"
                              label="Нэр"
                              value={singleUser.newName}
                              onChange={(e) => handleUserChange(e, index)}
                              required
                            />
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid container spacing={1}>
                {selectedApprovalType === "Дансны дугаар солих" && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Grid
                        item
                        md={12}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-around",
                        }}
                      >
                        <Typography
                          sx={{
                            textAlign: "center",
                            color: "primary.main",
                            margin: 1,
                          }}
                        >
                          Хуучин банк
                        </Typography>
                        <Typography
                          sx={{
                            textAlign: "center",
                            color: "primary.main",
                            margin: 1,
                          }}
                        >
                          Шинэ банк
                        </Typography>
                      </Grid>
                      {userList.map((singleUser, index) => (
                        <Grid
                          item
                          key={index}
                          xs={12}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {/* Хуучин уригч ID */}
                          <Grid item sx={{ flexDirection: "column" }}>
                            <TextField
                              fullWidth
                              name="oldBankName"
                              label="Банкны нэр"
                              value={singleUser.oldBankName || ""}
                            />
                            <TextField
                              fullWidth
                              name="oldBankNumber"
                              label="Дансны дугаар"
                              type="number"
                              value={singleUser.oldBankNumber}
                              onChange={(e) => handleUserChange(e, index)}
                              required
                            />
                          </Grid>
                          {userList.length - 1 === index ? (
                            <Box sx={{ position: "relative" }}>
                              <Fab
                                aria-label="save"
                                color="primary"
                                size="small"
                                sx={{ margin: 1 }}
                                onClick={handleUserAdd}
                              >
                                <AddIcon />
                              </Fab>
                            </Box>
                          ) : (
                            <Box sx={{ position: "relative" }}>
                              <Fab
                                aria-label="save"
                                color="error"
                                size="small"
                                sx={{ margin: 1 }}
                                onClick={() => handleUserRemove(index)}
                              >
                                <RemoveIcon />
                              </Fab>
                            </Box>
                          )}
                          {/* Хуучин уригч ID */}
                          <Grid item sx={{ flexDirection: "column" }}>
                            <TextField
                              fullWidth
                              name="newBankName"
                              label="Банкны нэр"
                              select
                              value={singleUser.newBankName}
                              onChange={(e) => handleUserChange(e, index)}
                              required
                            >
                              {BankList.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </TextField>
                            <TextField
                              fullWidth
                              name="newBankNumber"
                              label="Дансны дугаар"
                              type="number"
                              value={singleUser.newBankNumber}
                              onChange={(e) => handleUserChange(e, index)}
                              required
                            />
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid container spacing={1} sx={{ marginTop: 1 }}>
                {selectedApprovalType === "Овог солих" && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      {userList.map((singleUser, index) => (
                        <Grid
                          item
                          key={index}
                          xs={12}
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          {/* Хуучин уригч ID */}
                          <TextField
                            fullWidth
                            name="oldLastName"
                            label="Хуучин овог"
                            value={singleUser.oldLastName}
                            onChange={(e) => handleUserChange(e, index)}
                            required
                          />
                          <TextField
                            fullWidth
                            name="newLastName"
                            label="Шинэ овог"
                            value={singleUser.newLastName}
                            onChange={(e) => handleUserChange(e, index)}
                            sx={{ marginLeft: 1 }}
                            required
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid container spacing={1} sx={{ marginTop: 1 }}>
                {selectedApprovalType === "Нэр солих" && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      {userList.map((singleUser, index) => (
                        <Grid
                          item
                          key={index}
                          xs={12}
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          {/* Хуучин уригч ID */}
                          <TextField
                            fullWidth
                            name="oldFirstName"
                            label="Хуучин нэр"
                            value={singleUser.oldFirstName}
                            onChange={(e) => handleUserChange(e, index)}
                            required
                          />
                          <TextField
                            fullWidth
                            name="newFirstName"
                            label="Шинэ нэр"
                            value={singleUser.newFirstName}
                            onChange={(e) => handleUserChange(e, index)}
                            sx={{ marginLeft: 1 }}
                            required
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid container spacing={1} sx={{ marginTop: 1 }}>
                {selectedApprovalType ===
                  "Худалдан авалт хийж болохгүй байгаа" && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      {userList.map((singleUser, index) => (
                        <Grid
                          item
                          key={index}
                          xs={12}
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <TextField
                            fullWidth
                            name="count"
                            label="Дүн"
                            type="number"
                            value={singleUser.count}
                            onChange={(e) => handleUserChange(e, index)}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₮
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid
                container
                spacing={1}
                columnSpacing={{ xs: 2, sm: 2, md: 3 }}
                sx={{ marginTop: 1 }}
              >
                {selectedApprovalType === "Буцаалт хийх" && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      {userList.map((singleUser, index) => (
                        <div key={index}>
                          <TextField
                            fullWidth
                            name="calc"
                            label="Бодолт"
                            type="number"
                            disabled={admin.userInfo.userRoles !== "finance"}
                            value={singleUser.calc}
                            required
                            onChange={(e) => handleUserChange(e, index)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₮
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            name="bonusCalc"
                            label="Бонус бодолт"
                            type="number"
                            disabled={admin.userInfo.userRoles !== "finance"}
                            value={singleUser.bonusCalc}
                            required
                            onChange={(e) => handleUserChange(e, index)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₮
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              marginTop: 2,
                            }}
                          />
                        </div>
                      ))}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} sx={{ marginBottom: 2 }}>
                      <Typography variant="body2" align="center">
                        Гишүүний мэдээлэл
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} justifyContent="center">
                      <Box>
                        <Accordion>
                          <AccordionSummary
                            aria-controls="panel1-content"
                            id="panel11554564-header"
                          >
                            <Typography variant="body2">
                              Овог нэр:{" "}
                              <strong>
                                {Object.keys(memberInfo).length === 0
                                  ? ""
                                  : `${memberInfo.lastName} ${memberInfo.firstName}`}
                              </strong>
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
                                  summary.transactionCount -
                                    summary.ebarimtCount
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
                                    {index < ebarimtData.length - 1 && (
                                      <Divider />
                                    )}
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
                                    {index < ebarimtData.length - 1 && (
                                      <Divider />
                                    )}
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
                              <strong>
                                {numberWithCommas(summary.buyCount)} ₮
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
                                    {index < ebarimtData.length - 1 && (
                                      <Divider />
                                    )}
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
                                            {transaction.accName}{" "}
                                            {transaction.accNum}
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
                                          {numberWithCommas(
                                            transaction.tranAmount
                                          )}
                                          ₮{" "}
                                        </Typography>
                                      </Typography>
                                    </ListItem>
                                    {index < ebarimtData.length - 1 && (
                                      <Divider />
                                    )}
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid
                container
                spacing={1}
                columnSpacing={{ xs: 2, sm: 2, md: 3 }}
                sx={{ marginTop: 1 }}
              >
                {selectedApprovalType === "E-баримт олголт" && (
                  <>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      {userList.map((singleUser, index) => (
                        <TextField
                          key={index}
                          fullWidth
                          name="ebarimt"
                          label="Дүн"
                          type="number"
                          value={singleUser.ebarimt}
                          onChange={(e) => handleUserChange(e, index)}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                ₮
                              </InputAdornment>
                            ),
                          }}
                        />
                      ))}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} sx={{ marginBottom: 2 }}>
                      <Typography variant="body2" align="center">
                        Гишүүний мэдээлэл
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} justifyContent="center">
                      <Box>
                        <Accordion>
                          <AccordionSummary
                            aria-controls="panel1-content"
                            id="panel11554564-header"
                          >
                            <Typography variant="body2">
                              Овог нэр:{" "}
                              <strong>
                                {Object.keys(memberInfo).length === 0
                                  ? ""
                                  : `${memberInfo.lastName} ${memberInfo.firstName}`}
                              </strong>
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
                                  summary.transactionCount -
                                    summary.ebarimtCount
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
                                    {index < ebarimtData.length - 1 && (
                                      <Divider />
                                    )}
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
                              <strong>
                                {numberWithCommas(summary.buyCount)} ₮
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
                                    {index < ebarimtData.length - 1 && (
                                      <Divider />
                                    )}
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
                                            {transaction.accName}{" "}
                                            {transaction.accNum}
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
                                          {numberWithCommas(
                                            transaction.tranAmount
                                          )}
                                          ₮{" "}
                                        </Typography>
                                      </Typography>
                                    </ListItem>
                                    {index < ebarimtData.length - 1 && (
                                      <Divider />
                                    )}
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid container spacing={1} sx={{ marginTop: 1 }}>
                {selectedApprovalType === "Бүтээгдэхүүн олголт" && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      {userList.map((singleUser, index) => (
                        <div key={index}>
                          <TextField
                            fullWidth
                            name="productName"
                            label="Бүтээгдэхүүний нэр"
                            type="number"
                            select
                            defaultValue=""
                            value={singleUser.productName}
                            onChange={(e) => handleUserChange(e, index)}
                            required
                          >
                            {cardData.map((option) => (
                              <MenuItem key={option.title} value={option.title}>
                                {option.title} {option.amount}
                              </MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            fullWidth
                            name="productNumber"
                            label="Бүтээгдэхүүний тоо"
                            type="number"
                            value={singleUser.productNumber}
                            onChange={(e) => handleUserChange(e, index)}
                            required
                            sx={{ marginTop: 2 }}
                          />
                        </div>
                      ))}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} sx={{ marginBottom: 2 }}>
                      <Typography variant="body2" align="center">
                        Гишүүний мэдээлэл
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} justifyContent="center">
                      <Box>
                        <Accordion>
                          <AccordionSummary
                            aria-controls="panel1-content"
                            id="panel11554564-header"
                          >
                            <Typography variant="body2">
                              Овог нэр:{" "}
                              <strong>
                                {Object.keys(memberInfo).length === 0
                                  ? ""
                                  : `${memberInfo.lastName} ${memberInfo.firstName}`}
                              </strong>
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
                              Үлдсэн хэмжээ:{" "}
                              <strong>
                                {numberWithCommas(
                                  summary.transactionCount -
                                    summary.productCount
                                )}{" "}
                                ширхэг
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
                                    {index < ebarimtData.length - 1 && (
                                      <Divider />
                                    )}
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
                              Худалдаж авсан хэмжээ:{" "}
                              <strong>
                                {numberWithCommas(summary.buyCount)} ширхэг
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
                                    {index < ebarimtData.length - 1 && (
                                      <Divider />
                                    )}
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
                              Гүйлгээний хэмжээ:{" "}
                              <strong>
                                {numberWithCommas(summary.transactionCount)}{" "}
                                ширхэг
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
                                            {transaction.accName}{" "}
                                            {transaction.accNum}
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
                                          {numberWithCommas(
                                            transaction.tranAmount
                                          )}
                                          ₮{" "}
                                        </Typography>
                                      </Typography>
                                    </ListItem>
                                    {index < ebarimtData.length - 1 && (
                                      <Divider />
                                    )}
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid container spacing={1} sx={{ marginTop: 5 }}>
                {ID && selectedApprovalType && (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      id="multiline-comment"
                      label="Тайлбар"
                      multiline
                      rows={4}
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value);
                        validation();
                      }}
                      required
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <LoadingButton
                    fullWidth
                    disabled={!isValid}
                    loading={loading}
                    loadingIndicator="Loading…"
                    variant="contained"
                    value={comment}
                    onClick={handleSubmit}
                  >
                    <span>Submit</span>
                  </LoadingButton>
                </Grid>
              </Grid>
            </FormControl>
          </Box>
        </Box>
      </Dialog>
    </ThemeProvider>
  );
};

export default CreateApproval;
