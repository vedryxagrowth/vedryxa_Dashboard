"use client"
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Tooltip, Button, Modal, Input, Space, Drawer, theme, Tag } from 'antd';
import { LikeOutlined, CommentOutlined, ShareAltOutlined, GlobalOutlined, MoreOutlined, CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, MessageOutlined, CloseCircleOutlined, PlusOutlined, EyeOutlined, PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons";
import axios from 'axios';
import { useTokenContext } from '../../components/parent';
import Editads from './EditAds';
import moment from 'moment-timezone';
import Createnewads from './Createads';

const AdsetCard = ({ adset, index, imagehash, restrictedEmails, userdetails, changeRRefrst, viewCampaignData }) => {
    const [expanded, setExpanded] = useState(false);
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const token = localStorage.getItem("token");

    const isVideo = (filename) => {
        const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
        return videoExtensions.some(ext => filename?.toLowerCase().endsWith(ext));
    };

    const isImage = (filename) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
        return imageExtensions.some(ext => filename?.toLowerCase().endsWith(ext));
    };

    const isMediaBuyer = userdetails.role === 'MEDIA_BUYER' || userdetails.role === "Special_User";

    const handleEditClick = (item) => {
        setSelectedItem(item); // Set the item to be edited
        setIsDrawerVisible(true); // Open the drawer
    };

    const handleApprove = async (item) => {
        console.log("item in handle approve", item, "userdetails", userdetails)
        setLoading(true);
        try {//https://www.testapi.adsgoat.in
            const response = await axios.post(
                'https://www.testapi.adsgoat.in/api/newapproveAds',
                {
                    id: item.id,
                    Approved: userdetails.userName, // Assuming userdetails has a name property
                    datetime: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm [IST]')
                },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );
            if (response.status === 200) {
                console.log('Approved');
                changeRRefrst && changeRRefrst();
            }
        } catch (error) {
            console.error("Error approving ad:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleRejectClick = (item) => {
        setCurrentItem(item);
        setIsRejectModalVisible(true);
    };

    const handleCancelReject = () => {
        setIsRejectModalVisible(false);
        setRejectionReason("");
    };

    const handleConfirmReject = async () => {
        setLoading(true);
        try {//https://www.testapi.adsgoat.in
            const response = await axios.post(
                'https://www.testapi.adsgoat.in/api/newrejectAds',
                {
                    id: currentItem.id,
                    reason: rejectionReason,
                },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );
            if (response.status === 200) {
                console.log('Rejected:', currentItem.id);
                changeRRefrst && changeRRefrst();
            }
        } catch (error) {
            console.error("Error rejecting ad:", error);
        } finally {
            setLoading(false);
            setIsRejectModalVisible(false); // Close the modal
            setRejectionReason(""); // Reset the rejection reason input
        }
    };

    const approvedCount = adset.addlevel.filter((item) => item.status === "Approved").length;
    const rejectedCount = adset.addlevel.filter((item) => item.status === "Rejected").length;
    const pendingCount = adset.addlevel.filter((item) => !item.status).length;
  
    return (
      <Card
        bordered={false}
        style={{
          width: '100%',
          borderRadius: 12,
          background: '#fff',
          boxShadow: '0 1px 6px rgba(0, 0, 0, 0.05)',
          marginBottom: '12px',
        }}
        bodyStyle={{ padding: '16px' }}
      >
        {/* Top Row: Title + Icons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding:"0px" }}>
          <div style={{ fontWeight: 600, fontSize: 14, display:'flex', alignItems:'center' }}>
            <div onClick={() => setExpanded(!expanded)} style={{ fontSize: 12 }}>
                    {expanded ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
            </div>
            <div style={{marginLeft:'5px'}}>{adset.AdsetName || `Adset ${index + 1}`} </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginLeft: "10px" }}>
            <Tooltip title="Approved"><span style={{ color: '#4caf50', fontWeight: 'bold', marginRight: 10 }}>{approvedCount}</span></Tooltip>
            <Tooltip title="Rejected"><span style={{ color: 'red', fontWeight: 'bold', marginRight: 10 }}>{rejectedCount}</span></Tooltip>
            <Tooltip title="Pending"><span className="blinking" style={{ color: 'orange', fontWeight: 'bold' }}>{pendingCount}</span></Tooltip>
          </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Tooltip title="View">
              <EyeOutlined style={{ color: '#888', cursor: 'pointer' }} />
            </Tooltip>
            <Tooltip title="Edit">
              <EditOutlined style={{ color: '#888', cursor: 'pointer' }} />
            </Tooltip>
          </div>
        </div>
  
        {/* Budget Line */}
        <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
          Budget: ${(adset.Daily_amount) / 100 || 0} • {adset.addlevel?.length || 4} ads
        </div>
  
        {/* Status Badge */}
        <div style={{ marginTop: 12 }}>
          <span
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              backgroundColor: '#d7f3dc',
              color: '#2f855a',
              borderRadius: '20px',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {adset.Status?.toUpperCase() || 'PAUSED'}
          </span>
        </div>
  
        {/* Toggle Button */}
        
  
        {/* Conditional Detail Section */}
        {expanded && adset.addlevel && (
            <Row gutter={[16, 16]} style={{ marginTop: 16, display:'flex', flexWrap:"nowrap", overflow:"auto" }}>
                {adset.addlevel.map((item, index) => (
                        // <div key={index} style={{display:'flex', width:"100%", marginTop:'10px', flexWrap:"wrap"}}>
                        <Col span={12}>
                            <Card
                                title={null}
                                bordered={false}
                                style={{
                                    width: '100%',
                                    maxWidth: '280px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
                                            <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                                                {item?.AddName || 'Consumer finds'}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#888" }}>
                                                {imagehash?.pageName ? (
                                                    <>
                                                    {imagehash.pageName} <GlobalOutlined style={{ opacity: "0.6" }} />
                                                    </>
                                                    ) : (
                                                    <GlobalOutlined style={{ opacity: "0.6" }} />
                                                )}
                                                {/* Sponsored <GlobalOutlined style={{ opacity: "0.6", marginLeft: "4px" }} />/ */}
                                            </div>
                                        </div>
                                        <Tooltip title="More Options">
                                            <MoreOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
                                        </Tooltip>
                                    </div>
                                    <div style={{ fontSize: "14px", color: theme === "dark" ? "white" : "#333", marginBottom: "10px" }}>
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
                                    <div style={{ fontSize: "16px", fontWeight: "bold", color: theme === "dark" ? "white" : "#333" }}>
                                        {item?.headline}
                                    </div>
                                    <div style={{ fontSize: "14px", color: theme === "dark" ? "white" : "#333", marginBottom: "10px" }}>
                                        {item?.Description}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>
                                            {item?.Caption}
                                        </div>
                                        <button
                                            type="button"
                                            style={{
                                                padding: "8px 12px",
                                                borderRadius: "20px",
                                                backgroundColor: "#91C25F",
                                                color: "#000",
                                                border: "none",
                                                cursor: "pointer",
                                                flexShrink: 0,
                                                marginBottom:'5px'
                                            }}
                                            // style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px"}}
                                            onClick={() => console.log('Learn More clicked:', item)}
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
                                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => console.log('Liked:', item)}>
                                            <LikeOutlined style={{ fontSize: "18px", marginRight: "5px" }} />
                                            <span style={{ fontSize: "14px" }}>Like</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => console.log('Comment:', item)}>
                                            <CommentOutlined style={{ fontSize: "18px", marginRight: "5px" }} />
                                            <span style={{ fontSize: "14px" }}>Comment</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => console.log('Share:', item)}>
                                            <ShareAltOutlined style={{ fontSize: "18px", marginRight: "5px" }} />
                                            <span style={{ fontSize: "14px" }}>Share</span>
                                        </div>
                                    </div>

                                    {/* Approve/Reject, Edit/Delete */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: '100%' }}>

                                        {/* Edit/Delete buttons (only if not Approved and email is not restricted) */}
                                        {item.status !== "Approved" && !restrictedEmails.includes(userdetails.email) && (
                                            <Space style={{ display: "flex", justifyContent: "space-evenly" }}>
                                                <Button  className="dark-icon-button"  shape="circle" icon={<EditOutlined />} onClick={() => handleEditClick(item)} />
                                                {/* {item.status !== "Rejected" && (
                                                    <Button shape="circle" icon={<DeleteOutlined />} onClick={() => handleDeleteClick(item)} />
                                                )} */}
                                            </Space>
                                        )}

                                        {/* Approve/Reject buttons (only if the user is not a media buyer and the item is not approved or rejected) */}
                                        {(!isMediaBuyer && item.status !== "Approved" && item.status !== "Rejected") && (
                                            <div style={{ display: 'flex',justifyContent: "space-evenly", width: '100%' }}>
                                                <Button style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px",margin:'18px'}} onClick={() => handleApprove(item)}>Approve</Button>
                                                <Button type='primary' danger style={{ margin:'18px', borderColor: ' #ff6666' }} onClick={() => handleRejectClick(item)}>Reject</Button>
                                            </div>
                                        )}

                                        {/* Status Display for Approved */}
                                        {item.status === "Approved" && (
                                            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", color: "green", fontWeight: "bold" }}>
                                                <CheckCircleOutlined style={{ marginRight: '5px' }} />
                                                <p style={{ margin: 0 }}>{item.status}</p>
                                            </div>
                                        )}

                                        {/* Status Display for Rejected */}
                                        {item.status === "Rejected" && (
                                            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", color: "red", fontWeight: "bold" }}>
                                                <Tooltip title={item.rejectionReason}>
                                                    <MessageOutlined style={{ marginRight: '5px' }} />
                                                </Tooltip>
                                                <p style={{ margin: 0 }}>
                                                    <CloseCircleOutlined style={{ marginLeft: '5px' }} />{item.status}
                                                </p>
                                            </div>
                                        )}

                                    </div>

                                </div>
                            </Card>
                        </Col>
                        // </div>
                ))}
            </Row>
        )}
        <Modal
                title="Reject ad"
                visible={isRejectModalVisible}
                onOk={handleConfirmReject}
                onCancel={handleCancelReject}
                okButtonProps={{ danger: true }}
                confirmLoading={loading}
            >
                <Input.TextArea
                    placeholder="Enter rejection reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                />
            </Modal>
            <Drawer
                title="Edit ad"
                width={"100%"}
                onClose={() => {
                    setIsDrawerVisible(false);   // Close the drawer
                    setSelectedItem(null);       // Reset the selected item to avoid showing old data
                }}
                visible={isDrawerVisible}
                bodyStyle={{ paddingBottom: 80 }}
                style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
            >
                {selectedItem && <Editads doubleAdset={true} editdata={selectedItem} viewCampaignData={viewCampaignData} changeRRefrst={changeRRefrst} onClose={() => {
                    setIsDrawerVisible(false);   // Close the drawer
                    setSelectedItem(null);       // Reset the selected item to avoid showing old data
                }} />} {/* Pass selected item data to the Editads component */}
            </Drawer>
      </Card>
    );
  };

