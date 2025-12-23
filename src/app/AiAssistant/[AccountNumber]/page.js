// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { useTokenContext } from '../../components/parent';
// import { useSearchParams } from 'next/navigation';
// import axios from 'axios';

// export default function RecommendationsPage({ params }) {


//     const { theme } = useTokenContext();
//     const searchParams = useSearchParams();
//     const network = searchParams.get('network') || '';
//     const time = searchParams.get('time') || '';
//     const accountsCsv = decodeURIComponent(String(params?.AccountNumber ?? ''));
//     const initialAccounts = accountsCsv
//         .split(',')
//         .map(s => s.trim())
//         .filter(Boolean);
//     const bucketOrder = ['highROI', 'lowROI', 'lowCTR'];
//     const newtworkCollections = {
//         "FB_Mnet": "Facebook_Mnet",
//         "FB_MnetBing": "Facebook_MnetBing",
//         "FB_Enki": "Facebook_Enki",
//         "FB_System1": 'Facebook_System1',
//         "FB_Rsoc": 'Facebook_Rsoc',
//         "FB_Tonic": 'Facebook_Tonic',
//         "FB_DomainActive": "Facebook_DActive_Names",
//         "FB_Bodies": "Facebook_Bodies",
//         "FB_Bodies1": "Facebook_Bodies1",
//         "Newsbreak_DA": "Newsbreak_DomainActive",
//         "FB_Tonic1": "Facebook_Tonic1",
//         "FB_Sedo": "Facebook_Sedo",
//         "FB_Inmobi": "Facebook_Inmobi",
//     }
//     const isDark = theme === 'dark';
//     const bgColor = isDark ? '#1e1e1e' : '#f3f4f6';
//     const tabBgActive = isDark ? '#555' : '#fff';
//     const textDefault = isDark ? '#d1d5db' : '#000';
//     const textActive = '#22c55e';
//     const cardColors = useMemo(() => ({
//         default: isDark ? '#374151' : '#ffffff',
//         highROI: isDark ? '#064e3b' : '#d1fae5',
//         lowROI: isDark ? '#7f1d1d' : '#fee2e2',
//         lowCTR: isDark ? '#5252c3ff' : '#dbeafe',
//     }), [isDark]);

//     const borderColors = {
//         default: '#d1d5db',
//         highROI: '#94cda9ff',
//         lowROI: '#f59494ff',
//         lowCTR: '#acc8f5ff',
//     };
//     const DESC_BY_BUCKET = {
//         highROI: 'Campaign showing positive ROI for 2 consecutive days',
//         lowROI: 'Campaign showing negative ROI for 2 consecutive days',
//         lowCTR: 'Click-through rate below 3% for 2 consecutive days',
//     };
//     const [requestedAccounts] = useState(initialAccounts);
//     const [respCache, setRespCache] = useState({});
//     const [presentAccounts, setPresentAccounts] = useState([]);
//     const [activeTab, setActiveTab] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//   const dynamicTabs = useMemo(() => {
//     if (!presentAccounts.length) return [];

//     // Collect all bucket labels dynamically (no hardcoded order)
//     const combinedLabels = {};
//     for (const acc of presentAccounts) {
//         const labels = respCache[acc]?.bucketLabels || {};
//         for (const [key, val] of Object.entries(labels)) {
//             combinedLabels[key] = val;
//         }
//     }

//     return Object.entries(combinedLabels).map(([key, label]) => ({
//         key,
//         label,
//     }));
// }, [presentAccounts, respCache]);


//     const toUICampaignsByBucket = (summary, bucketKey) => {
//         if (!bucketKey || !summary) return [];
//         const list = summary?.[bucketKey]?.campaigns || [];
//         const desc = DESC_BY_BUCKET[bucketKey] || `Campaign in ${bucketKey}`;
//         return list.map(c => ({
//             name: c.campaignName,
//             desc,
//         }));
//     };
//     useEffect(() => {
//         (async () => {
//             const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//             try {
//                 setLoading(true);
//                 setError(null);
//                 const accounts = Array.isArray(requestedAccounts) ? requestedAccounts : [requestedAccounts];
                
