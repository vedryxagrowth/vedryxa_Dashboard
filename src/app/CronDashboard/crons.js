import React, { useState } from 'react';
import { Collapse, Select, Button, notification, Skeleton } from 'antd';
import axios from 'axios';
import { useTokenContext } from '../components/parent';
const { Panel } = Collapse;
const { Option } = Select;

const domainMapping = {
    FB_Mnet: ["FacebookMnet", "MnetToken", "Mnet", "MnetDaily", "MnetTQ", "FbMnet", "FacebookAdid", "filterFacebookPartners"],
    FB_MnetBing: ["FacebookMnet", "MnetBingToken", "MnetBing", "FbMnetBing"],
    FB_System1: ["System1", "FacebookSystem1", "FbSystem1"],
    FB_Bodies: ["FacebookBodies","BodiesToken", "Bodies", "FbBodies"],
    FB_Enki: ["FacebookEnki", "EnkiJobId", "EnkiLive", "FbEnki"],
    Newsbreak_DA: ["Newsbreak", "DomainActive", "NewsbreakDomain"],
    FB_DomainActive: ["FacebookDomainActive", "DActive", "FbDActive"],
    FB_Tonic1: ["FacebookTonic1", "Tonic1", "FbTonic1"],
    FB_TonicRsoc: ["FacebookTonicRsoc", "TonicRsoc", "FbTonicRsoc", "FacebookAdid", "filterFacebookPartners" ],
    FB_InuvoPrism: ["FacebookInuvoPrisam", "Inuvo_Prism", "FbInuvoPrisam", "Inuvo_PrismDaily", "FbInuvoPrisamDaily"]
};

const newdomainMapping ={
    FB_Mnet: ["Mnet", "MnetDaily", "MnetTQ", "FbMnet", "filterFacebookPartners"],
    FB_MnetBing: ["MnetBing", "FbMnetBing"],
    FB_System1: ["System1", "FbSystem1"],
    FB_Bodies: ["Bodies", "FbBodies"],
    FB_Enki: ["EnkiJobId", "EnkiLive", "FbEnki"],
    Newsbreak_DA: ["DomainActive", "NewsbreakDomain"],
    FB_DomainActive: ["DActive", "FbDActive"],
    FB_Tonic1: ["Tonic1", "FbTonic1"],
    FB_TonicRsoc: [ "TonicRsoc", "FbTonicRsoc", "FacebookAdid", "filterFacebookPartners"],
    FB_InuvoPrism: ["Inuvo_Prism", "FbInuvoPrisam", "Inuvo_PrismDaily", "FbInuvoPrisamDaily"]
}

const daysOptions = [
    { label: 'Today', value: 0 },
    { label: 'Yesterday', value: 1 },
    { label: '3 days', value: 2 },
    { label: '4 days', value: 3 },
    { label: '5 days', value: 4 },
    { label: '6 days', value: 5 }
];

const RequestComponent = ({ network, adAccounts }) => {
    const { theme, userdetails } = useTokenContext();
    if (!userdetails?.adAccounts) {
            return <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ padding: '24px' }}>
                    <Skeleton active paragraph={{ rows: 10 }} />
                </div>
                {/* <Flex align="center" gap="middle">
                    <Spin size="large" />
                </Flex> */}
            </div>;
    }
    const [selectedPath, setSelectedPath] = useState(userdetails?.role === "Special_User" ? newdomainMapping[network]?.[0] : domainMapping[network]?.[0]);
    const [selectedDays, setSelectedDays] = useState(daysOptions[0].value);
    const [loading, setLoading] = useState(false);

    const url = `URL/${selectedPath}?days=${selectedDays}`;

    const filterOption = {
        FB_Mnet: "MEDIA_DOT_NET",
        FB_TonicRsoc: "Tonic_Rsoc",
    };


    const handleSubmit = async (network) => {
        
        // if (selectedPath === "filterFacebookPartners" || selectedPath === "FacebookAdid") {console.log(filterOption[network])};

        let url = `https://networks.adsgoat.in/${selectedPath}?days=${selectedDays}`;
        if (selectedPath === "filterFacebookPartners" || selectedPath === "FacebookAdid") {
            url += `&revenuePartner=${filterOption[network]}`;
        }
        setLoading(true);
        console.log(`Submitting request to ${url} for network ${network}`);

        try {
            const response = await axios.get(url);
            if (response.status === 200 && response.data) {
                notification.success({
                    message: 'Request Successful',
                    description: `The request for ${network} was successful.`,
                });
                console.log(`Response data for ${network}:`, response.data);
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error for ${network}:`, error);
            notification.error({
                message: 'Request Failed',
                description: `The request for ${network} failed with error: ${error.message}`,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Collapse className={`custom-collapse ${theme === 'dark' ? 'dark-mode-collapse' : 'light-mode-collapse'}`} accordion>
            <Panel header={<div style={{ textAlign: 'left', color: theme === "dark" ? "white" : "black", }}>{network}</div>} key={network}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor:theme==="dark"? "#333":"white" }}>
                    <div style={{ marginBottom: '10px' }}>
                        <span>Select Path: </span>
                        <Select 
                            defaultValue={selectedPath}
                            style={{ width: 200 }} 
                            onChange={(value) => setSelectedPath(value)}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            title=''
                        >
                            {userdetails?.role === "Special_User" ? newdomainMapping[network]?.map((path, idx) => (
                                <Option key={idx} value={path} title=''>
                                    {path}
                                </Option>
                            )) : domainMapping[network]?.map((path, idx) => (
                                <Option key={idx} value={path} title=''>
                                    {path}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <span>Select Days: </span>
                        <Select 
                            defaultValue={selectedDays}
                            style={{ width: 150 }} 
                            onChange={(value) => setSelectedDays(value)}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            title={''}
                        >
                            {daysOptions.map((option) => (
                                <Option key={option.value} value={option.value} title={''}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </div>

                     {/* Display the URL */}
                    <p style={{ margin: '0 10px' }}>{url}</p>

                    <Button 
                        // type="primary" 
                        style={{ backgroundColor: "#91C25F", color: "black" }}
                        loading={loading} 
                        onClick={()=>handleSubmit(network)}
                    >
                        {loading ? "Loading" : "Submit"}
                    </Button>
                </div>

                <div style={{ paddingLeft: '10px', marginTop: '10px' }}>
                    {adAccounts?.map((account, index) => (
                        <div key={index} style={{ marginBottom: '5px' }}>
                            {typeof account === 'object' ? account.accountId : account}
                        </div>
                    ))}
                </div>
            </Panel>
        </Collapse>
    );
};

export default RequestComponent;
