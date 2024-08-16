"use client";
import React, { useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Upload,
  Modal,
  Space
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  CommentOutlined,
  GlobalOutlined,
  LikeOutlined,
  MoreOutlined,
  ShareAltOutlined,
  UploadOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
export default function Editads({ selectedRow, editdata }) {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState(null);

  // console.log(editdata, "editdata")

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
  var initialValue = {
    AddName: editdata?.AddName,
    // filename: editdata?.filename,
    page_id: editdata?.page_id,
    message: editdata?.message,
    headline: editdata?.headline,
    Description: editdata?.Description,
    Caption: editdata?.Caption,
    Website_URL: editdata?.Website_URL,
    urlParameters: editdata?.urlParameters,
  }
  return (
    <>
      {/* <h1>hello Edit ${selectedRow.campaign_name}</h1> */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValue}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ flex: "70%", marginRight: "5%" }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              {/* <Form.Item
                name="MediaContent"
                label={<span style={{ color: "#B4B4B4" }}>Upload</span>}
                rules={[
                  {
                    required: true,
                    message: "Please select Upload!",
                  },
                ]}
                style={{ flex: 1 }}
              >
                <Upload
                  // beforeUpload={handleBeforeUpload}
                  // onChange={handleChange}
                  maxCount={1}
                  accept="image/*, video/*"
                >
                  <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
              </Form.Item> */}
              <Form.Item
                name="page_id"
                // initialValue={pageid}
                label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
                rules={[
                  {
                    required: true,
                    message: "Please select an option!",
                  },
                ]}
                style={{ flex: 3, marginLeft: "1%" }}
              >
                <Input style={{ width: "45%" }} />
              </Form.Item>
            </div>
            <Form.Item
              name="AddName"
              label={<span style={{ color: "#B4B4B4" }}>Add name</span>}
              rules={[
                {
                  required: true,
                  message: "Please select an option!",
                },
              ]}
            >
              <Input
                style={{ width: "60%" }}
              />
            </Form.Item>
            <Form.Item
              label="Primary text"
              name="message"
              rules={[
                {
                  required: true,
                  message: "Please enter a message!",
                },
              ]}
              required
              tooltip="This is a required field">
              <TextArea
                placeholder="Primary text"
                autoSize={{ minRows: 2, maxRows: 10 }}

              />
            </Form.Item>

            <Form.Item
              label="Headline"
              name="headline"
              rules={[
                {
                  required: true,
                  message: "Please enter a Name!",
                },
              ]}
              required
              tooltip="This is a required field">
              <TextArea
                placeholder="Headline"
                autoSize={{ minRows: 2, maxRows: 10 }}
              />
            </Form.Item>

            <Form.Item
              label="Description"
              name="Description"
              rules={[
                {
                  required: true,
                  message: "Please enter a Description!",
                },
              ]}
              required
              tooltip="This is a required field">
              <TextArea
                placeholder="Description"
                autoSize={{ minRows: 2, maxRows: 10 }}
              />
            </Form.Item>
            <Form.Item
              label="Caption"
              name="Caption"
              rules={[
                {
                  required: true,
                  message: "Please enter a Caption!",
                },
              ]}
              required
              tooltip="This is a required field">
              <TextArea
                placeholder="Caption"
                autoSize={{ minRows: 2, maxRows: 10 }}
              />
            </Form.Item>
            <Form.Item
              label="Website_URL"
              name="Website_URL"
              rules={[
                {
                  required: true,
                  message: "Please select Website_URL!",
                },
              ]}
              required
              tooltip="This is a required field"
            >
              <TextArea
                placeholder="Website_URL"
                autoSize={{ minRows: 5, maxRows: 15 }}

              />
            </Form.Item>
            <Form.Item
              label="URL Parameters"
              name="urlParameters"
              tooltip="This is a required field"
            >
              <TextArea
                placeholder="URL Parameters"
                autoSize={{ minRows: 5, maxRows: 15 }}
              />
            </Form.Item>
          </div>
          <div style={{ flex: "30%" }}>
            {editdata?.filename && (
              <div className="container-ad-preview">
                <div className="ad-preview">
                  <div className="ad-heading">
                    <div className="img">
                      <img
                        src={editdata?.filename}
                        alt="page id"
                        width="40"
                        height="40"
                      />
                    </div>
                    <div className="title">
                      <div className="main">{"Facebook Page"}</div>
                      <div className="sub">
                        Sponsored <GlobalOutlined style={{ opacity: "0.6" }} />
                      </div>
                    </div>
                    <div className="close">
                      <CloseOutlined style={{ fontSize: "20px" }} />
                    </div>
                    <div className="moreoptions">
                      <MoreOutlined style={{ fontSize: "20px" }} />
                    </div>
                  </div>
                  <div className="ad-desc">{"adMessage"}</div>
                  <div className="ad-image">
                    <img
                      src={editdata?.filename}
                    />
                  </div>
                  <div className="ad-cta">
                    <div className="details">
                      <div className="link">{"adCaption"}</div>
                      <div className="title">{"adName"}</div>
                      <div className="desc">{"adDesc"}</div>
                    </div>
                    <div className="ad-button">
                      <button type="button">Learn More</button>
                    </div>
                  </div>
                  <div className="icons">
                    <div className="like">
                      <LikeOutlined style={{ fontSize: "20px" }} />
                      Like
                    </div>
                    <div className="comment">
                      <CommentOutlined style={{ fontSize: "20px" }} />
                      Comment
                    </div>
                    <div className="share">
                      <ShareAltOutlined style={{ fontSize: "20px" }} />
                      Share
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

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

      <Modal
        title="Form Data"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <p>Display form data in modal</p>
        {/* {formData && (
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          )} */}
      </Modal>
    </>
  );
  // return(
  //     <>
  //     <h1>hello Edit ${selectedRow.campaignName}</h1>
  //     </>
  // )
}