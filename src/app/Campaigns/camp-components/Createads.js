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
  Space,
  message
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
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const Createnewads = ({ data, rerenders, onClose }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageshow, setimageshow] = useState(null);
  const [filesof, setfilesof] = useState(null)
  var token = localStorage.getItem("token")
  console.log(data, "selectedRow")

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

  const handleChange = (info) => {
    if (info.fileList.length > 0) {
      // Update the selected file
      setSelectedFile(info.fileList[0].originFileObj);
    } else {
      setSelectedFile(null); // Clear the selected file if fileList is empty
    }
  };

  let s3UrlPath = "";
  let hashid = "";

  const customRequest = async (imageshow, imagehash, onSuccess, onError) => {
    const token = imagehash[0].token;
    const account = imagehash[0].extAccountId;

    try {
      const response = await axios.post("/api/uploadImage", imageshow, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const formData = new FormData();
      formData.append("filename", filesof);
      formData.append("access_token", token);

      const hasrespons = await axios.post(
        `https://graph.facebook.com/v19.0/act_${account}/adimages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 && hasrespons.status === 200) {
        onSuccess("ok", response);
        console.log(response);
        hashid = hasrespons.data?.images?.[filesof.name]?.hash;
        console.log("hashid is", hashid);
        s3UrlPath = response.data.imageUrl;
      } else {
        onError("error", response);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      onError("error", error);
    }
  };

  const handleBeforeUpload = (file) => {
    setfilesof(file);
    const formData = new FormData();
    formData.append("file", file);
    setimageshow(formData);
    return false;
  };

  const handleModalOk = async () => {
    setIsModalVisible(false);
    if (formData) {
      const onSuccess = (status, response) => {
        console.log("Upload success:", response);
        // Add any success handling logic here
      };

      const onError = (status, error) => {
        console.error("Upload error:", error);
        // Add any error handling logic here
      };

      try {
        const response = await axios.get(
          `https://www.testapi.adsgoat.in/api/hashimageidentity/${data?.Account_Number}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        console.log("siddu account data", response.data);
        const imagehash = response.data;

        await customRequest(imageshow, imagehash, onSuccess, onError);

        const newAddData = { ...formData, id: uuidv4() };
        await postData(newAddData);
        rerenders()
        onClose()
      } catch (error) {
        console.error("Error fetching campaign data:", error);
        // Handle error
      }
    }
  };

  const postData = async (values) => {
    try {
      const data1 = {
        id: values.id,
        AddName: values.AddName,
        filename: s3UrlPath,
        imag_hash: hashid,
        page_id: values.page_id,
        message: values.message,
        headline: values.headline,
        Description: values.Description,
        Caption: values.Caption,
        Website_URL: values.Website_URL,
        urlParameters: values.urlParameters,
      };

      console.log(data1, "from UI");

      const response = await fetch(
        `https://www.testapi.adsgoat.in/api/Createadd/${data.identifier}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(data1),
        }
      );

      // Check if the request was successful
      if (response.ok) {
        console.log("Form data submitted successfully");
        message.success("Your add is created successfully", 2, () => {
          setIsModalVisible(false);
        }); // Close the drawer or perform any other action
      } else {
        console.error("Failed to submit form data");
      }
    } catch (error) {
      console.error("Error submitting form data:", error);
    }
  };


  const handleModalCancel = () => {
    setIsModalVisible(false);
    console.log('Modal cancel clicked');
  };
  var initialValue = {
    page_id: data?.addlevel[0]?.page_id
  }

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValue}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ flex: "70%", marginRight: "5%" }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item
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
                  beforeUpload={handleBeforeUpload}
                  onChange={handleChange}
                  maxCount={1}
                  accept="image/*, video/*"
                >
                  <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
              </Form.Item>
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
            {selectedFile && (
              <div className="container-ad-preview">
                <div className="ad-preview">
                  <div className="ad-heading">
                    <div className="img">
                      <img
                        src={URL.createObjectURL(selectedFile)}
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
                      src={selectedFile && URL.createObjectURL(selectedFile)}
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
};

export default Createnewads;
