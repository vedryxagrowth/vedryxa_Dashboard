// SearchFilters.js
import React from 'react';
import { Col, Space, Input, Button, Dropdown, Menu, Tooltip } from 'antd';
import { SearchOutlined, FilterOutlined, DownOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { FaRobot } from 'react-icons/fa';

const SearchFilters = ({ theme, handleChangeInput, handleBlur, onClickRefresh }) => {
  return (
    <Col>
    <Space size={2} style={{marginRight: '10px'}}> 
        <Input
            placeholder="Search..."
            // prefix={<SearchOutlined />}
            onChange={handleChangeInput}
            onBlur={handleBlur}
            allowClear
            className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
            style={{
                borderRadius: 8,
                border: '1px solid #91C25F',
                // background: theme === 'dark' ? '#2a2a2a' : '#fff',
                // border: `1px solid ${theme === 'dark' ? '#444' : '#d9d9d9'}`,
                color: theme === 'dark' ? '#fff' : '#000',
                fontWeight: 500,
                width: 170,
                marginRight: '5px'
            }}
        />  
        <Tooltip 
            title={`🍳 This feature is cooking—almost ready to serve 😜`}
            overlayInnerStyle={{
                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                color: theme === 'dark' ? '#fff' : '#000',
                border: '1px solid #ccc',   
                borderRadius: 6,
                // fontWeight: 500,
            }}
        >         
            <Dropdown
                overlay={
                    <Menu
                    items={[
                        { key: 'active', 
                        label: <span style={{fontSize:'13px', display:'flex', alignItems:'center'}}>    
                        Active
                        <span
                                style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'green',
                                marginLeft: '15px',
                                }}
                            ></span>
                        </span> 
                        },
                        { key: 'pause', label: <span style={{fontSize:'13px', display:'flex', alignItems:'center'}}>Paused
                        <span
                                style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'red',
                                marginLeft: '8px',
                                }}
                            ></span>
                        </span> },
                    ]}
                    />
                }
                trigger={['click']}
            >
                <Button
                    type="default"
                    style={{
                    borderRadius: 8,
                    background: theme === 'dark' ? 'rgba(82,196,26,0.12)' : '#f6ffed',
                    border: '1px solid #4CAF50',
                    color: theme === 'dark' ? '#95de64' : '#389e0d',
                    fontWeight: 500,
                    marginRight: '5px'
                    }}
                >
                    <Space size={2}>
                    <FilterOutlined />
                    Filters
                    <DownOutlined style={{ fontSize: 10 }} />
                    </Space>
                </Button>
            </Dropdown>
        </Tooltip>
        <Tooltip 
            title={`🍳 This feature is cooking—almost ready to serve 😜`}
            overlayInnerStyle={{
                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                color: theme === 'dark' ? '#fff' : '#000',
                border: '1px solid #ccc',   
                borderRadius: 6,
                // fontWeight: 500,
            }}
        >
            <Button
                type="default"
                icon={<FaRobot style={{ fontSize: 20 }} />}
                disabled
                style={{
                borderRadius: 8,
                background: theme === 'dark' ? 'rgba(82,196,26,0.06)' : '#f0fdf4',
                border: '1px solid #4CAF50',
                color: theme === 'dark' ? '#52c41a' : '#389e0d',
                fontWeight: 500,
                cursor: 'not-allowed',
                marginRight: '5px'
                }}
            >
                AI Assistant
            </Button>
        </Tooltip>
        <Tooltip 
            title={`🍳 This feature is cooking—almost ready to serve 😜`}
            overlayInnerStyle={{
                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                color: theme === 'dark' ? '#fff' : '#000',
                border: '1px solid #ccc',   
                borderRadius: 6,
                // fontWeight: 500,
            }}
        >
            <Button
                type="default"
                icon={<SettingOutlined />}
                disabled
                style={{
                borderRadius: 8,
                background: theme === 'dark' ? 'rgba(24,144,255,0.06)' : '#e6f7ff',
                border: '1px solid #91d5ff',
                color: theme === 'dark' ? '#69c0ff' : '#1d39c4',
                fontWeight: 500,
                cursor: 'not-allowed',
                marginRight: '5px'
                }}
            >
                Rules
            </Button>
        </Tooltip>
            <Button
                    type="primary"
                    style={{
                    backgroundColor: '#91C25F',
                    border: 'solid 0px',
                    color: 'black',
                    height:'30px'
                }}
                icon={<ReloadOutlined  className="black-icon" />}
                onClick={onClickRefresh}
            />               
    </Space>
</Col>
  );
};

export default SearchFilters;
