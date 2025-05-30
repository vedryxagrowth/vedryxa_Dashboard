"use client";
import { useState, useEffect } from "react";
import { Form, Input, Button, Drawer, Modal, message, Select } from "antd";
import axios from "axios";
import { useTokenContext } from '../../components/parent';

const { Option } = Select;
import { CloseOutlined } from "@ant-design/icons";

const timezones = [
  "UTC",
  "EEST",
  "CEST",
  "EDT",
  "CST",
  "PDT",
  "IST",
  "BST",
  "GMT",
  "MST",
  "CDT",
  "AST",
  "DST",
  "HST",
  "EST",
];

const timeZoneFullNames = {
  EDT: "America/New_York",
  UTC: "Atlantic/Azores",
  EEST: "Europe/Athens",
  CEST: "Europe/Paris",
  CST: "America/Mexico_City",
  PDT: "America/Los_Angeles",
  BST: "Europe/London",
  GMT: "Africa/Accra",
  IST: "Asia/Kolkata",
  MST: "America/Dawson",
  CDT: "America/Chicago",
  AST: "America/Puerto_Rico",
  DST: "Asia/Dubai",
  HST: "Pacific/Honolulu",
  EST: "America/Toronto",
};

const timeZoneShortNames = {
  "America/New_York": "EDT",
  "Atlantic/Azores": "UTC",
  "Europe/Athens": "EEST",
  "Europe/Paris": "CEST",
  "America/Mexico_City": "CST",
  "America/Los_Angeles": "PDT",
  "Europe/London": "BST",
  "Africa/Accra": "GMT",
  "Asia/Kolkata": "IST",
  "America/Dawson": "MST",
  "America/Chicago": "CDT",
  "America/Puerto_Rico": "AST",
  "Asia/Dubai": "DST",
  "Pacific/Honolulu": "HST",
  "America/Toronto": "EST",
};

const availableNetworks = [
  "MEDIA_DOT_NET",
  "MEDIA_DOT_NET_BING",
  "ENKI",
  "TONIC",
  "System1",
  "Bodies",
  "Bodies1",
  "Rsoc",
  "Domain Active",
];

const EditAccountAccess = ({ editeddata, visible, onClose }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { theme } = useTokenContext();
  const { apiClient } = useTokenContext();
  const token = localStorage.getItem("token");
  console.log(editeddata, "edit");

  useEffect(() => {
    if (editeddata) {
      form.setFieldsValue({
        ...editeddata,
        timeZone: timeZoneShortNames[editeddata.timeZone],
        pixelID: editeddata?.pixelID || "",
        pageID: editeddata?.pageID || "",
        AgencyName: editeddata?.AgencyName || ""
      });
    }
  }, [editeddata, form]);

  const onFinish = async (values) => {
    try {
      const newValues = {
        ...editeddata,  // Include original values
        ...values,      // Merge with the updated form values
        timeZone: timeZoneFullNames[values.timeZone],
      };

      console.log(newValues, "new");

      // Simulate API call with newValues
      const response = await apiClient.post(
        "/updateAccount/",
        { newAccount: newValues }
      );

      if (response.status === 200) {
        message.success("Account Updated successfully");
        form.resetFields();
        onClose(newValues);
      } else {
        message.error("Failed to create account");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      message.error("Failed to create account");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  return (
    <>
      <Drawer
        title="Edit Account"
        open={visible}
        onClose={onClose}
        width="60%"
        closeIcon={<CloseOutlined />}
        style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
      >
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          style={{ width: "80%" }}
          initialValues={{
            ...editeddata,
          }}
          className={theme === 'dark' ? 'form-dark' : 'form-light'}
        >
          <Form.Item
            label="Spend Partner"
            name="spendPartner"
            rules={[{ required: true, message: "Please select a Spend Partner!" }]}
            disabled  style={{backgroundColor:'transparent', color: 'black'}}
          >
            <Select placeholder="Select a partner" disabled  style={{
              backgroundColor: theme === 'dark' && '#333', // Background color
              color: theme === 'dark' && '#fff',
            }} dropdownClassName={theme === 'dark' && "custom-dropdown"}>
              <Option value="Facebook">Facebook</Option>
              <Option value="Google">Google</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Spend Account ID"
            name="accountNumber"
            rules={[{ required: true, message: "Please input the Spend Account ID!" }]}
          >
            <Input   disabled  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
          </Form.Item>

          <Form.Item label="Account Name" name="accountName">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
          </Form.Item>

          <Form.Item label="Pixel ID" name="pixelID">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
          </Form.Item>

          <Form.Item label="Page ID" name="pageID">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
          </Form.Item>

          <Form.Item label="Page Name" name="pageName">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
          </Form.Item>

          <Form.Item label="Agency Name" name="AgencyName">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
          </Form.Item>

          <Form.Item
            label="BM Name"
            name="BMName"
            rules={[{ required: true, message: "Please select a BM Name!" }]}
          >
            <Select placeholder="Select BM Name"   disabled  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}} dropdownClassName={theme === 'dark' && "custom-dropdown"}>
              <Option value="Winkleads Search">Winkleads Search</Option>
              <Option value="MODO LEO BM X1">MODO LEO BM X1</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Time Zone"
            name="timeZone"
            rules={[{ required: true, message: "Please select a Time Zone!" }]}
          >
            <Select
              showSearch
              disabled  
              style={{backgroundColor:'transparent', // Background color
                color: theme === 'dark' && '#fff',
              }}
              placeholder="Select Timezone"
              dropdownClassName={theme === 'dark' && "custom-dropdown"}
              options={timezones.map((item) => ({
                value: item,
                label: item,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select a Status!" }]}
          >
            <Select placeholder="Select a status" style={{
              width: '100%',
              backgroundColor: theme === 'dark' && '#333', // Background color
              color: theme === 'dark' && '#fff',
            }} dropdownClassName={theme === 'dark' && "custom-dropdown"}>
              <Option value="Active">Active</Option>
              <Option value="InActive">InActive</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Revenue Partner"
            name="revenuePartner"
            rules={[{ required: true, message: "Please select a Revenue Partner!" }]}
          >
            <Select
              showSearch
              style={{ 
                width: '100%',
                backgroundColor: theme === 'dark' && '#333', // Background color
                color: theme === 'dark' && '#fff',
              }}
              placeholder="Select Revenue Partner"
              dropdownClassName={theme === 'dark' && "custom-dropdown"}
              options={availableNetworks.map((item) => ({
                value: item,
                label: item,
              }))}
            />
          </Form.Item>

          <Form.Item label="Media Buyer" name="MediaBuyerName">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
          </Form.Item>

          <Form.Item label="Holder" name="Holder">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
          </Form.Item>

          <Form.Item>
            <Button  style={{  border: 'none', backgroundColor: '#91C25F', color:'black', fontWeight:'600' }} onClick={showModal}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="Confirmation"
        open={isModalVisible}
        onOk={() => {
          form.submit();
          setIsModalVisible(false);
        }}
        onCancel={handleCancel}
      >
        <p>Are you sure you want to submit?</p>
      </Modal>
    </>
  );
};

export default EditAccountAccess;
