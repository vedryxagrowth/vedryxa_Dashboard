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
  message,
  Spin
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
  const [addName, setAddName] = useState('');
  const [primaryText, setPrimaryText] = useState('');
  const [caption, setCaption] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [websiteURL, setWebsiteURL] = useState('');
  const [loading, setLoading] = useState(false);

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
    const token = imagehash.token;
    const account = imagehash.accountNumber;
    let thambnailurl = "";

    try {
      let response, fbResponse;

      if (filesof.type.startsWith('image/')) {
        // Upload image
        response = await axios.post("https://www.testapi.adsgoat.in/upload", imageshow, {
          headers: {
            'Authorization': localStorage.getItem("token"),
            "Content-Type": "multipart/form-data"
          },
        });

        const formData = new FormData();
        formData.append("filename", selectedFile);  // Changed selectedFile to filesof.name
        formData.append("access_token", token);

        fbResponse = await axios.post(
          `https://graph.facebook.com/v19.0/act_${account}/adimages`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200 && fbResponse.status === 200) {
          onSuccess("ok", response);
          console.log(response);
          hashid = fbResponse.data?.images?.[selectedFile?.name]?.hash;
          console.log("hashid is", hashid);
          s3UrlPath = response.data.imageUrl;
          return {
            type: 'image',
            filename: s3UrlPath,
            imag_hash: hashid,
          };
        } else {
          onError("error", response);
        }

      } else if (filesof.type.startsWith('video/')) {
        // Upload video
        response = await axios.post("https://www.testapi.adsgoat.in/upload", imageshow, {
          headers: { 'Authorization': localStorage.getItem("token"), "Content-Type": "multipart/form-data" },
        });

        if (response.status !== 200) {
          onError("error", response);
          throw new Error("Video upload to custom API failed");
        }

        const formData = new FormData();
        formData.append("access_token", token);
        formData.append("filename", selectedFile);  // Changed selectedFile to filesof.name

        fbResponse = await axios.post(
          `https://graph.facebook.com/v19.0/act_${account}/advideos`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (fbResponse.status === 200) {
          const videoid = fbResponse?.data?.id;
          await new Promise(resolve => setTimeout(resolve, 10000));

          // Get thumbnail URL
          const thumbnailResponse = await axios.get(`https://graph.facebook.com/v19.0/${videoid}`, {
            params: {
              access_token: token,
              fields: 'thumbnails',
              is_preferred: true
            }
          });

          const preferredThumbnail = thumbnailResponse.data.thumbnails.data.find(thumbnail => thumbnail.is_preferred === true);
          thambnailurl = preferredThumbnail ? preferredThumbnail.uri : "";

          onSuccess("ok", fbResponse);
          s3UrlPath = response.data.imageUrl;
          hashid = videoid;

          console.log("videoid is", videoid);
          console.log("Thumbnail URL is", thambnailurl);
          return {
            type: 'video',
            filename: s3UrlPath,
            videoid: videoid,
            thambnailurl: thambnailurl,
          };
        } else {
          onError("error", fbResponse);
        }
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

  // const handleModalOk = async () => {
  //   setIsModalVisible(false);
  //   if (formData) {
  //     const onSuccess = (status, response) => {
  //       console.log("Upload success:", response);
  //       // Add any success handling logic here
  //     };

  //     const onError = (status, error) => {
  //       console.error("Upload error:", error);
  //       // Add any error handling logic here
  //     };

  //     try {
  //       const response = await axios.get(
  //         `https://www.testapi.adsgoat.in/api/hashimageidentity/${data?.Account_Number}`,
  //         {
  //           headers: {
  //             Authorization: token,
  //           },
  //         }
  //       );
  //       console.log("siddu account data", response.data);
  //       const imagehash = response.data[0];

  //       const mediaData = await customRequest(imageshow, imagehash, onSuccess, onError);

  //       let newAddData;
  //       if (mediaData.type === 'image') {
  //         newAddData = {
  //           ...formData,
  //           id: uuidv4(),
  //           filename: mediaData.filename,
  //           imag_hash: mediaData.imag_hash,
  //         };
  //       } else if (mediaData.type === 'video') {
  //         newAddData = {
  //           ...formData,
  //           id: uuidv4(),
  //           filename: mediaData.filename,
  //           videoid: mediaData.videoid,
  //           thambnailurl: mediaData.thambnailurl,
  //         };
  //       }

  //       await postData(newAddData);
  //       rerenders();
  //       onClose();

  //     } catch (error) {
  //       console.error("Error fetching campaign data:", error);
  //       // Handle error
  //     }
  //   }
  // };
  const handleModalOk = async () => {
    setLoading(true); // Start the spinner
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
        const imagehash = response.data[0];

        const mediaData = await customRequest(imageshow, imagehash, onSuccess, onError);

        let newAddData;
        if (mediaData.type === 'image') {
          newAddData = {
            ...formData,
            id: uuidv4(),
            filename: mediaData.filename,
            imag_hash: mediaData.imag_hash,
          };
        } else if (mediaData.type === 'video') {
          newAddData = {
            ...formData,
            id: uuidv4(),
            filename: mediaData.filename,
            videoid: mediaData.videoid,
            thambnailurl: mediaData.thambnailurl,
          };
        }

        await postData(newAddData);
        rerenders();
        onClose();

        setLoading(false); // Stop the spinner after the process is complete
        message.success("Your ad is created successfully", 2);

      } catch (error) {
        console.error("Error fetching campaign data:", error);
        setLoading(false); // Stop the spinner in case of error
        message.error("There was an error processing your request.");
      }
    } else {
      setLoading(false); // Stop the spinner if formData is not available
    }
  };



  const postData = async (values) => {
    try {
      const data1 = {
        id: values.id,
        AddName: values.AddName,
        filename: s3UrlPath,
        page_id: values.page_id,
        message: values.message,
        headline: values.headline,
        Description: values.Description,
        Caption: values.Caption,
        Website_URL: values.Website_URL,
        // urlParameters: values.urlParameters,
      };

      // Include image hash or video ID and thumbnail URL if available
      if (values.imag_hash) {
        data1.imag_hash = values.imag_hash;
      } else if (values.videoid) {
        data1.videoid = values.videoid;
        data1.thambnailurl = values.thambnailurl;
      }

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

      if (response.ok) {
        console.log("Form data submitted successfully");
        message.success("Your ad is created successfully", 2, () => {
          setIsModalVisible(false);
        });
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
      <Spin spinning={loading}>
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
                  onChange={(e) => setAddName(e.target.value)}

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
                  onChange={(e) => setPrimaryText(e.target.value)}


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
                  onChange={(e) => setCaption(e.target.value)}

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
                  onChange={(e) => setHeadline(e.target.value)}

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
                  onChange={(e) => setDescription(e.target.value)}

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
                  onChange={(e) => setWebsiteURL(e.target.value)}
                />
              </Form.Item>
              {/* <Form.Item
              label="URL Parameters"
              name="urlParameters"
              tooltip="This is a required field"
            >
              <TextArea
                placeholder="URL Parameters"
                autoSize={{ minRows: 5, maxRows: 15 }}
              />
            </Form.Item> */}
            </div>
            <div style={{ flex: "30%" }}>
              {selectedFile && (
                <div className="container-ad-preview">
                  <div className="ad-preview">
                    <div className="ad-heading">
                      <div className="img">
                        {selectedFile.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="page id"
                            width="40"
                            height="40"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(selectedFile)}
                            alt="page id"
                            width="40"
                            height="30"
                            style={{ objectFit: 'cover' }}
                            muted // Muted to prevent sound on preview
                          />
                        )}
                      </div>

                      <div className="title">
                        <div className="main" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                          {addName}
                        </div>                                                          <div className="sub">
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
                    <div className="ad-desc" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                      {primaryText}
                    </div>
                    <div className="ad-image" style={{ width: '400px', height: '400px' }}>
                      {selectedFile.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="ad content"
                          style={{ width: '400px', height: '400px', objectFit: 'cover' }}
                        />
                      ) : (
                        <video
                          controls
                          style={{ width: '400px', height: '400px', objectFit: 'cover' }}
                        >
                          <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>

                    <div className="ad-cta">
                      <div className="details">
                        <div className="link">{caption}</div>
                        <div className="title">{headline}</div>
                        <div className="desc">{description}</div>
                      </div>
                      <div className="ad-button">
                        <button type="button">Learn More</button>
                      </div>
                    </div>
                    <a href={websiteURL} target="_blank" rel="noopener noreferrer" style={{ wordWrap: 'break-word', whiteSpace: 'normal', color: '#0066cc', padding: '10px' }}>
                      {websiteURL}
                    </a>                                                <div className="icons">
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
      </Spin>
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
