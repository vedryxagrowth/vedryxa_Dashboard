import React, { useState, useEffect } from 'react';
import { Drawer, Button, Modal, Form, Input, Select, message, } from 'antd';
import { CloseOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useTokenContext } from '../../components/parent';

const EditUrlBuilder = ({ editeddata, visible, onClose }) =>{
    const token = localStorage.getItem("token");
    const { theme } = useTokenContext();
    const { apiClient } = useTokenContext();
    console.log(editeddata?.businessData);
    const [channelList, setChannelList] = useState([]);
    const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
    const [selectedChannelIndex, setSelectedChannelIndex] = useState(null);
    const [objects, setObjects] = useState([]);
    console.log(objects, "objects");
    const [dataList, setDataList] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [campaigns, setCampaigns] = useState([]);

    // State for modal visibility and delete index
    const [modalVisible, setModalVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);

    const generateNextChannelId = () => {
        const maxId = channelList.reduce((max, channel) => Math.max(max, channel.id), 0);
        return maxId + 1;
    };

    // Update input values for a specific channel
    const updateChannelField = (index, key, value) => {
        setChannelList((prevChannels) =>
        prevChannels.map((channel, i) => (i === index ? { ...channel, [key]: value } : channel))
        );
    };

    // Add a new channel
    const addNewChannel = () => {
        const newChannel = {
        id: generateNextChannelId(),
        name: "",
        source: "",
        value: "",
        };
        setChannelList([...channelList, newChannel]);
    };

    // Open the delete confirmation modal
    const openChannelDeleteModal = (index) => {
        setSelectedChannelIndex(index);
        setIsChannelModalOpen(true);
    };

    // Confirm deletion of a channel
    const confirmChannelDeletion = () => {
        setChannelList((prevChannels) => prevChannels.filter((_, i) => i !== selectedChannelIndex));
        setIsChannelModalOpen(false);
        setSelectedChannelIndex(null);
    };

    // Cancel deletion of a channel
    const cancelChannelDeletion = () => {
        setIsChannelModalOpen(false);
        setSelectedChannelIndex(null);
    };

    const getNextCampaignId = () => {
        const highestId = campaigns.reduce((maxId, campaign) => Math.max(maxId, campaign.id), 0);
        return highestId + 1;
    };

    // Function to handle input updates
    const updateField = (index, field, value) => {
        setCampaigns((prevCampaigns) =>
        prevCampaigns.map((campaign, i) =>
            i === index ? { ...campaign, [field]: value } : campaign
        )
        );
    };

    // Function to add a new campaign row
    const addNewCampaign = () => {
        const newCampaign = {
        id: getNextCampaignId(),
        name: "",
        code: "",
        campaignId: "",
        AdsetId: "",
        };
        setCampaigns([...campaigns, newCampaign]);
    };

    // Function to show the delete confirmation modal
    const showDeleteModal = (index) => {
        setActiveIndex(index);
        setModalVisible(true);
    };

    // Function to confirm deletion
    const deleteCampaign = () => {
        setCampaigns((prevCampaigns) => prevCampaigns.filter((_, i) => i !== activeIndex));
        setModalVisible(false);
        setActiveIndex(null);
    };

    // Function to cancel deletion
    const cancelDelete1 = () => {
        setModalVisible(false);
        setActiveIndex(null);
    };

    // Get the next available ID
    const getNextId = () => {
        const highestId = objects.reduce((maxId, obj) => Math.max(maxId, obj.id), 0);
        return highestId + 1;
    };

    // Handle input changes for existing objects
    const handleInputChange = (index, key, value) => {
        setObjects((prevObjects) =>
        prevObjects.map((obj, i) => (i === index ? { ...obj, [key]: value } : obj))
        );
    };

    // Handle adding a new object
    const handleAddObject = () => {
        const newObject = {
        id: getNextId(), // Automatically assign the next ID
        name: "",
        code: "",
        account: "",
        url: "",
        };
        setObjects([...objects, newObject]);
    };

    // Handle showing delete modal
    const handleDeleteClick = (index) => {
        setDeleteIndex(index); // Set the index of the object to delete
        setIsModalVisible(true); // Show the modal
    };

    // Handle confirming delete
    const handleConfirmDelete = () => {
        setObjects((prevObjects) => prevObjects.filter((_, i) => i !== deleteIndex)); // Remove object
        setIsModalVisible(false); // Close modal
        setDeleteIndex(null); // Reset index
    };

    // Handle cancel delete
    const handleCancelDelete = () => {
        setIsModalVisible(false); // Close modal
        setDeleteIndex(null); // Reset index
    };

    const generateNextId = () => {
        const highestId = dataList.reduce((maxId, item) => Math.max(maxId, item.id), 0);
        return highestId + 1;
    };

    // Function to handle input changes
    const updateInputValue = (index, key, value) => {
        setDataList((prevData) =>
        prevData.map((item, i) => (i === index ? { ...item, [key]: value } : item))
        );
    };

    // Function to add a new row
    const addNewRow = () => {
        const newRow = {
        id: generateNextId(),
        name: "",
        code: "",
        account: "",
        url: "",
        };
        setDataList([...dataList, newRow]);
    };

    // Function to open the delete modal
    const openDeleteModal = (index) => {
        setSelectedIndex(index);
        setIsModalOpen(true);
    };

    // Function to confirm delete
    const confirmDelete = () => {
        setDataList((prevData) => prevData.filter((_, i) => i !== selectedIndex));
        setIsModalOpen(false);
        setSelectedIndex(null);
    };

    // Function to cancel delete
    const cancelDelete = () => {
        setIsModalOpen(false);
        setSelectedIndex(null);
    };
    
    useEffect(() => {
        if (visible) {
            setObjects([]);
            setDataList([]);
            setCampaigns([]);
            setChannelList([]);
        }
    }, [visible]);

    useEffect(() => {
        console.log(editeddata?.businessData, "editeddata?.businessData"); // Logs the incoming data
        if (editeddata?.businessData) {
          setObjects(editeddata.businessData); // Update the state
        }
        if(editeddata?.Domains){
            setDataList(editeddata?.Domains);
        }
        if(editeddata?.Source){
            setCampaigns(editeddata?.Source);
        }
        if(editeddata?.channels){
            setChannelList(editeddata?.channels)
        }
    }, [editeddata]);

    const onClose1 = () =>{
        onClose(null);
    }

    const createDynamicObject = (network, channels = [], domains = [], source = [], businessData = []) => {
        // Initialize the dynamic object with the Network key (always present)
        const dynamicObject = { Network: network };
      
        // Add keys conditionally if their corresponding values are not empty arrays
        if (channels.length > 0) {
          dynamicObject.channels = channels;
        }
      
        if (domains.length > 0) {
          dynamicObject.Domains = domains;
        }
      
        if (source.length > 0) {
          dynamicObject.Source = source;
        }
      
        if (businessData.length > 0) {
          dynamicObject.businessData = businessData;
        }
      
        return dynamicObject;
    };


    const submitForm = async (values) => {
        Modal.confirm({
            title: 'Confirmation',
            content: 'Are you sure you want to submit?',
            onOk: async() => {
                try {
                    console.log(objects, "businessData");
                    console.log(dataList, "Domains");
                    console.log(campaigns, "source");
                    console.log(channelList, "channel");
                    const result = createDynamicObject(editeddata?.Network, channelList, dataList, campaigns, objects);
                    console.log(result);

                    const response = await apiClient.post(`/updateNetworkUrlBuilder/`, {updatedData: result});
                    // console.log(response.data);
                    if(response.status === 200){
                        onClose(result);
                    }
                } catch (error) {
                    console.error('Error updating user:', error);
                }
            },
            onCancel: () => {
                console.log('Cancel');
            },
        }); 
    };

    const initialValues = editeddata ? {
        Network: editeddata.Network,
    } : null;

    return(
        <Drawer
            title={`Edit the ${editeddata?.Network} Url Bulder`}
            width="50%"
            open={visible} // Change visible to open
            onClose={onClose1}
            closeIcon={<CloseOutlined />}
        >
            <Form
                layout="vertical"
                onFinish={submitForm}
                initialValues={initialValues}
                key={initialValues?.Network} 
            >
                <Form.Item
                    label="Network"
                    name="Network"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the username!',
                        },
                    ]}
                >
                    <Input  disabled  style={{backgroundColor:'transparent', color: theme === "dark" ? 'white' : "black"}}/>
                </Form.Item>
                
                {editeddata?.Source && (
                     <Form.Item
                    label="Source"
                    name="Network"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the email!',
                        },
                    ]}
                >
                    <div className='editeddata-source-fields'>
                        <div style={{ flex: 1, textAlign: "center" }}>ID</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Name</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Code</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Campaign ID</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Adset ID</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Action</div>
                    </div>

                    {/* Campaign rows */}
                    {campaigns.map((campaign, index) => (
                        <div
                        key={index}
                        className='campaigns-container'
                        >
                            <div style={{ flex: 1, textAlign: "center" }}>
                                <input
                                type="text"
                                value={campaign.id}
                                readOnly
                                className='campaigns-container-input'
                                />
                            </div>
                            <div style={{ flex: 2, textAlign: "center" }}>
                                <input
                                type="text"
                                value={campaign.name}
                                onChange={(e) => updateField(index, "name", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div style={{ flex: 2, textAlign: "center" }}>
                                <input
                                type="text"
                                value={campaign.code}
                                onChange={(e) => updateField(index, "code", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div style={{ flex: 2, textAlign: "center" }}>
                                <input
                                type="text"
                                value={campaign.campaignId}
                                onChange={(e) => updateField(index, "campaignId", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div style={{ flex: 2, textAlign: "center" }}>
                                <input
                                type="text"
                                value={campaign.AdsetId}
                                onChange={(e) => updateField(index, "AdsetId", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div className='delete-button-container'>
                                {/* Delete button for all rows */}
                                <Button
                                type="danger"
                                icon={<DeleteOutlined />}
                                onClick={() => showDeleteModal(index)}
                                />
                                {/* Add button only for the last row */}
                                {index === campaigns.length - 1 && (
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={addNewCampaign}
                                        style={{ marginRight: "5px" }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Delete Confirmation Modal */}
                    <Modal
                        title="Delete Confirmation"
                        visible={modalVisible}
                        onOk={deleteCampaign}
                        onCancel={cancelDelete1}
                        okText="OK"
                        cancelText="Cancel"
                    >
                        <p>Are you sure you want to delete this campaign?</p>
                    </Modal>
                </Form.Item> 
                )}
                {editeddata?.channels && (
                     <Form.Item
                    label="channels"
                    name="Network"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the email!',
                        },
                    ]}
                >
                    <div className='editeddata-source-fields'>
                        <div style={{ flex: 1, textAlign: "center" }}>ID</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Name</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Source</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Value</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Action</div>
                    </div>

                    {/* List of channels */}
                    {channelList.map((channel, index) => (
                        <div
                        key={index}
                        className='campaigns-container'
                        >
                            <div style={{ flex: 1, textAlign: "center" }}>
                                <input
                                type="text"
                                value={channel.id}
                                readOnly
                                className='campaigns-container-input'
                                />
                            </div>
                            <div style={{ flex: 2, textAlign: "center" }}>
                                <input
                                type="text"
                                value={channel.name}
                                onChange={(e) => updateChannelField(index, "name", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div style={{ flex: 2, textAlign: "center" }}>
                                <input
                                type="text"
                                value={channel.source}
                                onChange={(e) => updateChannelField(index, "source", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div style={{ flex: 2, textAlign: "center" }}>
                                <input
                                type="text"
                                value={channel.value}
                                onChange={(e) => updateChannelField(index, "value", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div className='delete-button-container'>
                                {/* Delete button for all rows */}
                                <Button
                                type="danger"
                                icon={<DeleteOutlined />}
                                onClick={() => openChannelDeleteModal(index)}
                                />
                                {/* Add button only for the last row */}
                                {index === channelList.length - 1 && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={addNewChannel}
                                    style={{ marginRight: "5px" }}
                                />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Delete Confirmation Modal */}
                    <Modal
                        title="Delete Confirmation"
                        visible={isChannelModalOpen}
                        onOk={confirmChannelDeletion}
                        onCancel={cancelChannelDeletion}
                        okText="OK"
                        cancelText="Cancel"
                    >
                        <p>Are you sure you want to delete this channel?</p>
                    </Modal>
                </Form.Item> 
                )}
                {editeddata?.Domains && (
                     <Form.Item
                    label="Domains"
                    name="Network"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the email!',
                        },
                    ]}
                >
                    <div className='editeddata-source-fields'>
                        <div style={{ flex: 1, textAlign: "center" }}>ID</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Name</div>
                        <div style={{ flex: 1, textAlign: "center" }}>Code</div>
                        <div style={{ flex: 1, textAlign: "center" }}>Account</div>
                        <div style={{ flex: 3, textAlign: "center" }}>URL</div>
                        <div style={{ flex: 1, textAlign: "center" }}>Action</div>
                    </div>

                    {/* List of objects */}
                    {dataList.map((item, index) => (
                        <div
                        key={index}
                        className='campaigns-container'
                        >
                            <div style={{ flex: 1, textAlign: "center" }}>
                                <input
                                type="text"
                                value={item.id}
                                readOnly
                                campaigns-container-input
                                />
                            </div>
                            <div style={{ flex: 2, textAlign: "center" }}>
                                <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateInputValue(index, "name", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div style={{ flex: 1, textAlign: "center" }}>
                                <input
                                type="text"
                                value={item.code}
                                onChange={(e) => updateInputValue(index, "code", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div style={{ flex: 1, textAlign: "center" }}>
                                <input
                                type="text"
                                value={item.account}
                                onChange={(e) => updateInputValue(index, "account", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div style={{ flex: 3, textAlign: "center" }}>
                                <input
                                type="text"
                                value={item.url}
                                onChange={(e) => updateInputValue(index, "url", e.target.value)}
                                style={{ width: "90%" }}
                                />
                            </div>
                            <div className='delete-button-container'>
                                {/* Delete button for all rows */}
                                <Button
                                type="danger"
                                style={{marginRight:'5px'}}
                                icon={<DeleteOutlined  style={{fontSize:'15px'}}/>}
                                onClick={() => openDeleteModal(index)}
                                />
                                {/* Add button only for the last row */}
                                {index === dataList.length - 1 && (
                                <Button
                                    type="primary"
                                    
                                    icon={<PlusOutlined style={{fontSize:'15px'}}/>}
                                    onClick={addNewRow}
                                    style={{ marginRight: "5px" }}
                                />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Delete Confirmation Modal */}
                    <Modal
                        title="Delete Confirmation"
                        visible={isModalOpen}
                        onOk={confirmDelete}
                        onCancel={cancelDelete}
                        okText="OK"
                        cancelText="Cancel"
                    >
                        <p>Are you sure you want to delete this object?</p>
                    </Modal>
                </Form.Item> 
                )}
                {editeddata?.businessData && (
                     <Form.Item
                    label="BusinessData"
                    name="Network"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the email!',
                        },
                    ]}
                >
                    <div className='editeddata-source-fields' style={{display:'flex'}}>
                        <div style={{ flex: 1, textAlign: "center" }}>ID</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Name</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Code</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Account</div>
                        <div style={{ flex: 3, textAlign: "center" }}>URL</div>
                        <div style={{ flex: 2, textAlign: "center" }}>Action</div>
                    </div>

                    {/* List of objects */}
                    {objects.map((obj, index) => (
                        <div
                        key={index}
                        className='campaigns-container'
                        style={{display:'flex'}}
                        >
                            <div style={{ flex: 1, textAlign: "center" }}>
                                <input
                                type="text"
                                value={obj.id}
                                readOnly
                                className='campaigns-container-input'
                                />
                            </div>
                            <div style={{ flex: 2, textAlign: "center" }}>
                                <input
                                type="text"
                                value={obj.name}
                                onChange={(e) => handleInputChange(index, "name", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div style={{ flex: 2, textAlign: "center" }}>
                                <input
                                type="text"
                                value={obj.code}
                                onChange={(e) => handleInputChange(index, "code", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div style={{ flex: 2, textAlign: "center" }}>
                                <input
                                type="text"
                                value={obj.account}
                                onChange={(e) => handleInputChange(index, "account", e.target.value)}
                                style={{ width: "90%", textAlign: "center" }}
                                />
                            </div>
                            <div style={{ flex: 3, textAlign: "center" }}>
                                <input
                                type="text"
                                value={obj.url}
                                onChange={(e) => handleInputChange(index, "url", e.target.value)}
                                style={{ width: "90%" }}
                                />
                            </div>
                            <div className='delete-button-container'>
                                {/* Add button only for the last object */}
                                {/* Delete button for all objects, including the last */}
                                <Button
                                type="danger"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteClick(index)}
                                >
                                </Button>
                                {index === objects.length - 1 && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddObject}
                                    style={{ marginRight: "5px" }}
                                >
                                </Button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Delete Confirmation Modal */}
                    <Modal
                        title="Delete Confirmation"
                        visible={isModalVisible}
                        onOk={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                        okText="OK"
                        cancelText="Cancel"
                    >
                        <p>Are you sure you want to delete this object?</p>
                    </Modal>
                </Form.Item> 
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Drawer>
    )
};

export default EditUrlBuilder;