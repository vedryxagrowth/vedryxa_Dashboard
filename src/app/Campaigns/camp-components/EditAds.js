

// import React, { useState, useEffect } from 'react';
// import {
//   Button,
//   Card,
//   Form,
//   Input,
//   Upload,
//   Space,
//   Tooltip,
//   Modal,
//   Spin,
// } from 'antd';
// import {
//   CloseOutlined,
//   CommentOutlined,
//   GlobalOutlined,
//   LikeOutlined,
//   MoreOutlined,
//   ShareAltOutlined,
//   UploadOutlined,
// } from '@ant-design/icons';

// const { TextArea } = Input;

// const Editads = ({ viewCampaignData, changeRRefrst, editdata }) => {
//   const [form] = Form.useForm();
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [addName, setAddName] = useState(editdata?.AddName || '');
//   const [primaryText, setPrimaryText] = useState(editdata?.message || '');
//   const [caption, setCaption] = useState(editdata?.Caption || '');
//   const [headline, setHeadline] = useState(editdata?.headline || '');
//   const [description, setDescription] = useState(editdata?.Description || '');
//   const [websiteURL, setWebsiteURL] = useState(editdata?.Website_URL || '');
//   const [initialMedia, setInitialMedia] = useState(editdata?.filename || null);
//   console.log(viewCampaignData, "editads")

//   const handleChange = (info) => {
//     if (info.fileList.length > 0) {
//       // Update the selected file
//       setSelectedFile(info.fileList[0].originFileObj);
//       setInitialMedia(null); // Remove initial media if a new file is uploaded
//     } else {
//       setSelectedFile(null);
//     }
//   };

//   return (
//     <>
//       <Form
//         form={form}
//         layout="vertical"
//         onFinish={(values) => console.log(values)}
//         initialValues={editdata}
//         onValuesChange={(changedValues, allValues) => {
//           if (changedValues.AddName !== undefined) setAddName(changedValues.AddName);
//           if (changedValues.message !== undefined) setPrimaryText(changedValues.message);
//           if (changedValues.Caption !== undefined) setCaption(changedValues.Caption);
//           if (changedValues.headline !== undefined) setHeadline(changedValues.headline);
//           if (changedValues.Description !== undefined) setDescription(changedValues.Description);
//           if (changedValues.Website_URL !== undefined) setWebsiteURL(changedValues.Website_URL);
//         }}
//       >
//         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//           <div style={{ flex: '70%', marginRight: '5%' }}>
//             <Form.Item
//               name="page_id"
//               // initialValue={pageid}
//               label={<span style={{ color: "#B4B4B4" }}>Page id</span>}
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select an option!",
//                 },
//               ]}
//               style={{ flex: 3, marginLeft: "1%" }}
//             >
//               <Input style={{ width: "45%" }} />
//             </Form.Item>

//             <Form.Item
//               name="MediaContent"
//               label="Upload Media"
//               rules={[{ required: true, message: 'Please upload a file!' }]}
//             >
//               <Upload
//                 beforeUpload={() => false}
//                 onChange={handleChange}
//                 maxCount={1}
//                 accept="image/*, video/*"
//               >
//                 <Button icon={<UploadOutlined />}>Select File</Button>
//               </Upload>
//             </Form.Item>

//             <Form.Item
//               name="AddName"
//               label="Add Name"
//               rules={[{ required: true, message: 'Please enter an ad name!' }]}
//             >
//               <Input
//                 onChange={(e) => setAddName(e.target.value)}
//               />
//             </Form.Item>

//             <Form.Item
//               name="message"
//               label="Primary Text"
//               rules={[{ required: true, message: 'Please enter a message!' }]}
//             >
//               <TextArea
//                 placeholder="Primary Text"
//                 autoSize={{ minRows: 2, maxRows: 10 }}
//                 onChange={(e) => setPrimaryText(e.target.value)}
//               />
//             </Form.Item>

//             <Form.Item
//               name="Caption"
//               label="Caption"
//               rules={[{ required: true, message: 'Please enter a caption!' }]}
//             >
//               <TextArea
//                 placeholder="Caption"
//                 autoSize={{ minRows: 2, maxRows: 10 }}
//                 onChange={(e) => setCaption(e.target.value)}
//               />
//             </Form.Item>

