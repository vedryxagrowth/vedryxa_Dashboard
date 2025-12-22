// SearchFilters.js
import React, { useEffect, useMemo, useState } from 'react';
import { Col, Space, Input, Button, Dropdown, Menu, Tooltip } from 'antd';
import { SearchOutlined, FilterOutlined, DownOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { FaRobot } from 'react-icons/fa';
import axios from 'axios';

const SearchFilters = ({ campaignStatusLabel, theme, handleChangeInput, handleBlur, onClickRefresh, onStatusFilterChange, accountsFromReports = [],
    network,
    time
}) => {
    // const [aiLoading, setAiLoading] = useState(false);
    // const [aiError, setAiError] = useState(null);
    // const [recDataByAccount, setRecDataByAccount] = useState({});
    // const [recAccounts, setRecAccounts] = useState([]);

    // useEffect(() => {
    //     const accounts = Array.isArray(accountsFromReports)
    //         ? accountsFromReports
    //         : String(accountsFromReports || '').split(',').map(s => s.trim()).filter(Boolean);

    //     if (!accounts.length) {
    //         setRecDataByAccount({});
    //         setRecAccounts([]);
    //         setAiLoading(false);
    //         setAiError(null);
    //         return;
    //     }
    //     //https://prodapis.adsgoat.in
    //     // const url =
    //     //     accounts.length === 1
    //     //         ? `http://localhost:8000/Recommendations/${encodeURIComponent(accounts[0])}`
    //     //         : `http://localhost:8000/Recommendations?accounts=${accounts.join(',')}`;

    //     const token = localStorage.getItem('token');

    //     (async () => {
    //         try {
    //             setAiLoading(true);
    //             setAiError(null);

    //             const headers = {};
    //             if (token) {
    //                 headers['Authorization'] = token;
    //             }
    //             const authHeaders = { headers: { Authorization: localStorage.getItem("token") } };

    //             const res = await axios.post(
    //                 `https://prodapis.adsgoat.in/Recommendations`,
    //                 { "accounts": accounts, ...(accounts.length > 1 ? { "merge": true, "includeAccounts": true } : {}) },
    //                 authHeaders
    //             );

    //             if (res.status === 404) {
    //                 setRecDataByAccount({});
    //                 setRecAccounts([]); // none present
    //                 setAiLoading(false);
    //                 return;
    //             }

    //             // if (!res.ok) throw new Error(`HTTP ${res.status}`);

    //             const data = res.data;
    //             setRecDataByAccount(data);
    //             // setRecAccounts(accounts.filter(acc => data?.[acc]));
    //             const validAccounts = accounts.filter(acc => {
    //                 const accountData = data?.[acc];
    //                 if (!accountData) return false;

    //                 const hasConditions = Array.isArray(accountData.condition) && accountData.condition.length > 0;
    //                 const hasSummary = accountData.summary && Object.keys(accountData.summary).length > 0;

    //                 return hasConditions || hasSummary;
    //             });

    //             setRecAccounts(validAccounts);
    //         } catch (e) {
    //             // setAiError(e.message || 'Failed to load');
    //             setRecDataByAccount({});
    //             setRecAccounts([]);
    //         } finally {
    //             setAiLoading(false);
    //         }
    //     })();
    // }, [accountsFromReports]);


    // const aiItems = useMemo(() => {
    //     if (aiLoading) {
    //         return [
    //             {
    //                 key: 'loading',
    //                 disabled: true,
    //                 label: (
    //                     <span style={{ fontSize: 13, color: theme === 'dark' ? '#bbb' : '#666' }}>
    //                         Loading recommendations…
    //                     </span>
    //                 ),
    //             },
    //         ];
    //     }
    //     if (aiError) {
    //         return [
    //             {
    //                 key: 'error',
    //                 disabled: true,
    //                 label: (
    //                     <span style={{ fontSize: 13, color: '#d4380d' }}>
    //                         Error: {aiError}
    //                     </span>
    //                 ),
    //             },
    //         ];
    //     }
    //     if (recAccounts.length === 0) {
    //         return [
    //             {
    //                 key: 'empty',
    //                 disabled: true,
    //                 label: (
    //                     <span style={{ fontSize: 12, color: theme === 'dark' ? '#bbb' : '#666' }}>
    //                         No recommendations found (last 2 days).
    //                     </span>
    //                 ),
    //             },
    //         ];
    //     }
    //     // const first = recDataByAccount[recAccounts[0]] || {};
    //     // const condition = Array.isArray(first.condition) ? first.condition : [];
    //     // Collect all conditions across valid accounts
    //     const allConditions = new Set();
    //     recAccounts.forEach(acc => {
    //         const accConditions = recDataByAccount[acc]?.condition || [];
    //         accConditions.forEach(c => allConditions.add(c));
    //     });
    //     const condition = Array.from(allConditions);

    //     const totals = {};
    //     condition.forEach(k => (totals[k] = 0));
    //     recAccounts.forEach(acc => {
    //         const s = recDataByAccount[acc]?.summary;
    //         if (!s) return;
    //         condition.forEach(k => {
    //             totals[k] += Number(s?.[k]?.count || 0);
    //         });
    //     });
    //     const LABEL_TEXT_BY_CONDITION = {
    //         highROI: 'campaigns showing ROI > 20%',
    //         lowROI: 'campaigns showing ROI < -20%',
    //         lowCTR: 'campaigns showing CTR < 3%',
    //     };
    //     const buildQuery = (obj) => {
    //         const qs = new URLSearchParams();
    //         Object.entries(obj).forEach(([k, v]) => {
    //             if (v !== undefined && v !== null && String(v).trim() !== '') {
    //                 qs.set(k, String(v));
    //             }
    //         });
    //         return qs.toString();
    //     };

    //     const arr = condition.map((k, idx) => {
    //         const text = LABEL_TEXT_BY_CONDITION[k] || 'campaigns';
    //         return {
    //             key: String(idx + 1),
    //             label: (
    //                 <div>
    //                     <strong>{k} Campaigns</strong>
    //                     <div style={{ fontSize: 12, color: theme === 'dark' ? '#bbb' : '#888' }}>
    //                         {totals[k]} {text}
    //                     </div>
    //                 </div>
    //             ),
    //         };
    //     });
    //     arr.push({
    //         type: 'divider',
    //         style: {
    //             border: theme === 'dark' ? '1px solid #ccc' : '1px solid #f0f0f0',
    //             margin: '6px 0',
    //         },
    //     });
    //     arr.push({
    //         key: 'view-all',
    //         label: (
    //             <Button
    //                 type="link"
    //                 onClick={() => {
    //                     const param = Array.isArray(accountsFromReports)
    //                         ? accountsFromReports.join(',')
    //                         : String(accountsFromReports || '');
    //                     const qs = buildQuery({ network, time });
    //                     const href = qs
    //                         ? `/AiAssistant/${encodeURIComponent(param)}?${qs}`
    //                         : `/AiAssistant/${encodeURIComponent(param)}`;
    //                     window.open(href, '_blank', 'noopener,noreferrer');
    //                     window.open(`/AiAssistant/${encodeURIComponent(param)}`, '_blank', 'noopener,noreferrer');
    //                 }}
    //                 style={{ color: theme === 'dark' ? '#52c41a' : '#389e0d', padding: 0 }}
    //             >
    //                 View All Recommendations
    //             </Button>
    //         ),
    //     });

    //     return arr;
    // }, [aiLoading, aiError, recAccounts, recDataByAccount, theme, accountsFromReports]);

    const networkCollectionsForAiAssistant = {
        FB_Mnet: 'Facebook_Mnet_Daily',
        FB_MnetBing: 'Facebook_MnetBing_Daily',
        FB_Enki: 'Facebook_Enki',
        FB_System1: 'Facebook_System1',
        FB_Rsoc: 'Facebook_Rsoc',
        FB_Tonic: 'Facebook_Tonic',
        FB_DomainActive: 'Facebook_DActive_Names',
        FB_Bodies: 'Facebook_Bodies',
        FB_Bodies1: 'Facebook_Bodies1',
        Newsbreak_DA: 'Newsbreak_DomainActive',
        FB_Tonic1: 'Facebook_Tonic1',
        FB_Sedo: 'Facebook_Sedo',
        FB_Inmobi: 'Facebook_Inmobi',
        FB_TonicRsoc: 'Facebook_TonicRsoc',
        FB_InuvoPrism: 'Facebook_InuvoPrismDaily',
        FB_CodeFuel: 'Facebook_CodeFuel_Daily',
    };

    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiSummary, setAiSummary] = useState(null);
    const [aiRequested, setAiRequested] = useState(false);


    function resolveAiNetwork(network) {
        if (!network) return network;


        return networkCollectionsForAiAssistant[network] || network;
    }
    const resolvedNetwork = resolveAiNetwork(network);
    useEffect(() => {
        if (!aiRequested) return; // 🔑 DO NOTHING until button click


        const accounts = Array.isArray(accountsFromReports)
            ? accountsFromReports
            : String(accountsFromReports || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);


        if (!accounts.length) {
            setAiSummary(null);
            setAiError(null);
            setAiLoading(false);
            return;
        }


        (async () => {
            try {
                setAiLoading(true);
                setAiError(null);


                const res = await axios.post(
                    'https://prodapis.adsgoat.in/AiCampaignRecommendations',
                    {
                        accountNumbers: accounts,
                        network: resolvedNetwork,
                        timezone: time,
                    },
                    {
                        headers: {
                            Authorization: localStorage.getItem('token'),
                        },
                    }
                );


                setAiSummary(res.data?.summary || null);
            } catch (e) {
                setAiError(e.message || 'Failed to load AI recommendations');
                setAiSummary(null);
            } finally {
                setAiLoading(false);
            }
        })();
    }, [aiRequested, accountsFromReports, resolvedNetwork, time]);
    useEffect(() => {
        setAiRequested(false);
        setAiSummary(null);
    }, [accountsFromReports, network, time]);


    function buildConditionsFromSummary(summary) {
        if (!summary) return [];


        const conditions = [];


        if (summary.pause_loss_makers > 0) {
            conditions.push({
                title: 'Pause Loss Makers',
                count: summary.pause_loss_makers,
                desc: 'campaigns losing money consistently',
            });
        }


        if (summary.scale_winners > 0) {
            conditions.push({
                title: 'Scale Winners',
                count: summary.scale_winners,
                desc: 'high ROI campaigns',
            });
        }


        if (summary.reallocate_budget?.low_performers > 0) {
            conditions.push({
                title: 'Reallocate Budget (Low)',
                count: summary.reallocate_budget.low_performers,
                desc: 'low performing campaigns',
            });
        }


        if (summary.reallocate_budget?.high_performers > 0) {
            conditions.push({
                title: 'Reallocate Budget (High)',
                count: summary.reallocate_budget.high_performers,
                desc: 'top performing campaigns',
            });
        }


        if (summary.risk_alert > 0) {
            conditions.push({
                title: 'Risk Alerts',
                count: summary.risk_alert,
                desc: 'early performance decline',
            });
        }


        return conditions;
    }
    const aiItems = useMemo(() => {
        if (aiLoading) {
            return [{
                key: 'loading',
                disabled: true,
                label: (
                    <span style={{ fontSize: 13, color: theme === 'dark' ? '#bbb' : '#666' }}>
                        Loading recommendations…
                    </span>
                ),
            }];
        }


        if (aiError) {
            return [{
                key: 'error',
                disabled: true,
                label: (
                    <span style={{ fontSize: 12, color: '#d4380d' }}>
                        Failed to load recommendations
                    </span>
                ),
            }];
        }


        if (!aiSummary) {
            return [{
                key: 'empty',
                disabled: true,
                label: (
                    <span style={{ fontSize: 12, color: theme === 'dark' ? '#bbb' : '#666' }}>
                        No recommendations found (last 4 days).
                    </span>
                ),
            }];
        }


        const conditions = buildConditionsFromSummary(aiSummary);


        if (!conditions.length) {
            return [{
                key: 'empty',
                disabled: true,
                label: (
                    <span style={{ fontSize: 12, color: theme === 'dark' ? '#bbb' : '#666' }}>
                        No recommendations found (last 4 days).
                    </span>
                ),
            }];
        }


        const items = conditions.map((c, idx) => ({
            key: String(idx + 1),
            label: (
                <div>
                    <strong>{c.title}</strong>
                    <div style={{ fontSize: 12, color: theme === 'dark' ? '#bbb' : '#888' }}>
                        {c.count} {c.desc}
                    </div>
                </div>
            ),
        }));


        items.push({
            type: 'divider',
            style: {
                border: theme === 'dark' ? '1px solid #ccc' : '1px solid #f0f0f0',
                margin: '6px 0',
            },
        });


        items.push({
            key: 'view-all',
            label: (
                <Button
                    type="link"
                    onClick={() => {
                        const param = Array.isArray(accountsFromReports)
                            ? accountsFromReports.join(',')
                            : String(accountsFromReports || '');


                        const qs = new URLSearchParams();
                        if (network) qs.set('network', network);
                        if (time) qs.set('time', time);


                        const href = `/AiAssistant/${param}${qs.toString() ? `?${qs}` : ''}`;


                        window.open(href, '_blank', 'noopener,noreferrer');
                    }}
                    style={{ color: theme === 'dark' ? '#52c41a' : '#389e0d', padding: 0 }}
                >
                    View All Recommendations
                </Button>
            ),
        });


        return items;
    }, [aiLoading, aiError, aiSummary, theme, accountsFromReports, network, time]);

    return (
        <Col>
            <Space size={2} style={{ marginRight: '10px' }}>
                <Input
                    placeholder="Search..."
                    // prefix={<SearchOutlined />}
                    onChange={handleChangeInput}
                    onBlur={handleBlur}
                    allowClear
                    className={theme === 'dark' ? 'inputat400px custom-input-dark' : 'inputat400px custom-input-light'}
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
                {/* <Tooltip 
            title={`🍳 This feature is cooking—almost ready to serve 😜`}
            overlayInnerStyle={{
                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                color: theme === 'dark' ? '#fff' : '#000',
                border: '1px solid #ccc',   
                borderRadius: 6,
                // fontWeight: 500,
            }}
        >          */}
                {/* <Dropdown
                    overlay={
                        <Menu
                            onClick={({ key }) => onStatusFilterChange && onStatusFilterChange(key)} // <-- Add this line
                            items={[
                                {
                                    key: 'all',
                                    label: (
                                        <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                                            <span
                                                style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#122F6E',
                                                    marginRight: '6px',
                                                }}
                                            ></span>
                                            All
                                        </span>
                                    ),
                                },
                                {
                                    key: 'active',
                                    label: <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                                        <span
                                            style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                backgroundColor: 'green',
                                                marginRight: '6px',
                                            }}
                                        ></span>
                                        Active

                                    </span>
                                },
                                {
                                    key: 'pause', label: <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                                        <span
                                            style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                backgroundColor: 'red',
                                                marginRight: '6px',
                                            }}
                                        ></span>
                                        Paused

                                    </span>
                                },
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
                            {campaignStatusLabel}
                            <DownOutlined style={{ fontSize: 10 }} />
                        </Space>
                    </Button>
                </Dropdown> */}
                {/* </Tooltip> */}
                {/* <Tooltip 
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
        </Tooltip> */}
                {/* <Dropdown
                    menu={{
                        items: aiItems,
                        className: theme === 'dark' ? 'custom-dropdown-menu-dark' : 'custom-dropdown-menu-light',
                    }}
                    trigger={['click']}
                >
                    <Button
                        type="default"
                        icon={<FaRobot style={{ fontSize: 20 }} />}
                        disabled={aiLoading}
                        style={{
                            borderRadius: 8,
                            background: theme === 'dark' ? 'rgba(82,196,26,0.06)' : '#f0fdf4',
                            border: '1px solid #4CAF50',
                            color: theme === 'dark' ? '#52c41a' : '#389e0d',
                            fontWeight: 500,
                            marginRight: '5px',
                        }}
                    >
                        AI Assistant
                    </Button>
                </Dropdown> */}
                <Dropdown
                    menu={{
                        items: aiItems,
                        className: theme === 'dark'
                            ? 'custom-dropdown-menu-dark'
                            : 'custom-dropdown-menu-light',
                    }}
                    trigger={['click']}
                    onOpenChange={(open) => {
                        if (open && !aiRequested) {
                            setAiRequested(true); // 🚀 FIRST CLICK triggers API
                        }
                    }}
                >
                    <Button
                        type="default"
                        icon={<FaRobot style={{ fontSize: 20 }} />}
                        loading={aiLoading}   // optional spinner
                        style={{
                            borderRadius: 8,
                            background: theme === 'dark'
                                ? 'rgba(82,196,26,0.06)'
                                : '#f0fdf4',
                            border: '1px solid #4CAF50',
                            color: theme === 'dark' ? '#52c41a' : '#389e0d',
                            fontWeight: 500,
                            marginRight: '5px',
                        }}
                    >
                        AI Assistant
                    </Button>
                </Dropdown>

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
                        height: '30px'
                    }}
                    icon={<ReloadOutlined className="black-icon" />}
                    onClick={onClickRefresh}
                />
            </Space>
        </Col>
    );
};

export default SearchFilters;