//                 const authHeaders = { headers: { Authorization: localStorage.getItem("token") } };
                
//                 const res = await axios.post(
//                     `https://prodapis.adsgoat.in/Recommendations`,
//                     {"accounts": accounts, ...(accounts.length > 1 ? {"merge":true,"includeAccounts":true} : {})},
//                     authHeaders
//                 );
//                 if (res.status === 404) {
//                     const emptySummary = {
//                         highROI: { count: 0, campaigns: [] },
//                         lowROI: { count: 0, campaigns: [] },
//                         lowCTR: { count: 0, campaigns: [] },
//                     };
//                     const emptyResp = {};
//                     for (const acc of accounts) {
//                         emptyResp[acc] = {
//                             Account: acc,
//                             bucketLabels: null,
//                             summary: emptySummary,
//                         };
//                     }
//                     setRespCache(emptyResp);
//                     setPresentAccounts([]);
//                     setActiveTab(null);
//                     setLoading(false);
//                     return;
//                 }

//                 // if (!res.ok) {
//                 //     const text = await res.text();
//                 //     throw new Error(`HTTP ${res.status} ${text}`);
//                 // }

//                 const data = res.data;
//                 setRespCache(data);
//                 const present = accounts.filter(acc => data?.[acc]);
//                 setPresentAccounts(present);
//                 if (!activeTab && present.length) {
//                     const combinedLabels = {};
//                     for (const acc of present) {
//                         const labels = data[acc]?.bucketLabels || {};
//                         for (const key of Object.keys(labels)) {
//                             combinedLabels[key] = labels[key];
//                         }
//                     }
//                     const keys = Object.keys(combinedLabels);
//                     if (keys.length) setActiveTab(keys[0]);
//                 }

//             } catch (e) {
//                 setError(e?.message || 'Failed to load recommendations');
//                 setRespCache({});
//                 setPresentAccounts([]);
//                 setActiveTab(null);
//             } finally {
//                 setLoading(false);
//             }
//         })();
//     }, []);
//     useEffect(() => {
//         if (!presentAccounts.length) return;
//         const firstAcc = presentAccounts[0];
//         const labels = respCache[firstAcc]?.bucketLabels || {};
//         const keys = Object.keys(labels);
//         if (!keys.length) return;

//         if (!activeTab || !keys.includes(activeTab)) {
//             setActiveTab(keys[0]);
//         }
//     }, [presentAccounts, respCache, activeTab]);
//     const nonePresent = presentAccounts.length === 0;
//     const noBuckets = presentAccounts.length > 0 && dynamicTabs.length === 0;
//     return (
//         <div style={{ padding: 10 }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <h3
//                     style={{
//                         margin: 0,
//                         fontSize: '18px',
//                         fontWeight: 600,
//                         color: isDark ? '#fff' : '#4b5563',
//                     }}
//                 >
//                     AI Powered Campaigns Recommendations
//                 </h3>

