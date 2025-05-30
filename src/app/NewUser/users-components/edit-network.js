"use client";
import { useState, useEffect } from "react";
import { Form, Input, Button, Drawer, Modal, message, Select, Tooltip } from "antd";
import axios from "axios";
// import { useTokenContext } from "../../components/parent";

const { Option } = Select;
import { CloseOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useTokenContext } from "../../components/parent";

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

const EditNetworkAccess = ({ editeddata, visible, onClose }) => {
  const { theme } = useTokenContext();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const token = localStorage.getItem("token");
  const { apiClient } = useTokenContext();
  console.log(editeddata, "edit");

  useEffect(() => {
    if (visible && editeddata) {
      form.setFieldsValue({
        ...editeddata,
        timeZone: timeZoneShortNames[editeddata.timeZone]
      });
    }
  }, [visible, editeddata, form]);

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
        "/updateNetwork/",
        { updatedNetwork: newValues }
      );

      if (response.status === 200) {
        message.success("Network updated successfully");
        form.resetFields();
        onClose(newValues);  // Pass the updated data to the parent
      } else {
        message.error("Failed to update Network");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      message.error("Failed to update Network");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const isFieldVsible = fieldValue => {
    return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  return (
    <>
      <Drawer
        title="Edit Network"
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
            {isFieldVsible(editeddata?.Message) && (
                <Form.Item label="Message" name="Message">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}

            {isFieldVsible(editeddata?.cronStatus) && (
                <Form.Item label="CronStatus" name="cronStatus">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}

            {isFieldVsible(editeddata?.timeZone) && (
                <Form.Item label="Timezone" name="timeZone">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}
             
            {isFieldVsible(editeddata?.Email) && (
                <Form.Item label="Email" name="Email">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}
            
            {isFieldVsible(editeddata?.Password) && (
                <Form.Item label="Password" name="Password">
                    <Input.Password  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}} 
                    />
                </Form.Item>
            )}
            
            {isFieldVsible(editeddata?.key) && (
                <Form.Item label="Key" name="key">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}
            

            {isFieldVsible(editeddata?.Token) && (
                <Form.Item label="Token" name="Token">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}
            

            {isFieldVsible(editeddata?.consumer_key) && (
                <Form.Item label="ConsumerKey" name="consumer_key">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}
            

            {isFieldVsible(editeddata?.consumer_secret) && (
                <Form.Item label="ConsumerSecret" name="consumer_secret">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}
            
            {isFieldVsible(editeddata?.client_id) && (
                <Form.Item label="ClientID" name="client_id">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}    

            {isFieldVsible(editeddata?.Secret) && (
                <Form.Item label="Secret" name="Secret">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}
            
            {isFieldVsible(editeddata?.Service) && (
                <Form.Item label="Service" name="Service">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}
            
            {isFieldVsible(editeddata?.Market) && (
                <Form.Item label="Market" name="Market">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}
            
            {isFieldVsible(editeddata?.config_id) && (
                <Form.Item label="ConfigID" name="config_id">
                    <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black'}}/>
                </Form.Item>
            )}
            
            {isFieldVsible(editeddata?.Status) && (
                <Form.Item
                    label="Status"
                    name="Status"
                    rules={[{ required: true, message: "Please select a Status!" }]}
                >
                    <Select placeholder="Select a status" dropdownClassName={theme === 'dark' && "custom-dropdown"}>
                    <Option value="Active">Active</Option>
                    <Option value="InActive">InActive</Option>
                    </Select>
                </Form.Item>
            )}
            
            {isFieldVsible(editeddata?.revenuePartner) && (
                <Form.Item
                    label="Revenue Partner"
                    name="revenuePartner"
                    rules={[{ required: true, message: "Please select a Revenue Partner!" }]}
                >
                    <Select
                    showSearch
                    style={{ width: "100%" }}
                    placeholder="Select Revenue Partner"
                    options={availableNetworks.map((item) => ({
                        value: item,
                        label: item,
                    }))}
                    dropdownClassName={theme === 'dark' && "custom-dropdown"}
                    />
                </Form.Item>
            )}
            
            <Form.Item>
                <Button style={{  border: 'none', backgroundColor: '#91C25F', color:'black', fontWeight:'600' }} onClick={showModal}>
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

export default EditNetworkAccess;
