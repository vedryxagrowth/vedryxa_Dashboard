"use client"
import React from 'react';
import { Button, Input, Row, Col } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTokenContext } from '../../../components/parent';
const TonicUrlBuilder = ({defaultValues, onReturnMessage, showSubmitButton}) => {
    const [siteName, setSiteName] = useState('');
    const [keywords, setKeyWords] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [NetworkData, setNetworkData]= useState([]);
    const { apiClient } = useTokenContext();
    // const businessData = [
    //     {
    //       "id":5,
    //       "name":"Tonic",
    //       "code":"b6",
    //       "account":"TO",
    //       "url":"sitename_replace/?network=facebook&site=direct&dpco=1&adtitle=keywords_replace&subid1={{campaign.id}}&subid2={{adset.id}}"
    //     }
    // ]

    const getUrlBuilderData = async()=>{
        const response = await apiClient.get(`/get/urlbuilderdata?network=Tonic1`);
        if(response?.status === 200){
          setNetworkData(response?.data)
          if(defaultValues){
            const defaultSiteName = defaultValues?.split("/")[0];
            const defaultKeyword = defaultValues?.split("/")[1]?.split("&")[3]?.split("=")[1];
            setSiteName(defaultSiteName);
            setKeyWords(defaultKeyword);
          }
        }
      };
    
      useEffect(()=>{
        getUrlBuilderData();
      },[]);

    // Function to add a new item
    const onChangeSiteName = (event)=>{
        setSiteName(event.target.value);
    }

    const onChangeKeyword = (event) =>{
        setKeyWords(event.target.value);
    }

    const onClickClear = () =>{
        setSiteName('');
        setKeyWords('');
        setErrorMessage('');
    }

    const onClickSubmit = () =>{
        
        if(keywords && siteName){
            let url = NetworkData?.businessData[0]?.url;

            url = url
                .replace("sitename_replace", siteName.trim())
                .replace("keywords_replace", keywords.trim());
            onReturnMessage(url);
        }
        else{
            setErrorMessage("Please complete all fields.");
        }
    }

    const onClickGet = () =>{
        
        if(keywords && siteName){
            let url = NetworkData?.businessData[0]?.url;

            url = url
                .replace("sitename_replace", siteName.trim())
                .replace("keywords_replace", keywords.trim());
            setErrorMessage(url);
        }
        else{
            setErrorMessage("Please complete all fields.");
        }
    }

    return (
        <div style={{width:'100%'}}>
            <Row style={{display:'flex', alignItems:'center', paddingBottom:'10px'}}>
                <Col style={{display:'flex', flexDirection:'column'}} span={9}>
                    <label><span style={{ color: 'red', paddingRight:'2px',paddingTop:'2px' }}>*</span>Site Name</label>
                    <Input placeholder='Site Name' value={siteName} required style={{width:'80%'}} onChange={onChangeSiteName}></Input>
                </Col>
                {/* <Col style={{display:'flex', flexDirection:'column'}} span={6}>
                    <label>Sorce</label>
                    <Select
                        showSearch
                        required
                        // onChange={onChangeTime}
                        // className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                        placeholder="Source"
                        style={{width:'80%'}}
                        value={source}
                        // dropdownClassName={theme === 'dark' && "custom-dropdown"}
                        // optionFilterProp="label"
                        // value={time}
                        options={Source.map((item) => ({
                            value: item.code,
                            label: item.name,
                        }))}
                    />
                </Col> */}
            </Row>
            <Row style={{ width: '100%' }}>
                <Col span={24}>
                    <label><span style={{ color: 'red', paddingRight:'2px',paddingTop:'2px' }}>*</span>Keywords</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="Key words" style={{ width: '100%' }} value={keywords} onChange={onChangeKeyword}/>
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
                    {!showSubmitButton && <Button type="primary" onClick={onClickSubmit}>Submit</Button>}
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

export default TonicUrlBuilder;