//                 <div
//                     style={{
//                         fontSize: 12,
//                         color: isDark ? '#9ca3af' : '#6b7280',
//                         padding: '4px 8px',
//                         background: isDark ? '#111827' : '#eef2f7',
//                         borderRadius: 6,
//                     }}
//                 >
//                 </div>
//             </div>
//             {loading ? (
//                 <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>Loading...</p>
//             ) : error ? (
//                 <p style={{ color: 'red' }}>Error: {error}</p>
//             ) : nonePresent ? (
//                 <div
//                     style={{
//                         marginTop: 16,
//                         padding: '10px 12px',
//                         borderRadius: 6,
//                         background: isDark ? 'rgba(253, 230, 138, 0.1)' : '#FFF7E6',
//                         border: `1px solid ${isDark ? '#F59E0B' : '#FFC069'}`,
//                         color: isDark ? '#FDE68A' : '#AD6800',
//                         fontSize: 13,
//                     }}
//                 >
//                     No recommendations found for the selected account(s) (last 2 days).
//                 </div>
//             ) : noBuckets ? (
//                 <div style={{ marginTop: 16, color: isDark ? '#9ca3af' : '#4b5563' }}>
//                     No tabs available  for this selection.
//                 </div>
//             ) : (
//                 <>
//                     <div
//                         style={{
//                             display: 'flex',
//                             gap: '8px',
//                             marginTop: 15,
//                             background: bgColor,
//                             borderRadius: 6,
//                             padding: 6,
//                         }}
//                     >
//                         {dynamicTabs.map(tab => (
//                             <div
//                                 key={tab.key}
//                                 onClick={() => setActiveTab(tab.key)}
//                                 style={{
//                                     cursor: 'pointer',
//                                     padding: '6px 12px',
//                                     borderRadius: 4,
//                                     fontSize: 14,
//                                     fontWeight: 600,
//                                     background: activeTab === tab.key ? tabBgActive : 'transparent',
//                                     color: activeTab === tab.key ? textActive : textDefault,
//                                     transition: 'all 0.2s ease',
//                                 }}
//                             >
//                                 {tab.label}
//                             </div>
//                         ))}
//                     </div>
//                     <div style={{ marginTop: 20 }}>
//                         {presentAccounts.map(acc => {
//                             const summary = respCache[acc]?.summary || null;
//                             const list = toUICampaignsByBucket(summary, activeTab);
//                             const bg = cardColors[activeTab] || cardColors.default;
//                             const bd = borderColors[activeTab] || borderColors.default;

//                             return (
//                                 <div key={acc} style={{ marginBottom: 18 }}>
//                                     {presentAccounts.length > 1 && (
//                                         <h4
//                                             style={{
//                                                 margin: '4px 0 10px',
//                                                 fontSize: 14,
//                                                 color: isDark ? '#e5e7eb' : '#374151',
//                                                 fontWeight: 600,
//                                             }}
//                                         >
//                                             Account: {acc}
//                                         </h4>
//                                     )}

//                                     {list.length === 0 ? (
//                                         <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>No campaigns</p>
//                                     ) : (
//                                         list.map((campaign, index) => (
//                                             <div
//                                                 key={`${acc}-${activeTab}-${campaign.name}-${index}`}
//                                                 style={{
//                                                     background: bg,
//                                                     borderRadius: 10,
//                                                     padding: 15,
//                                                     marginBottom: 12,
//                                                     display: 'flex',
//                                                     justifyContent: 'space-between',
//                                                     alignItems: 'center',
//                                                     color: isDark ? '#fff' : '#111827',
//                                                 }}
//                                             >
//                                                 <div>
//                                                     <p style={{ margin: 0, fontWeight: 600 }}>{campaign.name}</p>
//                                                     <p style={{ margin: '4px 0 0', fontSize: 14 }}>{campaign.desc}</p>
//                                                 </div>
//                                                 <button
//                                                     style={{
//                                                         background: 'transparent',
//                                                         color: isDark ? '#fff' : '#111827',
//                                                         border: `2px solid ${bd}`,
//                                                         borderRadius: 6,
//                                                         padding: '6px 10px',
//                                                         cursor: 'pointer',
//                                                     }}
//                                                     onClick={() => {
//                                                         console.log('History for:', campaign.name, 'Account:', acc, 'Bucket:', activeTab);
//                                                         const campaignEncoded = encodeURIComponent(campaign.name);
//                                                         const collection = newtworkCollections[network] || network || '';

//                                                         const url = `/DailyAndCampaignHistory/CampaignHistory/${campaignEncoded}-${acc}-${time}-${collection}`;
//                                                         window.open(url, '_blank', 'noopener,noreferrer');

