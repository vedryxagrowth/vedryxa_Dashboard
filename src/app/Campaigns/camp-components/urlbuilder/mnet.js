"use client"
import React, { useEffect } from 'react';
import { Drawer, Button, DatePicker, Space, Form, Input, Select, Collapse, Upload, Steps, Modal, message, Spin, Row, Col } from 'antd';
import { PlusOutlined, UploadOutlined, ShareAltOutlined, CommentOutlined, LikeOutlined, MoreOutlined, CloseOutlined, GlobalOutlined,EditOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import { useState, useRef } from 'react';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
const MnetUrlBuilder = ({onReturnMessage}) => {
    // Initial data array
    const [domain, setDomain] = useState(null);
    const [source, setSource] = useState(null);
    const [channel, setChannel] = useState(null);
    const [memberId, setMembetId] = useState('');
    const [geo, setGeo] = useState('');
    const [keywords, setKeyWords] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    

    const MnetDomains = [
        {
          "id":1,
          "name":"POCKETFACTS",
          "code":"PF",
          "account":"MN",
          "url":"https://top.pocketfacts.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
        },
        {
          "id":2,
          "name":"MOTORDIGEST",
          "code":"MD",
          "account":"MN",
          "url":"https://top.motordigest.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=566855625308747"
        },
        {
          "id":3,
          "name":"KNOW THE BUZZ",
          "code":"KB",
          "account":"MN",
          "url":"https://top.knowthebuzz.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
        },
        {
          "id":4,
          "name":"Look Up Trends",
          "code":"LT",
          "account":"MN",
          "url":"https://top.lookuptrends.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
        },
        {
          "id":5,
          "name":"ALLCARGUIDE",
          "code":"AG",
          "account":"MN",
          "url":"https://search.allcarguide.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=566855625308747"
        },
        {
          "id":6,
          "name":"GENIUSSEARCHES",
          "code":"SG",
          "account":"MN",
          "url":"https://top.geniussearches.net/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
        },
        {
          "id":7,
          "name":"DAILYEZINE",
          "code":"DZ",
          "account":"MN",
          "url":"https://top.dailyezine.net/search/556/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
        },
        {
          "id":8,
          "name":"READERARCHIVE",
          "code":"RA",
          "account":"MN",
          "url":"https://top.readerarchive.co/search/556/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
        }
      ];
    
    const Source = [
        {
          "id":1,
          "name":"facebook",
          "code":"FB",
          "campaignId":"{{campaign.id}}",
          "AdsetId":"{{adset.id}}"
        },
        {
          "id":2,
          "name":"Taboola",
          "code":"TB",
          "campaignId":"{{campaign.id}}",
          "AdsetId":"{{adset.id}}"
        }
      ];

    const channels = [
        {
          "id":1,
          "name":"T1",
          "source":"FB",
          "value":"t=1"
        },
        {
          "id":2,
          "name":"T2",
          "source":"FB",
          "value":"t=2"
        },
        {
          "id":3,
          "name":"T3",
          "source":"FB",
          "value":"t=3"
        },
        {
          "id":4,
          "name":"T4",
          "source":"FB",
          "value":"t=4"
        },
        {
          "id":5,
          "name":"T2",
          "source":"TB",
          "value":"t=2"
        },
        {
          "id":6,
          "name":"T3",
          "source":"TB",
          "value":"t=3"
        },
        {
          "id":7,
          "name":"T4",
          "source":"TB",
          "value":"t=4"
        },
        {
          "id":8,
          "name":"T5",
          "source":"TB",
          "value":"t=5"
        },
        {
          "id":9,
          "name":"T6",
          "source":"TB",
          "value":"t=6"
        },
        {
          "id":10,
          "name":"T7",
          "source":"TB",
          "value":"t=7"
        },
        {
          "id":11,
          "name":"T8",
          "source":"TB",
          "value":"t=8"
        },
        {
          "id":12,
          "name":"T9",
          "source":"TB",
          "value":"t=9"
        },
        {
          "id":13,
          "name":"T10",
          "source":"TB",
          "value":"t=10"
        }
      ];

    // Function to add a new item

    const onClickClear = () =>{
        setDomain(null)
        setSource(null);
        setChannel(null);
        setGeo('');
        setMembetId('');
        setKeyWords('');
        setErrorMessage('');
    }

    const onClickSubmit = () =>{
        
        if(keywords && channel && memberId && geo && domain && source){
            const campaign_id = Source.find(item => item.code === source).campaignId;
            const adset_id = Source.find(item => item.code === source).AdsetId;
            const mem_source_geo = `${memberId}_${source}_${geo}`
            let url = domain;

            url = url
                .replace("keywords_replace", keywords)
                .replace("chanel_replace", channel)
                .replace("business_code_replace_source_code_replace_region_code_replace", mem_source_geo)
                .replace("campaign_id_replace", campaign_id)
                .replace("adset_id_replace", adset_id);
            onReturnMessage(url);
        }
        else{
            setErrorMessage("Please complete all fields.");
        }
    }

    const onClickGet = () =>{
        
        if(keywords && channel && memberId && geo && domain && source){
            const campaign_id = Source.find(item => item.code === source).campaignId;
            const adset_id = Source.find(item => item.code === source).AdsetId;
            const mem_source_geo = `${memberId}_${source}_${geo}`
            let url = domain;

            url = url
                .replace("keywords_replace", keywords)
                .replace("chanel_replace", channel)
                .replace("business_code_replace_source_code_replace_region_code_replace", mem_source_geo)
                .replace("campaign_id_replace", campaign_id)
                .replace("adset_id_replace", adset_id);
            setErrorMessage(url);
        }
        else{
            setErrorMessage("Please complete all fields.");
        }
    }

    const onChangeDomian = (value) =>{
        setDomain(value)
    }

    const onChangeSource = (value)=>{
        setSource(value);
    }

    const onChangeChannel = (value)=>{
        setChannel(value)
    }

    const onChangeMemberId = (event) =>{
        setMembetId(event.target.value)
    }

    const onChangeGeo = (event) =>{
        setGeo(event.target.value)
    }
    const onChangeKeyword = (event) =>{
        setKeyWords(event.target.value)
    }

    return (
        <div style={{ width: '100%' }}>
            <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={6}>
                    <label><span style={{ color: 'red', margin:'2px' }}>*</span>Domain</label>
                    <Select
                        showSearch
                        required
                        placeholder="Select Domain"
                        value={domain}
                        style={{ width: '100%' }}
                        onChange={onChangeDomian}
                        options={MnetDomains.map((item) => ({
                            value: item.url,
                            label: item.name,
                        }))}
                    />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={4}>
                    <label><span style={{ color: 'red', paddingRight:'2px',paddingTop:'2px' }}>*</span>Source</label>
                    <Select
                        showSearch
                        required
                        placeholder="Source"
                        value={source}
                        onChange={onChangeSource}
                        options={Source.map((item) => ({
                            value: item.code,
                            label: item.name,
                        }))}
                    />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={3}>
                    <label><span style={{ color: 'red', paddingRight:'2px',paddingTop:'2px' }}>*</span>Channels</label>
                    <Select
                        showSearch
                        placeholder="Channel"
                        value={channel}
                        required
                        onChange={onChangeChannel}
                        options={channels
                            .filter((item) => item.source === source)
                            .map((item) => ({
                                value: item.value,
                                label: item.name,
                            }))}
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={5}>
                    <label><span style={{ color: 'red', paddingRight:'2px',paddingTop:'2px' }}>*</span>Member ID</label>
                    <Input placeholder="Member ID" value={memberId} required onChange={onChangeMemberId} />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={3}>
                    <label><span style={{ color: 'red', paddingRight:'2px',paddingTop:'2px' }}>*</span>GEO</label>
                    <Input placeholder="GEO" value={geo} required onChange={onChangeGeo} />
                </Col>
            </Row>
            <Row style={{ width: '100%' }}>
                <Col span={24}>
                    <label><span style={{ color: 'red', paddingRight:'2px',paddingTop:'2px' }}>*</span>Keywords</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="Keywords" style={{ width: '100%', paddingRight:'2px' }} value={keywords} onChange={onChangeKeyword} />
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
                    <Button type="primary" onClick={onClickSubmit}>Submit</Button>
                </Col>
            </Row>
            <Row justify="center" style={{marginTop:'10px'}}>
                <Col>
                    <p style={{ color: errorMessage === "Please complete all fields." && "red", fontWeight: 600, textAlign: 'center', width:'100%', fontSize:'20px' }}>{errorMessage}</p>
                </Col>
            </Row>
        </div>
    );
};

export default MnetUrlBuilder;