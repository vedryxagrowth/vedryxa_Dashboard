"use client";
import React, { useState, useEffect } from "react";
import {
  FilterOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
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
import { FaClone, FaEye, FaPenToSquare, FaTrashCan } from "react-icons/fa6";
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
  const [draftsLoading, setDraftsLoading] = useState(true);
  const [draftsData, setDraftsData] = useState([]);
  const [adsetsdrawerVisible, setadsetsDrawerVisible] = useState(false);
  const [adsetcampaigndata, setadsetcampaigndata] = useState(null);
  const [duplicatenewcampaigns, setduplicatenewcampaigns] = useState(null);
  const [refrst, setRefrst] = useState(false);
  const [options, setOptions] = useState([]);
  const [createcamselectedacc, setcreatecamselectedacc] = useState("");
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
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
  const [activeTab, setActiveTab] = useState("1");
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
  const onStatusFilterChange = (key) => {
    setCampaignStatusFilter(key);
  };

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
  const items = [
    { key: "1", label: "Old", content: "Content for Live data" },
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
        className={`left-pill-tabs ${
          theme === "dark" ? "pill-tabs-dark" : "pill-tabs-light"
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

      setCampaignData(filteredCampaignData);
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
    setLoading(true);
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

      setMultipleAdsetCampaignData(filteredCampaignData);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      setError("Failed to fetch campaign data.");
    } finally {
      setLoading(false);
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
    } finally {
      setDraftsLoading(false);
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
  // Handle key change
  const handleKeyChange = (key) => {
    setSelectedKey(key);
    setSelectedValue(null); // Reset value selection
    // Update value options based on selected key
  };

  // Handle value change
  const handleValueChange = (value) => {
    setSelectedValue(value);
    // fetchData(value); // Fetch data based on selected value
    // fetchMultipleAdsetCampaigns(value); // Fetch multiple adset campaigns based on selected value
  };
  const handleApply = () => {
    if (selectedValue && startDate && endDate) {
      fetchData(selectedValue, startDate, endDate);
      fetchMultipleAdsetCampaigns(selectedValue, startDate, endDate);
    } else {
      message.warning("Please select project, account and date range");
    }
  };

  useEffect(() => {
    if (selectedValue) {
      fetchData(selectedValue);
    }
  }, [refrst, selectedValue]);

  useEffect(() => {
    if (selectedValue) {
      fetchMultipleAdsetCampaigns(selectedValue);
    }
  }, [refrst, selectedValue]);

  useEffect(() => {
    if (draftsLoading) {
      fetchDrafts();
    }
  }, [draftsLoading]);
  const handleRefresh = () => {
    if (selectedValue) {
      fetchData(selectedValue);
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
      fetchData(selectedValue, startDate, endDate, searchValue);
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
    fetchData(selectedValue, startDate, endDate, searchInput); // Fetch data with search input
    fetchMultipleAdsetCampaigns(selectedValue, startDate, endDate, searchInput); // Fetch multiple adset campaigns with search input
    console.log("Search Input:", searchInput);
    console.log("Selected Input:", searchInput.length);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [useaproval, setuseraproval] = useState(null);
  const [isModalVisibleForAdsets, setIsModalVisibleForAdsets] = useState(false);
  const [useaprovalForAdsets, setuseraprovalForAdsets] = useState(null);

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

        message.success("Approval confirmed");
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

        message.success("Approval confirmed");
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
      console.log("Approval confirmed");
      // Close the modal
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
      console.log("Token:", token);

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
              message.success(
                `Campaign ${checked ? "Launched" : "Paused"} Successfully`
              );

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
              `Error updating facebook status: ${
                fbError.response?.data?.error?.message || fbError.message
              }`
            );
          }
        } else {
          // If no campaignId is available, only update the backend
          message.success("Campaign launched successfully");

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
      console.log("Token:", token);

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
              message.success(
                `Campaign ${checked ? "Launched" : "Paused"} Successfully`
              );

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
              `Error updating facebook status: ${
                fbError.response?.data?.error?.message || fbError.message
              }`
            );
          }
        } else {
          // If no campaignId is available, only update the backend
          message.success("Campaign launched successfully");

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
                  message.success(
                    "Daily amount updated successfully on both backend and Facebook"
                  );

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
              message.success("Daily amount updated successfully");

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
                  message.success(
                    "Daily amount updated successfully on both backend and Facebook"
                  );

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
              message.success("Daily amount updated successfully");

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

      message.success("Campaign deleted");
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
                  className={`custom-modal ${
                    theme === "dark" ? "dark-theme-modal" : ""
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
                onClick={() => handleApprovalforAdsets(record)} // This sets useaproval and opens modal
              >
                Approve
              </Button>

              {/* Show Modal only for selected record */}
              {useaprovalForAdsets?.identifier === record.identifier && (
                <Modal
                  title="Confirm approval"
                  open={isModalVisibleForAdsets}
                  onOk={handleOkForAdsets}
                  onCancel={() => setIsModalVisibleForAdsets(false)}
                  className={`custom-modal ${
                    theme === "dark" ? "dark-theme-modal" : ""
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
        accountis={createcamselectedacc}
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
              className={`${
                theme === "dark" ? "dark-theme" : "light-theme"
              } green-border-select`}
            >
              {options.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>

            {/* 🔹 Select Account */}
            <Select
              showSearch
              placeholder="Select Accounts"
              style={{ width: 225 }}
              onChange={handleValueChange}
              disabled={!selectedKey}
              value={selectedValue}
              optionFilterProp="children"
              filterOption={(input, option) =>
                /^[0-9]*$/.test(input) &&
                option?.value.toString().includes(input)
              }
              onDropdownVisibleChange={(open) => setIsOpen(open)}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${
                theme === "dark" ? "dark-theme" : "light-theme"
              } green-border-select`}
            >
              {valueOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
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
                        />
                      ) : (
                        <CloseCircleFilled
                          style={{ color: "#EC7117", fontSize: 15 }}
                        />
                      )}
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select>

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
                dropdownClassName={`${
                  theme === "dark" ? "dark-theme-dropdown" : ""
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

      <div>{renderCarouselNav()}</div>

      {loading ? (
        <Skeleton
          active
          paragraph={{ rows: 12 }}
          style={{ marginTop: "10px" }}
        />
      ) : (
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
                className={`custom-dark-table ${
                  theme === "dark"
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
                className={`custom-dark-table ${
                  theme === "dark"
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
      )}

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
    </div>
  );
};
export default App;
