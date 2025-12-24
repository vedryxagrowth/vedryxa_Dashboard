"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FilterOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  HistoryOutlined,
} from "@ant-design/icons";
import {
  Table,
  Tag,
  Button,
  Col,
  Card,
  Drawer,
  Dropdown,
  Flex,
  Input,
  Row,
  Select,
  Spin,
  Menu,
  Space,
  Modal,
  message,
  Switch,
  Tooltip,
  ConfigProvider,
  Skeleton,
  Tabs,
  Popconfirm,
  Checkbox
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  CloseOutlined,
  SwapRightOutlined,
  PlusOutlined,
  CopyOutlined,
  ExclamationCircleFilled,
  ReloadOutlined,
  LinkOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import CreateCampaignDrawer from "./camp-components/create_camapaign";
import CreateDraft from "./camp-components/CreateDraft";
import EditAllLevelDataDrawer from "./camp-components/EditAllLevelData";
import ViewDrawer from "./camp-components/view-campaign";
import EditMultipleAdsetCampaignDrawer from "./camp-components/editMultipleAdsetCampaign";
import CloneMultipleAdsetCampaignDrawer from "./camp-components/cloneMultipleAdsetsCampaign";
// import EditOnlyCampaignDrawer from './camp-components/EditCamp';
import EditCampaignDrawer1 from "./camp-components/EditCamp";
import axios from "axios";
import EditCampaignDrawer from "./camp-components/edit-campaign";
import { useTokenContext } from "../components/parent";
import Adsets from "./camp-components/Adsets";
import Editcampaign from "./camp-components/EditCampaign";
import Editcam from "./camp-components/EditCampaign";
import DuplicateCampaignDrawer from "./camp-components/Dupcampaign";
import { redirect } from "next/navigation";
import ExpandedRowContent from "./camp-components/expandcreatives";
import ExpandedAdsetsContent from "./camp-components/expandcreativesformultipleadsets";
import moment from "moment-timezone";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import StickyBox from "react-sticky-box";
import { FaClone, FaEye, FaPenToSquare, FaTrashCan, FaRegCommentDots } from "react-icons/fa6";
import { TiTickOutline, TiTimesOutline } from "react-icons/ti";
import { IoMdCreate } from "react-icons/io";

import { Token } from "aws-sdk";
const { RangePicker } = DatePicker;
// import { redirect } from 'next/navigation';

const App = () => {
  const { userdetails } = useTokenContext();
  console.log("useTokenContext", userdetails);

  if (!userdetails?.adAccounts) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <Flex align="center" gap="middle">
                <Spin size="large" />
            </Flex> */}
        <div style={{ padding: "24px" }}>
          <Skeleton active paragraph={{ rows: 20 }} />
        </div>
      </div>
    );
  }
  if (userdetails?.role === "Revenue_Partner") {
    redirect("/Dashboard");
  }
  const { adAccounts } = userdetails || {};
  const [hovered, setHovered] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [paginationSize, setPaginationSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [sendInputToApi, setSendInputToApi] = useState("");
  const [cdrawerVisible, setDrawerVisible] = useState(false);
  const [createNewDraft, setCreateNewDraft] = useState(false);
  const [dupdrawerVisible, setdupDrawerVisible] = useState(false);
  const [campaignData, setCampaignData] = useState([]);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [editOnlyDrawerVisible, setEditOnlyDrawerVisible] = useState(false);
  const [
    viewEditAllLevelDataDrawerVisible,
    setViewEditAllLevelDataDrawerVisible,
  ] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedOnlyEditData, setSelectedOnlyEditData] = useState(null);
  const [selectedEditAllLevelData, setSelectedEditAllLevelData] =
    useState(null);
  const [viewEditDrawerVisible, setViewEditDrawerVisible] = useState(false);
  const [selectedEditRowData, setSelectedEditRowData] = useState(null);
  const [EditcamapaignDrawerVisible, setEditcamapaignDrawerVisible] =
    useState(false);
  const [selectedEditCampaign, setselectedEditCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForMultipleAdsets, setLoadingForMultipleAdsets] = useState(false);
  const [draftsLoading, setDraftsLoading] = useState(true);
  const [draftsData, setDraftsData] = useState([]);
  const [adsetsdrawerVisible, setadsetsDrawerVisible] = useState(false);
  const [adsetcampaigndata, setadsetcampaigndata] = useState(null);
  const [duplicatenewcampaigns, setduplicatenewcampaigns] = useState(null);
  const [refrst, setRefrst] = useState(false);
  const [options, setOptions] = useState([]);
  const [createcamselectedacc, setcreatecamselectedacc] = useState("");
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedValue, setSelectedValue] = useState([]);
  const [valueOptions, setValueOptions] = useState([]);
  const [error, setError] = useState(false);
  const { theme } = useTokenContext();
  const [isOpen, setIsOpen] = useState(false); // State to track if dropdown is open
  const yesterday = dayjs().subtract(0, "day").format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(yesterday);
  const [selected, setSelected] = useState("Choose Option");
  const [deleteDraftId, setDeleteDraftId] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedDraftToEdit, setSelecetedDraftToEdit] = useState({});
  const [multipleAdsetCampaignData, setMultipleAdsetCampaignData] = useState(
    []
  );
  var token = localStorage.getItem("token")
  const [networksWithStatus, setNetworksWithStatus] = useState([]);
  const [activeTab, setActiveTab] = useState("2");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState("all");
  const [selectedEditMultipleAdsetData, setSelectedEditMultipleAdsetData] =
    useState(null);
  const [selectedCloneMultipleAdsetData, setSelectedCloneMultipleAdsetData] =
    useState(null);
  const [
    viewEditMultipleAdsetDataDrawerVisible,
    setViewEditMultipleAdsetDataDrawerVisible,
  ] = useState(false);
  const [
    viewCloneMultipleAdsetDataDrawerVisible,
    setViewCloneMultipleAdsetDataDrawerVisible,
  ] = useState(false);
  const [view, setView] = useState(false);
  const [accountChanged, setAccountChanged] = useState(false);
  const [comment, setComment] = useState("");
  const [isModalVisibles, setIsModalVisibles] = useState(false);
  const [firstColumnValue, setFirstColumnValue] = useState("");
  const [universalOject, setUniversalOject] = useState({});
  const [launcherComments, setLauncherComments] = useState([]);
  const [isModalVisiblesForBulkComments, setIsModalVisiblesForBulkComments] = useState(false);
  const [checkedRowIds, setCheckedRowIds] = useState([]);
  const [checkedRowRecords, setCheckedRowRecords] = useState([]);
  const [commentForBulkComments, setCommentForBulkComments] = useState("");

  console.log(checkedRowRecords);

  // const [isOpen, setIsOpen] = useState(false);
  const onStatusFilterChange = (key) => {
    setCampaignStatusFilter(key);
  };


  useEffect(() => {
    const fetchNetworksData = async () => {
      try {
        const res = await axios.get('https://prodapis.adsgoat.in/get/networksData/', {
          headers: {
            Authorization: token,

          }
        });
        setNetworksWithStatus(res.data);
      } catch (error) {
        console.error('Error to fetching networksData:', error);
      }
    };
    fetchNetworksData();
  }, []);
  const getFilteredSingleCampaigns = () => {
    return campaignData.filter((campaign) => {
      if (campaignStatusFilter === "active") {
        return campaign.Status === "ACTIVE" && campaign.Approval === "Approved";
      }
      if (campaignStatusFilter === "pause") {
        return campaign.Status === "PAUSED" && campaign.Approval === "Approved";
      }
      if (campaignStatusFilter === "pending") {
        return campaign.Approval === "PENDING_APPROVAL";
      }
      return true;
    });
  };

  const getFilteredMultipleAdsetCampaigns = () => {
    return multipleAdsetCampaignData.filter((campaign) => {
      if (campaignStatusFilter === "active") {
        return campaign.Status === "ACTIVE" && campaign.Approval === "Approved";
      }
      if (campaignStatusFilter === "pause") {
        return campaign.Status === "PAUSED" && campaign.Approval === "Approved";
      }
      if (campaignStatusFilter === "pending") {
        return campaign.Approval === "PENDING_APPROVAL";
      }
      return true;
    });
  };

  const gridThemeClass =
    theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine";
  console.log(selectedKey, "selectedKeyselectedKeyselectedKey");

  // const [selectedAccount, setSelectedAccount] = useState('All');
  const restrictedEmails = [
    "creatives@adsgoat.in",
    "mnetadmin@winkleads.com",
    "creativeteam@winkleads.com",
    "shravan.k@winkleads.com",
    "abhynay.k@winkleads.com",
  ];

  const rangePresets = [
    {
      label: "ALL",
      value: [dayjs().startOf("year"), dayjs()],
    },
    {
      label: "Today",
      value: [dayjs(), dayjs()],
    },
    {
      label: "Yesterday",
      value: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
    },
    {
      label: "Last 7 Days",
      value: [dayjs().subtract(7, "day"), dayjs()],
    },
    {
      label: "Last 14 Days",
      value: [dayjs().subtract(14, "day"), dayjs()],
    },
    {
      label: "Last 30 Days",
      value: [dayjs().subtract(30, "day"), dayjs()],
    },
    {
      label: "Last 60 Days",
      value: [dayjs().subtract(60, "day"), dayjs()],
    },
    {
      label: "Last 90 Days",
      value: [dayjs().subtract(90, "day"), dayjs()],
    },
    {
      label: "This Month",
      value: [dayjs().startOf("month"), dayjs()],
    },
    {
      label: "Last Month",
      value: [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
  ];

  const userPickedRef = useRef(false);

  // Function to disable future dates
  const disabledDate = (current) => {
    return current && current > dayjs().endOf("day");
  };

  const handleTabChange = (key) => {
    // console.log("Switched to Tab:", key); // Debugging log
    setActiveTab(key);
  };

  // Function to handle click on campaign name
  const handleCampaignNameClick = (record) => {
    setadsetcampaigndata(record);
    console.log(record, "adsets data");
    setadsetsDrawerVisible(true);
  };

  const changeRRefrst = () => {
    // alert("hey rerendering")
    setRefrst((els) => !els);
  };

  const changeDraftRefresh = () => {
    setDraftsLoading(true);
  };

  // console.log("localStorage", localStorage.getItem("token"))
  // var token = localStorage.getItem("token");

  const handleViewClick = (record) => {
    console.log(record, "viewdata campaign");
    setSelectedRowData(record);
    setViewDrawerVisible(true);
  };

  const handleEditOnlyClick = (record) => {
    console.log(record, "viewdata campaign");
    setSelectedOnlyEditData(record);
    setEditOnlyDrawerVisible(true);
  };

  const handleEditClickAllLevelData = (record) => {
    // console.log(record, "viewdata campaign")
    setSelectedEditAllLevelData(record);
    setViewEditAllLevelDataDrawerVisible(true);
  };
  // const handleEditClick = (record) => {
  //     console.log(record, "Editdata")
  //     setSelectedEditRowData(record);
  //     setViewEditDrawerVisible(true);
  // };
  // const handleEditcampaign = (record) => {
  //     console.log(record, "Editcamapaign")
  //     setselectedEditCampaign(record);
  //     setEditcamapaignDrawerVisible(true);
  // }

  const accountsForAccess = adAccounts[selectedKey];
  // console.log(accountsForAccess, "accounts Access");

  const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;


  const items = [
    // { key: "1", label: "Old", content: "Content for Live data" },
    { key: "2", label: "New", content: "Content for Daily data" },
  ];

  const handleCarouselChange = (index) => {
    setActiveTab(index);
  };

  const renderCarouselNav = () => (
    <StickyBox
      offsetTop={64}
      offsetBottom={20}
      style={{
        zIndex: 1,
        padding: "10px",
        marginBottom: "5px",
        marginLeft: "5px",
        paddingLeft: "5px",
        borderRadius: 12,
        // backgroundColor: theme === "dark" ? "#1E1E1E" : "#e6e6e6",
        padding: 3,
        //   boxShadow:
        //     theme === "dark"
        //       ? "0 1px 3px rgba(0,0,0,0.6)"
        //       : "0 1px 6px rgba(0,0,0,0.08)",
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={handleCarouselChange}
        items={items.map((item) => ({
          key: item.key,
          // label: item.label,
          label: (
            <Tooltip
              title={
                item.key === "1"
                  ? "Campaigns Before 11-08-2025"
                  : "Campaigns After 11-08-2025"
              }
              placement="top"
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <span>{item.label}</span>
            </Tooltip>
          ),
        }))}
        className={`left-pill-tabs ${theme === "dark" ? "pill-tabs-dark" : "pill-tabs-light"
          }`}
        style={{
          backgroundColor: "transparent",
          padding: "0",
          marginBottom: "0",
        }}
        tabBarStyle={{
          fontSize: "12px",
          padding: "0",
          height: "30px",
          lineHeight: "30px",
          marginBottom: "-1px",
          borderBottom: "none",
        }}
      />
    </StickyBox>
  );

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const showCreateNewDraftDrawer = () => {
    setCreateNewDraft(true);
    setSelecetedDraftToEdit({}); // Reset selected draft to edit
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
    setadsetsDrawerVisible(false);
    setEditcamapaignDrawerVisible(false);
    setdupDrawerVisible(false);
    setViewEditAllLevelDataDrawerVisible(false);
    setCreateNewDraft(false);
    setViewEditMultipleAdsetDataDrawerVisible(false);
    setViewCloneMultipleAdsetDataDrawerVisible(false);
  };

  useEffect(() => {
    if (userdetails?.adAccounts) {
      const adAccountOptions = Object.keys(userdetails?.adAccounts).map(
        (key) => ({
          value: key,
          label: key,
        })
      );
      setOptions(adAccountOptions);
    }
  }, []);

  // Populate value options in the second dropdown based on selected key
  // useEffect(() => {
  //     if (userdetails) {
  //         const values = userdetails?.adAccounts[selectedKey] || [];
  //         setValueOptions(values.map(value => ({
  //             value,
  //             label: value
  //         })));
  //     } else {
  //         setValueOptions([]);
  //     }
  // }, [selectedKey]);
  useEffect(() => {
    if (selectedKey && userdetails?.adAccounts) {
      // Mapping over the accounts based on the selected key
      const accountNumbers = userdetails.adAccounts[selectedKey]?.map(
        (account) => ({
          value: account.accountNumber, // Set value as accountNumber
          label: account.accountNumber, // Set label as accountNumber
          accountName: account.accountName, // Include accountName for conditional rendering
          status: account.status,
        })
      );
      setValueOptions(accountNumbers); // Update valueOptions with account numbers
    } else {
      setValueOptions([]);
    }
  }, [selectedKey, userdetails]);

  // Fetch campaign data based on selected value
  // const fetchData = async (accountNumber = null) => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //         const response = await axios.get(`https://www.testapi.adsgoat.in/api/getFormData?accountNumber=${accountNumber}`, {
  //             headers: {
  //                 'Authorization': localStorage.getItem("token"),
  //             }
  //         });
  //         const allCampaigns = response?.data;

  //         // Filter campaigns based on selected value && accountNumber !== 'All'
  //         const filteredCampaignData = accountNumber
  //             ? allCampaigns.filter(campaign => cam/api/getpaign.Account_Number === accountNumber)
  //             : allCampaigns.filter(campaign => userdetails?.adAccounts[selectedKey]?.includes(campaign.Account_Number));

  //         setcreatecamselectedacc(accountNumber)

  //         setCampaignData(filteredCampaignData);
  //     } catch (error) {
  //         console.error("Error fetching campaign list:", error);
  //         setError("Failed to fetch campaign data.");
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  const fetchData = async (
    accountNumber = null,
    start = startDate,
    end = endDate,
    search = ""
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Construct URL with optional startDate and endDate
      //https://www.testapi.adsgoat.in
      let url = `https://www.testapi.adsgoat.in/api/getFormData?accountNumber=${accountNumber}&network=${selectedKey}`;

      if (start && end) {
        url += `&startDate=${start}&endDate=${end}`;
      }
      if (search) {
        url += `&searchInput=${search}`; // Append search input if provided
      }
      console.log("Fetching data from URL:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      const allCampaigns = response?.data;

      // Filter campaigns based on selected value && accountNumber !== 'All'
      const filteredCampaignData = accountNumber
        ? allCampaigns.filter(
          (campaign) => campaign.Account_Number === accountNumber
        )
        : allCampaigns.filter((campaign) =>
          userdetails?.adAccounts[selectedKey]?.includes(
            campaign.Account_Number
          )
        );

      setcreatecamselectedacc(accountNumber);

      setCampaignData(allCampaigns);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      setError("Failed to fetch campaign data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMultipleAdsetCampaigns = async (
    accountNumber = null,
    start = startDate,
    end = endDate,
    search = ""
  ) => {
    setLoadingForMultipleAdsets(true);
    setError(null);
    try {
      // Construct URL with optional startDate and endDate
      //https://www.testapi.adsgoat.in
      // let url = `https://www.testapi.adsgoat.in/api/getFormData?accountNumber=${accountNumber}&network=${selectedKey}`;
      let url = `https://www.testapi.adsgoat.in/api/newGetFormData?accountNumber=${accountNumber}&network=${selectedKey}`;
      if (start && end) {
        url += `&startDate=${start}&endDate=${end}`;
      }
      if (search) {
        url += `&searchInput=${search}`; // Append search input if provided
      }
      console.log("Fetching data from URL:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      const allCampaigns = response?.data;

      console.log(allCampaigns, "all multiple adset campaigns");

      // Filter campaigns based on selected value && accountNumber !== 'All'
      const filteredCampaignData = accountNumber
        ? allCampaigns.filter(
          (campaign) => campaign.Account_Number === accountNumber
        )
        : allCampaigns.filter((campaign) =>
          userdetails?.adAccounts[selectedKey]?.includes(
            campaign.Account_Number
          )
        );

      setcreatecamselectedacc(accountNumber);

      console.log(filteredCampaignData, "multiple adset campaigns");

      // setMultipleAdsetCampaignData(filteredCampaignData);
      setMultipleAdsetCampaignData(allCampaigns);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      setError("Failed to fetch campaign data.");
    } finally {
      setLoadingForMultipleAdsets(false);
    }
  };

  const fetchLauncherComments = async (
    accountNumber = null,
  ) => {
    // setLoadingForMultipleAdsets(true);
    // setError(null);
    try {
      // Construct URL with optional startDate and endDate
      //https://www.testapi.adsgoat.in
      // let url = `https://www.testapi.adsgoat.in/api/getFormData?accountNumber=${accountNumber}&network=${selectedKey}`;
      // let url = `https://www.testapi.adsgoat.in/api/newGetFormData?accountNumber=${accountNumber}&network=${selectedKey}`;
      // if (start && end) {
      //   url += `&startDate=${start}&endDate=${end}`;
      // }
      // if (search) {
      //   url += `&searchInput=${search}`; // Append search input if provided
      // }
      // console.log("Fetching data from URL:", url);
      const url = `https://www.testapi.adsgoat.in/api/GetCommentsForCampaignLauncher?accountNumber=${accountNumber}`

      const response = await axios.get(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      const allCampaigns = response?.data;

      console.log(allCampaigns, "all multiple adset campaigns");
      setLauncherComments(allCampaigns);

      // console.log(filteredCampaignData, "multiple adset campaigns");

      // // setMultipleAdsetCampaignData(filteredCampaignData);
      // setMultipleAdsetCampaignData(allCampaigns);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      setError("Failed to fetch campaign data.");
    }
  };

  const fetchDrafts = async () => {
    setDraftsLoading(true);
    // setError(null);
    try {
      //https://www.testapi.adsgoat.in
      const response = await axios.get(
        `https://www.testapi.adsgoat.in/api/drafts?email=${userdetails?.email}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      const allDrafts = response?.data;

      // Filter drafts based on selected value && accountNumber !== 'All'
      // const filteredDraftsData = allDrafts.filter(draft => userdetails?.adAccounts[selectedKey]?.includes(draft.Account_Number));

      setDraftsData(allDrafts);
    } catch (error) {
      console.error("Error fetching draft data:", error);
      setError("Failed to fetch draft data.");
    }
  };

  // Handle date range change
  const handleChange = (dates) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      // const formattedStart = start.format("YYYY-MM-DD");
      // const formattedEnd = end.format("YYYY-MM-DD");

      // setStartDate(formattedStart);
      // setEndDate(formattedEnd);

      // if (selectedValue) {
      //   fetchData(selectedValue, formattedStart, formattedEnd);
      //   fetchMultipleAdsetCampaigns(
      //     selectedValue,
      //     formattedStart,
      //     formattedEnd
      //   );
      // }
      setStartDate(start.format("YYYY-MM-DD"));
      setEndDate(end.format("YYYY-MM-DD"));
    }
  };

  const allowFetchOnSelectRef = useRef(false);

  const handleKeyChange = (key) => {
    setSelectedKey(key);
    setSelectedValue([]);
  };

  const handleValueChange = (value) => {
    setSelectedValue(value);
    allowFetchOnSelectRef.current = false;
  };

  const handleApply = () => {
    if (selectedValue && startDate && endDate) {

      // fetchData(selectedValue, startDate, endDate);
      fetchLauncherComments(selectedValue)
      fetchMultipleAdsetCampaigns(selectedValue, startDate, endDate);
      setAccountChanged(false);

      allowFetchOnSelectRef.current = true;
    } else {
      message.warning("Please select project, account and date range");
    }
  };

  // useEffect(() => {
  //   if (!selectedValue || !startDate || !endDate) return;
  //   fetchData(selectedValue, startDate, endDate);
  // }, [refrst]);

  // useEffect(() => {
  //   if (!selectedValue || !startDate || !endDate) return;
  //   if (!allowFetchOnSelectRef.current) return;
  //   fetchData(selectedValue, startDate, endDate);

  //   allowFetchOnSelectRef.current = false;
  // }, [selectedValue]);

  useEffect(() => {
    if (!selectedValue || !startDate || !endDate) return;
    if (!allowFetchOnSelectRef.current) return;
    // fetchMultipleAdsetCampaigns(selectedValue, startDate, endDate);
    allowFetchOnSelectRef.current = false;
  }, [selectedValue]);
  useEffect(() => {
    if (!selectedValue || !startDate || !endDate) return;
    fetchLauncherComments(selectedValue);
    fetchMultipleAdsetCampaigns(selectedValue, startDate, endDate);
  }, [refrst]);

  // Handle value change
  // const handleValueChange = (value) => {
  //   setSelectedValue(value);
  //   // fetchData(value); // Fetch data based on selected value
  //   // fetchMultipleAdsetCampaigns(value); // Fetch multiple adset campaigns based on selected value
  // };
  // const handleApply = () => {
  //   if (selectedValue && startDate && endDate) {
  //     fetchData(selectedValue, startDate, endDate);
  //     fetchMultipleAdsetCampaigns(selectedValue, startDate, endDate);
  //   } else {
  //     message.warning({
  //       content: "Please select project, account and date range",
  //       className: theme === "dark" ? "dark-message" : ""
  //     });
  //   }
  // };

  // useEffect(() => {
  //   if (selectedValue) {
  //     fetchData(selectedValue);
  //   }
  // }, [refrst, selectedValue]);

  // useEffect(() => {
  //   if (selectedValue) {
  //     fetchMultipleAdsetCampaigns(selectedValue);
  //   }
  // }, [refrst, selectedValue]);

  useEffect(() => {
    if (draftsLoading) {
      fetchDrafts();
    }
  }, [draftsLoading]);
  const handleRefresh = () => {
    if (selectedValue) {
      // fetchData(selectedValue);
      fetchLauncherComments(selectedValue);
      fetchMultipleAdsetCampaigns(selectedValue);
    } // This will re-fetch the data or update the component
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPaginationSize(5);
      } else if (window.innerWidth < 2560) {
        setPaginationSize(15);
      } else {
        setPaginationSize(25);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchInput(searchValue);
    console.log("Search Input:", searchValue);
    if (!searchValue) {
      setSendInputToApi("");
      // fetchData(selectedValue, startDate, endDate, searchValue);
      fetchMultipleAdsetCampaigns(
        selectedValue,
        startDate,
        endDate,
        searchValue
      );
      console.log("Search Input is empty, resetting filtered data");
    }
    // const filtered = campaignData.filter((item) =>
    //     Object.values(item).some((field) =>
    //         typeof field === 'string' && field.toLowerCase().includes(searchValue)
    //     )
    // );
    // setFilteredData(filtered);
  };
  const handleSearchSubmit = () => {
    setSendInputToApi(searchInput);
    // fetchData(selectedValue, startDate, endDate, searchInput); // Fetch data with search input
    fetchMultipleAdsetCampaigns(selectedValue, startDate, endDate, searchInput); // Fetch multiple adset campaigns with search input
    console.log("Search Input:", searchInput);
    console.log("Selected Input:", searchInput.length);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [useaproval, setuseraproval] = useState(null);
  const [isModalVisibleForAdsets, setIsModalVisibleForAdsets] = useState(false);
  const [useaprovalForAdsets, setuseraprovalForAdsets] = useState(null);
  const [searchText, setSearchText] = useState("");

  const handleUpdateApproval = async (id, newApprovalValue) => {
    try {
      const response = await fetch(
        `https://www.testapi.adsgoat.in/api/updateApproval/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            Approval: newApprovalValue, // New approval value
            Approved: userdetails?.userName, // Username of the person who approved it
            datetime: moment()
              .tz("Asia/Kolkata")
              .format("YYYY-MM-DD HH:mm [IST]"), // Current datetime in IST
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setCampaignData((prevData) =>
          prevData.map((record) =>
            record.identifier === id
              ? { ...record, Approval: newApprovalValue }
              : record
          )
        );

        message.open({
          type: 'success',
          content: "Approval confirmed",
          className: theme === 'dark' ? 'dark-message' : '',
        });

        setIsModalVisible(false); // Close modal after updating
        changeRRefrst();
        // setTimeout(() => {
        //     window.location.reload();
        // }, 2000);
      } else {
        console.error("Failed to update approval");
        // Handle failure
      }
    } catch (error) {
      console.error("Error updating approval:", error);
      // Handle error
    }
  };

  const handleUpdateApprovalForAdsets = async (id, newApprovalValue) => {
    try {
      //https://www.testapi.adsgoat.in
      const response = await fetch(
        `https://www.testapi.adsgoat.in/api/newupdateApproval/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            Approval: newApprovalValue, // New approval value
            Approved: userdetails?.userName, // Username of the person who approved it
            datetime: moment()
              .tz("Asia/Kolkata")
              .format("YYYY-MM-DD HH:mm [IST]"), // Current datetime in IST
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setCampaignData((prevData) =>
          prevData.map((record) =>
            record.identifier === id
              ? { ...record, Approval: newApprovalValue }
              : record
          )
        );

        message.open({
          type: 'success',
          content: "Approval confirmed",
          className: theme === 'dark' ? 'dark-message' : '',
        });
        setIsModalVisible(false); // Close modal after updating
        changeRRefrst();
        // setTimeout(() => {
        //     window.location.reload();
        // }, 2000);
      } else {
        console.error("Failed to update approval");
        // Handle failure
      }
    } catch (error) {
      console.error("Error updating approval:", error);
      // Handle error
    }
  };

  const handleApproval = (record) => {
    console.log(record, "record");
    setuseraproval(record);
    setIsModalVisible(true);
  };

  const handleApprovalforAdsets = (record) => {
    console.log(record, "record");
    setuseraprovalForAdsets(record);
    setIsModalVisibleForAdsets(true);
  };

  const handleOk = async () => {
    try {
      // Call the handleUpdateApproval function with the appropriate parameters
      await handleUpdateApproval(useaproval.identifier, "Approved");
      // Log the message to the console
      console.log("Approval confirmed");
      // Close the modal
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error updating approval:", error);
      // Handle error
    }
  };

  const handleOkForAdsets = async () => {
    try {
      // Call the handleUpdateApproval function with the appropriate parameters
      await handleUpdateApprovalForAdsets(
        useaprovalForAdsets.identifier,
        "Approved"
      );
      // Log the message to the console
      console.log(userdetails?.role, "AAAAAApproval confirmed");

      if (userdetails?.role === "Network_Partner") {
        await onToggleStatusForMultipleAdsets(useaprovalForAdsets, "ACTIVE");
      }

      setIsModalVisibleForAdsets(false);
    } catch (error) {
      console.error("Error updating approval:", error);
      // Handle error
    }
  };

  const handleOkDeleteDraft = async () => {
    try {
      const response = await axios.delete(
        `https://www.testapi.adsgoat.in/api/drafts/${encodeURIComponent(
          userdetails.email
        )}/${deleteDraftId}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (response.status === 200) {
        message.success("Draft deleted successfully");
        setDeleteModalVisible(false);
        changeDraftRefresh();
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      message.error("Failed to delete draft");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const onToggleStatus = async (record, checked) => {
    try {
      const token = localStorage.getItem("token");
      console.log("hello siddu", record, checked);

      // Update status on your backend
      const backendResponse = await fetch(
        `https://www.testapi.adsgoat.in/api/status/${record?.identifier}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ Status: checked ? "ACTIVE" : "PAUSED" }),
        }
      );

      const responseData = await backendResponse.json();
      setCampaignData((prevCampaigns) =>
        prevCampaigns.map((campaign) =>
          campaign.identifier === record.identifier
            ? { ...campaign, Status: checked ? "ACTIVE" : "PAUSED" }
            : campaign
        )
      );
      console.log("Backend response status:", backendResponse.status);
      console.log("Backend response data:", responseData);

      if (backendResponse.ok) {
        // If campaignId is available, update the Facebook campaign status
        if (record.campaignid) {
          try {
            const fbResponse = await axios.post(
              `https://graph.facebook.com/v22.0/${record.campaignid}`,
              null,
              {
                params: {
                  status: checked ? "ACTIVE" : "PAUSED",
                  access_token: record.access_token,
                },
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("Facebook API response:", fbResponse.data);

            if (fbResponse.status === 200) {
              if (fbResponse.data?.success === true) {
                var mains = "Launched";
              } else {
                var mains = "PAUSE";
              }
              message.open({
                type: 'success',
                content: `Campaign ${checked ? "Launched" : "Paused"} Successfully`,
                className: theme === 'dark' ? 'dark-message' : '',
              });

              // Update the state to reflect the change in UI
              setCampaignData((prevCampaigns) =>
                prevCampaigns.map((campaign) =>
                  campaign.identifier === record.identifier
                    ? { ...campaign, Status: checked ? "ACTIVE" : "PAUSED" }
                    : campaign
                )
              );
            } else {
              console.error(
                "Failed to update facebook status:",
                fbResponse.data
              );
              message.error(
                `Failed to update facebook status: ${fbResponse.data.error.message}`
              );
            }
          } catch (fbError) {
            console.error("Error updating facebook status:", fbError);
            message.error(
              `Error updating facebook status: ${fbError.response?.data?.error?.message || fbError.message
              }`
            );
          }
        } else {
          // If no campaignId is available, only update the backend
          message.open({
            type: 'success',
            content: "Campaign launched successfully",
            className: theme === 'dark' ? 'dark-message' : '',
          });
          // Update the state to reflect the change in UI
          setCampaignData((prevCampaigns) =>
            prevCampaigns.map((campaign) =>
              campaign.identifier === record.identifier
                ? { ...campaign, Status: checked ? "ACTIVE" : "PAUSED" }
                : campaign
            )
          );
        }
      } else {
        console.error("Failed to update backend status:", responseData);
        message.error(
          `Failed to update status: ${responseData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Error updating status");
    }
  };

  const onToggleStatusForMultipleAdsets = async (record, checked) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Tokensssssssssssssssssssssssss:", token);

      // Update status on your backend https://www.testapi.adsgoat.in
      const backendResponse = await fetch(
        `https://www.testapi.adsgoat.in/api/newstatus/${record?.identifier}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ Status: checked ? "ACTIVE" : "PAUSED" }),
        }
      );

      const responseData = await backendResponse.json();
      setMultipleAdsetCampaignData((prevCampaigns) =>
        prevCampaigns.map((campaign) =>
          campaign.identifier === record.identifier
            ? { ...campaign, Status: checked ? "ACTIVE" : "PAUSED" }
            : campaign
        )
      );
      console.log("Backend response status:", backendResponse.status);
      console.log("Backend response data:", responseData);

      if (backendResponse.ok) {
        // If campaignId is available, update the Facebook campaign status
        if (record.campaignid) {
          try {
            const fbResponse = await axios.post(
              `https://graph.facebook.com/v22.0/${record.campaignid}`,
              null,
              {
                params: {
                  status: checked ? "ACTIVE" : "PAUSED",
                  access_token: record.access_token,
                },
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("Facebook API response:", fbResponse.data);

            if (fbResponse.status === 200) {
              if (fbResponse.data?.success === true) {
                var mains = "Launched";
              } else {
                var mains = "PAUSE";
              }
              message.open({
                type: 'success',
                content: `Campaign ${checked ? "Launched" : "Paused"} Successfully`,
                className: theme === 'dark' ? 'dark-message' : '',
              });

              // Update the state to reflect the change in UI
              setCampaignData((prevCampaigns) =>
                prevCampaigns.map((campaign) =>
                  campaign.identifier === record.identifier
                    ? { ...campaign, Status: checked ? "ACTIVE" : "PAUSED" }
                    : campaign
                )
              );
            } else {
              console.error(
                "Failed to update facebook status:",
                fbResponse.data
              );
              message.error(
                `Failed to update facebook status: ${fbResponse.data.error.message}`
              );
            }
          } catch (fbError) {
            console.error("Error updating facebook status:", fbError);
            message.error(
              `Error updating facebook status: ${fbError.response?.data?.error?.message || fbError.message
              }`
            );
          }
        } else {
          // If no campaignId is available, only update the backend
          message.open({
            type: 'success',
            content: "Campaign launched successfully",
            className: theme === 'dark' ? 'dark-message' : '',
          });

          // Update the state to reflect the change in UI
          setCampaignData((prevCampaigns) =>
            prevCampaigns.map((campaign) =>
              campaign.identifier === record.identifier
                ? { ...campaign, Status: checked ? "ACTIVE" : "PAUSED" }
                : campaign
            )
          );
        }
      } else {
        console.error("Failed to update backend status:", responseData);
        message.error(
          `Failed to update status: ${responseData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Error updating status");
    }
  };
  const EditableFieldForMultpleAdsets = ({
    value,
    record,
    dataIndex,
    updateTableRow,
    changeRRefrst,
  }) => {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };

    const handleEdit = () => {
      setEditing(true);
    };

    const handleSave = async () => {
      if (record && inputValue) {
        try {
          const budgets = inputValue * 100; // Convert input value to the required format (cents)

          // Step 1: Update the daily budget in your backend https://www.testapi.adsgoat.in
          const response = await fetch(
            `https://www.testapi.adsgoat.in/api/newdailyBudget/${record?.identifier}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("token"),
              },
              body: JSON.stringify({ Daily_amount: budgets }),
            }
          );

          if (response.ok) {
            console.log("Daily amount updated successfully in backend");

            // Step 2: If campaignId is available, update the budget on Facebook
            if (record.campaignid) {
              try {
                const fbResponse = await axios.post(
                  `https://graph.facebook.com/v22.0/${record.campaignid}`,
                  null,
                  {
                    params: {
                      daily_budget: budgets,
                      access_token: record.access_token,
                    },
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (fbResponse.status === 200) {
                  console.log("Daily budget updated successfully on Facebook");
                  message.open({
                    type: 'success',
                    content: "Daily amount updated successfully on both backend and Facebook",
                    className: theme === 'dark' ? 'dark-message' : '',
                  });

                  // Update the table row data with the new daily amount
                  updateTableRow({ ...record, Daily_amount: budgets });

                  // Trigger a refresh or any other necessary updates
                  changeRRefrst();
                } else {
                  console.error("Failed to update daily amount on Facebook");
                  // message.error(`Failed to update daily amount on Facebook: ${fbResponse.data.error.message}`);
                }
              } catch (fbError) {
                console.error(
                  "Error updating daily amount on Facebook:",
                  fbError
                );
                // message.error(`Error updating daily amount on Facebook: ${fbError.response?.data?.error?.message || fbError.message}`);
              }
            } else {
              // If no campaignId, just update the backend
              message.open({
                type: 'success',
                content: "Daily amount updated successfully ",
                className: theme === 'dark' ? 'dark-message' : '',
              })

              // Update the table row data with the new daily amount
              updateTableRow({ ...record, Daily_amount: budgets });

              // Trigger a refresh or any other necessary updates
              changeRRefrst();
            }
          } else {
            console.error("Failed to update daily amount in backend");
            message.error("Failed to update daily amount in backend");
          }
        } catch (error) {
          console.error("Error updating daily amount:", error);
          message.error("Error updating daily amount");
        }
      }

      setEditing(false);
    };

    return (
      <div>
        {editing ? (
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onPressEnter={handleSave}
            onBlur={handleSave}
            autoFocus
            className={
              theme === "dark" ? "custom-input-dark" : "custom-input-light"
            }
          />
        ) : (
          value !== 0 &&
          value !== "" && (
            <div
              onClick={handleEdit}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DollarOutlined className="custom-dollar-icon" />
              <span style={{ color: "#1890ff" }}>{value}</span>
              <span style={{ marginLeft: "5px" }}>Daily</span>
              {/* <EditOutlined style={{ marginLeft: "5px", cursor: "pointer" }} /> */}
            </div>
          )
        )}
      </div>
    );
  };
  const EditableField = ({
    value,
    record,
    dataIndex,
    updateTableRow,
    changeRRefrst,
  }) => {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };

    const handleEdit = () => {
      setEditing(true);
    };

    const handleSave = async () => {
      if (record && inputValue) {
        try {
          const budgets = inputValue * 100; // Convert input value to the required format (cents)

          // Step 1: Update the daily budget in your backend
          const response = await fetch(
            `https://www.testapi.adsgoat.in/api/dailyBudget/${record?.identifier}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("token"),
              },
              body: JSON.stringify({ Daily_amount: budgets }),
            }
          );

          if (response.ok) {
            console.log("Daily amount updated successfully in backend");

            // Step 2: If campaignId is available, update the budget on Facebook
            if (record.campaignid) {
              try {
                const fbResponse = await axios.post(
                  `https://graph.facebook.com/v22.0/${record.campaignid}`,
                  null,
                  {
                    params: {
                      daily_budget: budgets,
                      access_token: record.access_token,
                    },
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (fbResponse.status === 200) {
                  console.log("Daily budget updated successfully on Facebook");
                  message.open({
                    type: 'success',
                    content: "Daily amount updated successfully on both backend and Facebook",
                    className: theme === 'dark' ? 'dark-message' : '',
                  })
                  // Update the table row data with the new daily amount
                  updateTableRow({ ...record, Daily_amount: budgets });

                  // Trigger a refresh or any other necessary updates
                  changeRRefrst();
                } else {
                  console.error("Failed to update daily amount on Facebook");
                  // message.error(`Failed to update daily amount on Facebook: ${fbResponse.data.error.message}`);
                }
              } catch (fbError) {
                console.error(
                  "Error updating daily amount on Facebook:",
                  fbError
                );
                // message.error(`Error updating daily amount on Facebook: ${fbError.response?.data?.error?.message || fbError.message}`);
              }
            } else {
              // If no campaignId, just update the backend
              message.open({
                type: 'success',
                content: "Daily amount updated successfully",
                className: theme === 'dark' ? 'dark-message' : '',
              })

              // Update the table row data with the new daily amount
              updateTableRow({ ...record, Daily_amount: budgets });

              // Trigger a refresh or any other necessary updates
              changeRRefrst();
            }
          } else {
            console.error("Failed to update daily amount in backend");
            message.error("Failed to update daily amount in backend");
          }
        } catch (error) {
          console.error("Error updating daily amount:", error);
          message.error("Error updating daily amount");
        }
      }

      setEditing(false);
    };

    return (
      <div>
        {editing ? (
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onPressEnter={handleSave}
            onBlur={handleSave}
            autoFocus
            className={
              theme === "dark" ? "custom-input-dark" : "custom-input-light"
            }
          />
        ) : (
          value !== 0 &&
          value !== "" && (
            <div
              onClick={handleEdit}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DollarOutlined className="custom-dollar-icon" />
              <span style={{ color: "#1890ff" }}>{value}</span>
              <span style={{ marginLeft: "5px" }}>Daily</span>
              {/* <EditOutlined style={{ marginLeft: "5px", cursor: "pointer" }} /> */}
            </div>
          )
        )}
      </div>
    );
  };

  const updateTablebudget = (updatedRecord) => {
    setCampaignData((prevCampaigns) =>
      prevCampaigns.map((campaign) =>
        campaign.identifier === updatedRecord.identifier
          ? { ...campaign, Daily_amount: updatedRecord.Daily_amount }
          : campaign
      )
    );
  };

  const updateTablebudgetforAdsests = (updatedRecord) => {
    setMultipleAdsetCampaignData((prevCampaigns) =>
      prevCampaigns.map((campaign) =>
        campaign.identifier === updatedRecord.identifier
          ? { ...campaign, Daily_amount: updatedRecord.Daily_amount }
          : campaign
      )
    );
  };

  const duplicatenewcampaign = (record) => {
    console.log(record, "duplicate camapaign");
    setDrawerVisible(true);
    setdupDrawerVisible(true);
    setduplicatenewcampaigns(record);
  };
  const newtworkCollections = {
    FB_Mnet: "Facebook_Mnet",
    FB_MnetBing: "Facebook_MnetBing",
    FB_Enki: "Facebook_Enki",
    FB_System1: "Facebook_System1",
    FB_Rsoc: "Facebook_Rsoc",
    FB_Tonic: "Facebook_Tonic",
    FB_DomainActive: "Facebook_DomainActive",
    FB_Bodies: "Facebook_Bodies",
    FB_Bodies1: "Facebook_Bodies1",
    Newsbreak_DA: "Newsbreak_DomainActive",
  };

  const handleEditClickMultipleAdsetData = (record, status) => {
    // console.log(record, "viewdata campaign")
    setSelectedEditMultipleAdsetData(record);
    setViewEditMultipleAdsetDataDrawerVisible(true);
    setView(status);
  };

  const handleCloneClickMultipleAdsetData = (record, status) => {
    // console.log(record, "viewdata campaign")
    setSelectedCloneMultipleAdsetData(record);
    setViewCloneMultipleAdsetDataDrawerVisible(true);
  };

  // Safely stringify any error (string / object)
  const normalizeError = (err) => {
    if (!err) return "";
    if (typeof err === "string") return err;
    if (typeof err?.message === "string") return err.message;
    try {
      // Short, single-line JSON
      const s = JSON.stringify(err);
      return s?.length > 200 ? s.slice(0, 200) + "…" : s;
    } catch {
      return String(err);
    }
  };

  // Build tooltip JSX for a record
  const renderErrorTooltip = (record, theme = "light") => {
    const campaignErr = record?.campaignlevel_error;
    const adsetErrs = Array.isArray(record?.adsetErrors)
      ? record.adsetErrors
      : [];
    const adErrsFlat = Array.isArray(record?.adErrors) ? record.adErrors : [];
    const adErrsVerbose = Array.isArray(record?.adErrorsByAdset)
      ? record.adErrorsByAdset
      : [];

    const hasCampaign = !!campaignErr;
    const hasAdset = adsetErrs.length > 0;
    const hasAd = adErrsVerbose.length > 0 || adErrsFlat.length > 0;
    const hasAny = hasCampaign || hasAdset || hasAd;

    if (!hasAny) {
      return (
        <span style={{ color: theme === "dark" ? "#ddd" : "#333" }}>
          No errors found
        </span>
      );
    }

    return (
      <div style={{ maxWidth: 420 }}>
        {hasCampaign && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Campaign level
            </div>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.3 }}>
              {normalizeError(campaignErr)}
            </div>
          </div>
        )}

        {hasAdset && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Adset level{" "}
              <span style={{ opacity: 0.7 }}>({adsetErrs.length})</span>
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Adset level</div>
            <div style={{ display: "grid", gap: 6 }}>
              {adsetErrs.slice(0, 6).map((it, i) => (
                <div key={`${it?.key || i}`} style={{ lineHeight: 1.3 }}>
                  <span style={{ fontWeight: 500 }}>
                    {it?.name || it?.key || `adset_${i + 1}`}:
                  </span>{" "}
                  <span>{normalizeError(it?.error)}</span>
                </div>
              ))}
              {adsetErrs.length > 6 && (
                <div style={{ opacity: 0.8 }}>
                  …and {adsetErrs.length - 6} more adset errors
                </div>
              )}
            </div>
          </div>
        )}

        {hasAd && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Ad level</div>
            <div style={{ display: "grid", gap: 6 }}>
              {(adErrsVerbose.length ? adErrsVerbose : adErrsFlat)
                .slice(0, 6)
                .map((it, i) => (
                  <div
                    key={`${it?.adsetKey || it?.index || i}`}
                    style={{ lineHeight: 1.3 }}
                  >
                    {/* If we have verbose rows, show "Adset → Ad" */}
                    {adErrsVerbose.length ? (
                      <>
                        <span style={{ fontWeight: 600 }}>
                          {resolveAdsetName(record, it.adsetKey, it.adsetName)}
                        </span>
                        <span> → </span>
                        <span style={{ fontWeight: 500 }}>{it.adName}</span>
                        <span>: </span>
                        <span>{normalizeError(it.error)}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontWeight: 500 }}>
                          {it?.name ?? `ad${(it?.index ?? i) + 1}`}
                        </span>
                        <span>: </span>
                        <span>{normalizeError(it?.error)}</span>
                      </>
                    )}
                  </div>
                ))}
              {(adErrsVerbose.length ? adErrsVerbose : adErrsFlat).length >
                6 && (
                  <div style={{ opacity: 0.8 }}>
                    …and{" "}
                    {(adErrsVerbose.length ? adErrsVerbose : adErrsFlat).length -
                      6}{" "}
                    more ad errors
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Turn "adsetlevel_1" into a friendly label if no proper name is found
  const resolveAdsetName = (record, adsetKey, nameCandidate) => {
    const isKeyLike = (s) =>
      typeof s === "string" && /^adsetlevel[_-]?\d+$/i.test(s);

    // 1) if candidate is a real name (not a key), use it
    if (nameCandidate && !isKeyLike(nameCandidate)) return nameCandidate;

    // 2) try from adsetErrors (already enriched on the backend)
    const fromErr = (
      Array.isArray(record?.adsetErrors) ? record.adsetErrors : []
    ).find((e) => e.key === adsetKey)?.name;
    if (fromErr && !isKeyLike(fromErr)) return fromErr;

    // 3) try from adsetNameMap
    const fromMap = record?.adsetNameMap?.[adsetKey];
    if (fromMap && !isKeyLike(fromMap)) return fromMap;

    // 4) fallback: humanize the key
    if (adsetKey) {
      const m = String(adsetKey).match(/(\d+)$/);
      return m ? `Adset ${m[1]}` : String(adsetKey);
    }
    return "Adset";
  };

  const handleDeleteCampaign = async (identifier) => {
    try {
      // setDeletingId(identifier);
      console.log("identifier:", identifier);

      await axios.delete(
        `https://www.testapi.adsgoat.in/api/campaigns/${identifier}`
        // { headers: { Authorization: token } } // include if you use auth
      );

      changeRRefrst && changeRRefrst();

      message.open({
        type: 'success',
        content: "Campaign deleted",
        className: theme === 'dark' ? 'dark-message' : '',
      })
    } catch (err) {
      console.error("Delete campaign error:", {
        status: err?.response?.status,
        data: err?.response?.data,
        msg: err?.message,
      });
      message.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete campaign"
      );
    }
  };

  const columns = [
    {
      title: "Status",
      dataIndex: "fbstatus",
      key: "fbstatus",
      width: 120,
      align: "center",
      render: (text, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {record.fbstatus === "Live" ? (
            <CheckCircleFilled
              style={{ color: "#91C25F", fontSize: 16 }}
              className="black-icon-active-1"
            />
          ) : (
            <CloseCircleFilled
              style={{ color: "#EC7117", fontSize: 16 }}
              className="black-icon-pause-1"
            />
          )}
          <Switch
            checked={record.Status === "ACTIVE"}
            onChange={(checked) => onToggleStatus(record, checked)}
            checkedChildren="✓"
            unCheckedChildren="✗"
            size="default"
            style={{
              backgroundColor:
                record.Status === "ACTIVE" ? "#91C25F" : undefined,
              minWidth: 40,
              height: 22,
            }}
          />
        </div>
      ),
    },
    {
      title: "Campaign name",
      dataIndex: "campaign_name",
      key: "campaign_name",
      width: 320,
      align: "center",
      render: (text, record) => (
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <span onClick={() => handleCampaignNameClick(record)}>{text}</span>
          {record.reports && (
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: theme === "dark" ? "#333" : "white",
                marginLeft: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tooltip title="View Report">
                <LinkOutlined
                  style={{ color: "blue", fontSize: 14 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `/LiveHistory/LiveCampaignHistory/${record?.campaign_name}-${record?.Account_Number}-UTC-${newtworkCollections[selectedKey]}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                />
              </Tooltip>
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      align: "center",
      render: (text, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Tooltip
            title="View details"
            overlayInnerStyle={{
              backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#000000",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: "14px",
            }}
          >
            <Button
              icon={<FaEye />}
              onClick={() => handleViewClick(record)}
              style={{
                // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                borderRadius: "6px",
                border: "none",
                padding: "4px 8px",
                backgroundColor:
                  theme === "dark" ? "transparent" : "transparent",
                color: theme === "dark" ? "#fff" : "#000",
              }}
            />
          </Tooltip>
          <Tooltip
            title="Edit campaign"
            overlayInnerStyle={{
              backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#000000",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: "14px",
            }}
          >
            <Button
              icon={<FaPenToSquare />}
              onClick={() => handleEditClickAllLevelData(record)}
              style={{
                // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                borderRadius: "6px",
                border: "none",
                padding: "4px 8px",
                backgroundColor:
                  theme === "dark" ? "transparent" : "transparent",
                color: theme === "dark" ? "#fff" : "#000",
              }}
            />
          </Tooltip>
          {!restrictedEmails.includes(userdetails.email) && (
            <Tooltip
              title="Duplicate campaign"
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Button
                icon={<FaClone />}
                onClick={() => duplicatenewcampaign(record)}
                style={{
                  // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                  borderRadius: "6px",
                  border: "none",
                  padding: "4px 8px",
                  backgroundColor:
                    theme === "dark" ? "transparent" : "transparent",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              />
            </Tooltip>
          )}
          <Tooltip
            title="Delete campaign"
            overlayInnerStyle={{
              backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#000000",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: "14px",
            }}
          >
            <Button
              icon={<FaTrashCan color="#EC7117" />}
              style={{
                // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                borderRadius: "6px",
                border: "none",
                cursor: "not-allowed",
                padding: "4px 8px",
                backgroundColor:
                  theme === "dark" ? "transparent" : "transparent",
                color: theme === "dark" ? "#fff" : "#000",
              }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Budget",
      dataIndex: "Daily_amount",
      key: "Daily_amount",
      width: 100,
      align: "center",
      render: (Daily_amount, record) =>
        loading ? (
          <Spin />
        ) : (
          record?.Daily_amount !== undefined && (
            <EditableField
              value={record.Daily_amount / 100}
              record={record}
              dataIndex="Daily_amount"
              updateTableRow={updateTablebudget}
            />
          )
        ),
    },
    {
      title: "Account number",
      dataIndex: "Account_Number",
      key: "Account_Number",
      width: 160,
      align: "center",
      render: (text, record) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div>{record.Account_Number}</div>
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 2 }}
          >
            <Tooltip title="Approved">
              <span
                style={{
                  color: "#4caf50",
                  fontWeight: "bold",
                  marginRight: 10,
                }}
              >
                {record.approvedCount}
              </span>
            </Tooltip>
            <Tooltip title="Rejected">
              <span
                style={{
                  color: "#EC7117",
                  fontWeight: "bold",
                  marginRight: 10,
                }}
              >
                {record.rejectedCount}
              </span>
            </Tooltip>
            <Tooltip title="Pending">
              <span
                className="blinking"
                style={{ color: "#EC7117", fontWeight: "bold" }}
              >
                {record.pendingCount}
              </span>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 100,
      align: "center",
    },
    {
      title: "Created by",
      dataIndex: "createdby",
      key: "createdby",
      width: 100,
      align: "center",
    },
    {
      title: "Approved",
      dataIndex: "Approval",
      key: "Approval",
      width: 100,
      align: "center",
      render: (text, record) => {
        let color = "black";
        let displayText = text;
        if (text === "PENDING_APPROVAL") {
          color = "#EC7117";
          displayText = "Pending";
        } else if (text === "Approved") {
          color = "#4caf50";
        }
        const approvedBy = record?.Approvedby || "N/A";
        return (
          <div>
            <span style={{ color }}>{displayText}</span>
            {text === "Approved" && (
              <>
                <br />
                <small style={{ color: "gray" }}>{approvedBy}</small>
              </>
            )}
          </div>
        );
      },
    },
    {
      title: "Permission",
      dataIndex: "Approval",
      key: "permission",
      width: 120,
      align: "center",
      render: (text, record) => (
        <>
          {record.Approval === "PENDING_APPROVAL" && (
            <>
              <Button
                style={{
                  backgroundColor: "#91C25F",
                  color: "#000",
                  borderColor: "#91C25F",
                  borderWidth: "0px",
                }}
                onClick={() => handleApproval(record)} // This sets useaproval and opens modal
              >
                Approve
              </Button>

              {/* Show Modal only for selected record */}
              {useaproval?.identifier === record.identifier && (
                <Modal
                  title="Confirm approval"
                  open={isModalVisible}
                  onOk={handleOk}
                  onCancel={() => setIsModalVisible(false)}
                  className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
                    }`}
                >
                  <p>Are you sure you want to approve?</p>
                </Modal>
              )}
            </>
          )}
        </>
      ),
    },
  ];

  const columnsformultipleadsets = [
    {
      title: "Status",
      dataIndex: "fbstatus",
      key: "fbstatus",
      width: 120,
      align: "center",
      render: (text, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {record.fbstatus === "Live" ? (
            <CheckCircleFilled
              style={{ color: "#91C25F", fontSize: 16 }}
              className="black-icon-active-1"
            />
          ) : (
            <CloseCircleFilled
              style={{ color: "#EC7117", fontSize: 16 }}
              className="black-icon-pause-1"
            />
          )}

          <Switch
            checked={record.Status === "ACTIVE"}
            onChange={(checked) =>
              onToggleStatusForMultipleAdsets(record, checked)
            }
            checkedChildren="✓"
            unCheckedChildren="✗"
            // disabled={record.Approval !== "Approved"}
            size="default"
            style={{
              backgroundColor:
                record.Status === "ACTIVE" ? "#91C25F" : undefined,
              minWidth: 40,
              height: 22,
            }}
          />

        </div>
      ),
    },
    {
      title: "Campaign name",
      dataIndex: "campaign_name",
      key: "campaign_name",
      width: 320,
      align: "center",
      // render: (text, record) => (
      //   <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      //     <span>{text}({record.adsetCount})</span>
      //   </div>
      // )
      // render: (text, record) => (
      //   <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      //     <span onClick={() => handleCampaignNameClick(record)}>{text}</span>
      //     {record.reports && (
      //       <span style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: theme === 'dark' ? '#333' : 'white', marginLeft: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      //         <Tooltip title="View Report">
      //           <LinkOutlined
      //             style={{ color: 'blue', fontSize: 14 }}
      //             onClick={(e) => {
      //               e.stopPropagation();
      //               window.open(`/LiveHistory/LiveCampaignHistory/${record?.campaign_name}-${record?.Account_Number}-UTC-${newtworkCollections[selectedKey]}`, '_blank', 'noopener,noreferrer');
      //             }}
      //           />
      //         </Tooltip>
      //       </span>
      //     )}
      //   </div>
      // ),
      render: (text, record) => (
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <span
          // onClick={() => handleCampaignNameClick(record)}
          >{text}</span>
          {record.reports && (
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: theme === "dark" ? "#333" : "white",
                marginLeft: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tooltip title="View Report">
                <LinkOutlined
                  style={{ color: "blue", fontSize: 14 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `/LiveHistory/LiveCampaignHistory/${record?.campaign_name}-${record?.Account_Number}-UTC-${newtworkCollections[selectedKey]}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                />
              </Tooltip>
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Account number",
      dataIndex: "Account_Number",
      key: "Account_Number",
      // width: 320,
      align: "center",

    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   width: 180,
    //   align: "center",
    //   render: (text, record) => (
    //     <div
    //       style={{
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //         gap: "8px",
    //       }}
    //     >
    //       <Tooltip
    //         title="View details"
    //         overlayInnerStyle={{
    //           backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
    //           color: theme === "dark" ? "#ffffff" : "#000000",
    //           borderRadius: 6,
    //           padding: "6px 10px",
    //           fontSize: "14px",
    //         }}
    //       >
    //         <Button
    //           icon={<FaEye />}
    //           onClick={() => handleEditClickMultipleAdsetData(record, true)}
    //           style={{
    //             // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
    //             border: "none",
    //             borderRadius: "6px",
    //             padding: "4px 8px",
    //             backgroundColor:
    //               theme === "dark" ? "transparent" : "transparent",
    //             color: theme === "dark" ? "#fff" : "#000",
    //           }}
    //         />
    //       </Tooltip>
    //       <Tooltip
    //         title="Edit campaign"
    //         overlayInnerStyle={{
    //           backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
    //           color: theme === "dark" ? "#ffffff" : "#000000",
    //           borderRadius: 6,
    //           padding: "6px 10px",
    //           fontSize: "14px",
    //         }}
    //       >
    //         <Button
    //           icon={<FaPenToSquare />}
    //           // disabled={record.fbstatus === "Live"}
    //           onClick={() => handleEditClickMultipleAdsetData(record, false)}
    //           style={{
    //             // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
    //             border: "none",
    //             borderRadius: "6px",
    //             padding: "4px 8px",
    //             backgroundColor:
    //               theme === "dark" ? "transparent" : "transparent",
    //             color: theme === "dark" ? "#fff" : "#000",
    //           }}
    //         />
    //       </Tooltip>
    //       {!restrictedEmails.includes(userdetails.email) && (
    //         <Tooltip
    //           title="Duplicate campaign"
    //           overlayInnerStyle={{
    //             backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
    //             color: theme === "dark" ? "#ffffff" : "#000000",
    //             borderRadius: 6,
    //             padding: "6px 10px",
    //             fontSize: "14px",
    //           }}
    //         >
    //           <Button
    //             icon={<FaClone />}
    //             onClick={() => handleCloneClickMultipleAdsetData(record)}
    //             style={{
    //               // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
    //               border: "none",
    //               borderRadius: "6px",
    //               padding: "4px 8px",
    //               backgroundColor:
    //                 theme === "dark" ? "transparent" : "transparent",
    //               color: theme === "dark" ? "#fff" : "#000",
    //             }}
    //           />
    //         </Tooltip>
    //       )}
    //       <Tooltip
    //         title="Delete campaign"
    //         overlayInnerStyle={{
    //           backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
    //           color: theme === "dark" ? "#ffffff" : "#000000",
    //           borderRadius: 6,
    //           padding: "6px 10px",
    //           fontSize: "14px",
    //         }}
    //       >
    //         <Button
    //           icon={<FaTrashCan color="#EC7117" />}
    //           style={{
    //             // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
    //             border: "none",
    //             borderRadius: "6px",
    //             cursor: "not-allowed",
    //             backgroundColor:
    //               theme === "dark" ? "transparent" : "transparent",
    //             color: theme === "dark" ? "#fff" : "#000",
    //           }}
    //         />
    //       </Tooltip>
    //       <Tooltip
    //         title="Number of adsets"
    //         overlayInnerStyle={{
    //           backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
    //           color: theme === "dark" ? "#ffffff" : "#000000",
    //           borderRadius: 6,
    //           padding: "6px 10px",
    //           fontSize: "14px",
    //         }}
    //       >
    //         <div
    //           style={{
    //             backgroundColor: "#bce396ff",
    //             color: "#000",
    //             borderRadius: "60%",
    //             width: "20px",
    //             height: "20px",
    //             textAlign: "center",
    //           }}
    //         >
    //           {record.adsetCount}
    //         </div>
    //       </Tooltip>
    //     </div>
    //   ),
    // },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      align: "center",
      render: (text, record) => {
        const hasAnyError =
          !!record?.campaignlevel_error ||
          (Array.isArray(record?.adsetErrors) &&
            record.adsetErrors.length > 0) ||
          (Array.isArray(record?.adErrors) && record.adErrors.length > 0);
        const commentForCampaign = launcherComments.find(item => item.Account === record.Account_Number && item.campaignid === record.identifier && item.level === "Launcher") || {};

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Tooltip
              title="View details"
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Button
                icon={<FaEye />}
                onClick={() => handleEditClickMultipleAdsetData(record, true)}
                style={{
                  // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  backgroundColor:
                    theme === "dark" ? "transparent" : "transparent",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              />
            </Tooltip>
            <Tooltip
              title="Edit campaign"
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Button
                icon={<FaPenToSquare />}
                // disabled={record.fbstatus === "Live"}
                onClick={() => handleEditClickMultipleAdsetData(record, false)}
                style={{
                  // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  backgroundColor:
                    theme === "dark" ? "transparent" : "transparent",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              />
            </Tooltip>
            {!restrictedEmails.includes(userdetails.email) && (
              <Tooltip
                title="Duplicate campaign"
                overlayInnerStyle={{
                  backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: "14px",
                }}
              >
                <Button
                  icon={<FaClone />}
                  // disabled={true}
                  onClick={() => handleCloneClickMultipleAdsetData(record)}
                  style={{
                    // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    backgroundColor:
                      theme === "dark" ? "transparent" : "transparent",
                    color: theme === "dark" ? "#fff" : "#000",
                  }}
                />
              </Tooltip>
            )}

            <Tooltip
              title={commentForCampaign.comment ? commentForCampaign.comment : "Comment"}
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Button
                icon={commentForCampaign.comment ? <FaRegCommentDots /> : <IoMdCreate />}
                // disabled={record.fbstatus === "Live"}
                // onClick={() => handleEditClickMultipleAdsetData(record, false)}
                onClick={() => handleClickComment(record)}
                style={{
                  // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  backgroundColor:
                    theme === "dark" ? "transparent" : "transparent",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              />
            </Tooltip>

            {/* {record.fbstatus === "No-Live" && ( */}
            <Tooltip
              // title="Delete campaign"
              title={
                record.fbstatus === "No-Live"
                  ? "Delete campaign"
                  : "Status must be 'No-Live' to delete'"
              }
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Popconfirm
                title={
                  <span style={{ color: theme === "dark" ? "#fff" : "#333" }}>
                    Are you sure you want to delete this campaign?
                  </span>
                }
                onConfirm={() => handleDeleteCampaign(record.identifier)}
                okText="Yes"
                cancelText="No"
                disabled={record.fbstatus !== "No-Live"}
                okButtonProps={{
                  style: { backgroundColor: "#91C25F", color: "#fff" },
                }}
                cancelButtonProps={{
                  style: {
                    backgroundColor: theme === "dark" ? "#000" : "#fff",
                    color: theme === "dark" ? "#fff" : "#333",
                    border: "none",
                  },
                }}
                style={{ color: theme === "dark" ? "#fff" : "#333" }}
                overlayInnerStyle={{
                  backgroundColor: theme === "dark" ? "#1f1f1f" : "#fff",
                  color: theme === "dark" ? "#fff" : "#333",
                  borderRadius: 8,
                  padding: "10px 16px",
                }}
              >
                <Button
                  icon={<FaTrashCan color="#EC7117" />}
                  disabled={record.fbstatus !== "No-Live"}
                  style={{
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: "transparent",
                    color: theme === "dark" ? "#fff" : "#000",
                  }}
                />
              </Popconfirm>
            </Tooltip>
            {/* )} */}

            <Tooltip
              title={renderErrorTooltip(record, theme)}
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <div
                style={{
                  // backgroundColor: "#bce396ff",
                  backgroundColor: hasAnyError ? "#EC7117" : "#91C25F",
                  color: "#000",
                  borderRadius: "60%",
                  width: "20px",
                  height: "20px",
                  textAlign: "center",
                }}
              >
                {record.adsetCount}
              </div>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Budget",
      dataIndex: "Daily_amount",
      key: "Daily_amount",
      width: 100,
      align: "center",
      render: (Daily_amount, record) =>
        loading ? (
          <Spin />
        ) : (
          record?.Daily_amount !== undefined && (
            <EditableFieldForMultpleAdsets
              value={record.Daily_amount / 100}
              record={record}
              dataIndex="Daily_amount"
              updateTableRow={updateTablebudgetforAdsests}
            />
          )
        ),
    },
    // {
    //   title: "Account number",
    //   dataIndex: "Account_Number",
    //   key: "Account_Number",
    //   width: 160,
    //   align: "center",
    //   render: (text, record) => (
    //     <div
    //       style={{
    //         display: "flex",
    //         flexDirection: "column",
    //         alignItems: "center",
    //       }}
    //     >
    //       <div>{record.Account_Number}</div>
    //       <div
    //         style={{ display: "flex", justifyContent: "center", marginTop: 2 }}
    //       >
    //         <Tooltip title="Approved">
    //           <span
    //             style={{
    //               color: "#4caf50",
    //               fontWeight: "bold",
    //               marginRight: 10,
    //             }}
    //           >
    //             {record.approvedCount}
    //           </span>
    //         </Tooltip>
    //         <Tooltip title="Rejected">
    //           <span
    //             style={{ color: "red", fontWeight: "bold", marginRight: 10 }}
    //           >
    //             {record.rejectedCount}
    //           </span>
    //         </Tooltip>
    //         <Tooltip title="Pending">
    //           <span
    //             className="blinking"
    //             style={{ color: "orange", fontWeight: "bold" }}
    //           >
    //             {record.pendingCount}
    //           </span>
    //         </Tooltip>
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: "Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 100,
      align: "center",
    },
    {
      title: "Created by",
      dataIndex: "createdby",
      key: "createdby",
      width: 100,
      align: "center",
    },
    {
      title: "Approved",
      dataIndex: "Approval",
      key: "Approval",
      width: 120,
      align: "center",
      render: (text, record) => {
        let color = "black";
        let displayText = text;
        if (text === "PENDING_APPROVAL") {
          color = "#EC7117";
          displayText = "Pending";
        } else if (text === "Approved") {
          color = "#4caf50";
        }
        const approvedBy = record?.Approvedby || "N/A";
        const approvedDate = record?.Approveddate
          ? moment(record.Approveddate, "YYYY-MM-DD HH:mm z")
            .tz("Asia/Kolkata")
            .format("DD-MM-YYYY HH:mm")
          : "N/A";

        return (
          <div>
            <span style={{ color }}>{displayText}</span>
            {/* {text === "Approved" && (
              <>
                <br />
                <small style={{ color: "gray" }}>{approvedBy}</small>
                <br />
                <span style={{ color: "gray", fontSize: "8px" }}>{approvedDate}</span>
              </>
            )} */}
            {text === "Approved" && (
              <div style={{ lineHeight: "12px" }}>
                <span style={{ color: "gray", fontSize: "11px", display: "block" }}>
                  {approvedBy}
                </span>
                <span style={{ color: "gray", fontSize: "9px", display: "block", marginTop: 2, display: approvedDate !== "N/A" ? "block" : "none" }}>
                  {approvedDate}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    // {
    //   title: "Permission",
    //   dataIndex: "Approval",
    //   key: "permission",
    //   width: 120,
    //   align: "center",
    //   render: (text, record) => (
    //     <>
    //       {record.Approval === "PENDING_APPROVAL" && (
    //         <>
    //           <Button
    //             style={{
    //               backgroundColor: "#91C25F",
    //               color: "#000",
    //               borderColor: "#91C25F",
    //               borderWidth: "0px",
    //             }}
    //             onClick={() => handleApprovalforAdsets(record)} // This sets useaproval and opens modal
    //           >
    //             Approve
    //           </Button>

    //           {/* Show Modal only for selected record */}
    //           {useaprovalForAdsets?.identifier === record.identifier && (
    //             <Modal
    //               title="Confirm approval"
    //               open={isModalVisibleForAdsets}
    //               onOk={handleOkForAdsets}
    //               onCancel={() => setIsModalVisibleForAdsets(false)}
    //               className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
    //                 }`}
    //             >
    //               <p>Are you sure you want to approve?</p>
    //             </Modal>
    //           )}
    //         </>
    //       )}
    //     </>
    //   ),
    // },
    // {
    //   title: "Permission",
    //   dataIndex: "Approval",
    //   key: "permission",
    //   width: 120,
    //   align: "center",
    //   render: (text, record) => {
    //     const approval = record?.Approval?.toLowerCase();
    //     const fbstatus = record?.fbstatus?.toLowerCase();
    //     return fbstatus === "live" ? (
    //       <Tooltip title="View History">
    //         <HistoryOutlined
    //           style={{
    //             fontSize: 16,
    //             color: theme === "dark" ? "#91C25F" : "#37474F",
    //             cursor: "pointer",
    //           }}
    //           onClick={(e) => {
    //             e.stopPropagation();
    //             const accountNumber = record?.Account_Number;
    //             if (accountNumber) {
    //              const href = `/Campaigns/CampaignHistory?account=${encodeURIComponent(accountNumber)}`;
    //               window.open(href, "_blank", "noopener,noreferrer");
    //             } else {
    //               console.error("Account number missing for this record");
    //             }
    //           }}
    //         />
    //       </Tooltip>
    //     ) : approval === "pending_approval" ? (
    //       <>
    //         <Button
    //           style={{
    //             backgroundColor: "#91C25F",
    //             color: "#000",
    //             border: "none",
    //           }}
    //           onClick={() => handleApproval(record)}
    //         >
    //           Approve
    //         </Button>
    //         {useaproval?.identifier === record.identifier && (
    //           <Modal
    //             title="Confirm approval"
    //             open={isModalVisible}
    //             onOk={handleOk}
    //             onCancel={() => setIsModalVisible(false)}
    //             className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
    //               }`}
    //           >
    //             <p>Are you sure you want to approve?</p>
    //           </Modal>
    //         )}
    //       </>
    //     ) : null; 
    //   },
    // }
    {
      title: "Permission",
      dataIndex: "Approval",
      key: "permission",
      width: 120,
      align: "center",
      render: (text, record) => {
        const approval = record?.Approval?.toLowerCase();
        const fbstatus = record?.fbstatus?.toLowerCase();
        const accountNumber = record?.Account_Number;
        const campaignId = record?.campaignid;
        const openCampaignHistory = () => {
          if (!campaignId || !accountNumber) {
            console.error("Missing campaign ID or account number");
            return;
          }
          const href = `/Campaigns/CampaignHistory?account=${encodeURIComponent(
            accountNumber
          )}&type=Campaign&id=${encodeURIComponent(campaignId)}`;
          window.open(href, "_blank", "noopener,noreferrer");
        };
        if (fbstatus === "live") {
          return (
            <Tooltip title="View Campaign History">
              <HistoryOutlined
                style={{
                  fontSize: 16,
                  color: theme === "dark" ? "#91C25F" : "#37474F",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openCampaignHistory();
                }}
              />
            </Tooltip>
          );
        }
        if (approval === "pending_approval") {
          return (
            <>
              <Button
                style={{
                  backgroundColor: "#91C25F",
                  color: "#000",
                  border: "none",
                }}
                onClick={() => handleApprovalforAdsets(record)}
              >
                Approve
              </Button>

              {useaprovalForAdsets?.identifier === record.identifier && (
                <Modal
                  title="Confirm approval"
                  open={isModalVisibleForAdsets}
                  onOk={handleOkForAdsets}
                  onCancel={() => setIsModalVisibleForAdsets(false)}
                  className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
                    }`}
                >
                  <p>Are you sure you want to approve?</p>
                </Modal>
              )}
            </>
          );
        }

        return null;
      },
    }


  ];

  //     const columns = [

  //         {
  //             title: 'Status',
  //             dataIndex: 'fbstatus',
  //             key: 'fbstatus',
  //             width: '10%',  // Adjust width
  //             align: 'center',
  //             render: (text, record) => (
  //                 <>
  //                     {/* Display green check or red close icon based on fbstatus */}
  //                     {record.fbstatus === 'Live' ? (
  //                         <CheckCircleFilled style={{ color: 'green' }} className='black-icon-active' />
  //                     ) : (
  //                         <CloseCircleFilled style={{ color: 'red' }}   className='black-icon-pause-1' />
  //                     )}

  //                     {/* Display link icon if reports field is true */}
  //                     {record.reports === true && (
  //                         <LinkOutlined
  //                             style={{ color: 'blue', marginLeft: '8px', cursor: 'pointer' }}
  //                             onClick={() =>
  //                                 window.open(
  //                                     `/LiveHistory/LiveCampaignHistory/${record?.campaign_name}-${record?.Account_Number}-UTC-${newtworkCollections[selectedKey]}`,
  //                                     '_blank', // Opens in a new tab
  //                                     'noopener,noreferrer' // Security and performance considerations
  //                                 )
  //                             }
  //                         />
  //                     )}
  //                 </>
  //             ),
  //         },

  //         {
  //             title: "Campaign Name",
  //             dataIndex: "campaign_name",
  //             key: "campaign_name",
  //             width: '20%', // Adjust width
  //             align: 'left',  // Left align to keep names readable
  //             render: (text, record) => (

  //                 <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
  //                     <span onClick={() => handleCampaignNameClick(record)}>{text}</span>
  //                     {!restrictedEmails.includes(userdetails.email) && (
  //                         <span style={{
  //                             width: '24px',
  //                             height: '24px',
  //                             borderRadius: '50%',
  //                             // backgroundColor: '#e6f7ff',
  //                             backgroundColor: theme === "dark" ? "#333" : "white",
  //                             marginLeft: '5px',
  //                             display: 'flex',
  //                             alignItems: 'center',
  //                             justifyContent: 'center'
  //                         }}>
  //                             <Tooltip title="Clone">
  //                                 <CopyOutlined style={{ color: 'red' }} onClick={() => duplicatenewcampaign(record)} />
  //                             </Tooltip>
  //                         </span>
  //                     )}
  //                 </div>
  //             ),
  //         },
  //         {
  //             title: "Account Number",
  //             dataIndex: "Account_Number",
  //             key: "Account_Number",
  //             width: '15%',  // Adjust width
  //             align: 'center',  // Center align since it's numeric
  //             render: (text, record) => (
  //                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  //                     {/* Account Number */}
  //                     <div>{record.Account_Number}</div>

  //                     {/* Approved, Rejected, Pending - stacked vertically */}
  //                     <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
  //                         {/* Approved */}
  //                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '15px' }}>
  //                             <Tooltip title="Approved">
  //                                 <span style={{ color: 'green', fontWeight: 'bold' }}>{record.approvedCount}</span>
  //                             </Tooltip>
  //                         </div>

  //                         {/* Rejected */}
  //                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '15px' }}>
  //                             <Tooltip title="Rejected">
  //                                 <span style={{ color: 'red', fontWeight: 'bold' }}>{record.rejectedCount}</span>
  //                             </Tooltip>
  //                         </div>

  //                         {/* Pending */}
  //                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  //                             <Tooltip title="Pending">
  //                                 <span className="blinking" style={{ color: 'orange', fontWeight: 'bold' }}>{record.pendingCount}</span>
  //                             </Tooltip>
  //                         </div>
  //                     </div>
  //                 </div>
  //             ),
  //         },
  //         {
  //             title: "Created Date",
  //             dataIndex: "createdDate",
  //             key: "createdDate",
  //             width: '10%',  // Adjust width
  //             align: 'center',
  //         },

  //         {
  //             title: "Created By",
  //             dataIndex: "createdby",
  //             key: "createdby",
  //             width: '12%',  // Adjust width
  //             align: 'center',
  //         },
  //         {
  //             title: "Budget",
  //             dataIndex: "Daily_amount",
  //             key: "Daily_amount",
  //             width: '10%',  // Adjust width
  //             align: 'center',
  //             render: (Daily_amount, record) => (
  //                 <>
  //                     {loading ? (
  //                         <Spin />
  //                     ) : (
  //                         record?.Daily_amount !== undefined && (
  //                             <EditableField
  //                                 value={record.Daily_amount / 100}
  //                                 record={record}
  //                                 dataIndex="Daily_amount"
  //                                 updateTableRow={updateTablebudget}
  //                             />
  //                         )
  //                     )}
  //                 </>
  //             ),
  //         },
  //         {
  //             title: "Status",
  //             dataIndex: "Status",
  //             key: "Status",
  //             width: '10%',
  //             align: "center",
  //             render: (text, record) => (
  //                 <Switch
  //                     checked={record.Status === 'ACTIVE'}
  //                     onChange={(checked) => onToggleStatus(record, checked)}
  //                     checkedChildren="ACTIVE"
  //                     unCheckedChildren="PAUSED"
  //                     style={{ backgroundColor: record.Status === 'ACTIVE' && "#91C25F" }}
  //                 />
  //             )
  //         },

  //         {
  //             title: "Approve",
  //             dataIndex: "Approval",
  //             key: "Approval",
  //             width: '7%',
  //             align: 'center',
  //             render: (text, record) => {
  //               console.log(record, "recordeddata");

  //               let color = 'black';
  //               let displayText = text;

  //               // Modify color and text based on status
  //               if (text === "PENDING_APPROVAL") {
  //                 color = 'red';
  //                 displayText = 'Pending'; // Show 'Pending' text instead of the original value
  //               } else if (text === "Approved") {
  //                 color = 'green';
  //               }

  //               // Accessing the Approved by field from the record
  //               const approvedBy = record?.Approvedby || "N/A"; // Replace 'Approved' with actual field name if needed

  //               return (
  //                 <div>
  //                   <span style={{ color }}>{`${displayText}`}</span>
  //                   {text === "Approved" && (
  //                     <>
  //                       <br />
  //                       <small style={{ color: 'gray' }}> {approvedBy}</small>
  //                     </>
  //                   )}
  //                 </div>
  //               );
  //             },
  //           }
  // ,
  //         {
  //             title: '',
  //             dataIndex: 'Action',
  //             align: "center",
  //             render: (_, record) => {
  //                 console.log('Record in Action column:', record);
  //                 console.log(campaignData, "campaigns data");
  //                 // console.log('fbstatus:', record.fbstatus);

  //                 const errorDisplay = (campaign, adset, ad) => {
  //                     if (campaign) {
  //                         return "Campaign Level Error: \n" + campaign;
  //                     } else if (adset) {
  //                         return "Adset Level Error: \n" + adset;
  //                     } else if (ad) {
  //                         return "Ad Level Error: \n" + ad;
  //                     }
  //                     return null;
  //                 };

  //                 if (record.Approval === 'Approved') {
  //                     return (
  //                         <div style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
  //                             <Button className="dark-icon-button" icon={<EyeOutlined />} onClick={() => handleViewClick(record)}></Button>
  //                             <Button className="dark-icon-button" icon={<EditOutlined />} onClick={() => handleEditClickAllLevelData(record)} style={{marginLeft:'10px'}}></Button>
  //                             {(record.adlevel_error || record.campaignlevel_error || record.adsetlevel_error) && (
  //                                 <Tooltip title={errorDisplay(record.campaignlevel_error,record.adsetlevel_error,record.adlevel_error)}>
  //                                     <InfoCircleOutlined style={{marginLeft:'10px', color:"red", fontSize:'15px'}}/>
  //                                 </Tooltip>
  //                             ) }
  //                         </div>
  //                     )
  //                 }
  //                 // console.log('Record Status:', record?.fbstatus);
  //                 // if (record.fbstatus === 'Live'){
  //                 //     console.log('Record in Action column:', record);
  //                 //     return (
  //                 //         <Button icon={<EditOutlined />} onClick={() => handleEditOnlyClick(record)}></Button>
  //                 //     )
  //                 // }

  //                 return (
  //                     <Space size="middle">
  //                         <Button className="dark-icon-button" icon={<EyeOutlined />} onClick={() => handleViewClick(record)}></Button>
  //                         {record.fbstatus !== 'Live' && (
  //                             // <Button icon={<EditOutlined />} onClick={() => handleEditOnlyClick(record)}></Button>
  //                             <Button className="dark-icon-button" icon={<EditOutlined />} onClick={() => handleEditClickAllLevelData(record)}></Button>
  //                         )}
  //                         {record.Approval === 'PENDING_APPROVAL' && (
  //                             <Button style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px"}} onClick={() => handleApproval(record)}>Approve</Button>
  //                         )}
  //                         <Modal
  //                             title="Confirm Approval"
  //                             visible={isModalVisible}
  //                             onOk={handleOk}
  //                             onCancel={handleCancel}
  //                             className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
  //                         >
  //                             <p>Are you sure you want to approve?</p>
  //                         </Modal>
  //                     </Space>
  //                 );
  //             }
  //         }

  //     ];
  console.log(selectedKey);
  // const totalDailySpend = (searchInput ? filteredData : campaignData).reduce((sum, record) => {
  //     return sum + (record.Daily_amount || 0);
  // }, 0) / 100;  // Assuming Daily_amount is in cents
  // const totalDailySpend =
  //   campaignData.reduce((sum, record) => {
  //     return sum + (record.Daily_amount || 0);
  //   }, 0) / 100; // Assuming Daily_amount is in cents
  const totalDailySpend = (() => {
    if (activeTab === "1") {
      return (
        getFilteredSingleCampaigns().reduce(
          (sum, record) => sum + (record.Daily_amount || 0),
          0
        ) / 100
      ).toFixed(2);
    } else if (activeTab === "2") {
      return (
        getFilteredMultipleAdsetCampaigns().reduce(
          (sum, record) => sum + (record.Daily_amount || 0),
          0
        ) / 100
      ).toFixed(2);
    }
    return "0.00";
  })();

  const onClickDeleteDraft = (id) => {
    console.log(id, "draft id");
    setDeleteModalVisible(true);
    setDeleteDraftId(id);
  };

  const onClickEditDraft = (id) => {
    setCreateNewDraft(true);
    // setSelecetedDraftToEdit(draftsData.find(draft => draft.id === id));
  };

  // const draftDropdownMenu = (
  //     <Menu
  //       items={draftsData.map((draft) => ({
  //         key: draft.Draft_Name,
  //         label: (
  //           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //             <span>{draft.Draft_Name}</span>
  //             <span>
  //               <EditOutlined  onClick={()=>{
  //                 setCreateNewDraft(true)
  //                 setSelecetedDraftToEdit(draft);
  //               }} style={{ marginRight: 8 }} />
  //               <DeleteOutlined onClick={() => onClickDeleteDraft(draft.id)} />

  //             </span>
  //           </div>
  //         )
  //       }))}
  //       onClick={(e) => setSelected(e.key)}
  //     />
  // );
  const draftDropdownMenu = (
    <Menu
      items={draftsData.map((draft) => ({
        key: draft.Draft_Name,
        label: (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: theme === "dark" ? "#2f2f2f" : "#fff",
              color: theme === "dark" ? "#fff" : "#333",
              borderRadius: "4px",
            }}
          >
            <span
              style={{
                // fontWeight: 'bold',
                fontSize: "14px",
                color: theme === "dark" ? "#fff" : "#333",
              }}
            >
              {draft.Draft_Name}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Tooltip title="Edit">
                <EditOutlined
                  onClick={() => {
                    setCreateNewDraft(true);
                    setSelecetedDraftToEdit(draft);
                  }}
                  style={{
                    marginRight: 10,
                    color: theme === "dark" ? "#fff" : "#007bff",
                    fontSize: "16px",
                    cursor: "pointer",
                    transition: "color 0.3s ease",
                  }}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <DeleteOutlined
                  onClick={() => onClickDeleteDraft(draft.id)}
                  style={{
                    color: theme === "dark" ? "#fff" : "#ff4d4f",
                    fontSize: "16px",
                    cursor: "pointer",
                    transition: "color 0.3s ease",
                  }}
                />
              </Tooltip>
            </span>
          </div>
        ),
      }))}
      onClick={(e) => setSelected(e.key)}
    />
  );

  const handleDropdownVisibleChange = (open) => {
    setIsOpen(open); // Set dropdown open state
    // setAccountNumberToPass(null);
  };

  const onChangeSelect = (value) => {
    // setAccount(value);
  }

  const handleChange1 = (currentVisibleSelected) => {
    const visible = filteredAccounts.map(a => String(a.accountNumber));
    const current = currentVisibleSelected.map(String);
    const added = current.filter(id => !selectedValue.includes(id));
    let updated = Array.from(new Set([...selectedValue, ...added]));
    const removed = visible.filter(id =>
      selectedValue.includes(id) && !current.includes(id)
    );
    updated = updated.filter(id => !removed.includes(id));
    setSelectedValue(updated);
    userPickedRef.current = true;
    const last = currentVisibleSelected[currentVisibleSelected.length - 1];
    if (last) {
      const findAccount = (data, accountNumber) =>
        Object.values(data).flat().find((item) => item.accountNumber === accountNumber) || null;
      const accName = findAccount(userdetails?.adAccounts, last);
    }

    onChangeSelect(updated);
    setAccountChanged(true);
  };


  const filteredAccounts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return accountsAccess;
    return accountsAccess.filter((a) =>
      `${a.accountNumber} ${a.accountName || ""}`.toLowerCase().includes(q)
    );
  }, [accountsAccess, searchText]);

  // const renderAccountsCheckboxes = (theme) => (
  //   <Checkbox.Group
  //     options={filteredAccounts.map((account) => ({
  //       value: String(account.accountNumber),
  //       label: (
  //         <div
  //           style={{
  //             display: 'flex',
  //             justifyContent: 'space-between',
  //             alignItems: 'center',
  //             padding: '5px 10px',
  //             borderBottom: '1px solid #ddd'
  //           }}
  //         >
  //           <div style={{ display: 'flex', flexDirection: 'column' }}>
  //             <span style={{ fontWeight: 600 }}>{account.accountNumber}</span>
  //             {/* show accountName only when dropdown open (same as your old pattern) */}
  //             {isOpen && (
  //               <span style={{ fontSize: 12, color: 'gray' }}>
  //                 {account.accountName || ''}
  //               </span>
  //             )}
  //           </div>
  //           <span style={{ textAlign: 'right', marginLeft: 10 }}>
  //             {account.status === "Active" ? (
  //               <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} className='black-icon-active-1' />
  //             ) : (
  //               <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} className='black-icon-pause-1' />
  //             )}
  //           </span>
  //         </div>
  //       ),
  //     }))}
  //     value={selectedValue}      // array of selected accountNumbers
  //     onChange={handleChange1}   // updates your selectedValue + notifies parent
  //     className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
  //   />
  // );

  const handleCancels = () => setIsModalVisibles(false);

  const handleOks = async () => {
    const editedTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

    const commentText = comment.trim();

    if (commentText === "") {
      message.warning("Please enter valid comment");
      return;
    }

    const response = await axios.post(
      "https://www.testapi.adsgoat.in/api/createcommentForLauncher",
      { Account: universalOject.Account, campaignid: universalOject.campaignid, campaignname: universalOject.campaignname, level: "Launcher", comment: commentText, editedTime: editedTime },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        }
      }
    );
    if (response.status === 200 || response.status === 201) {
      setLauncherComments(prev => {

        const existsIndex = prev.findIndex(item =>
          item.Account === universalOject.Account &&
          item.campaignid === universalOject.campaignid &&
          item.campaignname === universalOject.campaignname &&
          item.level === "Launcher"
        );

        // If exists → update it
        if (existsIndex !== -1) {
          const updated = [...prev];
          updated[existsIndex] = {
            ...updated[existsIndex],
            comment: commentText,      // <-- your comment variable
            editedTime: editedTime            // formatted time
          };
          return updated;
        }

        // If not exists → add new object
        return [
          ...prev,
          {
            Account: universalOject.Account,
            campaignid: universalOject.campaignid,
            campaignname: universalOject.campaignname,
            level: "Launcher",
            comment: commentText,
            editedTime: editedTime
          }
        ];
      });

    }
    setIsModalVisibles(false);
  }

  const handleDelete = async () => {

    const response = await axios.post(
      "https://www.testapi.adsgoat.in/api/deleteCommentForLauncher",
      { Account: universalOject.Account, campaignid: universalOject.campaignid, campaignname: universalOject.campaignname, level: "Launcher", comment: comment },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        }
      }
    );
    if (response.status === 200 || response.status === 201) {
      setLauncherComments(prev => {

        const existsIndex = prev.findIndex(item =>
          item.Account === universalOject.Account &&
          item.campaignid === universalOject.campaignid &&
          item.campaignname === universalOject.campaignname &&
          item.level === "Launcher"
        );

        // If exists → REMOVE it
        if (existsIndex !== -1) {
          return prev.filter((_, index) => index !== existsIndex);
        }

        // If not exists → ADD new object
        return [
          ...prev,
          {
            Account: universalOject.Account,
            campaignid: universalOject.campaignid,
            campaignname: universalOject.campaignname,
            level: "Launcher",
            comment: comment,
            editedTime: editedTime
          }
        ];
      });


    }
    setIsModalVisibles(false);
  };

  const handleClickComment = (record) => {
    setIsModalVisibles(true)
    setFirstColumnValue(record.campaign_name)
    const commentObject = launcherComments.find(item => item.Account === record.Account_Number && item.campaignid === record.identifier && item.level === "Launcher") || { campaignname: record.campaign_name, Account: record.Account_Number, campaignid: record.identifier, level: "Launcher" };
    setUniversalOject(commentObject)
    if (commentObject.comment) {
      setComment(commentObject.comment)
    } else {
      setComment("")
    }
  }

  const handleCancelsForBulkComments = () => setIsModalVisiblesForBulkComments(false);
  const handleOksForBulkComments = async () => {
    const editedTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

    const commentText = commentForBulkComments.trim();

    if (checkedRowRecords.length === 0) {
      message.warning("Please select at least one campaign");
      return;
    }

    if (commentText === "") {
      message.warning("Please enter valid comment");
      return;
    }

    const response = await axios.post(
      "https://www.testapi.adsgoat.in/api/bulkCreateCommentForLauncher",
      {
        items: checkedRowRecords.map(c => ({
          Account: c.Account_Number,
          campaignid: c.identifier,
          campaignname: c.campaign_name,
          comment: commentText,
          editedTime: editedTime
        })),
        level: "Launcher"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        }
      }
    );
    if (response.status === 200 || response.status === 201) {

      setLauncherComments(prev => {
        const updatedList = [...prev];

        checkedRowRecords.forEach(c => {
          const Account = c.Account_Number;
          const campaignid = c.identifier;
          const campaignname = c.campaign_name;

          const existsIndex = updatedList.findIndex(item =>
            item.Account === Account &&
            item.campaignid === campaignid &&
            item.campaignname === campaignname &&
            item.level === "Launcher"
          );

          if (existsIndex !== -1) {
            // ✅ Update existing object
            updatedList[existsIndex] = {
              ...updatedList[existsIndex],
              comment: commentText,
              editedTime: editedTime
            };
          } else {
            // ✅ Add new object
            updatedList.push({
              Account,
              campaignid,
              campaignname,
              level: "Launcher",
              comment: commentText,
              editedTime: editedTime
            });
          }
        });

        return updatedList;
      });

    }

    setIsModalVisiblesForBulkComments(false);
  }

  const handleDeleteForBulkComments = async () => {
    if (checkedRowRecords.length === 0) {
      message.warning("Please select at least one campaign to delete comment");
      return;
    }

    const response = await axios.post(
      "https://www.testapi.adsgoat.in/api/bulkDeleteCommentForLauncher",
      {
        items: checkedRowRecords.map(c => ({
          Account: c.Account_Number,
          campaignid: c.identifier
        })),
        level: "Launcher"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        }
      }
    );
    if (response.status === 200 || response.status === 201) {

      setLauncherComments(prev => {

        return prev.filter(item =>
          !checkedRowRecords.some(c =>
            item.Account === c.Account_Number &&
            item.campaignid === c.identifier &&
            item.campaignname === c.campaign_name &&
            item.level === "Launcher"
          )
        );

      });

    }

    setIsModalVisiblesForBulkComments(false);
  };

  // const tableData = getFilteredMultipleAdsetCampaigns();
  const hasData = Array.isArray(checkedRowRecords) && checkedRowRecords.length > 0;


  const renderAccountsCheckboxes = (theme) => {
    const activeAccountNumbers = filteredAccounts
      .filter(acc => acc.status === "Active")
      .map(acc => String(acc.accountNumber));

    const allActiveSelected =
      activeAccountNumbers.length > 0 &&
      activeAccountNumbers.every(acc => selectedValue.includes(acc));

    return (
      <>
        <div style={{ padding: '5px 10px', borderBottom: '1px solid #ddd' }}>
          <Checkbox
            className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
            checked={allActiveSelected}
            indeterminate={
              selectedValue.length > 0 &&
              !allActiveSelected &&
              activeAccountNumbers.some(acc => selectedValue.includes(acc))
            }
            onChange={(e) => {
              if (e.target.checked) {
                handleChange1(activeAccountNumbers);
              } else {
                const remaining = selectedValue.filter(
                  val => !activeAccountNumbers.includes(val)
                );
                handleChange1(remaining);
              }
            }}
          >
            <strong>All Accounts</strong>
          </Checkbox>
          <TiTickOutline
            style={{
              fontSize: 20,
              color: "#52c41a",
              cursor: "pointer",
            }}
            title="Select All Active Accounts"
            onClick={handleApply}
          />
          <TiTimesOutline
            style={{
              fontSize: 20,
              color: "#ff4d4f",
              cursor: "pointer",
            }}
            title="Unselect All"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleChange1([]);

            }}
          />
        </div>
        <Checkbox.Group
          options={filteredAccounts.map((account) => ({
            value: String(account.accountNumber),
            label: (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 10px',
                  borderBottom: '1px solid #ddd'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>{account.accountNumber}</span>
                  {isOpen && (
                    <span style={{ fontSize: 12, color: 'gray' }}>
                      {account.accountName || ''}
                    </span>
                  )}
                </div>
                <span style={{ textAlign: 'right', marginLeft: 10 }}>
                  {account.status === "Active" ? (
                    <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} />
                  ) : (
                    <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} />
                  )}
                </span>
              </div>
            ),
          }))}
          value={selectedValue}
          onChange={handleChange1}
          className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
        />
      </>
    );
  };


  return (
    <div>
      <CreateCampaignDrawer
        visible={cdrawerVisible}
        accountis={createcamselectedacc}
        onClose={onCloseDrawer}
        changeRRefrst={changeRRefrst}
        network={selectedKey}
        draftsData={draftsData}
      />

      <EditAllLevelDataDrawer
        visible={viewEditAllLevelDataDrawerVisible}
        accountis={createcamselectedacc}
        onClose={onCloseDrawer}
        changeRRefrst={changeRRefrst}
        network={selectedKey}
        selectedRow={selectedEditAllLevelData}
      />

      <EditMultipleAdsetCampaignDrawer
        view={view}
        visible={viewEditMultipleAdsetDataDrawerVisible}
        accountis={selectedEditMultipleAdsetData?.Account_Number}
        onClose={onCloseDrawer}
        changeRRefrst={changeRRefrst}
        network={selectedKey}
        selectedRow={selectedEditMultipleAdsetData}
      />
      <CloneMultipleAdsetCampaignDrawer
        visible={viewCloneMultipleAdsetDataDrawerVisible}
        accountis={createcamselectedacc}
        onClose={onCloseDrawer}
        changeRRefrst={changeRRefrst}
        network={selectedKey}
        selectedRow={selectedCloneMultipleAdsetData}
      />

      <DuplicateCampaignDrawer
        visible={dupdrawerVisible}
        onClose={onCloseDrawer}
        selectedRow={duplicatenewcampaigns}
        changeRRefrst={changeRRefrst}
        network={selectedKey}
      />

      <CreateDraft
        visible={createNewDraft}
        onClose={onCloseDrawer}
        changeRRefrst={changeDraftRefresh}
        selectedDraftToEdit={selectedDraftToEdit}
      />

      <ViewDrawer
        rowData={selectedRowData}
        visible={viewDrawerVisible}
        changeRRefrst={changeRRefrst}
        onClose={() => setViewDrawerVisible(false)}
      />
      <EditCampaignDrawer
        rowData={selectedEditRowData}
        visible={viewEditDrawerVisible}
        changeRRefrst={changeRRefrst}
        onClose={() => setViewEditDrawerVisible(false)}
      />
      <EditCampaignDrawer1
        rowData={selectedOnlyEditData}
        visible={editOnlyDrawerVisible}
        changeRRefrst={changeRRefrst}
        onClose={() => setEditOnlyDrawerVisible(false)}
      />
      {/* <Editcam
                rowData={selectedEditCampaign}
                visible={EditcamapaignDrawerVisible}
                onClose={() => setEditcamapaignDrawerVisible(false)}
            /> */}
      <Card
        style={{
          marginBottom: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          borderRadius: "10px",
        }}
        headStyle={{
          borderBottom: "none",
          paddingBottom: 0,
        }}
        title={
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: theme === "dark" ? "#fff" : "#1c1e21",
                lineHeight: "30px",
              }}
            >
              Campaign Management
            </div>
            <div
              style={{
                fontSize: 12,
                color: theme === "dark" ? "#b0b3b8" : "#65676b",
              }}
            >
              Create, manage, and optimize your advertising campaigns
            </div>
          </div>
        }
        size="small"
        extra={
          userdetails?.role !== "Network_Partner" && (
            <Button
              onClick={showDrawer}
              icon={<PlusOutlined className="black-icon" />}
              style={{
                backgroundColor: "#91C25F",
                color: "#000",
                border: "none",
                border: "#4caf50",
              }}
            >
              New Campaign
            </Button>
          )
        }

      >
        {/* Entire filter section in one single aligned row */}
        <Row
          align="middle"
          justify="space-between"
          style={{ flexWrap: "wrap", rowGap: "12px" }}
        >
          <Col
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "5px",
              alignItems: "center",
            }}
          >
            {/* 🔹 Select Project */}
            <Select
              showSearch
              placeholder="Select Projects"
              style={{ width: 140 }}
              onChange={handleKeyChange}
              value={selectedKey}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            >
              {/* {options.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))} */}
              {options
                .sort((a, b) => {
                  const aActive = networksWithStatus.find(n => n.Network === a.label)?.Status === "Active" ? 1 : 0;
                  const bActive = networksWithStatus.find(n => n.Network === b.label)?.Status === "Active" ? 1 : 0;
                  return bActive - aActive; // active first
                })
                .map(option => {
                  const isActive = networksWithStatus.find(n => n.Network === option.label)?.Status === "Active";
                  return (
                    <Option key={option.value} value={option.value}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isActive
                          ? <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} className='black-icon-active-1' />
                          : <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} className='black-icon-pause-1' />}
                        <span>{option.label}</span>
                      </div>
                    </Option>
                  );
                })
              }


            </Select>

            {/* 🔹 Select Account */}
            {/* <Select
              showSearch
              mode="multiple"
              placeholder="Select Accounts"
              style={{ width: 225 }}
              onChange={handleValueChange}
              disabled={!selectedKey}
              value={selectedValue}
              optionLabelProp="label" 
              maxTagCount={1}                                      // 👈 always show only the first selected
              maxTagPlaceholder={(omitted) => `+${omitted.length}`} // 👈 rest as a count
              optionFilterProp="children"
              filterOption={(input, option) =>
                /^[0-9]*$/.test(input) &&
                option?.value.toString().includes(input)
              }
              onDropdownVisibleChange={(open) => setIsOpen(open)}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select vm-accounts-one-line`}
            >
              {valueOptions.map((option) => (
                <Select.Option key={option.value} value={option.value} label={option.value}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: "70%",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {option.label}
                      </p>
                      {isOpen && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            color: "gray",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {option.accountName || ""}
                        </p>
                      )}
                    </div>
                    <span>
                      {option.status === "Active" ? (
                        <CheckCircleFilled
                          style={{ color: "#91C25F", fontSize: 15 }}
                          className='black-icon-active-1'
                        />
                      ) : (
                        <CloseCircleFilled
                          style={{ color: "#EC7117", fontSize: 15 }}
                          className='black-icon-pause-1'
                        />
                      )}
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select> */}

            <Select
              showSearch
              onSearch={setSearchText}
              searchValue={searchText}
              placeholder="Select Account"
              // Keep the visible state you already have
              open={isOpen}
              onDropdownVisibleChange={handleDropdownVisibleChange}

              // 👇 Show first account + count
              value={
                selectedValue.length === 0
                  ? undefined
                  : selectedValue.length === 1
                    ? selectedValue[0] // just that account number
                    : `${selectedValue[0]}, +${selectedValue.length - 1} more`
              }

              dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
              className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
              style={{
                width: '250px',
                whiteSpace: 'nowrap',
                color: theme === 'dark' ? 'white' : undefined,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                border: '1px solid #4CAF50',
                borderRadius: '6px',
              }}

              // We are not using built-in options anymore
              optionFilterProp="value"
              // options={accountsAccess.map(createOption)}  // ❌ remove
              // onChange={handleChange1}                    // ❌ remove

              // Custom dropdown with checkboxes (no tick marks in the menu)
              dropdownRender={() => (
                <div style={{ maxHeight: 300, overflowY: 'auto', padding: 8 }}>
                  {renderAccountsCheckboxes(theme)}
                </div>
              )}
            />

            {/* 🔹 Date Picker */}
            <ConfigProvider
              theme={{
                token: { colorPrimary: "#91C25F", colorTextLightSolid: "#000" },
              }}
            >
              <RangePicker
                className="green-border-picker"
                presets={rangePresets}
                onChange={handleChange}
                disabledDate={disabledDate}
                style={{
                  width: 215,
                  backgroundColor: theme === "dark" ? "#555" : undefined,
                  color: theme === "dark" ? "white" : undefined,
                }}
                defaultValue={[dayjs(), dayjs()]}
                dropdownClassName={`${theme === "dark" ? "dark-theme-dropdown" : ""
                  }`}
              />
            </ConfigProvider>

            {/* 🔹 Apply Button */}
            <Button
              type="primary"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={handleApply}
              style={{
                backgroundColor: hovered ? "#91C25F" : "transparent",
                border: "1px solid #4CAF50",
                borderRadius: "6px",
                color: theme === "dark" ? "#ffffff" : "#000000",
                height: "32px",
                padding: "0 16px",
                transition: "all 0.15s ease-in-out",
              }}
            >
              Apply
            </Button>

            {/* 🔹 Search */}
          </Col>
          <Col
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "5px",
              alignItems: "center",
            }}
          >
            {/* 🔹 Status Filter */}
            <Input
              placeholder="Search..."
              value={searchInput}
              onChange={handleSearchChange}
              onPressEnter={handleSearchSubmit}
              className={
                theme === "dark" ? "custom-input-dark" : "custom-input-light"
              }
              style={{
                width: "170px",
                border: "1px solid #4caf50",
              }}
            />
            <Dropdown
              overlay={
                <Menu
                  onClick={({ key }) => onStatusFilterChange(key)}
                  items={[
                    {
                      key: "all",
                      label: (
                        <span
                          style={{
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "#122F6E",
                              marginRight: "6px",
                            }}
                          ></span>
                          All
                        </span>
                      ),
                    },
                    {
                      key: "active",
                      label: (
                        <span
                          style={{
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "green",
                              marginRight: "6px",
                            }}
                          ></span>
                          Active
                        </span>
                      ),
                    },
                    {
                      key: "pause",
                      label: (
                        <span
                          style={{
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "red",
                              marginRight: "6px",
                            }}
                          ></span>
                          Paused
                        </span>
                      ),
                    },
                    {
                      key: "pending",
                      label: (
                        <span
                          style={{
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "#EC7117",
                              marginRight: "6px",
                            }}
                          ></span>
                          Pending
                        </span>
                      ),
                    },
                  ]}
                />
              }
              trigger={["click"]}
            >
              <Button
                style={{
                  borderRadius: 8,
                  background:
                    theme === "dark" ? "rgba(82,196,26,0.12)" : "#f6ffed",
                  border: "1px solid #4CAF50",
                  color: theme === "dark" ? "#95de64" : "#389e0d",
                  fontWeight: 500,
                  width: 100,
                }}
              >
                <Space size={2}>
                  <FilterOutlined />
                  {campaignStatusFilter.charAt(0).toUpperCase() +
                    campaignStatusFilter.slice(1)}
                  <DownOutlined style={{ fontSize: 10 }} />
                </Space>
              </Button>
            </Dropdown>

            {/* 🔹 Total Daily Spend */}
            {/* <span
              style={{
                backgroundColor: "transparent",
                padding: "5px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                color: theme === "dark" ? "#fff" : "#000",
                border: "1px solid #4caf50",
              }}
            >
              Budget: ${totalDailySpend}
            </span> */}
            {userdetails?.role !== "Network_Partner" && (
              <span
                style={{
                  backgroundColor: "transparent",
                  padding: "5px 14px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: theme === "dark" ? "#fff" : "#000",
                  border: "1px solid #4caf50",
                }}
              >
                Budget: ${totalDailySpend}
              </span>
            )}


            {/* 🔹 Refresh Button */}
            <Button
              type="primary"
              onClick={handleRefresh}
              icon={<ReloadOutlined className="black-icon" />}
              style={{
                backgroundColor: "#91C25F",
                color: "#000",
                border: "none",
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* <div>{renderCarouselNav()}</div> */}

      {/* {loading ? (
        <Skeleton
          active
          paragraph={{ rows: 12 }}
          style={{ marginTop: "10px" }}
        />
      ) 
      : (
        // <Table
        //     style={{
        //         width: "100%",
        //         height: "calc(100vh - 300px)", // Full height minus header/footer space
        //         minHeight: "100%", // Ensures minimum height is filled even with fewer rows
        //         tableLayout: "fixed", // Ensures proper layout of the table with defined width
        //     }}
        //     className={`custom-dark-table ${theme === 'dark' ? 'dark-mode-pagination' : 'light-mode-pagination'}`}
        //     columns={columns}
        //     dataSource={campaignData.map((item, index) => ({
        //         ...item,
        //         key: index
        //     })).reverse()}
        //     pagination={{ pageSize: paginationSize }}
        //     scroll={{
        //         x: 'max-content', // Enable horizontal scroll if needed
        //          y: 'calc(63vh)'
        //     }}
        //     expandable={{
        //         expandedRowRender: (record) => (
        //             <ExpandedRowContent
        //                 record={record}
        //                 changeRRefrst={changeRRefrst}
        //                 network={selectedKey}
        //             />
        //         ),
        //         rowExpandable: (record) => !!record
        //     }}

        // />
        // <div>
        //   <div>

        //   </div>
        <div>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            renderTabBar={() => <></>}
          >
            <Tabs.TabPane key="1">
              <Table
                style={{
                  width: "100%",
                  height: "calc(100vh - 300px)",
                  // minHeight: '100%',
                  tableLayout: "fixed",
                }}
                className={`custom-dark-table ${theme === "dark"
                  ? "dark-mode-pagination"
                  : "light-mode-pagination"
                  }`}
                columns={columns}
                dataSource={getFilteredSingleCampaigns()
                  .map((item, index) => ({
                    ...item,
                    key: index,
                  }))
                  .reverse()}
                pagination={{ pageSize: paginationSize }}
                scroll={{
                  x: "auto",
                  y: "calc(63vh)",
                }}
                expandable={{
                  expandedRowRender: (record) => (
                    <ExpandedRowContent
                      record={record}
                      changeRRefrst={changeRRefrst}
                      network={selectedKey}
                    />
                  ),
                  rowExpandable: (record) => !!record,
                }}
                rowClassName={() => "custom-row"}
                rowKey="key"
                components={{
                  body: {
                    row: (props) => (
                      <tr
                        {...props}
                        style={{
                          ...props.style,
                          height: "32px",
                        }}
                      />
                    ),
                    cell: (props) => (
                      <td
                        {...props}
                        style={{
                          ...props.style,
                          paddingTop: "6px",
                          paddingBottom: "6px",
                          fontSize: "13px",
                        }}
                      />
                    ),
                  },
                }}
              />
            </Tabs.TabPane>
            <Tabs.TabPane key="2">
              <Table
                style={{
                  width: "100%",
                  height: "calc(100vh - 300px)",
                  // minHeight: '100%',
                  tableLayout: "fixed",
                }}
                className={`custom-dark-table ${theme === "dark"
                  ? "dark-mode-pagination"
                  : "light-mode-pagination"
                  }`}
                columns={columnsformultipleadsets}
                dataSource={getFilteredMultipleAdsetCampaigns()
                  .map((item, index) => ({
                    ...item,
                    key: index,
                  }))
                  .reverse()}
                pagination={{ pageSize: paginationSize }}
                scroll={{
                  x: "auto",
                  y: "calc(63vh)",
                }}
                expandable={{
                  expandedRowRender: (record) => (
                    <ExpandedAdsetsContent
                      record={record}
                      changeRRefrst={changeRRefrst}
                      network={selectedKey}
                    />
                  ),
                  rowExpandable: (record) => !!record,
                }}
                rowClassName={() => "custom-row"}
                rowKey="key"
                components={{
                  body: {
                    row: (props) => (
                      <tr
                        {...props}
                        style={{
                          ...props.style,
                          height: "32px",
                        }}
                      />
                    ),
                    cell: (props) => (
                      <td
                        {...props}
                        style={{
                          ...props.style,
                          paddingTop: "6px",
                          paddingBottom: "6px",
                          fontSize: "13px",
                        }}
                      />
                    ),
                  },
                }}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
        // </div>
      )} */}

      <div>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          renderTabBar={() => <></>}
        >
          {/* <Tabs.TabPane key="1">
            {loading ? (
              <Skeleton
                active
                paragraph={{ rows: 12 }}
                style={{ marginTop: "10px" }}
              />
            ) : (
              <Table
                style={{
                  width: "100%",
                  height: "calc(100vh - 300px)",
                  // minHeight: '100%',
                  tableLayout: "fixed",
                }}
                className={`custom-dark-table ${theme === "dark"
                  ? "dark-mode-pagination"
                  : "light-mode-pagination"
                  }`}
                columns={columns}
                dataSource={getFilteredSingleCampaigns()
                  .map((item, index) => ({
                    ...item,
                    key: index,
                  }))
                  .reverse()}
                pagination={{ pageSize: paginationSize }}
                scroll={{
                  x: "auto",
                  y: "calc(63vh)",
                }}
                expandable={{
                  expandedRowRender: (record) => (
                    <ExpandedRowContent
                      record={record}
                      changeRRefrst={changeRRefrst}
                      network={selectedKey}
                    />
                  ),
                  rowExpandable: (record) => !!record,
                }}
                rowClassName={() => "custom-row"}
                rowKey="key"
                components={{
                  body: {
                    row: (props) => (
                      <tr
                        {...props}
                        style={{
                          ...props.style,
                          height: "32px",
                        }}
                      />
                    ),
                    cell: (props) => (
                      <td
                        {...props}
                        style={{
                          ...props.style,
                          paddingTop: "6px",
                          paddingBottom: "6px",
                          fontSize: "13px",
                        }}
                      />
                    ),
                  },
                }}
              />
            )
            }
          </Tabs.TabPane> */}
          <Tabs.TabPane key="2">
            {loadingForMultipleAdsets ? (
              <Skeleton
                active
                paragraph={{ rows: 12 }}
                style={{ marginTop: "10px" }}
              />
            ) : (
              <Table
                style={{
                  width: "100%",
                  height: "calc(100vh - 300px)",
                  // minHeight: '100%',
                  tableLayout: "fixed",
                }}
                className={`custom-dark-table ${theme === "dark"
                  ? "dark-mode-pagination"
                  : "light-mode-pagination"
                  }`}
                columns={columnsformultipleadsets}
                rowSelection={{
                  type: "checkbox",
                  selectedRowKeys: checkedRowIds,
                  onChange: (rowIds, rowRecords) => {
                    setCheckedRowIds(rowIds);
                    setCheckedRowRecords(rowRecords);
                  },
                  columnTitle: (checkboxNode) => (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {checkboxNode} {/* ✅ Select-all checkbox */}

                      {/* <IoMdCreate
                        style={{ cursor: "pointer", }}
                        onClick={(e) => {
                          e.stopPropagation(); // ⛔ prevent select-all toggle
                          // handleHeaderIconClick();
                          // console.log(checkedRowRecords);
                          setIsModalVisiblesForBulkComments(true)
                        }}
                      /> */}
                      <IoMdCreate
                        style={{
                          cursor: hasData ? "pointer" : "not-allowed",
                          opacity: hasData ? 1 : 0.4,
                          pointerEvents: hasData ? "auto" : "none", // 🔒 fully disable
                        }}
                        onClick={(e) => {
                          if (!hasData) return;

                          e.stopPropagation(); // ⛔ prevent select-all toggle
                          setIsModalVisiblesForBulkComments(true);
                        }}
                      />
                    </div>
                  ),
                }}
                dataSource={getFilteredMultipleAdsetCampaigns()
                  .map((item, index) => ({
                    ...item,
                    key: index,
                  }))
                  .reverse()}
                // pagination={{ pageSize: paginationSize }}
                pagination={{
                  pageSize: paginationSize,
                  showSizeChanger: true,
                  onChange: (page, pageSize) => {
                    setPaginationSize(pageSize);
                  }
                }}
                scroll={{
                  x: "auto",
                  y: "calc(63vh)",
                }}
                expandable={{
                  expandedRowRender: (record) => (
                    <ExpandedAdsetsContent
                      record={record}
                      changeRRefrst={changeRRefrst}
                      network={selectedKey}
                    />
                  ),
                  rowExpandable: (record) => !!record,
                }}
                rowClassName={() => "custom-row"}
                rowKey="key"
                components={{
                  body: {
                    row: (props) => (
                      <tr
                        {...props}
                        style={{
                          ...props.style,
                          height: "32px",
                        }}
                      />
                    ),
                    cell: (props) => (
                      <td
                        {...props}
                        style={{
                          ...props.style,
                          paddingTop: "6px",
                          paddingBottom: "6px",
                          fontSize: "13px",
                        }}
                      />
                    ),
                  },
                }}
              />
            )}
          </Tabs.TabPane>
        </Tabs>
      </div>

      {!restrictedEmails.includes(userdetails.email) && (
        <Drawer
          title={adsetcampaigndata?.campaign_name || ""}
          placement="right"
          onClose={onCloseDrawer}
          open={adsetsdrawerVisible}
          width="100%" // Adjust width as needed
          style={{
            backgroundColor: theme === "dark" ? "#333" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
          }}
        >
          <Adsets
            selectedRow={adsetcampaigndata}
            onClose={onCloseDrawer}
            changeRRefrst={changeRRefrst}
            network={selectedKey}
          />
        </Drawer>
      )}

      {/* <Drawer
                title={adsetcampaigndata?.campaign_name || ''}
                placement="right"
                onClose={onCloseDrawer}
                open={adsetsdrawerVisible}
                width="90%" // Adjust width as needed
            >
                <Adsets selectedRow={adsetcampaigndata} onClose={onCloseDrawer} changeRRefrst={changeRRefrst} />
            </Drawer> */}
      <Modal
        title="Confirm approval"
        visible={deleteModalVisible}
        onOk={handleOkDeleteDraft}
        onCancel={() => setDeleteModalVisible(false)}
        className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
      >
        <p>Are you sure you want to delete this draft</p>
      </Modal>

      <Modal
        title={firstColumnValue}
        visible={isModalVisibles}
        className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
        onOk={handleOks}
        onCancel={handleCancels}
        footer={[
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: 'flex', flexDirection: "column" }}>
              <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                Last Edited Time:
              </span>
              <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                {universalOject?.editedTime || ""}
              </span>
            </div>
            <div>
              <Button
                key="delete"
                type="danger"
                onClick={handleDelete}
                style={{ marginRight: 'auto', border: "1px solid #e3e3da" }}
              >
                Delete
              </Button>
              <Button key="cancel" onClick={handleCancels} style={{ marginLeft: "4px" }}>
                Cancel
              </Button>
              <Button key="ok" onClick={handleOks} style={{ marginLeft: "4px", backgroundColor: "#91C25F" }}>
                Ok
              </Button>
            </div>
          </div>
        ]}
      >
        <Input.TextArea
          placeholder="Enter your comments here"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Modal>
      <Modal
        title={"Campaigns"}
        visible={isModalVisiblesForBulkComments}
        className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
        onOk={handleOksForBulkComments}
        onCancel={handleCancelsForBulkComments}
        footer={[
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: 'flex', flexDirection: "column" }}>
              {/* <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                Last Edited Time:
              </span>
              <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                {universalOject?.editedTime || ""}
              </span> */}
            </div>
            <div>
              <Button
                key="delete"
                type="danger"
                onClick={handleDeleteForBulkComments}
                style={{ marginRight: 'auto', border: "1px solid #e3e3da" }}
              >
                Delete
              </Button>
              <Button key="cancel" onClick={handleCancelsForBulkComments} style={{ marginLeft: "4px" }}>
                Cancel
              </Button>
              <Button key="ok" onClick={handleOksForBulkComments} style={{ marginLeft: "4px", backgroundColor: "#91C25F" }}>
                Ok
              </Button>
            </div>
          </div>
        ]}
      >
        <Input.TextArea
          placeholder="Enter your comments here"
          value={commentForBulkComments}
          onChange={(e) => setCommentForBulkComments(e.target.value)}
        />
      </Modal>
    </div>
  );
};
export default App;
