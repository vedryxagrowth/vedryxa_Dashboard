import React, { useState } from 'react';
import { Collapse, Select, Button, notification, Skeleton } from 'antd';
import axios from 'axios';
import { useTokenContext } from '../components/parent';
import { CheckCircleFill } from 'react-bootstrap-icons';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
const { Panel } = Collapse;
const { Option } = Select;

// const domainMapping = {
//     FB_Mnet: ["FacebookMnet", "MnetToken", "Mnet", "MnetDaily", "MnetTQ", "FbMnet", "FacebookAdid", "filterFacebookPartners","filterFacebookPartnersDaily"],
//     FB_MnetBing: ["FacebookMnet", "MnetBingToken", "MnetBing", "FbMnetBing"],
//     FB_System1: ["System1", "FacebookSystem1", "FbSystem1"],
//     FB_Bodies: ["FacebookBodies","BodiesToken", "Bodies", "FbBodies"],
//     FB_Enki: ["FacebookEnki", "EnkiJobId", "EnkiLive", "FbEnki"], 
//     Newsbreak_DA: ["Newsbreak", "DomainActive", "NewsbreakDomain"],
//     FB_DomainActive: ["FacebookDomainActive", "DActive", "FbDActive"],
//     FB_Tonic1: ["FacebookTonic1", "Tonic1", "FbTonic1"],
//     FB_TonicRsoc: ["FacebookTonicRsoc", "TonicRsoc", "FbTonicRsoc", "FacebookAdid", "filterFacebookPartners" ],
//     FB_InuvoPrism: ["FacebookInuvoPrisam", "Inuvo_Prism", "FbInuvoPrisam", "Inuvo_PrismDaily", "FbInuvoPrisamDaily"]
// };
const domainMapping = {
    FB_Mnet: [
        { label: "1.Fb campaign & adset", value: "FacebookMnet" },
        { label: "2.Facebook Ad ", value: "FacebookAdid" },
        { label: "3.MnetLive", value: "Mnet" },
        { label: "4.MnetDaily", value: "MnetDaily" },
        { label: "5.MnetTQ", value: "MnetTQ" },
        { label: "6.Live & Daily Filter Camapign adset ", value: "FbMnet" },
        { label: "7.Live filter Ad", value: "filterFacebookPartners" },
        { label: "8.Daily filter Ad", value: "filterFacebookPartnersDaily" },
        { label: "MnetToken", value: "MnetToken" },
    ],
    FB_MnetBing: [
        { label: "1.FacebookMnet", value: "FacebookMnet" },
        { label: "2.MnetBing", value: "MnetBing" },
        { label: "3.FBMnetBing", value: "FbMnetBing" },
        { label: "MnetBingToken", value: "MnetBingToken" },
    ],
    FB_System1: [
        { label: "1.FacebookSystem1", value: "FacebookSystem1" },
        { label: "2.System1", value: "System1" },
        { label: "3.FBSystem1", value: "FbSystem1" },
    ],
    FB_Bodies: [
        { label: "1.FacebookBodies", value: "FacebookBodies" },
        { label: "2.Bodies", value: "Bodies" },
        { label: "3.FBBodies", value: "FbBodies" },
        { label: "BodiesToken", value: "BodiesToken" },
    ],
    FB_Enki: [
        { label: "1.FacebookEnki", value: "FacebookEnki" },
        { label: "2.EnkiJobID", value: "EnkiJobId" },
        { label: "3.EnkiLive", value: "EnkiLive" },
        { label: "4.FBEnki", value: "FbEnki" },
    ],
    Newsbreak_DA: [
        { label: "1.NewsbreakDomain", value: "NewsbreakDomain" },
        { label: "2.Newsbreak", value: "Newsbreak" },
        { label: "3.DomainActive", value: "DomainActive" },

    ],
    FB_DomainActive: [
        { label: "1.FacebookDomainActive", value: "FacebookDomainActive" },
        { label: "2.DomainActive", value: "DActive" },
        { label: "3.FBDomainActive", value: "FbDActive" },
    ],
    FB_Tonic1: [
        { label: "1.FacebookTonic1", value: "FacebookTonic1" },
        { label: "2.Tonic1", value: "Tonic1" },
        { label: "3.FBTonic1", value: "FbTonic1" },
    ],
    FB_TonicRsoc: [
        { label: "1.FacebookTonicRsoc", value: "FacebookTonicRsoc" },
        { label: "2.FacebookAdID", value: "FacebookAdid" },
        { label: "3.TonicRsoc", value: "TonicRsoc" },
        { label: "4.FBTonicRsoc", value: "FbTonicRsoc" },
        { label: "5.FilterPartners", value: "filterFacebookPartners" },
    ],
    FB_InuvoPrism: [
        { label: "1.FacebookInuvoPrism", value: "FacebookInuvoPrisam" },
        { label: "2.Inuvo_Prism Live", value: "Inuvo_Prism" },
        { label: "3.Inuvo_Prism Daily", value: "Inuvo_PrismDaily" },
        { label: "4.Filter live InuvoPrism", value: "FbInuvoPrisam" },
        { label: "5.Filter Daily InuvoPrism", value: "FbInuvoPrisamDaily" },
    ]
};