//             <Form.Item
//               name="headline"
//               label="Headline"
//               rules={[{ required: true, message: 'Please enter a headline!' }]}
//             >
//               <TextArea
//                 placeholder="Headline"
//                 autoSize={{ minRows: 2, maxRows: 10 }}
//                 onChange={(e) => setHeadline(e.target.value)}
//               />
//             </Form.Item>

//             <Form.Item
//               name="Description"
//               label="Description"
//               rules={[{ required: true, message: 'Please enter a description!' }]}
//             >
//               <TextArea
//                 placeholder="Description"
//                 autoSize={{ minRows: 2, maxRows: 10 }}
//                 onChange={(e) => setDescription(e.target.value)}
//               />
//             </Form.Item>

//             <Form.Item
//               name="Website_URL"
//               label="Website URL"
//               rules={[{ required: true, message: 'Please enter a website URL!' }]}
//             >
//               <TextArea
//                 placeholder="Website URL"
//                 autoSize={{ minRows: 2, maxRows: 10 }}
//                 onChange={(e) => setWebsiteURL(e.target.value)}
//               />
//             </Form.Item>
//           </div>

//           {/* Card Preview */}
//           <div style={{ flex: '30%' }}>
//             <Card
//               title={null}
//               bordered={false}
//               style={{
//                 width: '100%',
//                 maxWidth: '340px',
//                 borderRadius: '8px',
//                 overflow: 'hidden',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//               }}
//               bodyStyle={{ padding: '0' }}
//             >
//               <div style={{ padding: '10px 16px' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
//                   <div style={{ marginRight: '10px' }}>
//                     {selectedFile ? (
//                       selectedFile.type.startsWith('image/') ? (
//                         <img
//                           src={URL.createObjectURL(selectedFile)}
//                           alt="Uploaded content"
//                           style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
//                         />
//                       ) : (
//                         <video
//                           src={URL.createObjectURL(selectedFile)}
//                           width="40"
//                           height="40"
//                           controls
//                           style={{ objectFit: 'cover', borderRadius: '50%' }}
//                         />
//                       )
//                     ) : initialMedia ? (
//                       initialMedia.endsWith('.mp4') ? (
//                         <video controls style={{ width: '40px', height: '40px', objectFit: 'cover' }}>
//                           <source src={initialMedia} type="video/mp4" />
//                           Your browser does not support the video tag.
//                         </video>
//                       ) : (
//                         <img
//                           src={initialMedia}
//                           alt="Initial ad content"
//                           style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
//                         />
//                       )
//                     ) : (
//                       <div>No media available</div>
//                     )}
//                   </div>

//                   <div style={{ flex: '1' }}>
//                     <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{addName || 'Default Ad Name'}</div>
//                     <div style={{ fontSize: '12px', color: '#888' }}>
//                       Sponsored <GlobalOutlined style={{ opacity: '0.6', marginLeft: '4px' }} />
//                     </div>
//                   </div>
//                   <Tooltip title="More Options">
//                     <MoreOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
//                   </Tooltip>
//                 </div>

//                 <div style={{ fontSize: '14px', color: '#333', marginBottom: '10px' }}>
//                   {primaryText || 'Default primary text...'}
//                 </div>
//               </div>

//               <div style={{ width: '100%', height: '200px', marginBottom: '10px' }}>
//                 {selectedFile ? (
//                   selectedFile.type.startsWith('image/') ? (
//                     <img
//                       src={URL.createObjectURL(selectedFile)}
//                       alt="ad content"
//                       style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                     />
//                   ) : (
//                     <video controls style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
//                       <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
//                       Your browser does not support the video tag.
//                     </video>
//                   )
//                 ) : initialMedia ? (
//                   initialMedia.endsWith('.mp4') ? (
//                     <video controls style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
//                       <source src={initialMedia} type="video/mp4" />
//                       Your browser does not support the video tag.
//                     </video>
//                   ) : (
//                     <img
//                       src={initialMedia}
//                       alt="Initial ad content"
//                       style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                     />
//                   )
//                 ) : (
//                   <div style={{ textAlign: 'center', padding: '50px' }}>No media available</div>
//                 )}
//               </div>

//               <div style={{ padding: '10px 16px' }}>
//                 <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{headline || 'Default headline'}</div>
//                 <div style={{ fontSize: '14px', color: '#333', marginBottom: '10px' }}>{description || 'Default description'}</div>
//                 <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>{caption || 'Default caption'}</div>

//                 <div className="ad-button">
//                   <button type="button">Learn More</button>
//                 </div>
//                 <a href={websiteURL} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', padding: '10px' }}>
//                   {websiteURL || 'https://default-url.com'}
//                 </a>
//               </div>

