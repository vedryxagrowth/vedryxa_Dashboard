"use client"
import React, { useState, useEffect } from 'react';
import { Drawer, Button, Modal, Form, Input, Select, message, } from 'antd';
import { CloseOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Add } from '@mui/icons-material';
import { useTokenContext } from '../../components/parent';

const Edituseraccesses = ({ editeddata, visible, onClose }) => {
    // console.log(editeddata, "heyy edit-useraccess page")
    // console.log(editeddata, "editeddata");
    const userAccess = editeddata?.adAccounts;
    // console.log(userAccess, "adAccounts");
    userAccess !== null && userAccess !== undefined ? Object.keys(userAccess).map(key => ({ network: key, inputs: userAccess[key] })) : [];
    // console.log(userAccessresult, "userAccessResult");
    let userName;
    if (editeddata !== null){
        userName = editeddata.userName;
    }
    // console.log(userName, "userName");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { theme } = useTokenContext();
    

    const [formalldata, setFormData] = useState({
        userName: '',
        email: '',
        role: '',
        adAccounts: [],
    });
    // const userAccessData =  [{network: "Mnet", inputs: ['123456789', '987654321']}, {network: "Enki", inputs: ['123456789', '987654321']}];

    const [additionalAccounts, setAdditionalAccounts] = useState([]);
    const [formAccounts, setFormAccounts] = useState([]);
    const [selectedNetworks, setSelectedNetworks] = useState([]);
    const [editeddatas, setEditeddatas] = useState(null);
    var token = localStorage.getItem("token")
    useEffect(()=>{
        if(userAccess !== null && userAccess !== undefined){
            setAdditionalAccounts(Object.keys(userAccess).map(key => ({ network: key, inputs: userAccess[key] })))
        }
        else{
            setAdditionalAccounts([])
        }
    }, [userAccess]);
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
    //     } catch (error) {
    //         console.error('Error creating user:', error);
    //     }
    // };

    let AddAccounts ;

    useEffect(() => {
        updateSelectedNetworks([...additionalAccounts, ...formAccounts]);
    }, [additionalAccounts, formAccounts]);

    const handleAddAccount = () => {
        // console.log(AddAccounts, "AddAccounts");
        if(AddAccounts.length > 1){
            const newAccount = { network: '', inputs: [''] };
            // setFormAccounts(prevFormAccounts => [...prevFormAccounts, newAccount]);
            setAdditionalAccounts(prevAdditionalAccounts => [...prevAdditionalAccounts, newAccount]);
        }
    };

    const handleRemoveAccount = (index) => {
        Modal.confirm({
            title: 'Confirm',
            content: 'Are you sure you want to delete this Network?',
            onOk: () => {
                try {
                    const updatedAccounts = additionalAccounts.filter((_, accountIndex) => accountIndex !== index);
                    setAdditionalAccounts(updatedAccounts);
                    updateSelectedNetworks([...formAccounts, ...updatedAccounts]);
                } catch (error) {
                    console.error('Error:', error);
                    // Handle error, such as showing an error message
                }
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
        // const updatedAccounts = additionalAccounts.filter((_, accountIndex) => accountIndex !== index);
        // setAdditionalAccounts(updatedAccounts);
        // updateSelectedNetworks([...formAccounts, ...updatedAccounts]);
    };

    const handleRemoveAccount1 = (index) => {
        Modal.confirm({
            title: 'Confirm',
            content: 'Are you sure you want to delete this Network?',
            onOk: () => {
                try {
                    const updatedFormAccounts = formAccounts.filter((_, accountIndex) => accountIndex !== index);
                    setFormAccounts(updatedFormAccounts);
                    updateSelectedNetworks([...updatedFormAccounts, ...additionalAccounts]);
                } catch (error) {
                    console.error('Error:', error);
                    // Handle error, such as showing an error message
                }
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
        // const updatedFormAccounts = formAccounts.filter((_, accountIndex) => accountIndex !== index);
        // setFormAccounts(updatedFormAccounts);
        // updateSelectedNetworks([...updatedFormAccounts, ...additionalAccounts]);
    };

    const handleNetworkChange = (index, value) => {
        const updatedAccounts = [...additionalAccounts];
        updatedAccounts[index].network = value;
        setAdditionalAccounts(updatedAccounts);
        updateSelectedNetworks([...formAccounts, ...updatedAccounts]);
    };

    const handleNetworkChange1 = (index, value) => {
        const updatedAccounts = [...formAccounts];
        updatedAccounts[index].network = value;
        setFormAccounts(updatedAccounts);
        updateSelectedNetworks([...updatedAccounts, ...additionalAccounts]);
    };

    const handleInputChange = (accountIndex, inputIndex, value) => {
        const updatedAccounts = [...additionalAccounts];
        updatedAccounts[accountIndex].inputs[inputIndex] = value;
        setAdditionalAccounts(updatedAccounts);
    };

    const handleInputChange1 = (accountIndex, inputIndex, value) => {
        const updatedAccounts = [...formAccounts];
        updatedAccounts[accountIndex].inputs[inputIndex] = value;
        setFormAccounts(updatedAccounts);
    };

    const handleRemoveInput = (accountIndex, inputIndex) => {
        Modal.confirm({
            title: 'Confirm',
            content: 'Are you sure you want to delete this Account?',
            onOk: () => {
                try {
                    const updatedAccounts = [...additionalAccounts];
                    updatedAccounts[accountIndex].inputs = updatedAccounts[accountIndex].inputs.filter((_, i) => i !== inputIndex);
                    setAdditionalAccounts(updatedAccounts);
                } catch (error) {
                    console.error('Error:', error);
                    // Handle error, such as showing an error message
                }
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
        
    };

    const handleRemoveInput1 = (accountIndex, inputIndex) => {
        const updatedAccounts = [...formAccounts];
        updatedAccounts[accountIndex].inputs = updatedAccounts[accountIndex].inputs.filter((_, i) => i !== inputIndex);
        setFormAccounts(updatedAccounts);
    };

    const handleAddInput = (accountIndex) => {
        const updatedAccounts = [...additionalAccounts];
        updatedAccounts[accountIndex].inputs.push('');
        setAdditionalAccounts(updatedAccounts);
    };

    const handleAddInput1 = (accountIndex) => {
        const updatedAccounts = [...formAccounts];
        updatedAccounts[accountIndex].inputs.push('');
        setFormAccounts(updatedAccounts);
    };

    const updateSelectedNetworks = (allAccounts) => {
        setSelectedNetworks(allAccounts.map(account => account.network).filter(network => network !== ''));
    };

    const getAvailableNetworks = (currentNetwork = '') => {
        const allSelectedNetworks = selectedNetworks.filter(network => network !== currentNetwork);
        
        const data = ["FB_Mnet", "FB_MnetBing", "FB_Enki", "FB_Tonic", "FB_System1", "FB_Bodies", "FB_Bodies1", "FB_Rsoc", "FB_DomainActive"].filter(network => !allSelectedNetworks.includes(network));
        // setNetworks(data);
        AddAccounts = data;
        return data;
    };


    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // const handleAddAccount = () => {
    //     setAdditionalAccounts([...additionalAccounts, '']);
    // };

    // const handleRemoveAccount = (index) => {
    //     const newAccounts = [...additionalAccounts];
    //     newAccounts.splice(index, 1);
    //     setAdditionalAccounts(newAccounts);
    // };
    const submitForm = async (values) => {
        Modal.confirm({
            title: 'Confirmation',
            content: 'Are you sure you want to submit?',
            onOk: async() => {
                try {
                    // const allAccounts = [
                    //     ...(editeddata && editeddata.adAccounts ? editeddata.adAccounts : []),
                    //     ...additionalAccounts
                    // ];
                    const singleObject = additionalAccounts.reduce((acc, obj) => {
                        const key = obj[Object.keys(obj)[0]];
                        const value = Object.keys(obj)[1];
                        // console.log() // Get the key from the current object
                        // console.log(obj, "obj")
                        acc[key] = obj[value]; // Assign the value to the accumulated object using the key
                        return acc;
                    }, {});
        
                    const formattedData = {
                        ...values, adAccounts: singleObject
                    };
                    // console.log(formattedData);
                    // console.log(additionalAccounts, "additionalAccounts data");
                    // console.log(singleObject, ":singleObject");
        
                    const response = await axios.put(`https://prodapis.adsgoat.in/api/updateUserTableData/`, {formattedData},
                        {
                            headers: {
                                'Authorization': token
                            }
                        });
        
                    if (response.status === 200) {
                        message.success("User Edits updated successfully"); // Display success message

                        // Pass the updated user data back to the parent to update the table
                        const updatedUserData = { ...editeddata, ...formattedData };
                        
                        // Call onClose and pass the updated data to the parent
                        onClose(updatedUserData);
                        
                        // setTimeout(() => {
                        //     window.location.reload();
                        // }, 1500);

                        setIsModalVisible(false); 
                    }
                     else {
                        console.error('Failed to update user');
                        // Handle error, show error message
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


    const handleOk = () => {
        setIsModalVisible(false);
        document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    };
    const initialValues = editeddata ? {
        userName: editeddata.userName,
        email: editeddata.email,
        role: editeddata.role,
        adAccounts: editeddata.adAccounts
        // Add other fields with their initial values here
    } : null;

    
    // console.log(initialValues, "initialValues")
    return (
        <Drawer
            title={`Edit the user ${userName}`}
            width="50%"
            open={visible} // Change visible to open
            onClose={onClose}
            closeIcon={<CloseOutlined />}
        >
            <Form
                layout="vertical"
                onFinish={submitForm}
                initialValues={initialValues}
                key={initialValues?.userName} 
            >
                <Form.Item
                    label="UserName"
                    name="userName"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the username!',
                        },
                    ]}
                >
                    <Input  disabled  style={{backgroundColor:'transparent', color: theme === "dark" ? 'white' : "black"}}/>
                </Form.Item>

                <Form.Item
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
                </Form.Item>

                <Form.Item
                    label="Role"
                    name="role"
                    rules={[
                        {
                            required: true,
                            message: 'Please select the role!',
                        },
                    ]}
                >
                    <Select dropdownClassName={theme === 'dark' && "custom-dropdown"}>
                        <Select.Option value="Media_Buyer">Media_Buyer</Select.Option>
                        <Select.Option value="Special_User">Special_User</Select.Option>
                        <Select.Option value="Admin">Admin</Select.Option>
                        <Select.Option value="Manager">Manager</Select.Option>
                    </Select>
                </Form.Item>
                {/* <Form.Item label="Ad Accounts" name="adAccounts">
                    <div>
                        {(editeddata && editeddata.adAccounts ? editeddata.adAccounts : []).map((account, index) => (
                            <div key={index}>
                                <Input
                                    value={account}
                                    readOnly // Ensure the input is read-only to display existing accounts
                                    placeholder="Existing ad account"
                                />
                                <Button type="default" onClick={() => handleRemoveAccount(index)}>
                                    Remove
                                </Button>
                            </div>
                        ))}
                        {additionalAccounts.map((account, index) => (
                            <div key={index}>
                                <Input
                                    value={account}
                                    onChange={(e) => {
                                        const newAccounts = [...additionalAccounts];
                                        newAccounts[index] = e.target.value;
                                        setAdditionalAccounts(newAccounts);
                                    }}
                                    placeholder="Enter ad account"
                                />
                                <Button type="default" onClick={() => handleRemoveAccount(index)}>
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Button type="dashed" onClick={handleAddAccount} icon={<PlusOutlined />}>
                            Add Account
                        </Button>
                    </div>
                </Form.Item> */}
                {additionalAccounts?.map((account, accountIndex) => (
                    <div key={accountIndex}>
                        <div style={{ display: 'flex', marginBottom: '8px', width: '100%' }}>
                            <Select
                                placeholder="Select a network"
                                style={{ width: '145px', height: '30px', marginRight:'8px' }}
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
                                    
                                    {/* Show DeleteOutlined only if there is more than one input */}
                                    {account.inputs.length > 1 && inputIndex !== 0 && (
                                        <DeleteOutlined
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleRemoveInput(accountIndex, inputIndex)}
                                        />
                                    )}

                                    {/* Show Remove button only if there is exactly one input */}
                                    {account.inputs.length === 1 && inputIndex === 0 && (
                                        <Button
                                        style={{ marginTop: '8px', marginBottom: '8px' }}
                                        type="default"
                                        onClick={() => handleRemoveAccount(accountIndex)}
                                        >
                                        Remove
                                        </Button>
                                    )}
                                    
                                    {/* Show PlusOutlined only for the last input */}
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
                ))}

                <Form.Item name="adAccounts">
                    <div>
                        {formAccounts.map((account, accountIndex) => (
                            <div key={accountIndex}>
                                <div style={{ display: 'flex', marginBottom: '8px', width: '100%' }}>
                                    <Select
                                        placeholder="Select a network"
                                        style={{ width: '120px', marginRight: '8px' }}
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
                    <Button type="dashed" onClick={handleAddAccount} icon={<span style={{ color: theme === 'dark' ? 'white' : 'black' }}> {/* Wrap icon in a span */}
                        <PlusOutlined />
                        </span>}>
                        Add Account
                    </Button>
                </Form.Item>
                
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>

            <Modal
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
            </Modal>
        </Drawer>
    );
};

export default Edituseraccesses;








