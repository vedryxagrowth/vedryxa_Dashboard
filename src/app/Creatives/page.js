"use client"
import { useState, useEffect } from "react";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Modal, Input, Select, Menu, Card, Typography } from "antd";

export default function Creative() {
    const { Meta } = Card;
    const { Text } = Typography;
    const { Option } = Select;

    const [state, setState] = useState({
        activeTab: 'Approved',
        carddata: [],
        searchQuery: '',
        modalVisible: false,
        imageSrc: ""
    });

    const handleImageClick = (src) => {
        setState(prevState => ({ ...prevState, imageSrc: src, modalVisible: true }));
    };

    const handleModalClose = () => {
        setState(prevState => ({ ...prevState, modalVisible: false }));
    };

    useEffect(() => {
        async function fetchCards() {
            try {
                const response = await fetch('https://api.imgflip.com/get_memes');
                if (!response.ok) {
                    throw new Error('Failed to fetch memes');
                }
                const totalcards = await response.json();
                const finaldata = totalcards.data.memes.map(source => ({
                    camp_name: source.name,
                    pic: source.url,
                    date: "2023-02-02",
                    holder: "@Siddu"
                }));
                setState(prevState => ({ ...prevState, carddata: finaldata }));
            } catch (error) {
                console.error('Error fetching memes:', error);
            }
        }

        fetchCards();
    }, []);

    const handleSearchChange = (event) => {
        const { value } = event.target;
        setState(prevState => ({ ...prevState, searchQuery: value }));
    };

    const filteredCarddata = state.carddata.filter(item =>
        item.camp_name.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    return (
        <div style={{ borderRadius: '6px', border: '1px solid #E6E6E6', background: '#FFF', position: 'sticky', top: '0' }}>
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ margin: '0px', color: '#404040', fontFamily: 'Inter', fontSize: '17px', fontWeight: 700 }}>Creatives <span style={{ color: '#B2A4A4' }}>All Creatives</span></Text>
                <Button onClick={() => setState(prevState => ({ ...prevState, modalVisible: true }))} style={{ backgroundColor: '#78BC61', color: 'white', marginLeft: '10px' }}>Upload Creatives</Button>
            </div>
            <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', height: '40px', gap: '30px' }}>
                    <Button style={{ backgroundColor: '#ffffff', border: '1px solid #C2C2C2', width: '90px' }}><FilterOutlined /> Filter</Button>
                    <Input placeholder="Enter your search query" suffix={<SearchOutlined />} onChange={handleSearchChange} style={{ width: '30%', height: '40px' }} />
                    <Select defaultValue="All" variant="filled" style={{ width: '10%' }} options={[{ value: 'jack', label: 'Jack' }, { value: 'All', label: 'All' }, { value: 'Yiminghe', label: 'yiminghe' }, { value: 'disabled', label: 'Disabled', disabled: true }]} />
                    <Select defaultValue="All" variant="filled" style={{ width: '10%' }} options={[{ value: 'jack', label: 'Jack' }, { value: 'All', label: 'All' }, { value: 'Yiminghe', label: 'yiminghe' }, { value: 'disabled', label: 'Disabled', disabled: true }]} />
                </div>
            </div>
            <div style={{ borderBottom: '1px solid #F5F5F5' }}>
                <Menu mode="horizontal" style={{ padding: '0px 16px' }}>
                    <Menu.Item key="Approved" className={state.activeTab === 'Approved' ? 'active' : ''} onClick={() => setState(prevState => ({ ...prevState, activeTab: 'Approved' }))}>
                        Approved
                    </Menu.Item>
                    <Menu.Item key="FF" className={state.activeTab === 'FF' ? 'active' : ''} onClick={() => setState(prevState => ({ ...prevState, activeTab: 'FF' }))}>
                        Un Approved
                    </Menu.Item>
                </Menu>
            </div>
            <div className="example" style={{ background: '#ededed', borderRadius: '6px', maxHeight: 'calc(91vh - 200px)', overflow: 'auto', position: "relative" }}>
                {state.activeTab === 'Approved' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: "15px", justifyContent: 'center' }}>
                        {filteredCarddata.map((item, index) => (
                            <Card
                                key={index}
                                hoverable
                                cover={<img alt={`Image ${index}`} src={item.pic} style={{ height: '240px', objectFit: 'cover' }} onClick={() => handleImageClick(item.pic)} />}
                                style={{ width: '240px', flex: '1 1 auto' }}
                                bodyStyle={{ padding: 0 }}
                            >
                                <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>{item.camp_name}</Text>
                                </div>
                                <Meta description={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: "6%" }}>
                                        <span>{item.holder}</span>
                                        <span style={{ marginLeft: '8px' }}>{item.date}</span>
                                    </div>
                                } />
                            </Card>
                        ))}
                    </div>
                )}
                {state.activeTab === 'FF' && (
                    <div>
                        <h2>Un Approved</h2>
                    </div>
                )}
            </div>
            <Modal
                visible={state.modalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={null}
                bodyStyle={{ padding: 0 }}
                centered
                style={{ top: 0 }}
            >
                <img alt="Enlarged Image" src={state.imageSrc} style={{ width: '100%', height: '100vh', objectFit: 'contain' }} />
            </Modal>
        </div>
    );
}