//               {/* Icons for Like, Comment, Share */}
//               <div className="icons" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '0 16px' }}>
//                 <div className="like">
//                   <LikeOutlined style={{ fontSize: '20px', marginRight: '5px' }} />
//                   Like
//                 </div>
//                 <div className="comment">
//                   <CommentOutlined style={{ fontSize: '20px', marginRight: '5px' }} />
//                   Comment
//                 </div>
//                 <div className="share">
//                   <ShareAltOutlined style={{ fontSize: '20px', marginRight: '5px' }} />
//                   Share
//                 </div>
//               </div>
//             </Card>

//           </div>
//         </div>

//         <Form.Item>
//           <Space>
//             <Button type="primary" htmlType="submit">
//               Submit
//             </Button>
//             <Button onClick={() => form.resetFields()}>Clear</Button>
//           </Space>
//         </Form.Item>
//       </Form>
//     </>
//   );
// };

// export default Editads;
import React, { useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Upload,
  Space,
  Tooltip,
  message,
  Modal,
  Spin,
} from 'antd';
import {
  CloseOutlined,
  CommentOutlined,
  GlobalOutlined,
  LikeOutlined,
  MoreOutlined,
  ShareAltOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const { TextArea } = Input;

const Editads = ({ viewCampaignData, changeRRefrst, editdata, onClose }) => {
  const [form] = Form.useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [addName, setAddName] = useState(editdata?.AddName || '');
  const [primaryText, setPrimaryText] = useState(editdata?.message || '');
  const [caption, setCaption] = useState(editdata?.Caption || '');
  const [headline, setHeadline] = useState(editdata?.headline || '');
  const [description, setDescription] = useState(editdata?.Description || '');
  const [websiteURL, setWebsiteURL] = useState(editdata?.Website_URL || '');
  const [initialMedia, setInitialMedia] = useState(editdata?.filename || null);
  const [loading, setLoading] = useState(false);
  const [filesof, setfilesof] = useState(null); // Track file for uploads
  const [imageshow, setimageshow] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState(null);

  let s3UrlPath = '';
  let hashid = '';

  // Custom request for uploading media (images/videos)

  const customRequest = async (imageshow, imagehash, onSuccess, onError) => {
    const token = imagehash.token;
    const account = imagehash.accountNumber;
    let thambnailurl = '';

    try {
      let response, fbResponse;

      if (filesof.type.startsWith('image/')) {
        response = await axios.post('https://www.testapi.adsgoat.in/upload', imageshow, {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data',
          },
        });

        const formData = new FormData();
        formData.append('filename', selectedFile);
        formData.append('access_token', token);

        fbResponse = await axios.post(
          `https://graph.facebook.com/v19.0/act_${account}/adimages`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.status === 200 && fbResponse.status === 200) {
          onSuccess('ok', response);
          hashid = fbResponse.data?.images?.[selectedFile?.name]?.hash;
          s3UrlPath = response.data.imageUrl;
          return {
            type: 'image',
            filename: s3UrlPath,
            imag_hash: hashid,
          };
        } else {
          onError('error', response);
        }
      } else if (filesof.type.startsWith('video/')) {
        response = await axios.post('https://www.testapi.adsgoat.in/upload', imageshow, {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status !== 200) {
          onError('error', response);
          throw new Error('Video upload to custom API failed');
        }

        const formData = new FormData();
        formData.append('access_token', token);
        formData.append('filename', selectedFile);

        fbResponse = await axios.post(
          `https://graph.facebook.com/v19.0/act_${account}/advideos`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (fbResponse.status === 200) {
          const videoid = fbResponse?.data?.id;
          await new Promise((resolve) => setTimeout(resolve, 10000));

          const thumbnailResponse = await axios.get(`https://graph.facebook.com/v19.0/${videoid}`, {
            params: {
              access_token: token,
              fields: 'thumbnails',
              is_preferred: true,
            },
          });

          const preferredThumbnail = thumbnailResponse.data.thumbnails.data.find((thumbnail) => thumbnail.is_preferred === true);
          thambnailurl = preferredThumbnail ? preferredThumbnail.uri : '';

          onSuccess('ok', fbResponse);
          s3UrlPath = response.data.imageUrl;
          hashid = videoid;

          return {
            type: 'video',
            filename: s3UrlPath,
            videoid: videoid,
            thambnailurl: thambnailurl,
          };
        } else {
          onError('error', fbResponse);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      onError('error', error);
    }
  };


  const handleBeforeUpload = (file) => {
    const formData = new FormData();
    formData.append('file', file); // Capture the file
    setfilesof(file); // Track the file for further processing
    setimageshow(formData); // Set the form data to be used in the customRequest function
    return false; // Prevent automatic upload
  };



  const handleChange = (info) => {
    if (info.fileList.length > 0) {
      setSelectedFile(info.fileList[0].originFileObj); // Capture the selected file
      setInitialMedia(null); // Reset the initial media preview when a new file is selected
    } else {
      setSelectedFile(null); // Clear the selected file if no file is selected
    }
  };

  const handleSubmit = async () => {
    form.validateFields().then((values) => {
      setFormData(values);
      setIsModalVisible(true); // Show modal on form submit
    });
  };

  const handleModalOk = async () => {
    setLoading(true);
    setIsModalVisible(false);

    if (formData) {
      const onSuccess = (status, response) => {
        console.log('Upload success:', response);
      };

      const onError = (status, error) => {
        console.error('Upload error:', error);
      };

      try {
        const response = await axios.get(
          `https://www.testapi.adsgoat.in/api/hashimageidentity/${viewCampaignData?.Account_Number}`,
          {
            headers: {
              Authorization: localStorage.getItem('token'),
            },
          }
        );
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
        // changeRRefrst && changeRRefrst();
        setLoading(false);
        message.success('Your ad is updated successfully', 2);
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        setLoading(false);
        message.error('There was an error processing your request.');
      }
    } else {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };


  const postData = async (values) => {
    try {
      // Prepare the data to be sent to the backend API
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
      };

      // Include image hash or video id if they exist
      if (values.imag_hash) {
        data1.imag_hash = values.imag_hash;
      } else if (values.videoid) {
        data1.videoid = values.videoid;
        data1.thambnailurl = values.thambnailurl;
      }

      // Construct the payload to be sent in the API request
      const payload = {
        ids: editdata?.id,             // The unique id of the ad
        newForm: data1,             // The new form data to be updated in the document
        identifier: viewCampaignData?.identifier,  // Identifier for filtering the document
      };

      // Send the POST request to your API endpoint
      const response = await axios.post(
        'https://www.testapi.adsgoat.in/api/updatededitedadd',
        payload, // This is the data (payload) that is being sent in the body
        {
          headers: {
            Authorization: localStorage.getItem('token'), // Add the Authorization header here
          },
        }
      );


      if (response.status === 200) {
        // Handle success response
        console.log('Ad updated successfully:', response.data);
        onClose && onClose()
        message.success('Ad updated successfully');

        // Optionally, trigger a refresh or any further action if required
        changeRRefrst && changeRRefrst();
      } else {
        // Handle error responses (status code other than 200)
        message.error('Failed to update the ad. Please try again.');
      }

    } catch (error) {
      console.error('Error submitting form data:', error);
      message.error('There was an error while updating the ad. Please try again.');
    }
  };


  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={editdata}
        onValuesChange={(changedValues) => {
          if (changedValues.AddName !== undefined) setAddName(changedValues.AddName);
          if (changedValues.message !== undefined) setPrimaryText(changedValues.message);
          if (changedValues.Caption !== undefined) setCaption(changedValues.Caption);
          if (changedValues.headline !== undefined) setHeadline(changedValues.headline);
          if (changedValues.Description !== undefined) setDescription(changedValues.Description);
          if (changedValues.Website_URL !== undefined) setWebsiteURL(changedValues.Website_URL);
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ flex: '70%', marginRight: '5%' }}>
            <Form.Item name="page_id" label="Page ID" rules={[{ required: true, message: 'Please enter a Page ID' }]}>
              <Input />
            </Form.Item>

            <Form.Item name="MediaContent" label="Upload Media" rules={[{ required: true, message: 'Please upload a file!' }]}>
              <Upload beforeUpload={handleBeforeUpload} onChange={handleChange} maxCount={1} accept="image/*, video/*">
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>

            <Form.Item name="AddName" label="Add Name" rules={[{ required: true, message: 'Please enter an ad name!' }]}>
              <Input onChange={(e) => setAddName(e.target.value)} />
            </Form.Item>

            <Form.Item name="message" label="Primary Text" rules={[{ required: true, message: 'Please enter a message!' }]}>
              <TextArea placeholder="Primary Text" autoSize={{ minRows: 2, maxRows: 10 }} onChange={(e) => setPrimaryText(e.target.value)} />
            </Form.Item>

            <Form.Item name="Caption" label="Caption" rules={[{ required: true, message: 'Please enter a caption!' }]}>
              <TextArea placeholder="Caption" autoSize={{ minRows: 2, maxRows: 10 }} onChange={(e) => setCaption(e.target.value)} />
            </Form.Item>

            <Form.Item name="headline" label="Headline" rules={[{ required: true, message: 'Please enter a headline!' }]}>
              <TextArea placeholder="Headline" autoSize={{ minRows: 2, maxRows: 10 }} onChange={(e) => setHeadline(e.target.value)} />
            </Form.Item>

            <Form.Item name="Description" label="Description" rules={[{ required: true, message: 'Please enter a description!' }]}>
              <TextArea placeholder="Description" autoSize={{ minRows: 2, maxRows: 10 }} onChange={(e) => setDescription(e.target.value)} />
            </Form.Item>

            <Form.Item name="Website_URL" label="Website URL" rules={[{ required: true, message: 'Please enter a website URL!' }]}>
              <TextArea placeholder="Website URL" autoSize={{ minRows: 2, maxRows: 10 }} onChange={(e) => setWebsiteURL(e.target.value)} />
            </Form.Item>
          </div>

          <div style={{ flex: '30%' }}>
            <Card
              title={null}
              bordered={false}
              style={{
                width: '100%',
                maxWidth: '340px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              bodyStyle={{ padding: '0' }}
            >
              <div style={{ padding: '10px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ marginRight: '10px' }}>
                    {selectedFile ? (
                      selectedFile.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Uploaded content"
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(selectedFile)}
                          width="40"
                          height="40"
                          controls
                          style={{ objectFit: 'cover', borderRadius: '50%' }}
                        />
                      )
                    ) : initialMedia ? (
                      initialMedia.endsWith('.mp4') ? (
                        <video controls style={{ width: '40px', height: '40px', objectFit: 'cover' }}>
                          <source src={initialMedia} type="video/mp4" />
                        </video>
                      ) : (
                        <img
                          src={initialMedia}
                          alt="Initial ad content"
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      )
                    ) : (
                      <div>No media available</div>
                    )}
                  </div>

                  <div style={{ flex: '1' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{addName || 'Default Ad Name'}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      Sponsored <GlobalOutlined style={{ opacity: '0.6', marginLeft: '4px' }} />
                    </div>
                  </div>
                  <Tooltip title="More Options">
                    <MoreOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
                  </Tooltip>
                </div>

                <div style={{ fontSize: '14px', color: '#333', marginBottom: '10px' }}>
                  {primaryText || 'Default primary text...'}
                </div>
              </div>

              <div style={{ width: '100%', height: '200px', marginBottom: '10px' }}>
                {selectedFile ? (
                  selectedFile.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="ad content"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <video controls style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                      <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                    </video>
                  )
                ) : initialMedia ? (
                  initialMedia.endsWith('.mp4') ? (
                    <video controls style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                      <source src={initialMedia} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={initialMedia}
                      alt="Initial ad content"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )
                ) : (
                  <div style={{ textAlign: 'center', padding: '50px' }}>No media available</div>
                )}
              </div>

              <div style={{ padding: '10px 16px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{headline || 'Default headline'}</div>
                <div style={{ fontSize: '14px', color: '#333', marginBottom: '10px' }}>{description || 'Default description'}</div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>{caption || 'Default caption'}</div>

                <div className="ad-button">
                  <button type="button">Learn More</button>
                </div>
                <a href={websiteURL} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', padding: '10px' }}>
                  {websiteURL || 'https://default-url.com'}
                </a>
              </div>

              <div className="icons" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '0 16px' }}>
                <div className="like">
                  <LikeOutlined style={{ fontSize: '20px', marginRight: '5px' }} />
                  Like
                </div>
                <div className="comment">
                  <CommentOutlined style={{ fontSize: '20px', marginRight: '5px' }} />
                  Comment
                </div>
                <div className="share">
                  <ShareAltOutlined style={{ fontSize: '20px', marginRight: '5px' }} />
                  Share
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button onClick={() => form.resetFields()}>Clear</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* Modal for confirmation */}
      <Modal
        title="Confirm Submission"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <p>Are you sure you want to submit this ad?</p>
      </Modal>
    </Spin>
  );
};

export default Editads;

