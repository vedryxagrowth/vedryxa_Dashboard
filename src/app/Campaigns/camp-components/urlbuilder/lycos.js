"use client"
import React from 'react';
import { Button, Input, Row, Col, Select } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTokenContext } from '../../../components/parent';
const LycosUrlBuilder = ({ defaultValues, indexValueForAccount, onReturnMessage, showSubmitButton }) => {
    const [siteName, setSiteName] = useState('');
    const [keywords, setKeyWords] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [NetworkData, setNetworkData] = useState([]);
    const [sub_ids, setSub_ids] = useState([]);
    const [sub_id_value, setSub_id_value] = useState("{{campaign.id}}")
    const [click_id, setClick_id_value] = useState("None");
    const { apiClient } = useTokenContext();
    const { theme } = useTokenContext();
    const token = localStorage.getItem("token")
    const Click_ids = [{ key: "None", label: "None", value: "None" }, { key: "click_id", label: "Click_id", value: "click_id" },]
    const getUrlBuilderData = async () => {
        // const response = await apiClient.get(`/get/urlbuilderdata?network=Tonic1`);
        const response = await fetch(
            `https://fblaunching.vyaktimetrics.com/open/get/urlbuilderdata?network=Lycos`,
            {
                method: "GET",
                headers: { Authorization: token },
            },
        )
        const json = await response.json();
        if (response?.status === 200) {
            const keyValuePairs = json?.channels?.map(item => ({ key: item.name, value: item.value, label: item.name }))
            setSub_ids(keyValuePairs)
            setNetworkData(json)
            if (indexValueForAccount) {
                const parsedindexValueForAccountUrl = new URL(indexValueForAccount);
                const defaultSub_id = parsedindexValueForAccountUrl.searchParams.get("type");
                const defaultKeyword = parsedindexValueForAccountUrl.searchParams.get("kw");
                const defaultClid = parsedindexValueForAccountUrl.searchParams.get("clid");
                setSub_id_value(defaultSub_id);
                setKeyWords(defaultKeyword);
                if (defaultClid) {
                    setClick_id_value(defaultClid)
                } else {
                    setClick_id_value("None");
                }
            } else {
                if (defaultValues) {
                    const parsedindexValueForAccountUrl = new URL(defaultValues);
                    const defaultSub_id = parsedindexValueForAccountUrl.searchParams.get("type");
                    const defaultClid = parsedindexValueForAccountUrl.searchParams.get("clid");
                    setSub_id_value(defaultSub_id);
                    setKeyWords("");
                    if (defaultClid) {
                        setClick_id_value(defaultClid)
                    } else {
                        setClick_id_value("None");
                    }
                }
            }
        }
    };

    useEffect(() => {
        getUrlBuilderData();
    }, []);

    // Function to add a new item
    const onChangeSiteName = (event) => {
        setSiteName(event.target.value);
    }

    const onChangeKeyword = (event) => {
        setKeyWords(event.target.value);
    }

    const onClickClear = () => {
        setSiteName('');
        setKeyWords('');
        setSub_id_value("{{campaign.id}}");
        setClick_id_value("None");
        setErrorMessage('');
    }
    const onClickSubmit = () => {
        if (!keywords || !sub_id_value || !click_id) {
            setErrorMessage("Please complete all fields.");
            return;
        }

        if (click_id !== "None" && !siteName?.trim()) {
            setErrorMessage("Please enter a valid Click ID.");
            return;
        }

        let url = NetworkData?.Domains[0]?.url;

        url = url
            .replace("$sub_id", sub_id_value?.trim() || "")
            .replace("$keyword", keywords.trim());
        if (click_id !== "None") {
            url = url.replace("$click_id", siteName?.trim() || "");
        } else {
            url = url.replace("&clid=$click_id", "");
        }

        onReturnMessage(url);
    };
    const onClickGet = () => {
        if (!keywords || !sub_id_value || !click_id) {
            setErrorMessage("Please complete all fields.");
            return;
        }

        if (click_id !== "None" && !siteName?.trim()) {
            setErrorMessage("Please enter a valid Click ID.");
            return;
        }

        let url = NetworkData?.Domains[0]?.url;

        url = url
            .replace("$sub_id", sub_id_value?.trim() || "")
            .replace("$keyword", keywords.trim());
        if (click_id !== "None") {
            url = url.replace("$click_id", siteName?.trim() || "");
        } else {
            url = url.replace("&clid=$click_id", "");
        }

        setErrorMessage(url);
    };

    return (
        <div style={{ width: '100%' }}>
            <Row style={{ display: 'flex', alignItems: 'center', paddingBottom: '10px', gap: 10 }}>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={6}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Type</label>
                    <Select placeholder="Select Channel" options={sub_ids} value={sub_id_value} onChange={(value) => setSub_id_value(value)} />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={6}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Click_id</label>
                    <Select placeholder="Select Channel" options={Click_ids} value={click_id} onChange={(value) => setClick_id_value(value)} />
                </Col>
                {click_id !== "None" && <Col style={{ display: 'flex', flexDirection: 'column' }} span={9}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Click_id Value</label>
                    <Input placeholder='Click Id' value={siteName} required style={{ width: '80%' }} onChange={onChangeSiteName} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}></Input>
                </Col>}
            </Row>
            <Row style={{ width: '100%' }}>
                <Col span={24}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Keyword</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="Key word" style={{ width: '100%' }} value={keywords} onChange={onChangeKeyword} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
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
                    <p style={{ color: errorMessage === "Please complete all fields." || errorMessage === "Please enter a valid Click ID." && "red", fontWeight: 600, textAlign: 'center', width: '100%', fontSize: '20px' }}>{errorMessage}</p>
                </Col>
            </Row>
        </div>
    );
};

export default LycosUrlBuilder;