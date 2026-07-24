"use client";


import React, {
    useState,
    useEffect,
    useRef,
    useMemo
} from "react";
import axios from "axios";
import { Input, Button, Select, Checkbox, Badge, message } from "antd";
import CreateCampaignDrawerForScrapping from "../camp-components/AdLibraryScrapping.js";
import { useTokenContext } from "../../components/parent.js";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { TiTickOutline, TiTimesOutline } from "react-icons/ti";

const FacebookAdsScraper = () => {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [ads, setAds] = useState([]);
    const [visibleCount, setVisibleCount] = useState(20);
    const [cdrawerVisible, setDrawerVisible] = useState(false);
    const [networksWithStatus, setNetworksWithStatus] = useState([]);
    const [selectedKey, setSelectedKey] = useState();
    const [selectedValue, setSelectedValue] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [options, setOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const userPickedRef = useRef(false);
    const [refrst, setRefrst] = useState(false);
    const [accountChanged, setAccountChanged] = useState(false);
    const [createcamselectedacc, setcreatecamselectedacc] = useState("");
    const [draftsData, setDraftsData] = useState([]);
    const [selectedAds, setSelectedAds] = useState([]);


    const { userdetails } = useTokenContext();
    const { adAccounts } = userdetails || {};


    const loaderRef = useRef(null);
    const { theme } = useTokenContext();
    const isMobile = window.innerWidth <= 500;
    const token = localStorage.getItem("token");
    const accountsForAccess = adAccounts[selectedKey];
    // console.log(accountsForAccess, "accounts Access");


    const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;
    const filteredAccounts = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return accountsAccess;
        return accountsAccess.filter((a) =>
            `${a.accountNumber} ${a.accountName || ""}`.toLowerCase().includes(q)
        );
    }, [accountsAccess, searchText]);
    useEffect(() => {
        const fetchNetworksData = async () => {
            try {
                const res = await axios.get('https://fblaunching.vyaktimetrics.com/open/get/networksData', {
                    headers: {
                        Authorization: token,


                    }
                });
                setNetworksWithStatus(res.data);
            } catch (error) {
                console.error('Error to fetching networksData:', error);
            }
        };
        fetchNetworksData();
    }, []);
    useEffect(() => {
        if (userdetails?.adAccounts) {
            const adAccountOptions = Object.keys(userdetails?.adAccounts).map(
                (key) => ({
                    value: key,
                    label: key,
                })
            );
            setOptions(adAccountOptions);
        }
    }, []);
    useEffect(() => {
        const savedAds = localStorage.getItem(
            "facebook_ads_data"
        );


        if (savedAds) {
            setAds(JSON.parse(savedAds));
        }
    }, []);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    visibleCount < ads.length
                ) {
                    setVisibleCount((prev) =>
                        Math.min(prev + 20, ads.length)
                    );
                }
            },
            {
                threshold: 1,
            }
        );


        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }


        return () => observer.disconnect();
    }, [visibleCount, ads.length]);
    const onChangeSelect = (value) => {
        // setAccount(value);
    }
    const onCloseDrawer = () => {
        setDrawerVisible(false);
    };
    const changeRRefrst = () => {
        // alert("hey rerendering")
        setRefrst((els) => !els);
    };
    const handleChange1 = (currentVisibleSelected) => {
        const visible = filteredAccounts.map(a => String(a.accountNumber));
        const current = currentVisibleSelected.map(String);
        const added = current.filter(id => !selectedValue.includes(id));
        let updated = Array.from(new Set([...selectedValue, ...added]));
        const removed = visible.filter(id =>
            selectedValue.includes(id) && !current.includes(id)
        );
        updated = updated.filter(id => !removed.includes(id));
        setSelectedValue(updated);
        setcreatecamselectedacc(updated);
        userPickedRef.current = true;
        const last = currentVisibleSelected[currentVisibleSelected.length - 1];
        if (last) {
            const findAccount = (data, accountNumber) =>
                Object.values(data).flat().find((item) => item.accountNumber === accountNumber) || null;
            const accName = findAccount(userdetails?.adAccounts, last);
        }


        onChangeSelect(updated);
        setAccountChanged(true);
    };


    const handleSubmit = async () => {
        try {
            if (!url.trim()) {
                alert("Please enter a URL");
                return;
            }

            setLoading(true);
            const response = await axios.post(
                '/api/ad-scrapping/facebook-ads',
                {
                    url
                },
                {
                    headers: {
                        Authorization: `${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const adsData = response?.data?.data || [];
            if (adsData.length === 0) {

                message.warning("No ads found for this URL");

                setAds([]);
                setVisibleCount(20);

                return;
            }
            setAds(adsData);
            setVisibleCount(20);
            localStorage.setItem(
                "facebook_ads_data",
                JSON.stringify(adsData)
            );

        } catch (error) {
            console.error(error);
            alert(
                error?.response?.data?.message ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };
    const handleKeyChange = (key) => {
        setSelectedKey(key);
        setSelectedValue([]);
    };
    const showDrawer = async () => {
        setDrawerVisible(true)
    }
    const renderAccountsCheckboxes = (theme) => {
        const activeAccountNumbers = filteredAccounts
            .filter(acc => acc.status === "Active")
            .map(acc => String(acc.accountNumber));


        const allActiveSelected =
            activeAccountNumbers.length > 0 &&
            activeAccountNumbers.every(acc => selectedValue.includes(acc));


        return (
            <>
                <div style={{ padding: '5px 10px', borderBottom: '1px solid #ddd' }}>
                    <Checkbox
                        className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
                        checked={allActiveSelected}
                        indeterminate={
                            selectedValue.length > 0 &&
                            !allActiveSelected &&
                            activeAccountNumbers.some(acc => selectedValue.includes(acc))
                        }
                        onChange={(e) => {
                            if (e.target.checked) {
                                handleChange1(activeAccountNumbers);
                            } else {
                                const remaining = selectedValue.filter(
                                    val => !activeAccountNumbers.includes(val)
                                );
                                handleChange1(remaining);
                            }
                        }}
                    >
                        <strong>All Accounts</strong>
                    </Checkbox>
                    <TiTickOutline
                        style={{
                            fontSize: 20,
                            color: "#52c41a",
                            cursor: "pointer",
                        }}
                        title="Select All Active Accounts"
                    // onClick={handleApply}
                    />
                    <TiTimesOutline
                        style={{
                            fontSize: 20,
                            color: "#ff4d4f",
                            cursor: "pointer",
                        }}
                        title="Unselect All"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleChange1([]);


                        }}
                    />
                </div>
                <Checkbox.Group
                    options={filteredAccounts.map((account) => ({
                        value: String(account.accountNumber),
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '5px 10px',
                                    borderBottom: '1px solid #ddd'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600 }}>{account.accountNumber}</span>
                                    {isOpen && (
                                        <span style={{ fontSize: 12, color: 'gray' }}>
                                            {account.accountName || ''}
                                        </span>
                                    )}
                                </div>
                                <span style={{ textAlign: 'right', marginLeft: 10 }}>
                                    {account.status === "Active" ? (
                                        <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} />
                                    ) : (
                                        <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} />
                                    )}
                                </span>
                            </div>
                        ),
                    }))}
                    value={selectedValue}
                    onChange={handleChange1}
                    className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
                />
            </>
        );
    };
    const handleDropdownVisibleChange = (open) => {
        setIsOpen(open);


    };
    const isSelected = (adId) =>
        selectedAds.some(item => item.adId === adId);


    const handleSelectAd = (ad, checked) => {
        setSelectedAds(prev => {
            if (checked) {
                return [...prev, ad];
            }


            return prev.filter(item => item.adId !== ad.adId);
        });
    };


    return (
        <div>
            <CreateCampaignDrawerForScrapping
                visible={cdrawerVisible}
                accountis={createcamselectedacc}
                onClose={onCloseDrawer}
                network={selectedKey}
                selectedAds={selectedAds}
                setSelectedAds={setSelectedAds}
            />
            <div
                style={{
                    width: "100%",
                    padding: "10px",
                }}
            >
                <h2>Facebook Ads Library Scraper</h2>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div
                        style={{
                            display: "flex",
                            gap: "3px",
                            marginBottom: "10px",
                        }}
                    >
                        <Input
                            placeholder="Enter Facebook Ad Library URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            size="large"
                            style={{
                                width: '500px',
                                height: "33px"
                            }}
                        />
                        <Button
                            type="primary"
                            loading={loading}
                            onClick={handleSubmit}
                            // size="large"
                            style={{
                                backgroundColor: "#91C25F",
                                borderColor: "#91C25F",
                                color: "#000",
                                fontWeight: 600,
                                width: "80px",
                                height: "30px"
                            }}
                        >
                            Submit
                        </Button>
                        <Button
                            // size="large"
                            onClick={() => {
                                setAds([]);
                                localStorage.removeItem("facebook_ads_data");
                                setSelectedAds([])
                            }}
                            style={{
                                width: "80px",
                                height: "30px"
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                    <div style={{
                        display: "flex",
                        gap: "3px",
                        marginBottom: "10px",
                    }}>


                        <Select
                            showSearch
                            placeholder="Select Projects"
                            style={{ width: isMobile ? 210 : 130 }}
                            onChange={handleKeyChange}
                            value={selectedKey}
                            dropdownClassName={theme === "dark" && "custom-dropdown"}
                            className={`${theme === "dark" ? "dark-theme" : "light-theme"
                                } green-border-select`}
                        >
                            {options
                                .sort((a, b) => {
                                    const aActive = networksWithStatus.find(n => n.Network === a.label)?.Status === "Active" ? 1 : 0;
                                    const bActive = networksWithStatus.find(n => n.Network === b.label)?.Status === "Active" ? 1 : 0;
                                    return bActive - aActive; // active first
                                })
                                .map(option => {
                                    const isActive = networksWithStatus.find(n => n.Network === option.label)?.Status === "Active";
                                    return (
                                        <Option key={option.value} value={option.value}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {isActive
                                                    ? <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} className='black-icon-active-1' />
                                                    : <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} className='black-icon-pause-1' />}
                                                <span>{option.label}</span>
                                            </div>
                                        </Option>
                                    );
                                })
                            }




                        </Select>
                        <Select
                            showSearch
                            onSearch={setSearchText}
                            searchValue={searchText}
                            placeholder="Select Account"
                            open={isOpen}
                            onDropdownVisibleChange={handleDropdownVisibleChange}
                            value={
                                selectedValue.length === 0
                                    ? undefined
                                    : selectedValue.length === 1
                                        ? selectedValue[0] // just that account number
                                        : `${selectedValue[0]}, +${selectedValue.length - 1} more`
                            }


                            dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            style={{
                                width: isMobile ? '350px' : '250px',
                                whiteSpace: 'nowrap',
                                color: theme === 'dark' ? 'white' : undefined,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                border: '1px solid #4CAF50',
                                borderRadius: '6px',


                            }}
                            optionFilterProp="value"
                            dropdownRender={() => (
                                <div style={{ maxHeight: 300, overflowY: 'auto', padding: 8 }}>
                                    {renderAccountsCheckboxes(theme)}
                                </div>
                            )}
                        />


                        <Badge
                            count={selectedAds.length}
                            offset={[-3, 3]}
                            color="#f5222d"
                        >
                            <Button
                                type="primary"
                                onClick={showDrawer}
                                disabled={!createcamselectedacc?.length}
                                style={{
                                    backgroundColor: "#91C25F",
                                    borderColor: "#91C25F",
                                    color: "#000",
                                    fontWeight: 600,
                                    width: "130px",
                                    height: "30px"
                                }}
                            >
                                New Campaign
                            </Button>
                        </Badge>
                    </div>
                </div>


                <div
                    style={{
                        marginBottom: "20px",
                    }}
                >
                    <strong>
                        Showing {Math.min(visibleCount, ads.length)}
                        of {ads.length} Ads
                    </strong>
                </div>




                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
                        gap: "10px",
                        marginTop: "20px",
                    }}
                >
                    {ads.slice(0, visibleCount).map((ad) => (
                        <div
                            key={ad.adId}
                            style={{
                                position: "relative",
                                border: isSelected(ad.adId)
                                    ? "2px solid #91C25F"
                                    : "1px solid #ddd",
                                borderRadius: "8px",
                                overflow: "hidden",
                                background: "#fff",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    zIndex: 1000,
                                    background: "#fff",
                                    borderRadius: "50%",
                                    padding: "2px"
                                }}
                            >
                                <Checkbox
                                    checked={isSelected(ad.adId)}
                                    disabled={
                                        (!ad.images || ad.images.length === 0) &&
                                        (!ad.videos || ad.videos.length === 0)
                                    }
                                    onChange={(e) =>
                                        handleSelectAd(ad, e.target.checked)
                                    }
                                />
                            </div>
                            {/* Header */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "10px",
                                }}
                            >
                                <img
                                    src={ad.pageProfileImage}
                                    alt=""
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />


                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "13px",
                                            lineHeight: "18px",
                                        }}
                                    >
                                        {ad.pageName}
                                    </div>


                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#666",
                                        }}
                                    >
                                        Sponsored
                                    </div>
                                </div>
                            </div>


                            {/* Ad Body */}
                            <div
                                style={{
                                    padding: "0 10px 10px",
                                    fontSize: "13px",
                                    lineHeight: "18px",
                                    height: "54px", // 3 lines × 18px
                                    overflow: "hidden",
                                    display: "-webkit-box",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 3,
                                    textOverflow: "ellipsis"
                                }}
                            >
                                {ad.body}
                            </div>


                            {/* Video */}
                            {ad.videos?.length > 0 && (
                                <video
                                    controls
                                    poster={ad.videos[0]?.preview}
                                    style={{
                                        width: "100%",
                                        height: "220px",
                                        objectFit: "cover",
                                        background: "#000",
                                    }}
                                >
                                    <source
                                        src={
                                            ad.videos[0]?.hd ||
                                            ad.videos[0]?.sd
                                        }
                                        type="video/mp4"
                                    />
                                </video>
                            )}


                            {/* Image */}
                            {!ad.videos?.length &&
                                ad.images?.length > 0 && (
                                    <img
                                        src={
                                            ad.images?.[0]?.resized_image_url ||
                                            ad.images?.[0]?.original_image_url ||
                                            ""
                                        }
                                        alt={ad.title}
                                        style={{
                                            width: "100%",
                                            height: "220px",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    />
                                )}


                            {/* Footer */}
                            <div
                                style={{
                                    padding: "10px",
                                    background: "#f5f6f7",
                                    borderTop: "1px solid #ddd",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "11px",
                                        color: "#666",
                                        marginBottom: "4px",
                                    }}
                                >
                                    {ad.caption}
                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        gap: "10px",
                                    }}
                                >
                                    <div
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                fontSize: "13px",
                                                marginBottom: "3px",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {ad.title}
                                        </div>


                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#666",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {ad.description}
                                        </div>
                                    </div>


                                    <a
                                        href={ad.landingPage}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            background: "#d8dadf",
                                            color: "#000",
                                            padding: "6px 10px",
                                            borderRadius: "6px",
                                            textDecoration: "none",
                                            fontWeight: 600,
                                            fontSize: "12px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {ad.ctaText || "Learn More"}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div
                    ref={loaderRef}
                    style={{
                        height: "60px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {visibleCount < ads.length && (
                        <span>Loading...</span>
                    )}
                </div>


            </div>
        </div>
    );


};


export default FacebookAdsScraper;

