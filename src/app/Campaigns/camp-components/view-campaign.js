import React, { useEffect, useState } from 'react';
import {
    CheckOutlined,
    CloseOutlined,
    CommentOutlined,
    DeleteOutlined,
    EditOutlined,
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
    Alert,
    Row,
    Col,
    Tooltip
} from "antd";
import { useTokenContext } from "../../components/parent";
import axios from 'axios';
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const allPositions = [
    { key: "feed", label: "Facebook Feed" },
    { key: "marketplace", label: "Facebook Marketplace" },
    { key: "video_feeds", label: "Facebook Video Feeds" },
    { key: "instream_video", label: "Facebook In-Stream Videos" },
    { key: "facebook_reels", label: "Facebook Reels" },
    { key: "profile_feed-f", label: "Facebook Profile Feed" },
    { key: "search", label: "Facebook Search" },
    { key: "story_f", label: "Facebook Stories" },
    { key: "right_hand_column", label: "Facebook Right Column" },
    { key: "instant_article", label: "Facebook Instant Articles" },
    { key: "biz_disco_feed", label: "Facebook Business Explore" },
  
    { key: "stream", label: "Instagram Stream" },
    { key: "story_i", label: "Instagram Stories" },
    { key: "explore", label: "Instagram Explore" },
    { key: "explore_home", label: "Instagram Explore Home" },
    { key: "reels", label: "Instagram Reels" },
    { key: "profile_feed-i", label: "Instagram Profile Feed" },
    { key: "ig_search", label: "Instagram Search" },
    { key: "profile_reels", label: "Instagram Profile Reels" },
  
    { key: "messenger_home", label: "Messenger Home" },
    { key: "story_m", label: "Messenger Stories" },
    { key: "sponsored_messages", label: "Messenger Sponsored Messages" },
  
    { key: "classic", label: "Audience Network Classic" },
    { key: "rewarded_video", label: "Audience Network Rewarded Video" }
];

