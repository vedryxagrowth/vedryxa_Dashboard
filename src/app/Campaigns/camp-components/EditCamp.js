
"use client";
import React, { useState, useEffect } from "react";
import { Drawer, Button, Collapse, Form, Input, Select, message, Spin, Skeleton } from "antd";
import axios from "axios";

const { Panel } = Collapse;

const EditCampaignDrawer1 = ({ rowData, visible, onClose, changeRRefrst}) => {
    if (!rowData) {
        return null;
    }

    const [EditCampaignData, setEditCampaignData] = useState({});
    const [form] = Form.useForm();
    const [changedData, setChangedData] = useState({});

    const token = localStorage.getItem("token");

    // Fetch campaign data
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (rowData) {
                    const response = await axios.get(
                        `https://www.testapi.adsgoat.in/api/viecampaigndata/${rowData.identifier}`,
                        { headers: { Authorization: token } }
                    );
                    setEditCampaignData(response.data[0]);
                    console.log(response.data[0],"setEditCampaignData")
                }
            } catch (error) {
                console.error("Error fetching campaign data:", error);
            }
        };
        fetchData();
    }, [rowData]);

    const handleFormChange = (changedValues) => {
        // Track changes in the form
        setChangedData((prev) => ({
            ...prev,
            ...changedValues,
        }));
    };

    const onFinish = async () => {
        console.log("Changed Data:", changedData); // Log the changed data after submission
        try {
            // Prepare the campaign data
            const updatedCampaignData = {
                accountnumber:EditCampaignData.Account_Number, // Replace with the appropriate account number
                identifier: EditCampaignData.identifier, // Assuming `rowData.identifier` is available
                updates: {
                    ...changedData, // Include all properties from changedData
                    campaign_name: changedData.Name, // Add campaign_name dynamically
                    Daily_amount: Number(changedData.Daily_amount) * 100, // Multiply Daily_amount by 100
                },
                    };
        
            // Make the API request
            const response = await fetch(
                `https://www.testapi.adsgoat.in/api/UpdateCampaign`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token, // Assuming `token` is available in scope
                    },
                    body: JSON.stringify(updatedCampaignData),
                }
            );
        
            // Handle the response
            if (response.ok) {
                message.success("Campaign updated successfully!");
                changeRRefrst()
                onClose(); // Close the modal or perform another action
            } else {
                const errorData = await response.json();
                message.error(`Failed to update campaign: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error("Error updating campaign:", error);
            message.error("Error updating campaign.");
        }
        
    };

    const initialValues = {
        Account_Number: EditCampaignData.Account_Number,
        Name: EditCampaignData?.camapaignlevel?.Name,
        Objectives: EditCampaignData?.camapaignlevel?.Objectives,
        Special_categories: EditCampaignData?.camapaignlevel?.Special_categories,
        Bid_strategy: EditCampaignData?.camapaignlevel?.Bid_strategy,
        Daily_amount: EditCampaignData?.camapaignlevel?.Daily_amount / 100,
        Status: EditCampaignData?.camapaignlevel?.Status,
    };

    return (
        <Drawer
            title={EditCampaignData?.camapaignlevel?.Name}
            width="100%"
            open={visible}
            onClose={onClose}
        >
            {EditCampaignData.identifier === rowData.identifier ? (
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onFinish}
                    onValuesChange={handleFormChange}
                    initialValues={initialValues}
                >
                    <Collapse accordion defaultActiveKey={["1"]}>
                        <Panel header="CAMPAIGN LEVEL" key="1">
                            <div style={{ display: "flex", flexWrap: "wrap" }}>
                                <Form.Item
                                    name="Account_Number"
                                    label="Account number"
                                    style={{ flex: 1, marginRight: "8px" }}
                                >
                                    <Input disabled />
                                </Form.Item>
                                <Form.Item
                                    name="Name"
                                    label="Campaign Name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter a campaign name!",
                                        },
                                    ]}
                                    style={{ flex: 1, marginRight: "8px" }}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="Objectives"
                                    label="Objectives"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an objective!",
                                        },
                                    ]}
                                    style={{ flex: 1, marginRight: "8px" }}
                                >
                                    <Select
                                        options={[
                                            { value: "OUTCOME_LEADS", label: "Leads" },
                                            { value: "OUTCOME_SALES", label: "Sales" },
                                            { value: "OUTCOME_ENGAGEMENT", label: "Engagement" },
                                            { value: "OUTCOME_AWARENESS", label: "Awareness" },
                                            { value: "OUTCOME_TRAFFIC", label: "Traffic" },
                                            { value: "OUTCOME_APP_PROMOTION", label: "App Promotion" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Special_categories"
                                    label="Categories"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select a category!",
                                        },
                                    ]}
                                    style={{ flex: 1, marginRight: "8px" }}
                                >
                                    <Select
                                        mode="multiple"
                                        options={[
                                            { value: "HOUSING", label: "Housing" },
                                            { value: "CREDIT", label: "Credit" },
                                            { value: "EMPLOYMENT", label: "Employment" },
                                            { value: "ISSUES_ELECTIONS_POLITICS", label: "Politics" },
                                            { value: "NONE", label: "None" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Bid_strategy"
                                    label="Bid Strategy"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select a bid strategy!",
                                        },
                                    ]}
                                    style={{ flex: 1, marginRight: "8px" }}
                                >
                                    <Select
                                        options={[
                                            { value: "LOWEST_COST_WITHOUT_CAP", label: "Highest Volume" },
                                            { value: "LOWEST_COST_WITH_BID_CAP", label: "Bid Cap" },
                                            { value: "COST_CAP", label: "Cost Cap" },
                                            { value: "LOWEST_COST_WITH_MIN_ROAS", label: "ROAS Goal" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Daily_amount"
                                    label="Daily Budget"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter a daily budget!",
                                        },
                                    ]}
                                    style={{ flex: 1, marginRight: "8px" }}
                                >
                                    <Input type="number" placeholder="$" />
                                </Form.Item>
                                <Form.Item
                                    name="Status"
                                    label="Status"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select a status!",
                                        },
                                    ]}
                                    style={{ flex: 1 }}
                                >
                                    <Select
                                        options={[
                                            { value: "ACTIVE", label: "ACTIVE" },
                                            { value: "PAUSED", label: "PAUSE" },
                                        ]}
                                    />
                                </Form.Item>
                            </div>
                        </Panel>
                    </Collapse>
                    <Form.Item style={{ textAlign: "right",marginTop:"1%" }}>
    <Button type="primary" htmlType="submit">
        Submit
    </Button>
</Form.Item>

                </Form>
            ) : (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    {/* <Spin size="large" /> */}
                    <div style={{ padding: '24px' }}>
                        <Skeleton active paragraph={{ rows: 10 }} />
                    </div>
                </div>
            )}
        </Drawer>
    );
};

export default EditCampaignDrawer1;



