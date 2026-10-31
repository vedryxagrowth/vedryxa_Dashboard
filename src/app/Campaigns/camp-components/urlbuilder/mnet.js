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
const MnetUrlBuilder = ({ defaultValues, indexValueForAccount, onReturnMessage, showSubmitButton, accountis }) => {
  // Initial data array
  const [domain, setDomain] = useState(null);
  const [source, setSource] = useState("FB");
  const [channel, setChannel] = useState(null);
  const [memberId, setMembetId] = useState('');
  const [geo, setGeo] = useState('');
  const [keywords, setKeyWords] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [NetworkData, setNetworkData] = useState([]);
  const { apiClient } = useTokenContext();
  const [copyText, setCopyText] = useState('Copy');
  const [pixelId, setPixelId] = useState('PixelId');
  const pixelIds = ['PixelId', 'None'];
  const { theme } = useTokenContext();
  const token = localStorage.getItem("token")


  // const MnetDomains = [
  //   {
  //     "id": 1,
  //     "name": "POCKETFACTS",
  //     "code": "PF",
  //     "account": "MN",
  //     "url": "https://top.pocketfacts.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
  //   },
  //   {
  //     "id": 2,
  //     "name": "MOTORDIGEST",
  //     "code": "MD",
  //     "account": "MN",
  //     "url": "https://top.motordigest.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=566855625308747"
  //   },
  //   {
  //     "id": 3,
  //     "name": "KNOW THE BUZZ",
  //     "code": "KB",
  //     "account": "MN",
  //     "url": "https://top.knowthebuzz.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
  //   },
  //   {
  //     "id": 4,
  //     "name": "Look Up Trends",
  //     "code": "LT",
  //     "account": "MN",
  //     "url": "https://top.lookuptrends.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
  //   },
  //   {
  //     "id": 5,
  //     "name": "ALLCARGUIDE",
  //     "code": "AG",
  //     "account": "MN",
  //     "url": "https://search.allcarguide.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=566855625308747"
  //   },
  //   {
  //     "id": 6,
  //     "name": "GENIUSSEARCHES",
  //     "code": "SG",
  //     "account": "MN",
  //     "url": "https://top.geniussearches.net/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
  //   },
  //   {
  //     "id": 7,
  //     "name": "DAILYEZINE",
  //     "code": "DZ",
  //     "account": "MN",
  //     "url": "https://top.dailyezine.net/search/556/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
  //   },
  //   {
  //     "id": 8,
  //     "name": "READERARCHIVE",
  //     "code": "RA",
  //     "account": "MN",
  //     "url": "https://top.readerarchive.co/search/556/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
  //   }
  // ];

  // const Source = [
  //   {
  //     "id": 1,
  //     "name": "facebook",
  //     "code": "FB",
  //     "campaignId": "{{campaign.id}}",
  //     "AdsetId": "{{adset.id}}"
  //   },
  //   {
  //     "id": 2,
  //     "name": "Taboola",
  //     "code": "TB",
  //     "campaignId": "{{campaign.id}}",
  //     "AdsetId": "{{adset.id}}"
  //   }
  // ];

  // const channels = [
  //   {
  //     "id": 1,
  //     "name": "T1",
  //     "source": "FB",
  //     "value": "t=1"
  //   },
  //   {
  //     "id": 2,
  //     "name": "T2",
  //     "source": "FB",
  //     "value": "t=2"
  //   },
  //   {
  //     "id": 3,
  //     "name": "T3",
  //     "source": "FB",
  //     "value": "t=3"
  //   },
  //   {
  //     "id": 4,
  //     "name": "T4",
  //     "source": "FB",
  //     "value": "t=4"
  //   },
  //   {
  //     "id": 5,
  //     "name": "T2",
  //     "source": "TB",
  //     "value": "t=2"
  //   },
  //   {
  //     "id": 6,
  //     "name": "T3",
  //     "source": "TB",
  //     "value": "t=3"
  //   },
  //   {
  //     "id": 7,
  //     "name": "T4",
  //     "source": "TB",
  //     "value": "t=4"
  //   },
  //   {
  //     "id": 8,
  //     "name": "T5",
  //     "source": "TB",
  //     "value": "t=5"
  //   },
  //   {
  //     "id": 9,
  //     "name": "T6",
  //     "source": "TB",
  //     "value": "t=6"
  //   },
  //   {
  //     "id": 10,
  //     "name": "T7",
  //     "source": "TB",
  //     "value": "t=7"
  //   },
  //   {
  //     "id": 11,
  //     "name": "T8",
  //     "source": "TB",
  //     "value": "t=8"
  //   },
  //   {
  //     "id": 12,
  //     "name": "T9",
  //     "source": "TB",
  //     "value": "t=9"
  //   },
  //   {
  //     "id": 13,
  //     "name": "T10",
  //     "source": "TB",
  //     "value": "t=10"
  //   }
  // ];

  const getUrlBuilderData = async () => {
    // const response = await apiClient.get(`/get/urlbuilderdata?network=Mnet`);
    const response = await fetch(
      `https://fblaunching.vyaktimetrics.com/open/get/urlbuilderdata?network=Mnet`,
      {
        method: "GET",
        headers: { Authorization: token },
      },
    )
    const json = await response.json();
    if (response?.status === 200) {
      setNetworkData(json)
      if (indexValueForAccount) {
        // console.log(defaultValues);
        // console.log(defaultValues.split("//")[1].split("/")[0]);
        const DomainUrls = json?.Domains
          .filter(item => item.url.includes(indexValueForAccount?.split("//")[1]?.split("/")[0]))
          .map(item => item.url);
        // console.log(DomainUrls);
        setDomain(DomainUrls[0]);

        const text = indexValueForAccount?.split("//")[1]?.split("/")[3];
        const result = text.replace(/\+/g, " ");
        // console.log(result);
        setKeyWords(result);
        // console.log(indexValueForAccount.split("//")[1]?.split("/")[4]?.split("&")[0]?.split("?")[1]);
        setChannel(indexValueForAccount.split("//")[1]?.split("/")[4]?.split("&")[0]?.split("?")[1]);
        setMembetId(indexValueForAccount?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[0]);
        setSource(indexValueForAccount?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[1]);
        setGeo(indexValueForAccount?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[2]);
        setSource("FB");
        if (indexValueForAccount.includes('&trkfb')) { setPixelId('PixelId') } else { setPixelId('None') };
        // console.log(indexValueForAccount.split("//")[1].split("/")[0]);
        // const domainData = response 
      } else {
        if (defaultValues) {
          // console.log(defaultValues);
          // console.log(defaultValues.split("//")[1].split("/")[0]);
          const DomainUrls = json?.Domains
            .filter(item => item.url.includes(defaultValues?.split("//")[1]?.split("/")[0]))
            .map(item => item.url);
          // console.log(DomainUrls);
          setDomain(DomainUrls[0]);

          const text = defaultValues?.split("//")[1]?.split("/")[3];
          const result = text?.replace(/\+/g, " ");
          // console.log(result);
          setKeyWords("");
          // console.log(defaultValues.split("//")[1]?.split("/")[4]?.split("&")[0]?.split("?")[1]);
          setChannel(defaultValues.split("//")[1]?.split("/")[4]?.split("&")[0]?.split("?")[1]);
          setMembetId(defaultValues?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[0]);
          setSource(defaultValues?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[1]);
          setGeo(defaultValues?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[2]);
          setSource("FB");
          if (defaultValues.includes('&trkfb')) { setPixelId('PixelId') } else { setPixelId('None') };
          // console.log(defaultValues.split("//")[1].split("/")[0]);
          // const domainData = response 
        }
      }
    }
  };

  useEffect(() => {
    setDomain(null)
    setSource("FB");
    setChannel(null);
    setGeo('');
    setMembetId('');
    setKeyWords('');
    setErrorMessage('');
    setPixelId('PixelId');
  }, [accountis]);

  useEffect(() => {
    getUrlBuilderData();
  }, []);

  const onChangePixelId = (value) => {
    setPixelId(value);
  }

  // Function to add a new item

  const onClickClear = () => {
    setDomain(null)
    setSource("FB");
    setChannel(null);
    setGeo('');
    setMembetId('');
    setKeyWords('');
    setErrorMessage('');
    setPixelId('PixelId');
  }
  // console.log(showSubmitButton);

  const onClickSubmit = () => {

    if (keywords && channel && domain && source && pixelId) {
      // const formattedKeywords = keywords.replace(/\s+/g, '+'); praveen 
      const formattedKeywords = keywords.trimEnd().replace(/\s+/g, '+'); //s

      const campaign_id = NetworkData?.Source?.find(item => item.code === source).campaignId;
      const adset_id = NetworkData?.Source?.find(item => item.code === source).AdsetId;
      const ad_id = NetworkData?.Source?.find(item => item.code === source).AdId;
      let url;

      if (pixelId === 'PixelId') {
        url = domain;
      }
      else {
        const newDomain = domain.split("&trkfb");
        url = newDomain[0];
      }

      url = url
        .replace("keywords_replace", formattedKeywords)
        .replace("chanel_replace", channel)
        .replace("business_code_replace_source_code_replace_region_code_replace", ad_id)
        .replace("campaign_id_replace", campaign_id)
        .replace("adset_id_replace", adset_id);
      onReturnMessage(url);
    }
    else {
      setErrorMessage("Please complete all fields.");
    }
  }

  const onClickGet = () => {

    if (keywords && channel && domain && source && pixelId) {
      const formattedKeywords = keywords.trimEnd().replace(/\s+/g, '+');
      const campaign_id = NetworkData?.Source?.find(item => item.code === source).campaignId;
      const adset_id = NetworkData?.Source?.find(item => item.code === source).AdsetId;
      const ad_id = NetworkData?.Source?.find(item => item.code === source).AdId;
      let url;

      if (pixelId === 'PixelId') {
        url = domain;
      }
      else {
        const newDomain = domain.split("&trkfb");
        url = newDomain[0];
      }

      url = url
        .replace("keywords_replace", formattedKeywords)
        .replace("chanel_replace", channel)
        .replace("business_code_replace_source_code_replace_region_code_replace", ad_id)
        .replace("campaign_id_replace", campaign_id)
        .replace("adset_id_replace", adset_id);
      setErrorMessage(url);
    }
    else {
      setErrorMessage("Please complete all fields.");
    }
  }

  const onChangeDomian = (value) => {
    setDomain(value)
  }

  const onChangeSource = (value) => {
    setSource(value);
  }

  const onChangeChannel = (value) => {
    setChannel(value)
  }

  const onChangeMemberId = (event) => {
    setMembetId(event.target.value)
  }

  const onChangeGeo = (event) => {
    setGeo(event.target.value)
  }
  const onChangeKeyword = (event) => {
    setKeyWords(event.target.value)
  }

  return (
    <div style={{ width: '100%' }}>
      <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={6}>
          <label><span style={{ color: 'red', margin: '2px' }}>*</span>Domain</label>
          <Select
            showSearch
            required
            placeholder="Select Domain"
            value={domain}
            style={{ width: '100%' }}
            onChange={onChangeDomian}
            options={NetworkData?.Domains?.map((item) => ({
              value: item.url,
              label: item.name,
            }))}
            dropdownClassName={theme === 'dark' && "custom-dropdown"}
            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
          />
        </Col>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={4}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Source</label>
          <Select
            showSearch
            required
            placeholder="Source"
            value={source}
            onChange={onChangeSource}
            options={NetworkData?.Source?.map((item) => ({
              value: item.code,
              label: item.name,
            }))}
            dropdownClassName={theme === 'dark' && "custom-dropdown"}
            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
          />
        </Col>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={3}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Channels</label>
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
        <Col style={{ display: 'flex', flexDirection: 'column', marginBottom: '5px' }} xs={11} sm={5} lg={4}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>PixelId</label>
          <Select
            showSearch
            placeholder="pixelId"
            value={pixelId}
            required
            onChange={onChangePixelId}
            options={pixelIds.map((item) => ({
              label: item,
              value: item
            }))}
            style={{ width: '100%' }}
            dropdownClassName={theme === 'dark' && "custom-dropdown"}
            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
          />
        </Col>
        {/* <Col style={{ display: 'flex', flexDirection: 'column' }} span={5}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Member ID</label>
          <Input placeholder="Member ID" value={memberId} required onChange={onChangeMemberId} />
        </Col>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={3}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>GEO</label>
          <Input placeholder="GEO" value={geo} required onChange={onChangeGeo} />
        </Col> */}
      </Row>
      <Row style={{ width: '100%' }}>
        <Col span={24}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Keywords</label>
          <div style={{ width: '100%' }}>
            <Input placeholder="Keywords" style={{ width: '100%', paddingRight: '2px' }} value={keywords} onChange={onChangeKeyword} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
          </div>
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
          {!showSubmitButton && <Button style={{ backgroundColor: '#5B8CFF', color: "#000", borderColor: '#5B8CFF', borderWidth: "0px" }} onClick={onClickSubmit}>Submit</Button>}
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: '10px' }}>
        <Col>
          <p style={{ color: errorMessage === "Please complete all fields." && "red", fontWeight: 600, textAlign: 'center', width: '100%', fontSize: '20px' }}>{errorMessage}</p>
        </Col>
      </Row>
    </div>
  );
};

export default MnetUrlBuilder;