const newdomainMapping = {
    FB_Mnet: [
        { label: "1.MnetLive", value: "Mnet" },
        { label: "2.MnetDaily", value: "MnetDaily" },
        { label: "3.MnetTQ", value: "MnetTQ" },
        { label: "4.FBMnet", value: "FbMnet" },
        { label: "5.FilterFacebookPartners", value: "filterFacebookPartners" },
        { label: "6.FilterFacebookPartnersDaily", value: "filterFacebookPartnersDaily" },
    ],
    FB_MnetBing: [
        { label: "1.MnetBing", value: "MnetBing" },
        { label: "2.FBMnetBing", value: "FbMnetBing" },
    ],
    FB_System1: [
        { label: "1.System1", value: "System1" },
        { label: "2.FBSystem1", value: "FbSystem1" },
    ],
    FB_Bodies: [
        { label: "1.Bodies", value: "Bodies" },
        { label: "2.FBBodies", value: "FbBodies" },
    ],
    FB_Enki: [
        { label: "1.EnkiJobID", value: "EnkiJobId" },
        { label: "2.EnkiLive", value: "EnkiLive" },
        { label: "3.FBEnki", value: "FbEnki" },
    ],
    Newsbreak_DA: [
        { label: "1.DomainActive", value: "DomainActive" },
        { label: "2.NewsbreakDomain", value: "NewsbreakDomain" },
    ],
    FB_DomainActive: [
        { label: "1.DomainActive", value: "DActive" },
        { label: "2.FBDomainActive", value: "FbDActive" },
    ],
    FB_Tonic1: [
        { label: "1.Tonic1", value: "Tonic1" },
        { label: "2.FBTonic1", value: "FbTonic1" },
    ],
    FB_TonicRsoc: [
        { label: "1.TonicRsoc", value: "TonicRsoc" },
        { label: "2.FBTonicRsoc", value: "FbTonicRsoc" },
        { label: "3.FacebookAdID", value: "FacebookAdid" },
        { label: "4.FilterFacebookPartners", value: "filterFacebookPartners" },
    ],
    FB_InuvoPrism: [
        { label: "1.Inuvo_Prism", value: "Inuvo_Prism" },
        { label: "2.FBInuvoPrism", value: "FbInuvoPrisam" },
        { label: "3.Inuvo_PrismDaily", value: "Inuvo_PrismDaily" },
        { label: "4.FBInuvoPrismDaily", value: "FbInuvoPrisamDaily" },
    ]
};

// const newdomainMapping ={
//     FB_Mnet: ["Mnet", "MnetDaily", "MnetTQ", "FbMnet", "filterFacebookPartners","filterFacebookPartnersDaily"],
//     FB_MnetBing: ["MnetBing", "FbMnetBing"],
//     FB_System1: ["System1", "FbSystem1"],
//     FB_Bodies: ["Bodies", "FbBodies"],
//     FB_Enki: ["EnkiJobId", "EnkiLive", "FbEnki"], 
//     Newsbreak_DA: ["DomainActive", "NewsbreakDomain"],
//     FB_DomainActive: ["DActive", "FbDActive"],
//     FB_Tonic1: ["Tonic1", "FbTonic1"],
//     FB_TonicRsoc: [ "TonicRsoc", "FbTonicRsoc", "FacebookAdid", "filterFacebookPartners"],
//     FB_InuvoPrism: ["Inuvo_Prism", "FbInuvoPrisam", "Inuvo_PrismDaily", "FbInuvoPrisamDaily"]
// }

const daysOptions = [
    { label: 'Today', value: 0 },
    { label: 'Yesterday', value: 1 },
    { label: '3 days', value: 2 },
    { label: '4 days', value: 3 },
    { label: '5 days', value: 4 },
    { label: '6 days', value: 5 }
];

const RequestComponent = ({ network, adAccounts, NetworkData }) => {
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
    // const [selectedPath, setSelectedPath] = useState(userdetails?.role === "Special_User" ? newdomainMapping[network]?.[0] : domainMapping[network]?.[0]);
    const [selectedPath, setSelectedPath] = useState(
        userdetails?.role === "Special_User"
            ? newdomainMapping[network]?.[0]?.value
            : domainMapping[network]?.[0]?.value
    );

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
        if (selectedPath === "filterFacebookPartners" || selectedPath === "FacebookAdid" || selectedPath === "filterFacebookPartnersDaily") {
            url += `&revenuePartner=${filterOption[network]}`;
            if (selectedPath === "filterFacebookPartnersDaily") {
                url += `&revenuePartnerCollectionName=MediaDotNet_Daily`
            }
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
            {/* <Panel header={<div style={{ textAlign: 'left', color: theme === "dark" ? "white" : "black", }}>{network}</div>} key={network}> */}
            <Panel
                key={network}
                header={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {NetworkData?.find(n => n.Network === network)?.Status === 'Active' ? (
                            <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} className='black-icon-active-1' />
                        ) : (
                            <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} className='black-icon-pause-1' />
                        )}
                        <span
                            style={{
                                color: theme === "dark" ? "white" : "black"
                            }}
                        >
                            {network}
                        </span>
                    </div>
                }
            >


                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme === "dark" ? "#333" : "white" }}>
                    <div style={{ marginBottom: '10px' }}>
                        <span>Select Path: </span>
                        <Select
                            value={selectedPath}
                            style={{ width: 200 }}
                            onChange={(value) => setSelectedPath(value)}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}

                        >
                            {userdetails?.role === "Special_User" ? newdomainMapping[network]?.map((path, idx) => (
                                // <Option key={idx} value={path} >
                                //     {path}
                                // </Option>
                                <Option key={idx} value={path.value}>
                                    {path.label}
                                </Option>
                            )) : domainMapping[network]?.map((path, idx) => (
                                // <Option key={idx} value={path} >
                                //     {path}
                                // </Option>
                                <Option key={idx} value={path.value}>
                                    {path.label}
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
                        onClick={() => handleSubmit(network)}
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
