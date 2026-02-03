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
const AffinityUrlBuilder = ({ defaultValues, indexValueForAccount, onReturnMessage, showSubmitButton, accountis }) => {
    // Initial data array
    const [domain, setDomain] = useState(null);
    const [source, setSource] = useState("fb");
    const [channel, setChannel] = useState("1675913170");
    const [memberId, setMembetId] = useState('');
    const [geo, setGeo] = useState('');
    const [keywords, setKeyWords] = useState('');
    const [channel_id, setChannel_id] = useState('');
    const [rac, setRac] = useState('');
    const [terms, setTerms] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [NetworkData, setNetworkData] = useState([]);
    const { apiClient } = useTokenContext();
    const [copyText, setCopyText] = useState('Copy');
    const [pixelId, setPixelId] = useState('PixelId');
    const [tmp, setTmp] = useState('9');
    const [tmpIds, setTmpIds] = useState([]);
    const pixelIds = ['PixelId', 'None'];
    const { theme } = useTokenContext();

    // https://munchable.com/article/domain_extension_replace?src=src_replace&pxi=835172915206585&channel=channel_replace&terms=terms_replace&rac=rac_replace&utm_campaign=utm_campaign_replace&sltId=sltId_replace&tmp=tmp_replace

    const getUrlBuilderData = async () => {
        const response = await apiClient.get(`/get/urlbuilderdata?network=Affinity`);
        if (response?.status === 200) {
            setTmpIds(response?.data?.tmps.map(item => ({
                label: item.name,
                value: item.value
            })) || []);
            setNetworkData(response?.data)
            if (indexValueForAccount) {
                // console.log(defaultValues);
                // console.log(defaultValues.split("//")[1].split("/")[0]);
                const DomainUrls = response?.data?.Domains
                    .filter(item => item.url.includes(indexValueForAccount?.split("//")[1]?.split("/")[0]))
                    .map(item => item.url);
                // console.log(DomainUrls);
                setDomain(DomainUrls[0]);

                const text = indexValueForAccount?.split("//")[1]?.split("/")[3];
                const result = text.replace(/\+/g, " ");
                // console.log(result);
                setKeyWords(result);
                console.log(indexValueForAccount.split("//")[1]?.split("/")[4]?.split("&")[0]?.split("?")[1]);
                setChannel(indexValueForAccount.split("//")[1]?.split("/")[4]?.split("&")[0]?.split("?")[1]);
                setMembetId(indexValueForAccount?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[0]);
                setSource(indexValueForAccount?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[1]);
                setGeo(indexValueForAccount?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[2]);
                setSource("fb");
                if (indexValueForAccount.includes('&trkfb')) { setPixelId('PixelId') } else { setPixelId('None') };
                // console.log(indexValueForAccount.split("//")[1].split("/")[0]);
                // const domainData = response 
            } else {
                if (defaultValues) {
                    console.log(defaultValues);
                    // console.log(defaultValues.split("//")[1].split("/")[0]);
                    const DomainUrls = response?.data?.Domains
                        .filter(item => item.url.includes(defaultValues?.split("//")[1]?.split("/")[0]))
                        .map(item => item.url);
                    // console.log(DomainUrls);
                    setDomain(DomainUrls[0]);

                    const text = defaultValues?.split("//")[1]?.split("/")[3];
                    const result = text.replace(/\+/g, " ");
                    console.log(result);
                    setKeyWords("");
                    console.log(defaultValues.split("//")[1]?.split("/")[4]?.split("&")[0]?.split("?")[1]);
                    setChannel(defaultValues.split("//")[1]?.split("/")[4]?.split("&")[0]?.split("?")[1]);
                    setMembetId(defaultValues?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[0]);
                    setSource(defaultValues?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[1]);
                    setGeo(defaultValues?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[2]);
                    setSource("fb");
                    if (defaultValues.includes('&trkfb')) { setPixelId('PixelId') } else { setPixelId('None') };
                    // console.log(defaultValues.split("//")[1].split("/")[0]);
                    // const domainData = response 
                }
            }
        }
    };

    useEffect(() => {
        setDomain(null)
        setSource("fb");
        setChannel("1675913170");
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

    const onChangeTmpId = (value) => {
        setTmp(value);
    }

    // Function to add a new item

    const onClickClear = () => {
        setDomain(null)
        setSource("fb");
        setChannel("1675913170");
        setGeo('');
        setMembetId('');
        setKeyWords('');
        setErrorMessage('');
        setPixelId('PixelId');
        setChannel_id('');
        setRac('');
        setTerms('');
        setTmp('9');

    }
    console.log(showSubmitButton);

    const onClickSubmit = () => {

        if (keywords && channel && domain && source && pixelId) {
            // const formattedKeywords = keywords.replace(/\s+/g, '+'); praveen 
            const formattedKeywords = keywords.trimEnd().replace(/\s+/g, '+'); //s

            const campaign_id = NetworkData?.Source?.find(item => item.code === source).campaignId;
            const adset_id = NetworkData?.Source?.find(item => item.code === source).AdsetId;
            const ad_id = NetworkData?.Source?.find(item => item.code === source).AdId;
            let url;

            // if (pixelId === 'PixelId') {
            //     url = domain;
            // }
            // else {
            //     const newDomain = domain.split("&trkfb");
            //     url = newDomain[0];
            // }

            // if (channel === "None") {
            //     url = url
            //         .replace("keywords_replace", formattedKeywords)
            //         .replace("&chanel_replace", "")
            //         .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
            //         .replace("campaign_id_replace", adset_id)
            //         .replace("adset_id_replace", ad_id);
            // }
            // else {

            //     url = url
            //         .replace("keywords_replace", formattedKeywords)
            //         .replace("chanel_replace", channel)
            //         .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
            //         .replace("campaign_id_replace", adset_id)
            //         .replace("adset_id_replace", ad_id);
            // }
            const racValue = rac ? rac.trim().replace(/\s+/g, '+') : '';

            if (pixelId === 'PixelId') {
                url = domain;
            }
            else {
                // const newDomain = domain.split("&trkfb");
                url = domain.replace("&pxi=835172915206585", "");
            }
            if (channel === "None") {
                url = url
                    .replace("utm_campaign_replace", formattedKeywords)
                    .replace("&chanel_replace", "")
                    .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
                    .replace("campaign_id_replace", adset_id)
                    .replace("adset_id_replace", ad_id)
                    .replace("src_replace", source)
                    .replace("channel_replace", channel_id)
                    .replace("rac_replace", racValue)
                    .replace("tmp_replace", tmp);
            }
            else {

                url = url
                    .replace("utm_campaign_replace", formattedKeywords)
                    .replace("sltId_replace", channel)
                    .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
                    .replace("campaign_id_replace", adset_id)
                    .replace("adset_id_replace", ad_id)
                    .replace("src_replace", source)
                    .replace("channel_replace", channel_id)
                    .replace("rac_replace", racValue)
                    .replace("tmp_replace", tmp);
            }
            if (terms) {
                url = url.replace("terms_replace", terms.trim().replace(/\s+/g, '%20'));
            }else{
                url = url.replace("&terms=terms_replace", "");
            }

            // url = url
            //   .replace("keywords_replace", formattedKeywords)
            //   .replace("chanel_replace", channel)
            //   .replace("business_code_replace_source_code_replace_region_code_replace", ad_id)
            //   .replace("campaign_id_replace", campaign_id)
            //   .replace("adset_id_replace", adset_id);
            onReturnMessage(url);
        }
        else {
            setErrorMessage("Please complete all required fields.");
        }
    }

    const onClickGet = () => {

        if (keywords && channel && domain && source && pixelId && channel_id && rac) {
            const formattedKeywords = keywords.trimEnd().replace(/\s+/g, '+');
            const campaign_id = NetworkData?.Source?.find(item => item.code === source).campaignId;
            const adset_id = NetworkData?.Source?.find(item => item.code === source).AdsetId;
            const ad_id = NetworkData?.Source?.find(item => item.code === source).AdId;
            let url;
            const racValue = rac ? rac.trim().replace(/\s+/g, '+') : '';

            if (pixelId === 'PixelId') {
                url = domain;
            }
            else {
                // const newDomain = domain.split("&trkfb");
                url = domain.replace("&pxi=835172915206585", "");
            }
            if (channel === "None") {
                url = url
                    .replace("utm_campaign_replace", formattedKeywords)
                    .replace("&chanel_replace", "")
                    .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
                    .replace("campaign_id_replace", adset_id)
                    .replace("adset_id_replace", ad_id)
                    .replace("src_replace", source)
                    .replace("channel_replace", channel_id)
                    .replace("rac_replace", racValue)
                    .replace("tmp_replace", tmp);
            }
            else {

                url = url
                    .replace("utm_campaign_replace", formattedKeywords)
                    .replace("sltId_replace", channel)
                    .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
                    .replace("campaign_id_replace", adset_id)
                    .replace("adset_id_replace", ad_id)
                    .replace("src_replace", source)
                    .replace("channel_replace", channel_id)
                    .replace("rac_replace", racValue)
                    .replace("tmp_replace", tmp);
            }
            if (terms) {
                url = url.replace("terms_replace", terms.trim().replace(/\s+/g, '%20'));
            }else{
                url = url.replace("&terms=terms_replace", "");
            }
            setErrorMessage(url);
        }
        else {
            setErrorMessage("Please complete all required fields.");
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

    const onChangeRac = (event) => {
        setRac(event.target.value)
    }

    const onChangeTerms = (event) => {
        setTerms(event.target.value)
    }

    const onChangeChannel_id = (event) => {
        setChannel_id(event.target.value)
    }

    return (
        <div style={{ width: '100%' }}>
            <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={4}>
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
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={3}>
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
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={6}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Sltid</label>
                    <Select
                        showSearch
                        placeholder="sltid"
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
                <Col style={{ display: 'flex', flexDirection: 'column', marginBottom: '5px' }} xs={11} sm={5} lg={4}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Tmp</label>
                    <Select
                        showSearch
                        placeholder="tmp"
                        value={tmp}
                        required
                        onChange={onChangeTmpId}
                        options={tmpIds}
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
            <Row style={{ width: '100%', display: 'flex', justifyContent: "space-between" }}>
                <Col span={7}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Channel</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="channel" style={{ width: '100%', paddingRight: '2px' }} value={channel_id} onChange={onChangeChannel_id} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                    </div>
                </Col>
                <Col span={15}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Utm_campaign</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="utm_campaign" style={{ width: '100%', paddingRight: '2px' }} value={keywords} onChange={onChangeKeyword} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                    </div>
                </Col>
            </Row>
            <Row style={{ width: '100%', display: 'flex', justifyContent: "space-between", marginTop: '10px' }}>
                <Col span={12}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Rac</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="rac" style={{ width: '100%', paddingRight: '2px' }} value={rac} onChange={onChangeRac} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                    </div>
                </Col>
                <Col span={11}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}></span>Terms</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="terms" style={{ width: '100%', paddingRight: '2px' }} value={terms} onChange={onChangeTerms} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
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
                    {!showSubmitButton && <Button style={{ backgroundColor: '#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px" }} onClick={onClickSubmit}>Submit</Button>}
                </Col>
            </Row>
            <Row justify="center" style={{ marginTop: '10px' }}>
                <Col>
                    <p style={{ color: errorMessage === "Please complete all required fields." && "red", fontWeight: 600, textAlign: 'center', width: '100%', fontSize: '20px' }}>{errorMessage}</p>
                </Col>
            </Row>
        </div>
    );
};

export default AffinityUrlBuilder;