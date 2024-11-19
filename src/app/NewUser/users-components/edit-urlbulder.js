import React, { useState, useEffect } from 'react';
import { Drawer, Button, Modal, Form, Input, Select, message, } from 'antd';
import { CloseOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useTokenContext } from '../../components/parent';

const EditUrlBuilder = ({ editeddata, visible, onClose }) =>{
    
    const token = localStorage.getItem("token");
    const { theme } = useTokenContext();
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

    // const [formalldata, setFormData] = useState({
    //     userName: '',
    //     email: '',
    //     role: '',
    //     adAccounts: [],
    // });
    // // const userAccessData =  [{network: "Mnet", inputs: ['123456789', '987654321']}, {network: "Enki", inputs: ['123456789', '987654321']}];

    // const [additionalAccounts, setAdditionalAccounts] = useState([]);
    // const [formAccounts, setFormAccounts] = useState([]);
    // const [selectedNetworks, setSelectedNetworks] = useState([]);
    // const [editeddatas, setEditeddatas] = useState(null);
    // var token = localStorage.getItem("token")
    // useEffect(()=>{
    //     if(userAccess !== null && userAccess !== undefined){
    //         setAdditionalAccounts(Object.keys(userAccess).map(key => ({ network: key, inputs: userAccess[key] })))
    //     }
    //     else{
    //         setAdditionalAccounts([])
    //     }
    // }, [userAccess]);
    // const submitForm = async (values) => {
    //     try {
    //         const allAccounts = [
    //             ...(editeddata && editeddata.adAccounts ? editeddata.adAccounts : []),
    //             ...additionalAccounts
    //         ];

    //         const formattedData = {
    //             ...values,
    //             adAccounts: allAccounts,
    //         };

    //         const response = await axios.put(`https://www.testapi.adsgoat.in/api/users/${editeddata && editeddata.email}`, formattedData);

    //         if (response.status === 200) {
    //             console.log('User created successfully');
    //             message.success("User created successfully"); // Display success message
    //             setIsModalVisible(false); // Close modal after success
    //             onClose(); // Close drawer
    //         } else {
    //             console.error('Failed to create user');
    //             // Handle error, show error message
    //         }
    //         console.log(objects);
    //         console.log(dataList);
    //         console.log(campaigns);
    //         console.log(channelList);
    //     } catch (error) {
    //         console.error('Error creating user:', error);
    //     }
    // };

    // let AddAccounts ;

    // useEffect(() => {
    //     updateSelectedNetworks([...additionalAccounts, ...formAccounts]);
    // }, [additionalAccounts, formAccounts]);

    // const handleAddAccount = () => {
    //     // console.log(AddAccounts, "AddAccounts");
    //     if(AddAccounts.length > 1){
    //         const newAccount = { network: '', inputs: [''] };
    //         // setFormAccounts(prevFormAccounts => [...prevFormAccounts, newAccount]);
    //         setAdditionalAccounts(prevAdditionalAccounts => [...prevAdditionalAccounts, newAccount]);
    //     }
    // };

    // const handleRemoveAccount = (index) => {
    //     Modal.confirm({
    //         title: 'Confirm',
    //         content: 'Are you sure you want to delete this Network?',
    //         onOk: () => {
    //             try {
    //                 const updatedAccounts = additionalAccounts.filter((_, accountIndex) => accountIndex !== index);
    //                 setAdditionalAccounts(updatedAccounts);
    //                 updateSelectedNetworks([...formAccounts, ...updatedAccounts]);
    //             } catch (error) {
    //                 console.error('Error:', error);
    //                 // Handle error, such as showing an error message
    //             }
    //         },
    //         onCancel: () => {
    //             console.log('Cancel');
    //         },
    //     });
    //     // const updatedAccounts = additionalAccounts.filter((_, accountIndex) => accountIndex !== index);
    //     // setAdditionalAccounts(updatedAccounts);
    //     // updateSelectedNetworks([...formAccounts, ...updatedAccounts]);
    // };

    // const handleRemoveAccount1 = (index) => {
    //     Modal.confirm({
    //         title: 'Confirm',
    //         content: 'Are you sure you want to delete this Network?',
    //         onOk: () => {
    //             try {
    //                 const updatedFormAccounts = formAccounts.filter((_, accountIndex) => accountIndex !== index);
    //                 setFormAccounts(updatedFormAccounts);
    //                 updateSelectedNetworks([...updatedFormAccounts, ...additionalAccounts]);
    //             } catch (error) {
    //                 console.error('Error:', error);
    //                 // Handle error, such as showing an error message
    //             }
    //         },
    //         onCancel: () => {
    //             console.log('Cancel');
    //         },
    //     });
    //     // const updatedFormAccounts = formAccounts.filter((_, accountIndex) => accountIndex !== index);
    //     // setFormAccounts(updatedFormAccounts);
    //     // updateSelectedNetworks([...updatedFormAccounts, ...additionalAccounts]);
    // };

    // const handleNetworkChange = (index, value) => {
    //     const updatedAccounts = [...additionalAccounts];
    //     updatedAccounts[index].network = value;
    //     setAdditionalAccounts(updatedAccounts);
    //     updateSelectedNetworks([...formAccounts, ...updatedAccounts]);
    // };

    // const handleNetworkChange1 = (index, value) => {
    //     const updatedAccounts = [...formAccounts];
    //     updatedAccounts[index].network = value;
    //     setFormAccounts(updatedAccounts);
    //     updateSelectedNetworks([...updatedAccounts, ...additionalAccounts]);
    // };

    // const handleInputChange = (accountIndex, inputIndex, value) => {
    //     const updatedAccounts = [...additionalAccounts];
    //     updatedAccounts[accountIndex].inputs[inputIndex] = value;
    //     setAdditionalAccounts(updatedAccounts);
    // };

    // const handleInputChange1 = (accountIndex, inputIndex, value) => {
    //     const updatedAccounts = [...formAccounts];
    //     updatedAccounts[accountIndex].inputs[inputIndex] = value;
    //     setFormAccounts(updatedAccounts);
    // };

    // const handleRemoveInput = (accountIndex, inputIndex) => {
    //     Modal.confirm({
    //         title: 'Confirm',
    //         content: 'Are you sure you want to delete this Account?',
    //         onOk: () => {
    //             try {
    //                 const updatedAccounts = [...additionalAccounts];
    //                 updatedAccounts[accountIndex].inputs = updatedAccounts[accountIndex].inputs.filter((_, i) => i !== inputIndex);
    //                 setAdditionalAccounts(updatedAccounts);
    //             } catch (error) {
    //                 console.error('Error:', error);
    //                 // Handle error, such as showing an error message
    //             }
    //         },
    //         onCancel: () => {
    //             console.log('Cancel');
    //         },
    //     });
        
    // };

    // const handleRemoveInput1 = (accountIndex, inputIndex) => {
    //     const updatedAccounts = [...formAccounts];
    //     updatedAccounts[accountIndex].inputs = updatedAccounts[accountIndex].inputs.filter((_, i) => i !== inputIndex);
    //     setFormAccounts(updatedAccounts);
    // };

    // const handleAddInput = (accountIndex) => {
    //     const updatedAccounts = [...additionalAccounts];
    //     updatedAccounts[accountIndex].inputs.push('');
    //     setAdditionalAccounts(updatedAccounts);
    // };

    // const handleAddInput1 = (accountIndex) => {
    //     const updatedAccounts = [...formAccounts];
    //     updatedAccounts[accountIndex].inputs.push('');
    //     setFormAccounts(updatedAccounts);
    // };

    // const updateSelectedNetworks = (allAccounts) => {
    //     setSelectedNetworks(allAccounts.map(account => account.network).filter(network => network !== ''));
    // };

    // const getAvailableNetworks = (currentNetwork = '') => {
    //     const allSelectedNetworks = selectedNetworks.filter(network => network !== currentNetwork);
        
    //     const data = ["FB_Mnet", "FB_MnetBing", "FB_Enki", "FB_Tonic", "FB_System1", "FB_Bodies", "FB_Bodies1", "FB_Rsoc", "FB_DomainActive"].filter(network => !allSelectedNetworks.includes(network));
    //     // setNetworks(data);
    //     AddAccounts = data;
    //     return data;
    // };


    // const handleCancel = () => {
    //     setIsModalVisible(false);
    // };

    // const handleAddAccount = () => {
    //     setAdditionalAccounts([...additionalAccounts, '']);
    // };

    // const handleRemoveAccount = (index) => {
    //     const newAccounts = [...additionalAccounts];
    //     newAccounts.splice(index, 1);
    //     setAdditionalAccounts(newAccounts);
    // };

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

                    const response = await axios.post(`http://localhost:8000/updateNetworkUrlBuilder/`, {updatedData: result},
                        {
                            headers: { 
                                'Authorization': token
                            }
                        });
                    // console.log(response.data);
                    if(response.status === 200){
                        onClose(result);
                    }
                    
                    // // const allAccounts = [
                    // //     ...(editeddata && editeddata.adAccounts ? editeddata.adAccounts : []),
                    // //     ...additionalAccounts
                    // // ];
                    // const singleObject = additionalAccounts.reduce((acc, obj) => {
                    //     const key = obj[Object.keys(obj)[0]];
                    //     const value = Object.keys(obj)[1];
                    //     // console.log() // Get the key from the current object
                    //     // console.log(obj, "obj")
                    //     acc[key] = obj[value]; // Assign the value to the accumulated object using the key
                    //     return acc;
                    // }, {});
        
                    // const formattedData = {
                    //     ...values, adAccounts: singleObject
                    // };
                    // // console.log(formattedData);
                    // // console.log(additionalAccounts, "additionalAccounts data");
                    // // console.log(singleObject, ":singleObject");
        
                    // const response = await axios.put(`https://prodapis.adsgoat.in/api/updateUserTableData/`, {formattedData},
                    //     {
                    //         headers: {
                    //             'Authorization': token
                    //         }
                    //     });
        
                    // if (response.status === 200) {
                    //     message.success("User Edits updated successfully"); // Display success message

                    //     // Pass the updated user data back to the parent to update the table
                    //     const updatedUserData = { ...editeddata, ...formattedData };
                        
                    //     // Call onClose and pass the updated data to the parent
                    //     onClose(updatedUserData);
                        
                    //     // setTimeout(() => {
                    //     //     window.location.reload();
                    //     // }, 1500);

                    //     setIsModalVisible(false); 
                    // }
                    //  else {
                    //     console.error('Failed to update user');
                    //     // Handle error, show error message
                    // }
                } catch (error) {
                    console.error('Error updating user:', error);
                }
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
        
    };


    // const handleRemoveAccount = (index, type) => {
    //     if (type === 'existing') {
    //         // Logic to remove existing account from editeddata
    //         const newEditedData = { ...editeddata };
    //         newEditedData.adAccounts.splice(index, 1);
    //         setEditeddatas(newEditedData);
    //     } else {
    //         // Logic to remove additional account
    //         const newAccounts = [...additionalAccounts];
    //         newAccounts.splice(index, 1);
    //         setAdditionalAccounts(newAccounts);
    //     }
    // };


    // const handleOk = () => {
    //     setIsModalVisible(false);
    //     document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    // };
    const initialValues = editeddata ? {
        Network: editeddata.Network,
        Domains: editeddata.Domains,
        Source: editeddata.Source,
        channels: editeddata.channels,

        // Add other fields with their initial values here
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
                {/* {editeddata?.Domains && (
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
                    <Input  disabled  style={{backgroundColor:'transparent', color: theme === "dark" ? 'white' : "black"}}/>
                </Form.Item> 
                )} */}
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
                    <div
                        style={{
                        display: "flex",
                        fontWeight: "bold",
                        borderBottom: "2px solid #ddd",
                        padding: "10px 0",
                        }}
                    >
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
                        style={{
                            display: "flex",
                            padding: "10px 0",
                            borderBottom: "1px solid #eee",
                            alignItems: "center",
                        }}
                        >
                        <div style={{ flex: 1, textAlign: "center" }}>
                            <input
                            type="text"
                            value={campaign.id}
                            readOnly
                            style={{ width: "90%", textAlign: "center", backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
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
                        <div style={{ flex: 2, textAlign: "center", display: "flex", justifyContent: "space-evenly" }}>
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
                    <div
                        style={{
                        display: "flex",
                        fontWeight: "bold",
                        borderBottom: "2px solid #ddd",
                        padding: "10px 0",
                        }}
                    >
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
                        style={{
                            display: "flex",
                            padding: "10px 0",
                            borderBottom: "1px solid #eee",
                            alignItems: "center",
                        }}
                        >
                        <div style={{ flex: 1, textAlign: "center" }}>
                            <input
                            type="text"
                            value={channel.id}
                            readOnly
                            style={{ width: "90%", textAlign: "center", backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
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
                        <div style={{ flex: 2, textAlign: "center", display: "flex", justifyContent: "space-evenly" }}>
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
                    <div
                        style={{
                        display: "flex",
                        fontWeight: "bold",
                        borderBottom: "2px solid #ddd",
                        padding: "10px 0",
                        }}
                    >
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
                        style={{
                            display: "flex",
                            padding: "10px 0",
                            borderBottom: "1px solid #eee",
                            alignItems: "center",
                        }}
                        >
                        <div style={{ flex: 1, textAlign: "center" }}>
                            <input
                            type="text"
                            value={item.id}
                            readOnly
                            style={{ width: "90%", textAlign: "center", backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
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
                        <div style={{ flex: 1, textAlign: "center", display: "flex" }}>
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
                    <div
                        style={{
                        display: "flex",
                        fontWeight: "bold",
                        borderBottom: "2px solid #ddd",
                        padding: "10px 0",
                        }}
                    >
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
                        style={{
                            display: "flex",
                            padding: "10px 0",
                            borderBottom: "1px solid #eee",
                            alignItems: "center",
                        }}
                        >
                        <div style={{ flex: 1, textAlign: "center" }}>
                            <input
                            type="text"
                            value={obj.id}
                            readOnly
                            style={{ width: "90%", textAlign: "center", backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
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
                        <div style={{ flex: 2, textAlign: "center", display: "flex", justifyContent: "space-evenly" }}>
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

                {/* <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the email!',
                        },
                    ]}
                >
                    <Input  disabled  style={{backgroundColor:'transparent', color: theme === "dark" ? 'white' : "black"}}/>
                </Form.Item> */}

                {/* <Form.Item
                    label="Role"
                    name="role"
                    rules={[
                        {
                            required: true,
                            message: 'Please select the role!',
                        },
                    ]}
                >
                    <Select
                    style={{
                        width: '100%',
                        backgroundColor: theme === 'dark' && '#333', // Background color
                        color: theme === 'dark' && '#fff',
                    }}      
                    dropdownClassName={theme === 'dark' && "custom-dropdown"}>
                        <Select.Option value="Media_Buyer">Media_Buyer</Select.Option>
                        <Select.Option value="Special_User">Special_User</Select.Option>
                        <Select.Option value="Admin">Admin</Select.Option>
                        <Select.Option value="Manager">Manager</Select.Option>
                    </Select>
                </Form.Item> */}
                
                {/* {additionalAccounts?.map((account, accountIndex) => (
                    <div key={accountIndex}>
                        <div style={{ display: 'flex', marginBottom: '8px', width: '100%' }}>
                            <Select
                                placeholder="Select a network"
                                style={{ width: '145px', height: '30px', marginRight:'8px',
                                    backgroundColor: theme === 'dark' && '#333',
                                    color: theme === 'dark' && '#fff',
                                }}
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                value={account.network}
                                onChange={(value) => handleNetworkChange(accountIndex, value)}
                            >
                                {getAvailableNetworks(account.network).map((network) => (
                                    <Select.Option key={network} value={network}>
                                        {network}
                                    </Select.Option>
                                ))}
                            </Select>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                    marginTop: '0px',
                                    paddingTop: '0px',
                                }}
                            >
                                {account.inputs.map((input, inputIndex) => (
                                    <div
                                    key={inputIndex}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '8px',
                                        width: '100%',
                                        height: '30px',
                                        justifyContent: 'center',
                                    }}
                                    >
                                    <Input
                                        value={input}
                                        onChange={(e) =>
                                        handleInputChange(accountIndex, inputIndex, e.target.value)
                                        }
                                        placeholder="Enter ad input"
                                        style={{ width: '100%', marginRight: '8px', color: theme === "dark" ? 'white' : "black" }}
                                    />
                                    
                                    {account.inputs.length > 1 && inputIndex !== 0 && (
                                        <DeleteOutlined
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleRemoveInput(accountIndex, inputIndex)}
                                        />
                                    )}
                                    {account.inputs.length === 1 && inputIndex === 0 && (
                                        <Button
                                        style={{ marginTop: '8px', marginBottom: '8px' }}
                                        type="default"
                                        onClick={() => handleRemoveAccount(accountIndex)}
                                        >
                                        Remove
                                        </Button>
                                    )}
                                    
                                    {inputIndex === account.inputs.length - 1 && (
                                        <PlusOutlined
                                        style={{ cursor: 'pointer', marginLeft: '8px' }}
                                        onClick={() => handleAddInput(accountIndex)}
                                        />
                                    )}
                                    </div>
                                ))}
                            </div>


                        </div>
                        
                    </div>
                ))} */}

                {/* <Form.Item name="adAccounts">
                    <div>
                        {formAccounts.map((account, accountIndex) => (
                            <div key={accountIndex}>
                                <div style={{ display: 'flex', marginBottom: '8px', width: '100%' }}>
                                    <Select
                                        placeholder="Select a network"
                                        style={{ width: '120px', marginRight: '8px',
                                            backgroundColor: theme === 'dark' && '#333',
                                            color: theme === 'dark' && '#fff',
                                         }}
                                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                        value={account.network}
                                        onChange={(value) => handleNetworkChange1(accountIndex, value)}
                                    >
                                        {getAvailableNetworks(account.network).map((network) => (
                                            <Select.Option key={network} value={network}>
                                                {network}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                        {account.inputs.map((input, inputIndex) => (
                                            <div key={inputIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', width: '100%' }}>
                                                <Input
                                                    value={input}
                                                    onChange={(e) => handleInputChange1(accountIndex, inputIndex, e.target.value)}
                                                    placeholder="Enter ad input"
                                                    style={{ width: '100%', marginRight: '8px', color: theme === "dark" ? 'white' : "black" }}
                                                />
                                                {inputIndex !== 0 && (
                                                    <DeleteOutlined
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleRemoveInput(accountIndex, inputIndex)}
                                                    />
                                                )}
                                                <PlusOutlined
                                                    style={{ cursor: 'pointer', marginLeft: '8px' }}
                                                    onClick={() => handleAddInput1(accountIndex)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    style={{ marginTop: '8px', marginBottom: '8px' }}
                                    type="default"
                                    onClick={() => handleRemoveAccount1(accountIndex)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button type="dashed" onClick={handleAddAccount} icon={<span style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                        <PlusOutlined />
                        </span>}>
                        Add Account
                    </Button>
                </Form.Item> */}
                
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>

            {/* <Modal
                title="Confirmation"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button key="ok" type="primary" onClick={handleOk}>
                        OK
                    </Button>,
                ]}
            >
                <p>Are you sure you want to submit?</p>
            </Modal> */}
        </Drawer>
    )
};

export default EditUrlBuilder;