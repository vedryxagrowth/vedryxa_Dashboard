"use client";
import {
  CheckOutlined,
  CloseOutlined,
  CommentOutlined,
  GlobalOutlined,
  LikeOutlined,
  MoreOutlined,
  ShareAltOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tabs,
  Upload,
  message,
  theme
} from "antd";
import TextArea from "antd/es/input/TextArea";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
const { Option } = Select;
const { TabPane } = Tabs;
const Createadsets = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState(null);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        console.log('Form data:', values);
        setFormData(values);
        setIsModalVisible(true);
      })
      .catch((errorInfo) => {
        console.log('Validation failed:', errorInfo);
      });
  };

  const handleClear = () => {
    form.resetFields();
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    console.log('Modal ok clicked');
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    console.log('Modal cancel clicked');
  };

  return (
    <>
      <Card style={{ width: '100%' }} className="editcard">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ display: "flex" }}>
            <Form.Item
              name="AdsetName"
              label={<span style={{ color: "#B4B4B4" }}>Adset name</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 0.25 }}>
              <Input
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="optimization_goal"
              label={<span style={{ color: "#B4B4B4" }}>Optimiz goal</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 0.1, marginLeft: "2%" }}>
              <Select

                variant="filled"
                options={[
                  { value: "OFFSITE_CONVERSIONS", label: "Conversions" },
                  { value: "LINK_CLICKS", label: "Clicks" },
                  { value: "REACH", label: "Reach" },
                  { value: "VALUE", label: "Value" }
                ]}
              />
            </Form.Item>
            <Form.Item
              name="billing_event"
              label={<span style={{ color: "#B4B4B4" }}>Billing event</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 0.1, marginLeft: "2%" }}>
              <Select

                variant="filled"
                options={[
                  { value: "IMPRESSIONS", label: "Impressions" },
                  { value: "VALUE", label: "Value" }
                ]}
              />
            </Form.Item>
            <Form.Item
              name="DatePicker"
              label={<span style={{ color: "#B4B4B4" }}>Start Time</span>}
              rules={[
                {
                  required: true,
                  message: 'Please input!',
                },
              ]}
              style={{ flex: 0.1, marginLeft: "2%" }}

            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              name="action_source"
              label={<span style={{ color: "#B4B4B4" }}>Action source</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 0.1, marginLeft: "2%" }}>
              <Select

                variant="filled"
                options={[
                  { value: "website", label: "Website" },
                  { value: "email", label: "Email" },
                  { value: "app", label: "App" },
                  { value: "phone_call", label: "Phone Call" }
                ]}
              />
            </Form.Item>
            <Form.Item
              name="custom_event_type"
              label={<span style={{ color: "#B4B4B4" }}>Event type</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 0.1, marginLeft: "2%" }}>
              <Select

                variant="filled"
                options={[
                  { value: "LEAD", label: "Lead" },
                  { value: "PURCHASE", label: "Purchase" },
                  { value: "SEARCH", label: "Search" },
                  { value: "CONTACT", label: "Contact" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="pixel_id"
              // initialValue={pixelids}
              label={<span style={{ color: "#B4B4B4" }}>Pixel id</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 0.15, marginLeft: "2%" }}>
              <Input
                style={{ width: "100%" }}
              />
            </Form.Item>
            {/* {showBidAmount && ( */}
            <Form.Item
              name="bid_amount"
              label={<span style={{ color: "#B4B4B4" }}>Bid_amount</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 0.1, marginLeft: "2%" }}>
              <Input
                type="number"
                placeholder="$"

              />
            </Form.Item>
            {/* )} */}


          </div>
          <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#91C25F" }}>Targeting</span>
          <div style={{ display: "flex" }}>
            <Form.Item
              name="countries"
              label={<span style={{ color: "#B4B4B4" }}>Countries</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 0.12 }}>
              <Select
                variant="filled"

                // options={[
                //   { value: "US", label: "United States" },
                //   { value: "GB", label: "United Kingdom" },
                //   { value: "AU", label: "Australia" },
                //   { value: "IN", label: "India" },
                //   { value: "AE", label: "United Arab Emirates" },
                //   { value: "CA", label: "Canada" },
                //   { value: "DE", label: "Germany" },
                //   { value: "FR", label: "France" },
                //   { value: "JP", label: "Japan" },
                //   { value: "CN", label: "China" },
                //   { value: "BR", label: "Brazil" },
                //   { value: "ZA", label: "South Africa" },
                //   { value: "RU", label: "Russia" },
                //   { value: "IT", label: "Italy" },
                //   { value: "ES", label: "Spain" },
                //   { value: "SG", label: "Singapore" },
                //   { value: "NZ", label: "New Zealand" },
                //   { value: "MX", label: "Mexico" }
                // ]}
                showSearch
                options={[
                  { value: "US", label: "United States", title: "" },
                  { value: "GB", label: "United Kingdom", title: "" },
                  { value: "AU", label: "Australia", title: "" },
                  { value: "IN", label: "India", title: "" },
                  { value: "AE", label: "United Arab Emirates", title: "" },
                  { value: "CA", label: "Canada", title: "" },
                  { value: "DE", label: "Germany", title: "" },
                  { value: "FR", label: "France", title: "" },
                  { value: "JP", label: "Japan", title: "" },
                  { value: "CN", label: "China", title: "" },
                  { value: "BR", label: "Brazil", title: "" },
                  { value: "ZA", label: "South Africa", title: "" },
                  { value: "RU", label: "Russia", title: "" },
                  { value: "IT", label: "Italy", title: "" },
                  { value: "ES", label: "Spain", title: "" },
                  { value: "SG", label: "Singapore", title: "" },
                  { value: "NZ", label: "New Zealand", title: "" },
                  { value: "MX", label: "Mexico", title: "" },
                  { value: "AT", label: "Austria", title: "" },
                  { value: "BE", label: "Belgium", title: "" },
                  { value: "BG", label: "Bulgaria", title: "" },
                  { value: "HR", label: "Croatia", title: "" },
                  { value: "CY", label: "Cyprus", title: "" },
                  { value: "CZ", label: "Czech Republic", title: "" },
                  { value: "DK", label: "Denmark", title: "" },
                  { value: "EE", label: "Estonia", title: "" },
                  { value: "FI", label: "Finland", title: "" },
                  { value: "GR", label: "Greece", title: "" },
                  { value: "HU", label: "Hungary", title: "" },
                  { value: "IE", label: "Ireland", title: "" },
                  { value: "LV", label: "Latvia", title: "" },
                  { value: "LT", label: "Lithuania", title: "" },
                  { value: "LU", label: "Luxembourg", title: "" },
                  { value: "MT", label: "Malta", title: "" },
                  { value: "NL", label: "Netherlands", title: "" },
                  { value: "PL", label: "Poland", title: "" },
                  { value: "PT", label: "Portugal", title: "" },
                  { value: "RO", label: "Romania", title: "" },
                  { value: "SK", label: "Slovakia", title: "" },
                  { value: "SI", label: "Slovenia", title: "" },
                  { value: "SE", label: "Sweden", title: "" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="Min_Age"
              label={<span style={{ color: "#B4B4B4" }}>Min Age</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ marginLeft: "2%" }}>
              <Select
                variant="filled"
                options={[
                  { value: "18", label: "18" },
                  { value: "25", label: "25" },
                  { value: "35", label: "35" },
                  { value: "40", label: "40", disabled: true },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="Max_Age"
              label={<span style={{ color: "#B4B4B4" }}>Max Age</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
            >
              <Select
                variant="filled"
                options={[
                  { value: "20", label: "20" },
                  { value: "30", label: "30" },
                  { value: "65", label: "65+" },
                  { value: "80", label: "80", disabled: true },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="Gender"
              label={<span style={{ color: "#B4B4B4" }}> Gender</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 0.1, marginLeft: "2%" }}>
              <Select
                variant="filled"
                options={[
                  { value: "0", label: "All" },
                  { value: "1", label: "Male" },
                  { value: "2", label: "Female" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="publisher_platforms"
              label={<span style={{ color: "#B4B4B4" }}>Platforms</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 0.1, marginLeft: "2%" }}>
              <Select
                variant="filled"
                options={[
                  { value: "facebook", label: "Facebook" },
                  { value: "instagram", label: "Instagram" }
                ]}
              />
            </Form.Item>
            <Form.Item
              name="Facebook_positions"
              label={<span style={{ color: "#B4B4B4" }}>Positions</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 0.25, marginLeft: "2%" }}>
              <Select
                mode="multiple"
                variant="filled"
                allowClear
                style={{ width: '100%' }}
                placeholder="Please select"
                // defaultValue={['a10', 'c12']}
                // onChange={handlepositionChange}
                options={[
                  { value: "feed", label: "Facebook Feed" },
                  { value: "marketplace", label: "Facebook Marketplace" },
                  { value: "video_feeds", label: "Facebook Video Feeds" },
                  { value: "search", label: "Facebook Search Results" },
                  { value: "explore", label: "Facebook business Explore" },
                  { value: "right_hand_column", label: "Facebook Right Column" },
                  { value: "story", label: "Facebook Stories" },
                  { value: "instream_video", label: "Facebook In-Stream Videos" },
                  { value: "reels", label: "Facebook Reels" }
                ]}
              />
            </Form.Item>
            <Form.Item
              name="device_platforms"
              label={<span style={{ color: "#B4B4B4" }}>Device</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
              style={{ flex: 0.18, marginLeft: "2%" }}>
              <Select
                mode="multiple"
                variant="filled"
                allowClear
                style={{ width: '100%' }}
                placeholder="Please select"
                options={[
                  { value: "mobile", label: "Mobile" },
                  { value: "desktop", label: "Desktop" }
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button onClick={handleClear}>Clear</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Form Data"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        {/* Display form data in modal */}
        {formData && (
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        )}
      </Modal>
    </>
  );
};
export default Createadsets;
