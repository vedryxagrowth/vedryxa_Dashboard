"use client";
import {
  CloseOutlined,
  CommentOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  GlobalOutlined,
  LikeOutlined,
  MoreOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Dropdown,
  Drawer,
  Flex,
  Input,
  List,
  Menu,
  Row,
  Space,
  Tabs,
  Typography,
  Table,
  message,
  theme,
  Select,
  Spin,
  Tooltip,
  Switch
} from "antd";
import axios from "axios";
import moment from "moment-timezone";
import { useEffect, useState, useMemo } from "react";
import { useTokenContext } from "../../components/parent";
import Createadsets from "./Createadsets";
import Createads from "./Ads";
import Editadset from "./EditAdset";
import Viewadsets from "./ViewAdset";
const { TabPane } = Tabs;
const { Title, Text } = Typography;


export default function Adsets({ selectedRow, onClose, changeRRefrst, network }) {
  // const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [adsetsDrawerVisible, setadsetsDrawerVisible] = useState(false);
  const [editadsetsDrawerVisible, seteditadsetsDrawerVisible] = useState(false);
  const [viewadsetsDrawerVisible, setviewadsetsDrawerVisible] = useState(false);
  const [adsDrawerVisible, setadsDrawerVisible] = useState(false)
  const [adsetsdata, setadsetsdata] = useState(null)
  const [editadsetsdata, seteditadsetsdata] = useState(null)
  const [viewadsetsdata, setviewadsetsdata] = useState(null)
  const [campaignDetails, setCampaignDetails] = useState([]);
  const [ovrallcampdetal, setovrallcampdetal] = useState({});
  const [twoor, settwoor] = useState(false)
  const [loading, setLoading] = useState(false);  // Add loading state
  const { theme } = useTokenContext();

  console.log(ovrallcampdetal, "ovrallcampdetal")

  const rerender = () => {
    settwoor((els) => !els)
  }
  var token = localStorage.getItem("token");
  // console.log(selectedRow, "selectedRow")
  console.log(campaignDetails, "campaignDetails")
  // console.log(campaignDetails,"campaignDetails")
  // var id=selectedRow.id

  useEffect(() => {
    const fetchCampaignDetails = async (identifier) => {
      try {
        const response = await axios.get(`https://www.testapi.adsgoat.in/api/viecampaigndata/${identifier}`, {
          headers: {
            Authorization: token,
          }
        });
        console.log(response?.data, "response data");
        setovrallcampdetal(response?.data[0]);
        setCampaignDetails(response?.data[0].adsetlevel);
      } catch (error) {
        console.error("Error fetching campaign details:", error);
        setCampaignDetails([])
      }
    };

    if (selectedRow) {
      fetchCampaignDetails(selectedRow.identifier);
    }
  }, [selectedRow, twoor]); // Add selectedRow and token as dependencies


  const showDrawer1 = () => {
    setadsetsDrawerVisible(true)
  };

  const onCloseDrawer = () => {
    // setIsDrawerVisible(false);
    setadsetsDrawerVisible(false)
    setadsDrawerVisible(false)
    seteditadsetsDrawerVisible(false)
    setviewadsetsDrawerVisible(false)
  };

  // Function to handle click on campaign name
  const handleadsetsClick = (record) => {
    setadsetsdata(record)
    console.log(record, "adsets data")
    setadsDrawerVisible(true)
  };
  const handleadsetsEdit = (record) => {
    // console.log(record)
    seteditadsetsdata(record)
    seteditadsetsDrawerVisible(true)

  }
  const handleadsetsView = (record) => {
    setviewadsetsdata(record)
    setviewadsetsDrawerVisible(true)
    // console.log(record)
  }
  const EditableField = ({ value, record, dataIndex, updateTableRow, changeRRefrst }) => {
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
        setLoading(true);  // Start loading
        try {
          const budgets = inputValue * 100; // Convert input value to cents

          // Step 1: Update the daily budget in your backend
          const response = await fetch(`https://www.testapi.adsgoat.in/api/adsetdailyBudget/${selectedRow.identifier}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem("token"),
            },
            body: JSON.stringify({ Daily_amount: budgets }),
          });

          if (response.ok) {

            console.log("Daily amount updated successfully in backend");

            // Step 2: If campaignId is available, update the budget on Facebook
            if (campaignDetails.Adsetid) {
              try {
                const fbResponse = await axios.post(
                  `https://graph.facebook.com/v20.0/${campaignDetails.Adsetid}`,
                  null,
                  {
                    params: {
                      daily_budget: budgets,
                      access_token: selectedRow.access_token,
                    },
                    headers: {
                      'Content-Type': 'application/json',
                    }
                  }
                );

                if (fbResponse.status === 200) {
                  console.log("Daily budget updated successfully on Facebook");
                  message.success("Daily amount updated successfully on both backend and Facebook");

                  // Update the table row data with the new daily amount
                  updateTableRow({ ...record, Daily_amount: budgets });

                  // Trigger a refresh or any other necessary updates
                  rerender()
                } else {
                  console.error("Failed to update daily amount on Facebook");
                  message.error(`Failed to update daily amount on Facebook: ${fbResponse.data.error.message}`);
                }
              } catch (fbError) {
                console.error("Error updating daily amount on Facebook:", fbError);
                message.error(`Error updating daily amount on Facebook: ${fbError.response?.data?.error?.message || fbError.message}`);
              }
            } else {
              // If no campaignId, just update the backend
              message.success("Daily amount updated successfully");

              // Update the table row data with the new daily amount
              updateTableRow({ ...record, Daily_amount: budgets });

              // Trigger a refresh or any other necessary updates
              rerender()
            }
          } else {
            console.error("Failed to update daily amount in backend");
            message.error("Failed to update daily amount in backend");
          }
        } catch (error) {
          console.error("Error updating daily amount:", error);
          message.error("Error updating daily amount");
        } finally {
          setLoading(false);  // End loading
        }
      }

      setEditing(false);
    };

    console.log(network, "network from adsets.js");

    return (
      <div>
        {editing ? (
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onPressEnter={handleSave}
            onBlur={handleSave}
            autoFocus
          />
        ) : (
          loading ? (
            <Spin />
          ) : (
            value !== 0 && value !== '' && (
              <div onClick={handleEdit}>
                {value}
                <EditOutlined style={{ marginLeft: "5px", cursor: "pointer" }} />
              </div>
            )
          )
        )}
      </div>
    );
  };

  const updateTablebudget = (updatedRecord) => {
    setCampaignDetails(prevDetails =>
      Array.isArray(prevDetails)
        ? prevDetails.map(adset =>
          adset.identifier === updatedRecord.identifier
            ? { ...adset, Daily_amount: updatedRecord.Daily_amount }
            : adset
        )
        : [] // If prevDetails is not an array, return an empty array (or handle this case appropriately)
    );
  };

  const updateAdSetStatus = async (adset_id, status, access_token) => {
    try {
      const res = await axios.post(
        `https://graph.facebook.com/v22.0/${adset_id}`,
        new URLSearchParams({ status, access_token })
      );
      console.log("Ad Set Response:", res.data);
    } catch (err) {
      console.error("Ad Set Error:", err.response?.data || err.message);
    }
  };

  const onToggleStatus = async(record, checked) => {
    console.log(record, "record")
    console.log(checked, "checked")
    console.log(record.Adsetid, "Adsetid");
    console.log(selectedRow.access_token, "access_token");
    console.log(selectedRow);

    const response = await axios.post(
      `https://www.testapi.adsgoat.in/api/adsetlevel`,  
      {
        status: checked ? "ACTIVE" : "PAUSED",
        id:selectedRow.identifier,
        adset_id: record.Adsetid
      }, {
        headers: {
          Authorization: token,
        }
      }
    );
    if(response.status === 200){
      rerender();
    };
      
    // updateAdSetStatus(record.Adsetid, checked ? "ACTIVE" : "PAUSED", selectedRow.access_token)
  }

  // console.log(selectedRow)
  const data = [campaignDetails]
  // const columns = [
  //   {
  //     title: 'AdsetName',
  //     dataIndex: 'AdsetName',
  //     key: 'AdsetName',
  //     render: (text, record) => (
  //       <span
  //         style={{ cursor: 'pointer' }}
  //         onClick={() => handleadsetsClick(record)}
  //       >
  //         {text}
  //       </span>
  //     ),
  //   },
  //   {
  //     title: 'Account_Number',
  //     dataIndex: 'Account_Number',
  //     key: 'Account_Number',
  //     render: (text, record) => (
  //       <span>{ovrallcampdetal.Account_Number}</span>
  //     ),
  //   },
  //   {
  //     title: "Daily Amount",
  //     dataIndex: "Daily_amount",
  //     width: "5%",
  //     render: (Daily_amount, record) => (
  //       <>
  //         {loading ? (
  //           <Spin />
  //         ) : (
  //           record?.Daily_amount !== undefined && (
  //             <EditableField
  //               value={record.Daily_amount / 100}
  //               record={record}
  //               dataIndex="Daily_amount"
  //               updateTableRow={updateTablebudget}
  //             />
  //           )
  //         )}
  //       </>
  //     ),
  //   },
  //   {
  //     title: "Error",
  //     dataIndex: "error",
  //     width: "10%",
  //     render: (text, record) => (
  //       <>
  //         {record?.error ? (
  //           <Tooltip title={record.error} placement="top" color="red">
  //             <span style={{ color: 'red', cursor: 'pointer' }}>Error</span>
  //           </Tooltip>
  //         ) : (
  //           <span>No Error</span>
  //         )}
  //       </>
  //     ),
  //   },
  //   {
  //     title: 'Status',
  //     dataIndex: 'status',
  //     key: 'status',
  //     render: (text, record) => (
  //       <Switch
  //           checked={record?.Status === 'ACTIVE' }
  //           onChange={(checked) => onToggleStatus(record, checked)}
  //           checkedChildren="ACTIVE"
  //           unCheckedChildren="PAUSED"
  //           disabled={
  //             !(
  //               ovrallcampdetal?.fbstatus === 'Live' &&
  //               ovrallcampdetal?.campaignlevel?.Status === 'ACTIVE'
  //             )
  //           }
  //       />
  //     )
  //   },
  //   {
  //     title: 'Action',
  //     key: 'action',
  //     render: (_, record) => (
  //       <div style={{ display: 'flex', gap: '10px' }}>
  //         <Button onClick={() => handleadsetsEdit(record)} icon={<EditOutlined />}>
  //           Edit
  //         </Button>
  //         <Button onClick={() => handleadsetsView(record)} icon={<EyeOutlined />}>
  //           View
  //         </Button>
  //       </div>

  //     ),
  //   }
  // ];
  
  const columns = useMemo(() => [
    {
      title: 'AdsetName',
      dataIndex: 'AdsetName',
      key: 'AdsetName',
      render: (text, record) => (
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => handleadsetsClick(record)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Account_Number',
      dataIndex: 'Account_Number',
      key: 'Account_Number',
      render: (text, record) => (
        <span>{ovrallcampdetal.Account_Number}</span>
      ),
    },
    {
      title: "Daily Amount",
      dataIndex: "Daily_amount",
      width: "5%",
      render: (Daily_amount, record) => (
        <>
          {loading ? (
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
          )}
        </>
      ),
    },
    {
      title: "Error",
      dataIndex: "error",
      width: "10%",
      render: (text, record) => (
        <>
          {record?.error ? (
            <Tooltip title={record.error} placement="top" color="red">
              <span style={{ color: 'red', cursor: 'pointer' }}>Error</span>
            </Tooltip>
          ) : (
            <span>No Error</span>
          )}
        </>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <Switch
          checked={record?.Status === 'ACTIVE'}
          onChange={(checked) => onToggleStatus(record, checked)}
          checkedChildren="ACTIVE"
          unCheckedChildren="PAUSED"
          style={{ backgroundColor: record.Status === 'ACTIVE' && "#91C25F" }}
          disabled={
            !(
              ovrallcampdetal?.fbstatus === 'Live' &&
              ovrallcampdetal?.camapaignlevel?.Status === 'ACTIVE'
            )
          }
        />
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button  className="dark-icon-button" onClick={() => handleadsetsEdit(record)} icon={<EditOutlined />} style={{color: theme === "dark" ? "white" : "#000"}}>
            Edit
          </Button>
          <Button  className="dark-icon-button" onClick={() => handleadsetsView(record)} icon={<EyeOutlined />} style={{color: theme === "dark" ? "white" : "#000"}}>
            View
          </Button>
        </div>
      ),
    }
  ], [
    handleadsetsClick,
    handleadsetsEdit,
    handleadsetsView,
    ovrallcampdetal,
    loading,
    updateTablebudget,
    onToggleStatus
  ]);

  return (
    <>
      {/* <h1>{selectedRow?.campaignName}</h1> */}
      <Flex justify="space-between" align="center">
        <Title
          level={3}
          style={{ margin: "0 0 10px 0", color: theme === "dark" ? "white" : "#1677ff" }}>
          Adsets
        </Title>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button  style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px",marginRight: '10px'}} onClick={showDrawer1}>
            Create Adset
          </Button>
        </div>

      </Flex>
      <Row style={{ columnGap: "10px" }} align={"bottom"}>
        <Col span={7}>
          <Input
            placeholder="Search..."
            variant="filled"
            suffix={<SearchOutlined />}
            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
          // value={searchInput}
          // onChange={handleSearchChange}
          />
        </Col>

        <Col span={4}>
          {<span style={{ color: "#B4B4B4" }}>Status</span>}
          <Select
            // defaultValue="All"
            style={{ width: "100%" }}
            dropdownClassName={theme === 'dark' && "custom-dropdown"}
            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
            // onChange={handleSelectChange}
            options={[
              { value: "CREATED", label: "CREATED" },
              { value: "AI_REJECTED", label: "AI_REJECTED" },
              { value: "PENDING_APPROVAL", label: "PENDING_APPROVAL" },
              { value: "PUBLISHED", label: "PUBLISHED" },
            ]}
          />
        </Col>
      </Row>

      {/* <Drawer
        title="Create Adsets"
        placement="right"
        // closable={false}
        onClose={onCloseDrawer}
        open={adsetsDrawerVisible}
        width="90%" // Adjust width as needed
      >
        <Createadsets />
      </Drawer> */}
      <Drawer
        title={ovrallcampdetal?.adsetlevel?.AdsetName}
        placement="right"
        // closable={false}
        onClose={onCloseDrawer}
        open={adsDrawerVisible}
        width="90%" // Adjust width as needed
        style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
      >
        <Createads selectedRow={ovrallcampdetal} network={network}/>

      </Drawer>
      <Drawer
        title={editadsetsdata?.AdsetName}
        placement="right"
        // closable={false}
        onClose={onCloseDrawer}
        open={editadsetsDrawerVisible}
        width="90%" // Adjust width as needed
        style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
      >
        <Editadset selectedRow={ovrallcampdetal} editadsetlevel={editadsetsdata} onClose={onCloseDrawer} changeRRefrst={changeRRefrst} rerender={rerender} />

      </Drawer>
      <Drawer
        title={viewadsetsdata?.AdsetName}
        placement="right"
        // closable={false}
        onClose={onCloseDrawer}
        open={viewadsetsDrawerVisible}
        width="90%" // Adjust width as needed
        style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
      >
        <Viewadsets selectedRow={ovrallcampdetal} viewadsetlevel={viewadsetsdata} onClose={onCloseDrawer} />

      </Drawer>
      <Table dataSource={data} columns={columns} rowKey={(record, index) => index} className={`custom-dark-table ${theme === 'dark' ? 'dark-mode-pagination' : 'light-mode-pagination'}`}/>
    </>
  )
}