//                                                     }}
//                                                 >
//                                                     Campaign History
//                                                 </button>
//                                             </div>
//                                         ))
//                                     )}
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }


'use client';


import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTokenContext } from '../../components/parent';
import { useSearchParams } from 'next/navigation';
import { RefreshOutlined } from '@mui/icons-material';
import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';


const networkCollections = {
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


export default function RecommendationsPage({ params }) {
    const { theme } = useTokenContext();
    const searchParams = useSearchParams();


    const networkParam = searchParams.get('network') || '';
    const time = searchParams.get('time') || '';


    const resolvedNetwork =
        networkCollections[networkParam] || networkParam;


    const accounts = decodeURIComponent(params.AccountNumber || '')
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);


    const [data, setData] = useState({});
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);


    const isDark = theme === 'dark';


    const bgColor = isDark ? '#1e1e1e' : '#f3f4f6';
    const tabBgActive = isDark ? '#555' : '#fff';
    const textDefault = isDark ? '#d1d5db' : '#000';
    const textActive = '#22c55e';


    const cardColors = {
        pause_loss_makers: isDark ? '#7f1d1d' : '#fee2e2',
        scale_winners: isDark ? '#064e3b' : '#d1fae5',
        reallocate_budget: isDark ? '#374151' : '#ffffff',
        creative_alert: isDark ? '#5252c3ff' : '#dbeafe',
        risk_alert: isDark ? '#78350f' : '#ffedd5',
    };


    const borderColors = {
        pause_loss_makers: '#f59494ff',
        scale_winners: '#94cda9ff',
        reallocate_budget: '#d1d5db',
        creative_alert: '#acc8f5ff',
        risk_alert: '#fdba74',
    };


    const fetchData = async () => {
        try {
            setLoading(true);


            const res = await axios.post(
                'https://prodapis.adsgoat.in/AiCampaignRecommendations',
                {
                    timezone: time,
                    network: resolvedNetwork,
                    accountNumbers: accounts,
                },
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                }
            );


            const api = res.data || {};


            setData(api.data || {});
            setLastUpdated(api.meta?.lastUpdatedDate || null);


            const tabKeys = Object.keys(api.data || {});
            setTabs(tabKeys);
            setActiveTab(tabKeys[0] || '');
        } catch (err) {
            console.error('AI API ERROR:', err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);


    return (
        <div style={{ padding: 10 }}>
           
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <h3
                    style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: isDark ? '#fff' : '#4b5563',
                    }}
                >
                    AI Powered Campaign Recommendations
                </h3>


                <div style={{ display:"flex" }}>
                    <div style={{ fontSize: 15, color: textDefault ,margin:"10px" }}>
                        {lastUpdated ? `Last updated: ${lastUpdated}` : 'Last updated: N/A'}
                    </div>
                    <Button
                        type="primary"
                        style={{
                            backgroundColor: '#91C25F',
                            border: 'solid 0px',
                            color: 'black',
                            height: '30px'
                        }}
                        icon={<ReloadOutlined className="black-icon" />}
                        onClick={fetchData}
                    />
                </div>
            </div>


           
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 15,
                    background: bgColor,
                    borderRadius: 6,
                    padding: 6,
                }}
            >
                {tabs.map(tab => (
                    <div
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: 4,
                            fontSize: 14,
                            fontWeight: 600,
                            background:
                                activeTab === tab ? tabBgActive : 'transparent',
                            color: activeTab === tab ? textActive : textDefault,
                        }}
                    >
                        {{
                            pause_loss_makers: 'Pause Loss Makers',
                            scale_winners: 'Scale Winners',
                            reallocate_budget: 'Reallocate Budget',
                            risk_alert: 'Risk Alert',
                        }[tab] || tab}
                    </div>
                ))}
            </div>


            {loading && (
                <p style={{ color: textDefault, marginTop: 10 }}>
                    Loading…
                </p>
            )}


           
            <div style={{ marginTop: 20 }}>
                {accounts.map(acc => {
                    const accData = data?.[activeTab]?.[acc];
                    const bg = cardColors[activeTab];
                    const bd = borderColors[activeTab];


                    if (!accData) {
                        return (
                            <div key={acc} style={{ marginBottom: 18 }}>
                                <h4 style={{ color: textDefault }}>
                                    Account: {acc}
                                </h4>
                                <p style={{ color: '#9ca3af' }}>No campaigns</p>
                            </div>
                        );
                    }


                   
                    if (activeTab === 'reallocate_budget') {
                        return (
                            <div key={acc} style={{ marginBottom: 18 }}>
                                <h4 style={{ color: textDefault }}>
                                    Account: {acc}
                                </h4>


                                <div style={{ display: 'flex', gap: 16 }}>
                                    {['low_performers', 'high_performers'].map(type => (
                                        <div key={type} style={{ flex: 1 }}>
                                            <h5
                                                style={{
                                                    color:
                                                        type === 'low_performers'
                                                            ? '#ef4444'
                                                            : '#22c55e',
                                                }}
                                            >
                                                {type === 'low_performers'
                                                    ? '🔻 Low Performance'
                                                    : '🔺 High Performance'}
                                            </h5>


                                            {(accData[type] || []).map(c => (
                                                <div
                                                    key={c.campaign_id}
                                                    style={{
                                                        background: bg,
                                                        borderRadius: 10,
                                                        padding: 15,
                                                        marginBottom: 12,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                    }}
                                                >
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 600 }}>
                                                            {c.campaign_name}
                                                        </p>
                                                        <p style={{ fontSize: 12 }}>
                                                            ROI: {c.days.at(-1)?.roi}% | Spend: $
                                                            {c.days.at(-1)?.spend}
                                                        </p>
                                                    </div>


                                                    <Button
                                                        style={{
                                                            background: 'transparent',
                                                            border: `1px solid ${bd}`,
                                                            padding: '5px',
                                                            cursor: 'pointer',
                                                            color: isDark ? '#fff' : '#111827',
                                                        }}
                                                        onClick={() =>
                                                            window.open(
                                                                `/DailyAndCampaignHistory/CampaignHistory/${encodeURIComponent(
                                                                    c.campaign_id
                                                                )}-${acc}-${time}-${resolvedNetwork}`,
                                                                '_blank'
                                                            )
                                                        }
                                                    >
                                                        Campaign History
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }


                    return (
                        <div key={acc} style={{ marginBottom: 18 }}>
                            <h4 style={{ color: textDefault }}>
                                Account: {acc}
                            </h4>


                            {accData.map(c => (
                                <div
                                    key={c.campaign_id}
                                    style={{
                                        background: bg,
                                        borderRadius: 10,
                                        padding: 15,
                                        marginBottom: 12,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600 }}>
                                            {c.campaign_name}
                                        </p>
                                        <p style={{ fontSize: 12 }}>
                                            ROI: {c.days.at(-1)?.roi}% | Spend: $
                                            {c.days.at(-1)?.spend}
                                        </p>
                                    </div>


                                    <Button
                                        style={{
                                            background: 'transparent',
                                            border: `1px solid ${bd}`,
                                            borderRadius: 6,
                                            padding: '6px 10px',
                                            cursor: 'pointer',
                                            color: isDark ? '#fff' : '#111827',
                                        }}
                                        onClick={() =>
                                            window.open(
                                                `/DailyAndCampaignHistory/CampaignHistory/${encodeURIComponent(
                                                    c.campaign_id
                                                )}-${acc}-${time}-${resolvedNetwork}`,
                                                '_blank'
                                            )
                                        }
                                    >
                                        Campaign History
                                    </Button>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

