'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTokenContext } from '../../components/parent';
import { useSearchParams } from 'next/navigation';

export default function RecommendationsPage({ params }) {


    const { theme } = useTokenContext();
    const searchParams = useSearchParams();
    const network = searchParams.get('network') || '';
    const time = searchParams.get('time') || '';
    const accountsCsv = decodeURIComponent(String(params?.AccountNumber ?? ''));
    const initialAccounts = accountsCsv
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    const bucketOrder = ['highROI', 'lowROI', 'lowCTR'];
    const newtworkCollections = {
        "FB_Mnet": "Facebook_Mnet",
        "FB_MnetBing": "Facebook_MnetBing",
        "FB_Enki": "Facebook_Enki",
        "FB_System1": 'Facebook_System1',
        "FB_Rsoc": 'Facebook_Rsoc',
        "FB_Tonic": 'Facebook_Tonic',
        "FB_DomainActive": "Facebook_DActive_Names",
        "FB_Bodies": "Facebook_Bodies",
        "FB_Bodies1": "Facebook_Bodies1",
        "Newsbreak_DA": "Newsbreak_DomainActive",
        "FB_Tonic1": "Facebook_Tonic1",
        "FB_Sedo": "Facebook_Sedo",
        "FB_Inmobi": "Facebook_Inmobi",
    }
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#1e1e1e' : '#f3f4f6';
    const tabBgActive = isDark ? '#555' : '#fff';
    const textDefault = isDark ? '#d1d5db' : '#000';
    const textActive = '#22c55e';
    const cardColors = useMemo(() => ({
        default: isDark ? '#374151' : '#ffffff',
        highROI: isDark ? '#064e3b' : '#d1fae5',
        lowROI: isDark ? '#7f1d1d' : '#fee2e2',
        lowCTR: isDark ? '#5252c3ff' : '#dbeafe',
    }), [isDark]);

    const borderColors = {
        default: '#d1d5db',
        highROI: '#94cda9ff',
        lowROI: '#f59494ff',
        lowCTR: '#acc8f5ff',
    };
    const DESC_BY_BUCKET = {
        highROI: 'Campaign showing positive ROI for 2 consecutive days',
        lowROI: 'Campaign showing negative ROI for 2 consecutive days',
        lowCTR: 'Click-through rate below 3% for 2 consecutive days',
    };
    const [requestedAccounts] = useState(initialAccounts);
    const [respCache, setRespCache] = useState({});
    const [presentAccounts, setPresentAccounts] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const dynamicTabs = useMemo(() => {
        if (!presentAccounts.length) return [];

        // Collect all bucket labels across accounts
        const combinedLabels = {};
        for (const acc of presentAccounts) {
            const labels = respCache[acc]?.bucketLabels || {};
            for (const key of Object.keys(labels)) {
                combinedLabels[key] = labels[key]; // last one wins, or you can keep the first
            }
        }

        return bucketOrder
            .filter(key => combinedLabels[key])
            .map(key => ({
                key,
                label: combinedLabels[key],
            }));
    }, [presentAccounts, respCache]);

    const toUICampaignsByBucket = (summary, bucketKey) => {
        if (!bucketKey || !summary) return [];
        const list = summary?.[bucketKey]?.campaigns || [];
        const desc = DESC_BY_BUCKET[bucketKey] || `Campaign in ${bucketKey}`;
        return list.map(c => ({
            name: c.campaignName,
            desc,
        }));
    };
    useEffect(() => {
        (async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            try {
                setLoading(true);
                setError(null);

                const base = 'http://localhost:8000/Recommendations';
                const accounts = Array.isArray(requestedAccounts) ? requestedAccounts : [requestedAccounts];
                const url =
                    accounts.length === 1
                        ? `${base}/${encodeURIComponent(accounts[0])}`
                        : `${base}?accounts=${accounts.join(',')}`;

                const headers = {};
                if (token) headers.Authorization = token;
                const res = await fetch(url, { method: 'GET', headers });
                if (res.status === 404) {
                    const emptySummary = {
                        highROI: { count: 0, campaigns: [] },
                        lowROI: { count: 0, campaigns: [] },
                        lowCTR: { count: 0, campaigns: [] },
                    };
                    const emptyResp = {};
                    for (const acc of accounts) {
                        emptyResp[acc] = {
                            Account: acc,
                            bucketLabels: null,
                            summary: emptySummary,
                        };
                    }
                    setRespCache(emptyResp);
                    setPresentAccounts([]);
                    setActiveTab(null);
                    setLoading(false);
                    return;
                }

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status} ${text}`);
                }

                const data = await res.json();
                setRespCache(data);
                const present = accounts.filter(acc => data?.[acc]);
                setPresentAccounts(present);
                if (!activeTab && present.length) {
                    const combinedLabels = {};
                    for (const acc of present) {
                        const labels = data[acc]?.bucketLabels || {};
                        for (const key of Object.keys(labels)) {
                            combinedLabels[key] = labels[key];
                        }
                    }
                    const keys = Object.keys(combinedLabels);
                    if (keys.length) setActiveTab(keys[0]);
                }

            } catch (e) {
                setError(e?.message || 'Failed to load recommendations');
                setRespCache({});
                setPresentAccounts([]);
                setActiveTab(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);
    useEffect(() => {
        if (!presentAccounts.length) return;
        const firstAcc = presentAccounts[0];
        const labels = respCache[firstAcc]?.bucketLabels || {};
        const keys = Object.keys(labels);
        if (!keys.length) return;

        if (!activeTab || !keys.includes(activeTab)) {
            setActiveTab(keys[0]);
        }
    }, [presentAccounts, respCache, activeTab]);
    const nonePresent = presentAccounts.length === 0;
    const noBuckets = presentAccounts.length > 0 && dynamicTabs.length === 0;
    return (
        <div style={{ padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3
                    style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: 600,
                        color: isDark ? '#fff' : '#4b5563',
                    }}
                >
                    AI Powered Campaigns Recommendations
                </h3>

                <div
                    style={{
                        fontSize: 12,
                        color: isDark ? '#9ca3af' : '#6b7280',
                        padding: '4px 8px',
                        background: isDark ? '#111827' : '#eef2f7',
                        borderRadius: 6,
                    }}
                >
                </div>
            </div>
            {loading ? (
                <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>Loading...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>Error: {error}</p>
            ) : nonePresent ? (
                <div
                    style={{
                        marginTop: 16,
                        padding: '10px 12px',
                        borderRadius: 6,
                        background: isDark ? 'rgba(253, 230, 138, 0.1)' : '#FFF7E6',
                        border: `1px solid ${isDark ? '#F59E0B' : '#FFC069'}`,
                        color: isDark ? '#FDE68A' : '#AD6800',
                        fontSize: 13,
                    }}
                >
                    No recommendations found for the selected account(s) (last 2 days).
                </div>
            ) : noBuckets ? (
                <div style={{ marginTop: 16, color: isDark ? '#9ca3af' : '#4b5563' }}>
                    No tabs available  for this selection.
                </div>
            ) : (
                <>
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: 15,
                            background: bgColor,
                            borderRadius: 6,
                            padding: 6,
                        }}
                    >
                        {dynamicTabs.map(tab => (
                            <div
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    cursor: 'pointer',
                                    padding: '6px 12px',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    background: activeTab === tab.key ? tabBgActive : 'transparent',
                                    color: activeTab === tab.key ? textActive : textDefault,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {tab.label}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 20 }}>
                        {presentAccounts.map(acc => {
                            const summary = respCache[acc]?.summary || null;
                            const list = toUICampaignsByBucket(summary, activeTab);
                            const bg = cardColors[activeTab] || cardColors.default;
                            const bd = borderColors[activeTab] || borderColors.default;

                            return (
                                <div key={acc} style={{ marginBottom: 18 }}>
                                    {presentAccounts.length > 1 && (
                                        <h4
                                            style={{
                                                margin: '4px 0 10px',
                                                fontSize: 14,
                                                color: isDark ? '#e5e7eb' : '#374151',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Account: {acc}
                                        </h4>
                                    )}

                                    {list.length === 0 ? (
                                        <p style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>No campaigns</p>
                                    ) : (
                                        list.map((campaign, index) => (
                                            <div
                                                key={`${acc}-${activeTab}-${campaign.name}-${index}`}
                                                style={{
                                                    background: bg,
                                                    borderRadius: 10,
                                                    padding: 15,
                                                    marginBottom: 12,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    color: isDark ? '#fff' : '#111827',
                                                }}
                                            >
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 600 }}>{campaign.name}</p>
                                                    <p style={{ margin: '4px 0 0', fontSize: 14 }}>{campaign.desc}</p>
                                                </div>
                                                <button
                                                    style={{
                                                        background: 'transparent',
                                                        color: isDark ? '#fff' : '#111827',
                                                        border: `2px solid ${bd}`,
                                                        borderRadius: 6,
                                                        padding: '6px 10px',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => {
                                                        console.log('History for:', campaign.name, 'Account:', acc, 'Bucket:', activeTab);
                                                        const campaignEncoded = encodeURIComponent(campaign.name);
                                                        const collection = newtworkCollections[network] || network || '';

                                                        const url = `/DailyAndCampaignHistory/CampaignHistory/${campaignEncoded}-${acc}-${time}-${collection}`;
                                                        window.open(url, '_blank', 'noopener,noreferrer');

                                                    }}
                                                >
                                                    Campaign History
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