const ExpandedAdsetsContent = ({ record, changeRRefrst, network}) => {
    const [viewCampaignData, setViewCampaignData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [currentItem, setCurrentItem] = useState(null);
    const token = localStorage.getItem("token");
    const { userdetails } = useTokenContext();
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [newadsDrawerVisible, setnewadsDrawerVisible] = useState(false);
    const [imagehash, setimagehash] = useState('')

    console.log(userdetails, "userdetails")
    console.log(record, "record in expanded adsets content");
    console.log("network", network);
    console.log("imagehash", imagehash, "imagehash in expanded adsets content");
    console.log("token", token, "token in expanded adsets content");
    console.log(viewCampaignData, "viewCampaignData in expanded adsets content");
    
    const { theme } = useTokenContext();
    // console.log(record);


    const isMediaBuyer = userdetails.role === 'MEDIA_BUYER' || userdetails.role === "Special_User";
    const restrictedEmails = [
        "creatives@adsgoat.in",
        "mnetadmin@winkleads.com",
        "creativeteam@winkleads.com",
        "shravan.k@winkleads.com",
        "abhynay.k@winkleads.com"
    ];

    const imageHashCaller = async(record)=>{
        try {
          const response = await axios.get(`https://www.testapi.adsgoat.in/api/hashimageidentity/${record.Account_Number}`,
              {
                  headers: {
                      'Authorization': token
                  }
              }
          );
          console.log("account data", ...response?.data);
          setimagehash(...response?.data)
        } catch (error) {
            console.error("Error fetching campaign data:", error);
            // Handle error
        }
      }
    
      useEffect(()=>{
        if(record){
          imageHashCaller(record);
        }
      },[record])



    useEffect(() => {
        const fetchData = async () => {
            try {
                if (record) { //https://www.testapi.adsgoat.in
                    const response = await axios.get(
                        `https://www.testapi.adsgoat.in/api/newviecampaigndata/${record.identifier}`,
                        {
                            headers: {
                                Authorization: token,
                            },
                        }
                    );
                    setViewCampaignData(response.data[0]);
                }
            } catch (error) {
                console.error("Error fetching campaign data:", error);
            }
        };
        fetchData();
    }, [record]);

    if (!viewCampaignData) {
        return <div>Loading...</div>;
    }

    const handleApprove = async (item) => {
        setLoading(true);
        try {
            const response = await axios.post(
                'https://www.testapi.adsgoat.in/api/approveAds',
                {
                    id: item.id,
                    Approved: userdetails.userName, // Assuming userdetails has a name property
                    datetime: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm [IST]')
                },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );
            if (response.status === 200) {
                console.log('Approved');
                changeRRefrst && changeRRefrst();
            }
        } catch (error) {
            console.error("Error approving ad:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleRejectClick = (item) => {
        setCurrentItem(item);
        setIsRejectModalVisible(true);
    };

    const handleConfirmReject = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                'https://www.testapi.adsgoat.in/api/rejectAds',
                {
                    id: currentItem.id,
                    reason: rejectionReason,
                },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );
            if (response.status === 200) {
                console.log('Rejected:', currentItem.id);
                changeRRefrst && changeRRefrst();
            }
        } catch (error) {
            console.error("Error rejecting ad:", error);
        } finally {
            setLoading(false);
            setIsRejectModalVisible(false); // Close the modal
            setRejectionReason(""); // Reset the rejection reason input
        }
    };

    const handleCancelReject = () => {
        setIsRejectModalVisible(false);
        setRejectionReason("");
    };

    const handleEditClick = (item) => {
        setSelectedItem(item); // Set the item to be edited
        setIsDrawerVisible(true); // Open the drawer
    };
    const createnewads = () => {
        setnewadsDrawerVisible(true)
    };
    const onCloseDrawer = () => {
        setnewadsDrawerVisible(false)

    };

    // const handleDeleteClick = (item) => {
    //     console.log('Delete:', item);
    // };

    const isVideo = (filename) => {
        const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
        return videoExtensions.some(ext => filename?.toLowerCase().endsWith(ext));
    };

    const isImage = (filename) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
        return imageExtensions.some(ext => filename?.toLowerCase().endsWith(ext));
    };

    return (
        <>
            <Row gutter={[16, 16]} style={{ display: "flex", flexWrap: "wrap", overflowX: "auto", padding:'10px', backgroundColor:"#E9E9E9" }}>
            {viewCampaignData &&
    Object.entries(viewCampaignData)
      .filter(([key]) => key.startsWith('adsetlevel_'))
      .map(([key, adset], index) => (
        <Col key={key} span={12}>
          <AdsetCard adset={adset} index={index} imagehash={imagehash} restrictedEmails={restrictedEmails} userdetails={userdetails} changeRRefrst={changeRRefrst} viewCampaignData={viewCampaignData} />
        </Col>
      ))}
                {/* {!restrictedEmails.includes(userdetails.email) && (
                    <Col span={8}>
                        <Card
                            bordered={false}
                            style={{
                                maxWidth: '340px',
                                height: '100%', // Set height for the card
                                display: 'flex', // Flexbox to center content
                                justifyContent: 'center', // Center horizontally
                                alignItems: 'center', // Center vertically
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                backgroundColor: theme === "dark" ? "#333" : '#f5f5f5', // Light background color
                            }}
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined   className="black-icon"/>} // Icon for "Create Ads"
                                onClick={createnewads} // Your function to create new ads
                                // style={{
                                //     padding: '8px 16px',
                                //     borderRadius: '8px',
                                // }}
                                style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px",padding: '8px 16px',borderRadius: '8px',}}
                            >
                                Create ads
                            </Button>
                        </Card>
                    </Col>
                )} */}
            </Row>
            {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button type="primary" onClick={createnewads} style={{ marginRight: '10px' }}>
                    Create Ads
                </Button>
            </div> */}
            <Drawer
                title="Create ads"
                placement="right"
                // closable={false}
                onClose={onCloseDrawer}
                open={newadsDrawerVisible}
                width="100%" // Adjust width as needed
                style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
            >
                <Createnewads data={viewCampaignData} visible={newadsDrawerVisible} onClose={onCloseDrawer} rerenders={changeRRefrst} adsData={viewCampaignData?.addlevel} network={network} />
            </Drawer>
            <Drawer
                title="Edit ad"
                width={"100%"}
                onClose={() => {
                    setIsDrawerVisible(false);   // Close the drawer
                    setSelectedItem(null);       // Reset the selected item to avoid showing old data
                }}
                visible={isDrawerVisible}
                bodyStyle={{ paddingBottom: 80 }}
                style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
            >
                {selectedItem && <Editads editdata={selectedItem} viewCampaignData={viewCampaignData} changeRRefrst={changeRRefrst} onClose={() => {
                    setIsDrawerVisible(false);   // Close the drawer
                    setSelectedItem(null);       // Reset the selected item to avoid showing old data
                }} />} {/* Pass selected item data to the Editads component */}
            </Drawer>

            {/* Rejection Modal */}
            <Modal
                title="Reject ad"
                visible={isRejectModalVisible}
                onOk={handleConfirmReject}
                onCancel={handleCancelReject}
                okButtonProps={{ danger: true }}
                confirmLoading={loading}
            >
                <Input.TextArea
                    placeholder="Enter rejection reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                />
            </Modal>
        </>
    );
};

export default ExpandedAdsetsContent;


