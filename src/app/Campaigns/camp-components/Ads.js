"use client";
import {
  CloseOutlined,
  CommentOutlined,
  CopyOutlined,
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
  Tooltip,
  Switch
} from "antd";
import axios from "axios";
import moment from "moment-timezone";
import { useEffect, useState } from "react";
import { useTokenContext } from "../../components/parent";
import Createnewads from "./Createads";
import Editads from "./EditAds";
import Viewads from "./ViewAds";
import Duplicatenewads from "./Dupadd";

const { TabPane } = Tabs;
const { Title, Text } = Typography;


export default function Createads({ selectedRow, network }) {

  const [newadsDrawerVisible, setnewadsDrawerVisible] = useState(false);
  const [duplicateDrawerVisible, setduplicateDrawerVisible] = useState(false);
  const [duplicatedata, setduplicatedata] = useState(false);
  const [editadsdata, seteditadsdata] = useState(null)
  const [editadsDrawerVisible, seteditadsDrawerVisible] = useState(false);
  const [viewadsDrawerVisible, setviewadsDrawerVisible] = useState(false);
  const [viewadsdata, setviewadsdata] = useState(null)
  var token = localStorage.getItem("token")
  const [data, setData] = useState(selectedRow?.addlevel);
  const [selectedKey, setSelectedKey] = useState(null);
  const [refrst, setRefrst] = useState(false);
  const [visibleNewAdset, setVisibleNewAdset] = useState(false);
  const [visibleDuplicateAdd, setVisibleDuplicateAdd] = useState(false);
  const [ovrallcampdetal, setovrallcampdetal] = useState({});
  const { theme } = useTokenContext();


  // console.log(selectedRow, "selectedRow")
  useEffect(() => {
    const fetchCampaignDetails = async (identifier) => {
      try {
        const response = await axios.get(`https://www.testapi.adsgoat.in/api/viecampaigndata/${identifier}`, {
          headers: {
            Authorization: token,
          }
        });

        console.log(response?.data);
        setovrallcampdetal(response?.data[0])
        setData(response?.data[0]?.addlevel)
      } catch (error) {
        console.error("Error fetching the campaign details:", error);
      }
    };

    if (selectedRow) {
      fetchCampaignDetails(selectedRow.identifier);
    }
  }, [selectedRow, refrst]);
  const rerenders = () => {
    setRefrst((els) => !els)
  }

  const createnewads = () => {
    console.log(network, "network ads");
    setnewadsDrawerVisible(true)
    setVisibleNewAdset(true)
  };
  const duplicatenewads = (record) => {
    console.log(record, "duplicated")
    setduplicatedata(record)
    setduplicateDrawerVisible(true)
    setVisibleDuplicateAdd(true);
  };

  const onCloseDrawer = () => {
    setnewadsDrawerVisible(false)
    setviewadsDrawerVisible(false)
    seteditadsDrawerVisible(false)
    setduplicateDrawerVisible(false)
    setVisibleNewAdset(false);
    setVisibleDuplicateAdd(false);

  };
  const handleadsEdit = (record) => {
    seteditadsdata(record)
    seteditadsDrawerVisible(true)
    // console.log(record)
  }
  const handleadsView = (record) => {
    setviewadsdata(record)
    setviewadsDrawerVisible(true)
    console.log(record)
  }
  const handleadsdelete = async (record) => {
    console.log(record, "deleted record");
    const id = record.id;

    try {
      const response = await fetch(`https://www.testapi.adsgoat.in/api/DeleteAdd/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        }
      });

      if (response.ok) {
        console.log('Record deleted successfully');
        const updatedData = data.filter(item => item.id !== id);
        // Update the data state with the filtered array
        setData(updatedData);
      } else {
        console.error('Failed to delete record');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleadsDuplicate = (record) => {
    // Duplicate the record and add it to the data array
    const duplicatedRecord = { ...record, id: Math.random().toString() }; // Generate a new random id for the duplicated record
    const updatedData = [...data, duplicatedRecord];
    setData(updatedData);
  };

  const updateAdStatus = async (ad_id, status, access_token) => {
    try {
      const res = await axios.post(
        `https://graph.facebook.com/v22.0/${ad_id}`,
        new URLSearchParams({ status, access_token })
      );
      console.log("Ad Response:", res.data);
    } catch (err) {
      console.error("Ad Error:", err.response?.data || err.message);
    }
  };

  const onToggleStatus = async (record, checked) => {
    console.log(record, "record")
    console.log(checked, "checked")
    console.log(record.Addid, "Adid");
    console.log(selectedRow?.camapaignlevel?.access_token, "access_token");
    const response = await axios.post(
      `https://www.testapi.adsgoat.in/api/adlevel`,  
      {
        status: checked ? "ACTIVE" : "PAUSED",
        id:selectedRow.identifier,
        ad_id: record.Addid
      }, {
        headers: {
          Authorization: token,
        }
      }
    );
    if(response.status === 200){
      rerenders();
    };
    // updateAdStatus(record.Addid, checked ? "ACTIVE" : "PAUSED", selectedRow?.camapaignlevel?.access_token)

  }

  const columns = [
    {
      title: 'AddName',
      dataIndex: 'AddName',
      key: 'AddName',
      render: (_, record) => (

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>{record.AddName}</span>
          <span style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: theme === "dark" ? "#333" : '#e6f7ff' , margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '5px' }}>
            <Tooltip title="Clone">
              <CopyOutlined style={{ color: theme === "dark" ? "white" : 'red' }} onClick={() => duplicatenewads(record)} />
            </Tooltip>
          </span>
        </div>

      ),
    },
    {
      title: 'Account_Number',
      dataIndex: 'Account_Number',
      key: 'Account_Number',
      render: (text, record) => (
        <span>{selectedRow.Account_Number}</span>
      ),
    },
    {
      title: 'Approval_Status',
      dataIndex: 'status',
      // key: 'status',
      render: (text, record) => (
        <span>{record.status ? record.status : "Pending"}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'Ad_Status',
      render: (text, record) => (
        <Switch
            checked={record.Ad_Status === 'ACTIVE'}
            onChange={(checked) => onToggleStatus(record, checked)}
            checkedChildren="ACTIVE"
            unCheckedChildren="PAUSED"
            style={{ backgroundColor: record.Ad_Status === 'ACTIVE' && "#91C25F" }}
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
        <Space>
          {/* <Button icon={<EditOutlined />} onClick={() => handleadsEdit(record)}>Edit</Button> */}
          <Button className="dark-icon-button" icon={<EyeOutlined />} onClick={() => handleadsView(record)}>View</Button>
          <Button  style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px"}} onClick={() => handleadsdelete(record)}>Delete</Button>
        </Space>
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

  ];
  console.log(selectedRow, "selected rows");
  return (
    <>
      <Flex justify="space-between" align="center">
        <Title
          level={3}
          style={{ margin: "0 0 10px 0", color: theme === "dark" ? "white" : "#1677ff" }}>
          Total Ads
        </Title>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button  style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px", marginRight: '10px'}} onClick={createnewads}>
            Create Ads
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
      <Table dataSource={data} columns={columns} rowKey={(record, index) => index} className={`custom-dark-table ${theme === 'dark' ? 'dark-mode-pagination' : 'light-mode-pagination'}`}/>
      <Drawer
        title="Create Ads"
        placement="right"
        // closable={false}
        onClose={onCloseDrawer}
        open={newadsDrawerVisible}
        width="90%" // Adjust width as needed
        style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
      >
        <Createnewads data={selectedRow} visible={visibleNewAdset} onClose={onCloseDrawer} rerenders={rerenders} network={network} adsData={data} />
      </Drawer>

      <Drawer
        title="Duplicate Ads"
        placement="right"
        // closable={false}
        onClose={onCloseDrawer}
        open={duplicateDrawerVisible}
        width="90%" // Adjust width as needed
        style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
      >
        <Duplicatenewads data={selectedRow} dupdata={duplicatedata} onClose={onCloseDrawer} rerenders={rerenders} network={network} visible={visibleDuplicateAdd} adsData={data} />
      </Drawer>

      <Drawer
        title={editadsdata?.AddName}
        placement="right"
        // closable={false} 
        onClose={onCloseDrawer}
        open={editadsDrawerVisible}
        width="90%" // Adjust width as needed
        style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
      >
        <Editads selectedRow={selectedRow} editdata={editadsdata} />

      </Drawer>
      <Drawer
        title={editadsdata?.AddName}
        placement="right"
        // closable={false}
        onClose={onCloseDrawer}
        open={viewadsDrawerVisible}
        width="90%" // Adjust width as needed
        style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
      >
        <Viewads selectedRow={selectedRow} viewdata={viewadsdata} />

      </Drawer>
    </>
  )
}