const ViewDrawer = ({ rowData, visible, onClose }) => {
    if (!rowData) {
        return null
    }
    const [viewCampaignData, setViewCampaignData] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    var token = localStorage.getItem("token");
    const { theme } = useTokenContext();


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

    const isVideo = (filename) => {
        const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
        return videoExtensions.some(ext => filename?.toLowerCase().endsWith(ext));
    };

    const isImage = (filename) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
        return imageExtensions.some(ext => filename?.toLowerCase().endsWith(ext));
    };

    return (
        <Drawer
            title={`View Campaign Details ----> ${viewCampaignData?.Account_Number} / ${viewCampaignData?.campaign_name}`} open={visible} // Changed from open to visible
            onClose={onClose}
            width="95%"
            style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
        >
            {rowData.Approval == "PENDING_APPROVAL" ?
                <Alert
                    message={rowData.Approval}
                    // description="This Camapaign"
                    type="info"
                    // showIcon
                    // banner
                    className="blinking"
                    style={{ textAlign: 'center', backgroundColor: theme === 'dark' && '#444', color: theme === 'dark' && '#fff', }}
                /> : null

            }

            <Flex>
                <div style={{ flexGrow: 1 }}>

                    <Card style={{ width: "100%", margin: "20px 0",border:'1px solid #4caf50' }}>
                        <Row gutter={[16, 16]} wrap={false} justify="space-between">
                            <Col flex="auto" style={{ maxWidth: '150px' }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Name</Text>
                                <Title level={4} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.camapaignlevel?.Name}
                                </Title>
                            </Col>
                            <Col flex="auto" style={{ maxWidth: '150px' }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Objectives</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal',margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.camapaignlevel?.Objectives}
                                </Title>
                            </Col>
                            <Col flex="auto" style={{ maxWidth: '150px' }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Special categories</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.camapaignlevel?.Special_categories && Array.isArray(viewCampaignData?.camapaignlevel?.Special_categories) ? viewCampaignData?.camapaignlevel?.Special_categories?.join(", ") : viewCampaignData?.camapaignlevel?.Special_categories}
                                </Title>
                            </Col>
                            <Col flex="auto" style={{ maxWidth: '150px' }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Bid strategy</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.camapaignlevel?.Bid_strategy}
                                </Title>
                            </Col>
                            <Col flex="auto" style={{ maxWidth: '150px' }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Daily budget</Text>
                                <Title level={5} style={{ fontSize:'13px',fontWeight:'normal',margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {(viewCampaignData?.camapaignlevel?.Daily_amount) / 100}
                                </Title>
                            </Col>
                            <Col flex="auto" style={{ maxWidth: '150px' }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Status</Text>
                                <Title level={5} style={{ fontSize:'13px',fontWeight:'normal', margin: "2px 0" , color: theme === "dark" && "#edece8"}}>
                                    {viewCampaignData?.camapaignlevel?.Status}
                                </Title>
                            </Col>
                        </Row>
                    </Card>
                    {/* <Card
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
                    </Card> */}
                    <Card style={{ width: "100%", margin: "20px 0" ,border:'1px solid #4caf50'}}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                            <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Adset name</Text>
                                <Title level={4} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.adsetlevel?.AdsetName}
                                </Title>
                            </div>
                            <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Optimization goal</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.adsetlevel?.optimization_goal}
                                </Title>
                            </div>
                            <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Billing event</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.adsetlevel?.billing_event}
                                </Title>
                            </div>
                            <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Action source</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.adsetlevel?.action_source}
                                </Title>
                            </div>
                            <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Custom event type</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.adsetlevel?.custom_event_type}
                                </Title>
                            </div>
                            {/* <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary">Pixel ID</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.pixel_id}
                                </Title>
                            </div> */}
                            <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Bid amount</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.adsetlevel?.bid_amount ? (viewCampaignData?.adsetlevel?.bid_amount/100) : 0}
                                </Title>
                            </div>
                        {/* </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "20px" }}> */}
                            {/* <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary">Bid Amount</Text>
                                <Title level={5} style={{ margin: "2px 0" }}>
                                    {viewCampaignData?.adsetlevel?.bid_amount}
                                </Title>
                            </div> */}
                            <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Countries</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.adsetlevel?.countries}
                                </Title>
                            </div>
                            <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Age</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.adsetlevel?.Min_Age}-{viewCampaignData?.adsetlevel?.Max_Age}
                                </Title>
                            </div>
                            <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Gender</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal' ,margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.adsetlevel?.Gender === 1 ? "Male" : viewCampaignData?.adsetlevel?.Gender === 2 ? "Female" : viewCampaignData?.adsetlevel?.Gender === 0 ? "All" : ""}
                                </Title>
                            </div>
                            <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Placements</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.adsetlevel?.placements
                                    ? viewCampaignData.adsetlevel.placements.charAt(0).toUpperCase() + viewCampaignData.adsetlevel.placements.slice(1)
                                    : 'N/A'}
                                </Title>
                            </div>
                            {viewCampaignData?.adsetlevel?.placements === "manual" &&
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "20px" }}>
                                    <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                        <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Publisher platforms</Text>
                                        <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                            {viewCampaignData?.adsetlevel?.publisher_platforms
                                            ?.map(item =>
                                                item
                                                .split('_')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join('_')
                                            )
                                            .join(', ') || 'N/A'}
                                        </Title>
                                    </div>
                                    <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                        <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Positions</Text>
                                        <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                            {viewCampaignData?.adsetlevel?.position
                                            ?.map(posKey => {
                                                const match = allPositions.find(option => option.key === posKey);
                                                return match?.label || posKey; // fallback to key if label not found
                                            })
                                            .join(', ') || 'N/A'}
                                        </Title>
                                    </div>
                                    <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                        <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Device platforms</Text>
                                        <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                            {viewCampaignData?.adsetlevel?.device_platforms
                                            ?.map(item => item.charAt(0).toUpperCase() + item.slice(1))
                                            .join(', ') || 'N/A'}
                                        </Title>
                                    </div>
                                    <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                        <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Buying type</Text>
                                        <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                            {viewCampaignData?.adsetlevel?.buying_type}
                                        </Title>
                                    </div>
                                    <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                        <Text type="secondary"></Text>
                                        <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                            
                                        </Title>
                                    </div>
                                </div>
                            }
                            {viewCampaignData?.adsetlevel?.placements !== "manual" &&<div style={{ flex: "1 1 200px", minWidth: "200px" }}>
                                <Text type="secondary" style={{color: theme === "dark" && "#bfbfbf"}}>Buying type</Text>
                                <Title level={5} style={{fontSize:'13px',fontWeight:'normal', margin: "2px 0", color: theme === "dark" && "#edece8" }}>
                                    {viewCampaignData?.adsetlevel?.buying_type}
                                </Title>
                            </div>}
                        </div>
                    </Card>

                    <Row gutter={[16, 16]} style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto" }}>
                        {viewCampaignData.addlevel && viewCampaignData.addlevel.map((item, index) => (
                            <Col key={index} flex="0 0 340px">
                                <Card
                                    title={null}
                                    bordered={false}
                                    style={{
                                        width: '100%',
                                        maxWidth: '340px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        border:'1px solid #4caf50'
                                    }}
                                    bodyStyle={{ padding: '0' }}
                                >
                                    <div style={{ padding: '10px 16px' }}>
                                        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                                            <div style={{ marginRight: "10px" }}>
                                                {isImage(item.filename) ? (
                                                    <img
                                                        src={item?.filename}
                                                        alt="page id"
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : isVideo(item.filename) ? (
                                                    <video
                                                        src={item?.filename}
                                                        width="40"
                                                        height="40"
                                                        controls
                                                        style={{
                                                            objectFit: 'cover',
                                                            borderRadius: '50%',
                                                        }}
                                                    />
                                                ) : (
                                                    <div>No media available</div>
                                                )}
                                            </div>

                                            <div style={{ flex: "1" }}>
                                                <div style={{ fontWeight: "bold", fontSize: "14px" ,color : theme === "dark" && "white"}}>
                                                    {item?.AddName || 'Consumer finds'}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "#888" ,color : theme === "dark" && "white"}}>
                                                    Sponsored <GlobalOutlined style={{ opacity: "0.6", marginLeft: "4px" }} />
                                                </div>
                                            </div>
                                            <Tooltip title="More options">
                                                <MoreOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
                                            </Tooltip>
                                        </div>
                                        <div style={{ fontSize: "14px", color: "#333", marginBottom: "10px",color : theme === "dark" && "white" }}>
                                            {item?.message}
                                        </div>
                                    </div>

                                    <div style={{ width: '100%', height: '200px', marginBottom: "10px" }}>
                                        {isVideo(item?.filename) ? (
                                            <video
                                                controls
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            >
                                                <source src={item?.filename} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : isImage(item?.filename) ? (
                                            <img
                                                src={item?.filename}
                                                alt="content"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ textAlign: "center", padding: "50px" }}>
                                                No media available
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '10px 16px' }}>
                                        <div style={{ fontSize: "16px", fontWeight: "bold", color : theme === "dark" ? "white" : "#333" }}>
                                            {item?.headline}
                                        </div>
                                        <div style={{ fontSize: "14px", color : theme === "dark" ? "white" : "#333", marginBottom: "10px" }}>
                                            {item?.Description}
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <div style={{ fontSize: "12px", color : theme === "dark" ? "white" : "#888", marginBottom: "10px" }}>
                                                {item?.Caption}
                                            </div>
                                            <button
                                                type="button"
                                                style={{
                                                    padding: "8px 12px",
                                                    borderRadius: "20px",
                                                    // backgroundColor: "#007BFF",
                                                    // color: "#fff",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    flexShrink: 0,
                                                    backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px"
                                                }}
                                                onClick={() => console.log('Learn more clicked:', item)}
                                            >
                                                Learn more
                                            </button>
                                        </div>

                                        {/* Website URL */}
                                        <div style={{ fontSize: "12px", color: "#888", wordWrap: "break-word", marginBottom: "10px" }}>
                                            <GlobalOutlined />{" "}
                                            <a href={item?.Website_URL} target="_blank" rel="noopener noreferrer" style={{ color: "blue" }}>
                                                {item?.Website_URL}
                                            </a>
                                        </div>

                                        {/* Like, Comment, Share */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleLike(item)}>
                                                <LikeOutlined style={{ fontSize: "18px", marginRight: "5px" }} />
                                                <span style={{ fontSize: "14px",color : theme === "dark" && "white" }}>Like</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleComment(item)}>
                                                <CommentOutlined style={{ fontSize: "18px", marginRight: "5px" }} />
                                                <span style={{ fontSize: "14px",color : theme === "dark" && "white" }}>Comment</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleShare(item)}>
                                                <ShareAltOutlined style={{ fontSize: "18px", marginRight: "5px" }} />
                                                <span style={{ fontSize: "14px",color : theme === "dark" && "white" }}>Share</span>
                                            </div>
                                        </div>

                                        {/* Approve/Reject, Edit/Delete */}
                                        {/* <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <Button type="primary" icon={<CheckOutlined />} style={{ backgroundColor: 'green', borderColor: 'green' }} onClick={() => handleApprove(item)}>
                                                    Approve
                                                </Button>
                                                <Button type="primary" danger icon={<CloseOutlined />} onClick={() => handleReject(item)}>
                                                    Reject
                                                </Button>
                                            </div>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <Tooltip title="Edit">
                                                    <EditOutlined style={{ fontSize: "18px", cursor: "pointer" }} onClick={() => handleEdit(item)} />
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <DeleteOutlined style={{ fontSize: "18px", color: "red", cursor: "pointer" }} onClick={() => handleDelete(item)} />
                                                </Tooltip>
                                            </div>
                                        </div> */}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    {viewCampaignData.Approval !== "Approved" && ( // Only render buttons if not approved
                        <div style={{ display: "flex", marginTop: "1%" }}>
                            <div style={{ flex: 1 }}>
                                <Button onClick={handleCancel} className="dark-icon-button"  style={{color: theme === "dark" ? "white" : "#000"}}>Cancel</Button>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Button  style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px"}} onClick={handleApproval}>Approval</Button>
                            </div>
                        </div>
                    )}

                    <Modal
                        title="Approval confirmation"
                        open={isModalVisible}
                        onOk={handleOk}
                        onCancel={() => setIsModalVisible(false)}
                        className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                    >
                        <p>Are you sure you want to approve?</p>
                    </Modal>
                </div>
            </Flex>
        </Drawer>
    );
};

export default ViewDrawer;
