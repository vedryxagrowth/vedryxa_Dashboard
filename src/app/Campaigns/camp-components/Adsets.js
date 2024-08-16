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
  Select
} from "antd";
import axios from "axios";
import moment from "moment-timezone";
import { useEffect, useState } from "react";

import Createadsets from "./Createadsets";
import Createads from "./Ads";
import Editadset from "./EditAdset";
import Viewadsets from "./ViewAdset";
const { TabPane } = Tabs;
const { Title, Text } = Typography;


export default function Adsets({ selectedRow, onClose, changeRRefrst }) {
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

  const rerender = () => {
    settwoor((els) => !els)
  }
  var token = localStorage.getItem("token");
  console.log(selectedRow, "selectedRow")
  // console.log(campaignDetails, "campaignDetails")
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
        setovrallcampdetal(response?.data[0]);
        setCampaignDetails(response?.data[0].adsetlevel);
      } catch (error) {
        console.error("Error fetching campaign details:", error);
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

  // console.log(selectedRow)
  const data = [campaignDetails]
  const columns = [
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        // <Dropdown trigger={['click']} overlay={
        //   <Menu>
        //     <Menu.Item key="edit" onClick={() => handleadsetsEdit(record)}>
        //       <EditOutlined />
        //       Edit
        //     </Menu.Item>
        //     <Menu.Item key="view" onClick={() => handleadsetsView(record)}>
        //       <EyeOutlined />
        //       View
        //     </Menu.Item>
        //   </Menu>
        // }>
        //   <Button>...</Button>
        // </Dropdown>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={() => handleadsetsEdit(record)} icon={<EditOutlined />}>
            Edit
          </Button>
          <Button onClick={() => handleadsetsView(record)} icon={<EyeOutlined />}>
            View
          </Button>
        </div>

      ),
    }
  ];
  return (
    <>
      {/* <h1>{selectedRow?.campaignName}</h1> */}
      <Flex justify="space-between" align="center">
        <Title
          level={3}
          style={{ margin: "0 0 10px 0", color: "#1677ff" }}>
          Adsets
        </Title>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button type="primary" onClick={showDrawer1} style={{ marginRight: '10px' }}>
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
          // value={searchInput}
          // onChange={handleSearchChange}
          />
        </Col>
        <Col span={4}>
          {<span style={{ color: "#B4B4B4" }}>Status</span>}
          <Select
            // defaultValue="All"
            style={{ width: "100%" }}
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
      >
        <Createads selectedRow={ovrallcampdetal} />

      </Drawer>
      <Drawer
        title={editadsetsdata?.AdsetName}
        placement="right"
        // closable={false}
        onClose={onCloseDrawer}
        open={editadsetsDrawerVisible}
        width="90%" // Adjust width as needed
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
      >
        <Viewadsets selectedRow={ovrallcampdetal} viewadsetlevel={viewadsetsdata} onClose={onCloseDrawer} />

      </Drawer>
      <Table dataSource={data} columns={columns} rowKey={(record, index) => index} />
    </>
  )
}