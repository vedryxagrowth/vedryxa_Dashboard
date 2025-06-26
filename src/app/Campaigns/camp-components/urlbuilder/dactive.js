"use client"
import React, { useEffect } from 'react';
import { Drawer, Button, DatePicker, Space, Form, Input, Select, Collapse, Upload, Steps, Modal, message, Spin, Row, Col } from 'antd';
import { PlusOutlined, UploadOutlined, ShareAltOutlined, CommentOutlined, LikeOutlined, MoreOutlined, CloseOutlined, GlobalOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import { useState, useRef } from 'react';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { useTokenContext } from '../../../components/parent';
const DActiveUrlBuilder = ({ onReturnMessage, showSubmitButton }) => {
  // Initial data array
  const [source, setSource] = useState("None");
  const [channel, setChannel] = useState("0");
  const [geo, setGeo] = useState(''); // AdText input
//   const [keywords, setKeyWords] = useState('');
  const [baseUrl, setBaseUrl] = useState(""); // Base URL input
  const [errorMessage, setErrorMessage] = useState('');
  const [NetworkData, setNetworkData]= useState([]);
  const [generatedUrl, setGeneratedUrl] = useState(""); // To store the generated URL
  const { apiClient } = useTokenContext();
  const { theme } = useTokenContext();

  const getUrlBuilderData = async()=>{
    const response = await apiClient.get(`/get/urlbuilderdata?network=DActive`);
    if(response?.status === 200){
      setNetworkData(response?.data)
    }
  };

  useEffect(()=>{
    getUrlBuilderData();
  },[]);

  // Function to add a new item

  const onClickClear = () => {
    setSource(null);
    setChannel(null);
    setGeo('');
    setBaseUrl("");
    // setKeyWords('');
    setErrorMessage('');
    setGeneratedUrl(""); // Clear the generated URL
  }

  const generateUrl = () => {
    
    if (baseUrl && geo) {
      // Replace `atxt` placeholder with the provided `geo` value
      let updatedUrl = baseUrl.replace(/atxt=([^&]*)/, `atxt=${geo}`);
  
      // Check if `tg1` and `tg2` exist in the URL and append `tg3` to `tg6` after `tg2`
      const tg2Regex = /&tg1={tg1}&tg2={tg2}/;
      if (tg2Regex.test(updatedUrl)) {
        const tg3to6 = `&tg3={{ad.id}}&tg4={{adset.name}}&tg5={{campaign.name}}&tg6={{ad.name}}`;
        updatedUrl = updatedUrl.replace(tg2Regex, `&tg1={{adset.id}}&tg2={{campaign.id}}${tg3to6}`);
      }
  
      // Append `channel` as `ct` only if the channel is not "0"
      if (channel !== null && channel !== "0") {
        updatedUrl += `&ct=${channel}`;
      }
  
      return updatedUrl;
    }
    return null;
  };
  

  console.log(showSubmitButton);

  const onClickSubmit = () => {
    const url = generateUrl();
    if (url) {
      onReturnMessage(url); // Return the URL to the parent
      setErrorMessage(""); // Clear error message
    } else {
      setErrorMessage("Please complete all fields.");
    }
  };

//   const onClickSubmit = () => {

//     if (keywords && channel && geo && source) {
//         console.log(keywords);
//         console.log(channel);
//         console.log(geo);
//         console.log(source);
//       const formattedKeywords = keywords.replace(/\s+/g, '+');
//       const campaign_id = NetworkData?.Source?.find(item => item.code === source).campaignId;
//       const adset_id = NetworkData?.Source?.find(item => item.code === source).AdsetId;
//       const mem_source_geo = `${source}_${geo}`

//       url = url
//         .replace("keywords_replace", formattedKeywords)
//         .replace("chanel_replace", channel)
//         .replace("business_code_replace_source_code_replace_region_code_replace", mem_source_geo)
//         .replace("campaign_id_replace", campaign_id)
//         .replace("adset_id_replace", adset_id);
//       onReturnMessage(url);
//     }
//     else {
//       setErrorMessage("Please complete all fields.");
//     }
//   }

const onClickGet = () => {
    const url = generateUrl();
    if (url) {
      setGeneratedUrl(url); // Set the generated URL
      setErrorMessage(""); // Clear error message
    } else {
      setErrorMessage("Please complete all fields.");
    }
  };

//   const onClickGet = () => {

//     if (keywords && channel && geo && source) {
//         console.log(keywords);
//         console.log(channel);
//         console.log(geo);
//         console.log(source);
//       const formattedKeywords = keywords.replace(/\s+/g, '+');
//       const campaign_id = NetworkData?.Source?.find(item => item.code === source).campaignId;
//       const adset_id = NetworkData?.Source?.find(item => item.code === source).AdsetId;
//       const mem_source_geo = `${source}_${geo}`

//       url = url
//         .replace("keywords_replace", formattedKeywords)
//         .replace("chanel_replace", channel)
//         .replace("business_code_replace_source_code_replace_region_code_replace", mem_source_geo)
//         .replace("campaign_id_replace", campaign_id)
//         .replace("adset_id_replace", adset_id);
//       setErrorMessage(url);
//     }
//     else {
//       setErrorMessage("Please complete all fields.");
//     }
//   }

const onCopyUrl = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl).then(() => {
        message.success("URL copied to clipboard!");
      });
    } else {
      message.error("No URL to copy!");
    }
};

  const onChangeSource = (value) => {
    setSource(value);
    value === "None" && setChannel("0");
  }

  const onChangeChannel = (value) => {
    setChannel(value)
  }

  const onChangeGeo = (event) => {
    setGeo(event.target.value)
  }
  const onChangeKeyword = (event) => {
    setKeyWords(event.target.value)
  }

  

  return (
    <div style={{ width: '100%' }}>
      <Row style={{ width: '100%' }}>
        <Col span={24}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Base URL</label>
          <div style={{ width: '100%' }}>
            <Input placeholder="Base URL" style={{ width: '100%', paddingRight: '2px' }} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}/>
          </div>
        </Col>
      </Row>
      <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', paddingTop: '15px' }}>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={10}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>AdText</label>
          <Input placeholder="AdText" value={geo} required onChange={(e) => setGeo(e.target.value)}  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}/>
        </Col>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={4}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Category</label>
          <Select
            showSearch
            required
            placeholder="Source"
            value={source}
            onChange={onChangeSource}
            options={NetworkData?.Source?.map((item) => ({
              value: item.name,
              label: item.name,
            }))}
            dropdownClassName={theme === 'dark' && "custom-dropdown"}
            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
          />
        </Col>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={3}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>CT</label>
          <Select
            showSearch
            placeholder="Channel"
            value={channel}
            required
            onChange={onChangeChannel}
            options={NetworkData?.channels
              ?.filter((item) => item.source === source)
              ?.map((item) => ({
                value: item.value,
                label: item.name,
              }))}
            style={{ width: '100%' }}
            dropdownClassName={theme === 'dark' && "custom-dropdown"}
            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
          />
        </Col>
        
      </Row>
      

      <Row justify="space-between" style={{ marginTop: '20px' }}>
        <Col>
          <Button
            type="default"
            onClick={onClickClear}
            style={{ backgroundColor: '#d3d3d3', borderColor: '#d3d3d3', color: 'black' }}
          >Clear</Button>
        </Col>
        <Col>
          <Button onClick={onClickGet} style={{ marginRight: '10px', backgroundColor: '#b7e8c6', borderColor: '#b7e8c6', color: 'black' }}>Get</Button>
          {!showSubmitButton && <Button  style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px"}} onClick={onClickSubmit}>Submit</Button>}
        </Col>
      </Row>

      {generatedUrl && (
        <Row justify="center" style={{ marginTop: "20px" }}>
          <Col>
            <p style={{ fontWeight: 600, textAlign: "center", width: "100%", fontSize: "16px" }}>
              Generated URL:{" "}
              {/* <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
                {generatedUrl}
              </a> */}
              <span style={{ fontWeight: 600, fontSize: "16px", marginRight: "10px" }}>{generatedUrl}</span>
              <br />
              <Button onClick={onCopyUrl} type="default" style={{marginTop: '10px'}}>
                Copy
              </Button>
            </p>
          </Col>
        </Row>
      )}
      <Row justify="center" style={{ marginTop: '10px' }}>
        <Col>
          <p style={{ color: errorMessage === "Please complete all fields." && "red", fontWeight: 600, textAlign: 'center', width: '100%', fontSize: '20px' }}>{errorMessage}</p>
        </Col>
      </Row>
    </div>
  );
};

export default DActiveUrlBuilder;