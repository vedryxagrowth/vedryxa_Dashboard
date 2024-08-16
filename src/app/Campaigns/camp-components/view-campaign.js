import React, { useEffect, useState } from 'react';
import {
    CloseOutlined,
    CommentOutlined,
    GlobalOutlined,
    LikeOutlined,
    MoreOutlined,
    ShareAltOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Flex,
    Drawer,
    Tabs,
    Modal,
    Typography,
    message,
    Alert
} from "antd";
import axios from 'axios';
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const ViewDrawer = ({ rowData, visible, onClose }) => {
    if (!rowData) {
        return null
    }
    const [viewCampaignData, setViewCampaignData] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    var token = localStorage.getItem("token");


    useEffect(() => {
        const fetchData = async () => {
            try {
                if (rowData) {
                    const response = await axios.get(`https://www.testapi.adsgoat.in/api/viecampaigndata/${rowData.identifier}`
                        ,
                        {
                            headers: {
                                Authorization: token,
                            }
                        }
                    );
                    console.log("hello viewdata", response.data[0]);
                    setViewCampaignData(response.data[0]);
                }
            } catch (error) {
                console.error("Error fetching campaign list:", error);
            }
        };

        fetchData();
    }, [rowData]); // Add rowData as a dependency

    const handleUpdateApproval = async (id, newApprovalValue) => {
        try {
            const response = await fetch(`https://www.testapi.adsgoat.in/api/updateApproval/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({ Approval: newApprovalValue }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
            } else {
                console.error('Failed to update approval');
                // Handle failure
            }
        } catch (error) {
            console.error('Error updating approval:', error);
            // Handle error
        }
    };


    const handleCancel = () => {
        onClose();
    };

    const handleApproval = () => {
        setIsModalVisible(true);
    };
    const handleOk = async () => {
        try {
            // Call the handleUpdateApproval function with the appropriate parameters
            await handleUpdateApproval(rowData.identifier, "Approved");
            // Log the message to the console
            console.log('Approval confirmed');
            message.success("Approval confirmed");
            onClose();
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 2000);
            // Close the modal
            setIsModalVisible(false);
        } catch (error) {
            console.error('Error updating approval:', error);
            // Handle error
        }

    };



    return (
        <Drawer
            title={`View Campaign Details ----> ${viewCampaignData?.Account_Number} / ${viewCampaignData?.campaign_name}`} open={visible} // Changed from open to visible
            onClose={onClose}
            width="95%"
        >
            {rowData.Approval == "PENDING_APPROVAL" ?
                <Alert
                    message={rowData.Approval}
                    // description="This Camapaign"
                    type="info"
                    // showIcon
                    // banner
                    className="blinking"
                    style={{ textAlign: 'center' }}
                /> : null

            }

            <Flex>
                <div style={{ flexGrow: 1 }}>
                    <Card
                        style={{
                            width: "95%"
                        }}>
                        <div style={{ display: "flex", justifyContent: "space-around" }}>
                            <div style={{ flex: 1, marginRight: "20px" }}>
                                <Text type="secondary">Name</Text>
                                <Title level={3} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.camapaignlevel?.Name}
                                </Title>
                            </div>
                            <div style={{ flex: 1, marginRight: "20px" }}>
                                <Text type="secondary">Objectives</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.camapaignlevel?.Objectives}
                                </Title>
                            </div>
                            <div style={{ flex: 1, marginRight: "20px" }}>
                                <Text type="secondary">Special_categories</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.camapaignlevel?.Special_categories}
                                </Title>
                            </div>
                            <div style={{ flex: 1, marginRight: "20px" }}>
                                <Text type="secondary">Bid_strategy</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.camapaignlevel?.Bid_strategy}
                                </Title>
                            </div>
                            <div style={{ flex: 1, marginRight: "20px" }}>
                                <Text type="secondary">dailyBudget</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {(viewCampaignData?.camapaignlevel?.Daily_amount) / 100}
                                </Title>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Text type="secondary">Status</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.camapaignlevel?.Status}
                                </Title>
                            </div>
                        </div>

                    </Card>
                    <Card
                        style={{
                            width: "95%"


                        }}>


                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, marginRight: "20px" }}>
                                <Text type="secondary">AdsetName</Text>
                                <Title level={3} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.AdsetName}
                                </Title>
                            </div>
                            <div style={{ flex: 1, marginRight: "20px" }}>
                                <Text type="secondary">optimization_goal</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.optimization_goal}
                                </Title>
                            </div>
                            <div style={{ flex: 1, marginRight: "20px" }}>
                                <Text type="secondary">billing_event</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.billing_event}
                                </Title>
                            </div>
                            <div style={{ flex: 1, marginRight: "20px" }}>
                                <Text type="secondary">action_source</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.action_source}
                                </Title>
                            </div>
                            <div style={{ flex: 1, marginRight: "20px" }}>
                                <Text type="secondary">custom_event_type</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.custom_event_type}
                                </Title>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Text type="secondary">pixel_id</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.pixel_id}
                                </Title>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            <div style={{ flex: 1 }}>
                                <Text type="secondary">bid_amount</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.bid_amount}
                                </Title>
                            </div>
                            <div style={{ flex: 0.5 }}>
                                <Text type="secondary">countries</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.countries}
                                </Title>
                            </div>
                            <div style={{ flex: 0.6 }}>
                                <Text type="secondary">age</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.Min_Age}-{viewCampaignData?.adsetlevel?.Max_Age}
                                </Title>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Text type="secondary">Gender</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.Gender === 1 ? "Male" : viewCampaignData?.adsetlevel?.Gender === 2 ? "Female" : viewCampaignData?.adsetlevel?.Gender === 0 ? "All" : ""}
                                </Title>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Text type="secondary">publisher_platforms</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.publisher_platforms?.join(', ')}
                                </Title>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Text type="secondary">device_platforms</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.device_platforms?.join(', ')}
                                </Title>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Text type="secondary">buying_type</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.buying_type}
                                </Title>
                            </div>
                        </div>
                    </Card>
                    {viewCampaignData && viewCampaignData.addlevel && viewCampaignData.addlevel.map((item, index) => (
                        <div style={{ border: "1px dotted green" }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ flex: "70%" }}>
                                    <Card
                                        style={{
                                            width: "100%"
                                        }}>
                                        <div style={{ marginRight: "20px" }}>
                                            <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#e6f7ff", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <h3 style={{ margin: 0 }}>{index + 1}</h3>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, marginRight: "20px" }}>
                                            <Text type="secondary">AddName</Text>
                                            <Title level={3} style={{ margin: "2px 0" }}>
                                                {item?.AddName}
                                            </Title>
                                        </div>

                                        <div style={{ display: "flex", flexWrap: "wrap" }}>


                                            <div style={{ flex: 1, marginRight: "20px" }}>
                                                <Text type="secondary">page_id</Text>
                                                <Title level={5} style={{ margin: "2px 0" }}>
                                                    {item?.page_id}
                                                </Title>
                                            </div>
                                            <div style={{ flex: 1, marginRight: "20px" }}>
                                                <Text type="secondary">message</Text>
                                                <Title level={5} style={{ margin: "2px 0" }}>
                                                    {item?.message}
                                                </Title>
                                            </div>
                                            <div style={{ flex: 1, marginRight: "20px" }}>
                                                <Text type="secondary">headline</Text>
                                                <Title level={5} style={{ margin: "2px 0" }}>
                                                    {item?.headline}
                                                </Title>
                                            </div>
                                            <div style={{ flex: 1, marginRight: "20px" }}>
                                                <Text type="secondary">Description</Text>
                                                <Title level={5} style={{ margin: "2px 0" }}>
                                                    {item?.Description}
                                                </Title>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <Text type="secondary">Caption</Text>
                                                <Title level={5} style={{ margin: "2px 0" }}>
                                                    {item?.Caption}
                                                </Title>
                                            </div>
                                        </div>



                                        {/* <div style={{ display: "flex", marginTop: "1%" }}> */}
                                        <div style={{ flex: 1, padding: "2%", border: "2px dotted green" }}>
                                            <Text type="secondary">Website_URL</Text>
                                            <Title level={5} style={{ margin: "2px 0" }}>
                                                {item?.Website_URL}
                                            </Title>
                                        </div>
                                        <div style={{ flex: 1, padding: "2%", border: "2px dotted green" }}>
                                            <Text type="secondary">urlParameters</Text>
                                            <Title level={5} style={{ margin: "2px 0" }}>
                                                {item?.urlParameters}
                                            </Title>
                                        </div>
                                        {/* </div> */}

                                    </Card>
                                </div>
                                <div style={{ flex: "30%" }}>
                                    {item?.filename && (
                                        <div className="container-ad-preview">
                                            <div className="ad-preview">
                                                <div className="ad-heading">
                                                    <div className="img">
                                                        <img
                                                            src={item?.filename}
                                                            alt="page id"
                                                            width="40"
                                                            height="40"
                                                        />
                                                    </div>
                                                    <div className="title">
                                                        <div className="main">{"Facebook Page"}</div>
                                                        <div className="sub">
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
                                                <div className="ad-desc">{item?.message}</div>
                                                <div className="ad-image">
                                                    <img
                                                        src={item?.filename}
                                                    />
                                                </div>
                                                <div className="ad-cta">
                                                    <div className="details">
                                                        <div className="link">{item?.Caption}</div>
                                                        <div className="title">{item?.AddName}</div>
                                                        <div className="desc">{item?.Description}</div>
                                                    </div>
                                                    <div className="ad-button">
                                                        <button type="button">Learn More</button>
                                                    </div>
                                                </div>
                                                <div className="icons">
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
                        </div>
                    ))}
                    <div style={{ display: "flex", marginTop: "1%" }}>
                        <div style={{ flex: 1 }}>
                            <Button onClick={handleCancel}>Cancel</Button>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Button type="primary" onClick={handleApproval}>Approval</Button>
                        </div>
                    </div>
                    <Modal
                        title="Approval Confirmation"
                        open={isModalVisible}
                        onOk={handleOk}
                        onCancel={() => setIsModalVisible(false)}
                    >
                        <p>Are you sure you want to approve?</p>
                    </Modal>
                </div>
            </Flex>
        </Drawer>
    );
};

export default ViewDrawer;
