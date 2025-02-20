import { useSearchParams } from 'next/navigation';
import { ImHistory } from "react-icons/im";
import Draggable from 'react-draggable';
import {SubnodeOutlined, PushpinFilled, PushpinOutlined, UserAddOutlined,CommentOutlined, CustomerServiceOutlined, MenuOutlined} from '@ant-design/icons';
import { RiLiveFill } from 'react-icons/ri';
import { FaDailymotion } from 'react-icons/fa';

// function debounce(func, wait) {
//     let timeout;
//     return function(...args) {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => func.apply(this, args), wait);
//     };
// }
const CustomHeader = (props) => {
    const { displayName, tooltip, api, column } = props;

    const onFilterClicked = () => {
        api.showColumnMenuAfterButtonClick(column, document.querySelector('.custom-header-icon'));
    };





    return (
        <div>
            <span>{displayName}</span>
            <InfoCircleOutlined title={tooltip} style={{ marginLeft: 5 }} />
            <div
                className="custom-header-icon"
                onClick={onFilterClicked}
                style={{ display: 'inline', marginLeft: 5, cursor: 'pointer' }}
            >
                <i className="ag-icon ag-icon-menu" />
            </div>
        </div>
    );
};

const [url1, setUrl1] = useState('FbMnetUI');

const [url2, setUrl2] = useState('FbMnetDailyUI');

const [url3, setUrl3] = useState('MnetAllCampaigns');

const [isSubmitted, setIsSubmitted] = useState(false);

const filterRef = useRef(null);

// const columnApiRef = useRef(null);

const handleSearchClick = () => {
    setIsSearching(true);
    setIsSecondRowVisible(prevState => !prevState);
};



const saveScrollPosition = (gridApi) => {
    if (gridApi) {
        const scrollTop = gridApi.getVerticalScrollPosition()?.top || 0;
        localStorage.setItem('gridScrollPosition', scrollTop);
    }
};

// Restore scroll position from localStorage
const restoreScrollPosition = (gridApi) => {
    const scrollTop = localStorage.getItem('gridScrollPosition');
    if (gridApi && scrollTop) {
        gridApi.setVerticalScrollPosition(parseInt(scrollTop, 10));
    }
};

// Save grid state (filters and sorting) to localStorage
const saveGridState = (gridApi) => {
    if (gridApi) {
        const filterModel = gridApi.getFilterModel();
        const sortModel = gridApi.getSortModel();
        localStorage.setItem('gridFilterModel', JSON.stringify(filterModel));
        localStorage.setItem('gridSortModel', JSON.stringify(sortModel));
    }
};

// const spender = (params) => {
//     var total = 0;
//     params.values.forEach((value) => (total += parseFloat(value)));
//     var total1 = total.toString()
//     var total2 = total1.split(".")
//     if (total2[1] !== undefined && total2[1] !== null && total2[1].length > 2) {
//       var total22 = total2[1].slice(0, 2)
//       var totalone = total2[0] + '.' + total22
//     //   console.log(parseFloat(totalone).toFixed(2), "totalone");
//     return parseFloat(totalone).toFixed(2)

//     }
//     console.log(total, "total");
//     return total
// };

function customTextFilterFunction(filter, value, filterText) {
        if (!filterText) {
            return true;
        }
        return value != null && value.toString().toLowerCase().includes(filterText.toLowerCase());
}

const customNumberComparator = (valueA, valueB) => {
    const a = parseFloat(valueA);
    const b = parseFloat(valueB);

    // Handle null/undefined values first (nulls should appear last in the sort order)
    if (isNaN(a)) return 1;
    if (isNaN(b)) return -1;

    // Standard comparison for non-null values
    return a - b;
};
// adId: {
//     headerName: 'Ad ID',
//     field: 'adId',
//     sortable: true,
//     filter: 'agTextColumnFilter',
//     hide: true, // Hide since we handle this in the keyword tooltip
// },
// keyword: {
//     headerName: 'Keywords',
//     field: 'keyword',
//     sortable: true,
//     filter: 'agTextColumnFilter',
//     width: 300,
//     resizable: true,
//     cellRenderer: (params) => {
//         return params.value;
//     },
//     // Include this column only in expanded rows
// },
    

    function groupAndCalculateBMName(data) {
        const groupedData = data.reduce((acc, item) => {
            const key = `${item.BMName}-${item[`${newtime}Date`]}`;

            if (!acc[key]) {
                acc[key] = {
                    BMName: item.BMName,
                    [`${newtime}Date`]: item[`${newtime}Date`],
                    estimated_revenue: 0,
                    spend: 0,
                    conversions: 0,
                    fbLeads: 0,
                };
            }

            acc[key].estimated_revenue += item.estimated_revenue;
            acc[key].spend += parseFloat(item.spend);
            acc[key].conversions += item.conversions || 0;  // Default to 0 if undefined
            acc[key].fbLeads += parseInt(item.fbLeads) || 0;        // Default to 0 if undefined

            return acc;
        }, {});

        return Object.values(groupedData).map(item => ({
            ...item,
            profit: item.estimated_revenue - item.spend,
            margin: item.estimated_revenue > 0 ? ((item.estimated_revenue - item.spend) / item.estimated_revenue) * 100 : 0,
            rpc: item.conversions > 0 ? (item.estimated_revenue / item.conversions) : 0, // Revenue per Conversion
            cpl: item.fbLeads > 0 ? (item.spend / item.fbLeads) : 0,  // Cost per Lead
        }));
    }
    // if (fetchData.status === 200 && mainData.length > 0) {
    //     try {
    //         const commentFetch = await axios.get(`https://prodapis.adsgoat.in/Comments/${account}`, {
    //             headers: {
    //                 Authorization: token,
    //             },
    //         });
    //         campaignComments = commentFetch.data; // Set comments only if fetched successfully
    //     } catch (error) {
    //         console.error('Error fetching comments:', error); // Log any errors fetching comments
    //     }
    // }
    // setCampaignComments(campaignComments);
   


    
    // console.log(mainData, "maindata of functinCall1");


        // const getValidValue = mainData.filter(item => item.fbCron !== null && item.revenueCron !== null)

        // // console.log(getValidValue[0])


        // if (mainData.length > 1) {
        //     timezone.current = mainData[0].accountTimezone;
        //     accountStatus.current = mainData[0].accountStatus;
        //     cronStatus.current = mainData[0].cronStatus;
        //     fbCron.current = getValidValue[0].fbCron;
        //     revenueCron.current = getValidValue[0].revenueCron;
        //     maxHour.current = findMaxHour(mainData);
        //     maxNetworkHour.current = getMaxHour(mainData);
        // }

            // const totalValue = {
            //     adsetname: "Total",
            //     date: input,
            //     adsetid: '',
            //     compaignid: '',
            //     spend: (Math.round(totalSpend*100)/100).toString(),
            //     revenue: (Math.round(totalRevenue*100)/100).toString(),
            //     profit: (Math.round(totalProfit*100)/100).toString(),
            //     margin: `${(Math.round((((totalRevenue-totalSpend)/totalRevenue)*100)*100)/100)}%`,
            //     rpc: (Math.round((totalRevenue/totalConversions)*100)/100).toString(),
            //     cpl:(Math.round((totalSpend/totalFbleads)*100)/100).toString(),
            //     ncpl:(Math.round((totalSpend/totalConversions)*100)/100).toString(),
            //     roi: `${(Math.round((((totalRevenue-totalSpend)/totalSpend)*100)*100)/100)}%`,
            //     cpc: (Math.round((totalCpc/mainData.length)*100)/100).toString(),
            //     fbleads: totalFbleads.toString(),
            //     fbclicks: totalFbclicks.toString(),
            //     impressions: totalImpressions.toString(),
            //     conversions: totalConversions.toString(),
            //     fmargin: `${(Math.round((((totalProfit)/(totalFbleads*(totalRevenue/totalConversions)))*100)*100)/100)}%`,
            //     ctr: `${(Math.round(((totalFbclicks/totalImpressions)*100)*100)/100)}%`,
            // }
            // console.log(totalValue);


    const campaignNamesDataForDActiveDaily = async () => {
        try {
            const fetchData = await apiClient.get(`/Daily/CampaignName?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}`);
            const mainData = fetchData.data;
            // console.log(mainData, "mainData of functionCall2");
            let totalSpend = 0;
            let totalRevenue = 0;
            let totalProfit = 0;
            let totalCpc = 0;
            let totalFbleads = 0;
            let totalFbclicks = 0;
            let totalImpressions = 0;
            let totalConversions = 0;
            const specifiedTimeZone = selectTimezone[time];
            // console.log(mainData[0], "one");
            const totalRow = mainData && mainData.length > 0 ?
                mainData.map((eachData) => {
                    const Revenue = eachData.estimated_revenue !== undefined ? (eachData.estimated_revenue) : 0;
                    const profit = (Revenue - eachData.spend);
                    const conversions = eachData.conversions !== undefined ? eachData.conversions : 0;
                    totalRevenue += Revenue;
                    totalSpend += parseFloat(eachData.spend);
                    totalProfit += profit;
                    totalConversions += conversions;
                    totalCpc += eachData.cpc;
                    totalFbclicks += eachData.fbClicks;
                    totalFbleads += eachData.fbLeads;
                    totalImpressions += eachData.impressions;
                }) : null;
            // const totalValue = {
            //     adsetname: "Total",
            //     date: input,
            //     adsetid: '',
            //     compaignid: '',
            //     spend: (Math.round(totalSpend*100)/100).toString(),
            //     revenue: (Math.round(totalRevenue*100)/100).toString(),
            //     profit: (Math.round(totalProfit*100)/100).toString(),
            //     margin: `${(Math.round((((totalRevenue-totalSpend)/totalRevenue)*100)*100)/100)}%`,
            //     rpc: (Math.round((totalRevenue/totalConversions)*100)/100).toString(),
            //     cpl:(Math.round((totalSpend/totalFbleads)*100)/100).toString(),
            //     ncpl:(Math.round((totalSpend/totalConversions)*100)/100).toString(),
            //     roi: `${(Math.round((((totalRevenue-totalSpend)/totalSpend)*100)*100)/100)}%`,
            //     cpc: (Math.round((totalCpc/mainData.length)*100)/100).toString(),
            //     fbleads: totalFbleads.toString(),
            //     fbclicks: totalFbclicks.toString(),
            //     impressions: totalImpressions.toString(),
            //     conversions: totalConversions.toString(),
            //     fmargin: `${(Math.round((((totalProfit)/(totalFbleads*(totalRevenue/totalConversions)))*100)*100)/100)}%`,
            //     ctr: `${(Math.round(((totalFbclicks/totalImpressions)*100)*100)/100)}%`,
            // }
            // console.log(totalValue);
            const filteredData = mainData && mainData.length > 0 ?
                mainData.map((eachData) => {
                    const Revenue = eachData.estimated_revenue !== undefined ? (eachData.estimated_revenue) : 0;
                    const profit = Math.round((Revenue - eachData.spend) * 100) / 100;
                    const margin = Revenue !== 0 ? `${Math.round((((Revenue - eachData.spend) / eachData.estimated_revenue) * 100) * 100) / 100}%` : '0%'
                    let rpc = eachData.conversions !== 0 ? (Math.round((Revenue / eachData.conversions) * 100) / 100) : 0;
                    const revenue = ((eachData.estimated_revenue - eachData.spend) / (eachData.fbLeads * rpc)) * 100;
                    let fMargin = revenue !== 0 ? Math.round(((profit / revenue) * 100) * 100) / 100 : 0;
                    const cpl = eachData.fbLeads !== 0 ? Math.round((eachData.spend / eachData.fbLeads) * 100) / 100 : 0;
                    let ncpl = eachData.conversions !== 0 ? Math.round((eachData.spend / eachData.conversions) * 100) / 100 : 0;
                    const roi = eachData.spend !== 0 ? `${Math.round((((Revenue - eachData.spend) / eachData.spend) * 100) * 100) / 100}%` : '0%';
                    const ctr = eachData.impressions !== 0 ? `${Math.round(((eachData.fbClicks / eachData.impressions) * 100) * 100) / 100}%` : '0%';
                    const mainRvenue = ((Math.round(Revenue * 100) / 100)).toString();
                    const conversions = eachData.conversions !== undefined ? eachData.conversions : '0';
                    rpc = !isNaN(rpc) ? rpc : 0;
                    ncpl = !isNaN(ncpl) ? ncpl : 0;
                    fMargin = !isNaN(fMargin) ? `${fMargin}%` : '0%';

                    // console.log(eachData.campaign_name, "campaign_name");
                    return (
                        {
                            campaignname: eachData.campaign_name,
                            adsetname: eachData.adsetName,
                            date: eachData[specifiedTimeZone],
                            'fb-hour': eachData.campaign_id,
                            'mnet-hour': eachData.campaign_id,
                            spend: parseFloat(eachData.spend),
                            revenue: parseFloat(mainRvenue),
                            profit: parseFloat(profit),
                            margin: margin,
                            fbleads: parseInt(eachData.fbLeads),
                            conversions: parseInt(conversions),
                            cpc: parseFloat(eachData.cpc),
                            fbclicks: parseInt(eachData.fbClicks),
                            impressions: parseInt(eachData.impressions),
                            ctr: ctr,
                            rpc: parseFloat(rpc),
                            cpl: parseFloat(cpl),
                            ncpl: parseFloat(cpl),
                            roi: roi,
                            fmargin: fMargin,
                            campaignid: eachData.campaign_id,
                            adsetid: eachData.adset_id,
                            timezone: 'UTC',
                            actions: '...'
                            // compaignid: eachData.campaign_id,
                        }
                    )
                }) : null;
            // console.log(filteredData[0],"one");
            // console.log(filteredData, "filter");

            const fullData = filteredData?.length > 0 ? [...filteredData] : [];
            // console.log(fullData, "full");

            // setDailyColumn(columnDefs);
            setCampaignNamesDActiveDaily(fullData);
            newCampaignNamesDActiveDaily.current = fullData;
            setCampaignNamesDActiveDailyLoading(false);
            setCampaignNamesDActiveFixedFooterDaily([
                {
                    campaignname: 'Total',
                    spend: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0).toFixed(2)),
                    revenue: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0).toFixed(2)),
                    profit: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0).toFixed(2)),
                    margin: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
                    rpc: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr?.rpc), 0) / fullData?.length).toFixed(2)),
                    cpl: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr?.cpl), 0) / fullData?.length).toFixed(2)),
                    ncpl: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr?.ncpl), 0) / fullData?.length).toFixed(2)),
                    fbleads: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
                    conversions: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
                    fmargin: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                    roi: parseFloat(((fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                    cpc: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / fullData?.length).toFixed(2)),
                    fbclicks: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
                    impressions: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
                    ctr: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
                }
            ]);
        } catch (error) {
            console.log(error);
        }
    }

    const handleCustomerServiceClick = () => {
        // console.log('Customer Service button clicked');
        setActiveTab('2');
        carouselRef.current.goTo(1); // Change to the first slide
    };

    const handleCommentClick = () => {
        // console.log('Comment button clicked');
        setActiveTab('1');
        carouselRef.current.goTo(0); // Change to the second slide
    };

    const handleCommentClick1 = () => {
        // console.log('Comment button clicked');
        setActiveTab('3');
        carouselRef.current.goTo(2);
    }

    // const onCellClickedLive = (event) => {

    //     if (event.colDef.field === 'adsetname') {
    //         const value = event.value;
    //         if(value !== undefined){
    //             const url = `/LiveHistory/LiveAdsetHistory/${value}-${account}-${time}-${revenuePratner}`;
    //             window.open(url, '_blank');
    //             console.log(`Adset clicked: ${value}`);
    //         }
    //     }

    // };
//setCampaignCommentssetCampaignCommentssetCampaignComments
    // useEffect(() => {
    //     fetchCampaignComments(); // Fetch comments on initial load
    // }, []); // Run this effect on component mount



    // const autoGroupColumnDefLive = {
    //     headerName: 'CampaignName',
    //     minWidth: 450,
    //     pinned: 'left',
    //     sortable: true, // Enable sorting

    //     comparator: (campaignA, campaignB) => {
    //         if (!campaignA) return 1;
    //         if (!campaignB) return -1;

    //         // Function to get the 'pinned' status of a campaign
    //         const getPinStatusForCampaign = (campaignName) => {
    //             const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //             return relatedComment ? relatedComment.pinned : false;
    //         };

    //         // Prioritize pinned campaigns first (pinned campaigns should come to the top)
    //         const isPinnedA = getPinStatusForCampaign(campaignA);
    //         const isPinnedB = getPinStatusForCampaign(campaignB);

    //         if (isPinnedA !== isPinnedB) {
    //             return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
    //         }

    //         // If both campaigns have the same pinned status, fall back to other sorting logic

    //         // For example: Prioritize by starred status
    //         const getStarredForCampaign = (campaignName) => {
    //             const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //             return relatedComment ? relatedComment.starred : false;
    //         };

    //         const isStarredA = getStarredForCampaign(campaignA);
    //         const isStarredB = getStarredForCampaign(campaignB);

    //         if (isStarredA !== isStarredB) {
    //             return isStarredA ? -1 : 1;  // Starred campaigns should come first
    //         }

    //         // Finally, fallback to alphabetical sorting if no pinned or starred criteria
    //         return campaignA.localeCompare(campaignB);
    //     },


    //     cellRendererParams: {
    //         suppressCount: false,
    //         innerRenderer: (params) => {
    //             if (params.node.footer) {
    //                 return 'Total';
    //             }

    //             const firstColumnValue = params.node.key;  // campaign name
    //             const campaignName = params.node.key;

    //             // Check if this is a grouped row and has children
    //             let campaignid, adsetid;

    //             if (params.node.group && params.node.childrenAfterGroup && params.node.childrenAfterGroup.length > 0) {
    //                 // Get the first child row data to extract campaignid and adsetid
    //                 const firstChild = params.node.childrenAfterGroup[0].data;
    //                 campaignid = firstChild.campaignid;
    //                 adsetid = firstChild.adsetid;
    //             } else if (params.data) {
    //                 // Fallback to individual row data if not grouped
    //                 campaignid = params.data.campaignid;
    //                 adsetid = params.data.adsetid;
    //             } else {
    //                 console.error('Missing campaignid or adsetid for campaign:', campaignName);
    //                 return (
    //                     <div style={{ color: 'red' }}>
    //                         Error: campaignid or adsetid missing for {campaignName}
    //                     </div>
    //                 );
    //             }

    //             const getEditedUserAndTime = (campaignName, newaccount) => {
    //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
    //                 // console.log(relatedStatus, "relatedStatus");
    //                 const relatedStatusEditedTime = relatedStatus ? relatedStatus : null;
    //                 // console.log(relatedStatusTrue);
    //                 return relatedStatusEditedTime;
    //             }

    //             const getStatusForCampaign = (campaignName, newaccount) => {
    //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
    //                 // console.log(relatedStatus, "relatedStatus");
    //                 const relatedStatusTrue = relatedStatus !== undefined && relatedStatus.status === true ? true : relatedStatus !== undefined ? false : null;
    //                 // console.log(relatedStatusTrue);
    //                 return relatedStatusTrue;
    //             }

    //             const getCommentForCampaign = (campaignName) => {
    //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //                 return relatedComment ? relatedComment.comment : null;
    //             };

    //             const getStarredForCampaign = (campaignName) => {
    //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //                 return relatedComment ? relatedComment.starred : false;
    //             };

    //             const getPinStatusForCampaign = (campaignName) => {
    //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //                 return relatedComment ? relatedComment.pinned : false;
    //             };

    //             const editUserANdTime = getEditedUserAndTime(campaignName, newaccount);
    //             const relatedStatus = getStatusForCampaign(campaignName, newaccount);
    //             const relatedComment = getCommentForCampaign(campaignName);
    //             const isStarred = getStarredForCampaign(campaignName);
    //             const valueWithCount = `${firstColumnValue}`;

    //             const [tooltipText, setTooltipText] = useState("Click to Copy");
    //             const [isModalVisibles, setIsModalVisibles] = useState(false);
    //             const [comment, setComment] = useState(relatedComment || '');
    //             const [starred, setStarred] = useState(isStarred);
    //             const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));

    //             const copyToClipboard = () => {
    //                 navigator.clipboard.writeText(firstColumnValue)
    //                     .then(() => {
    //                         setTooltipText("Copied!");
    //                         setTimeout(() => setTooltipText("Click to Copy"), 2000);
    //                     })
    //                     .catch(() => {
    //                         console.error('Failed to copy to clipboard');
    //                     });
    //             };

    //             const handleEditClick = () => {
    //                 setIsModalVisibles(true);
    //             };

    //             const sendNewCommentToAPI = async (logData) => {
    //                 try {
    //                     const response = await axios.post('https://prodapis.adsgoat.in/Comments', {
    //                         commentsdatas: logData,
    //                     }, {
    //                         headers: {
    //                             Authorization: token,
    //                         }
    //                     });

    //                     // console.log('Response from server:', response.data);
    //                 } catch (error) {
    //                     console.error('Error sending data to server:', error);
    //                 }
    //                 // console.log(logData);
    //             };

    //             const sendEditedCommentToAPI = async (logData) => {
    //                 try {
    //                     const response = await axios.post('https://prodapis.adsgoat.in/Comments/edit', {
    //                         campaignname: logData.campaignname,
    //                         comment: logData.comment,
    //                         Account: logData.Account,
    //                         adsetid: logData.adsetid,
    //                         campaignid: logData.campaignid,
    //                         status: true

    //                     }, {
    //                         headers: {
    //                             Authorization: token,
    //                         }
    //                     });
    //                     // console.log('Response from server (edited comment):', response.data);
    //                     return response.data;
    //                 } catch (error) {
    //                     console.error('Error sending edited comment to server:', error);
    //                     throw error;
    //                 }
    //                 // console.log(logData);
    //             };

    //             const sendStarStatusToAPI = async (campaignname, isStarred) => {
    //                 // console.log(campaignid);
    //                 // console.log(adsetid);
    //                 try {
    //                     const endpoint = isStarred ? 'https://prodapis.adsgoat.in/Star' : 'https://prodapis.adsgoat.in/Unstar';
    //                     const response = await axios.post(endpoint, {
    //                         campaignname: campaignname,
    //                         Account: account,
    //                         usercommit: userdetails?.email,
    //                         campaignid: campaignid, // Pass campaignid from grouped data
    //                         adsetid: adsetid // Pass adsetid from grouped data
    //                     }, {
    //                         headers: {
    //                             Authorization: token,
    //                         }
    //                     });
    //                     // console.log('Response from server (starred status):', response.data);
    //                 } catch (error) {
    //                     console.error('Error updating star status:', error);
    //                 }
    //             };

    //             const handleStarClick = async () => {
    //                 const updatedStarred = !starred;
    //                 setStarred(updatedStarred);
    //                 await sendStarStatusToAPI(firstColumnValue, updatedStarred);
    //                 message.success(updatedStarred ? "Campaign starred!" : "Campaign unstarred!");

    //                 const updatedComments = campaignComments.map(cmt =>
    //                     cmt.campaignname === firstColumnValue ? { ...cmt, starred: updatedStarred } : cmt
    //                 );
    //                 setCampaignComments(updatedComments);
    //                 changeRRefrst();
    //             };

    //             const handleOks = async () => {
    //                 try {
    //                     const logData = {
    //                         Account: newaccount,
    //                         usercommit: userdetails?.email,
    //                         campaignname: firstColumnValue,
    //                         comment: comment,
    //                         campaignid: campaignid, // Pass campaignid
    //                         adsetid: adsetid // Pass adsetid
    //                     };

    //                     if (relatedComment) {
    //                         await sendEditedCommentToAPI(logData);
    //                         message.success("Comment updated successfully!");
    //                     } else {
    //                         await sendNewCommentToAPI(logData);
    //                         message.success("New comment added successfully!");
    //                     }

    //                     const updatedComments = relatedComment
    //                         ? campaignComments.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
    //                         : [...campaignComments, logData];
    //                     setCampaignComments(updatedComments);

    //                     changeRRefrst();
    //                     setIsModalVisibles(false);
    //                 } catch (error) {
    //                     console.error('Error while submitting comment:', error);
    //                     message.error("Error while submitting the comment.");
    //                 }
    //             };

    //             const handleCancels = () => {
    //                 setIsModalVisibles(false);
    //             };

    //             const CustomTooltipContent = ({ editedTime, usercommit }) => (
    //                 <div style={{ padding: '5px', borderRadius: '5px' }}>
    //                     <p style={{ margin: 0, color: "#ffffff" }}>{usercommit}</p>
    //                     <p style={{ margin: 0, color: "#ffffff" }}>{editedTime}</p>
    //                 </div>
    //             );

    //             const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
    //                 const updatedPinStatus = !currentPinStatus;

    //                 try {
    //                     let response;
    //                     if (updatedPinStatus) {
    //                         response = await axios.post('https://prodapis.adsgoat.in/Pin', {
    //                             campaignname: campaignName,
    //                             Account: account,
    //                             campaignid: campaignid,
    //                             adsetid: adsetid,
    //                             usercommit: userdetails?.email,
    //                             comment: comment || ''
    //                         }, { headers: { Authorization: token } });

    //                         message.success("Campaign pinned!");
    //                     } else {
    //                         response = await axios.post('https://prodapis.adsgoat.in/Unpin', {
    //                             campaignname: campaignName,
    //                             Account: account,
    //                             campaignid: campaignid,
    //                             adsetid: adsetid
    //                         }, { headers: { Authorization: token } });

    //                         message.success("Campaign unpinned!");
    //                     }

    //                     const updatedComments = campaignComments.some(cmt => cmt.campaignname === campaignName)
    //                         ? campaignComments.map(cmt =>
    //                             cmt.campaignname === campaignName ? { ...cmt, pinned: updatedPinStatus } : cmt
    //                         )
    //                         : [...campaignComments, { campaignname: campaignName, pinned: updatedPinStatus }];

    //                     // Update pinned campaigns to stay at the top
    //                     const sortedComments = updatedComments.sort((a, b) => b.pinned - a.pinned);
    //                     setCampaignComments(sortedComments);
    //                     setPinned(updatedPinStatus);
    //                 } catch (error) {
    //                     console.error('Error toggling pin status:', error);
    //                     message.error('Error while updating pin status.');
    //                 }
    //             };

    //             const PinIcon = ({ campaignName, campaignid, adsetid, pinned }) => {
    //                 return (
    //                     <div onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}>
    //                         {pinned ? (
    //                             <PushpinFilled style={{ color: 'blue' }} />  // Blue for pinned
    //                         ) : (
    //                             <PushpinOutlined style={{ color: 'gray' }} />  // Gray for unpinned
    //                         )}
    //                     </div>
    //                 );
    //             };

    //             return (
    //                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
    //                     <PinIcon
    //                         campaignName={campaignName}
    //                         campaignid={campaignid}
    //                         adsetid={adsetid}
    //                         // pinned={getPinStatusForCampaign(campaignName)}
    //                         pinned={pinned}
    //                     />
    //                     {relatedStatus === true &&
    //                         <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
    //                             <CheckCircleFilled style={{ color: 'green', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
    //                         </Tooltip>
    //                     }
    //                     {relatedStatus === false &&
    //                         <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
    //                             <CloseCircleFilled style={{ color: 'red', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
    //                         </Tooltip>
    //                     }
    //                     {relatedComment && (
    //                         starred ? (
    //                             <StarFilled className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px', color: "gold" }} />
    //                         ) : (
    //                             <StarOutlined className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px' }} />
    //                         )
    //                     )}
    //                     {relatedComment ? (
    //                         <Tooltip title={(
    //                             <div style={{ display: 'flex', alignItems: 'center' }}>
    //                                 <span>{relatedComment || 'No comment available'}</span>
    //                                 <EditOutlined onClick={handleEditClick} style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }} />
    //                             </div>
    //                         )}>
    //                             <MessageOutlined className='Message' style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: 'blue' }} />
    //                             <Tooltip title={tooltipText}></Tooltip>
    //                         </Tooltip>
    //                     ) : (
    //                         <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
    //                     )}
    //                     <Tooltip title={tooltipText}>
    //                         <CopyOutlined
    //                             onClick={copyToClipboard}
    //                             style={{ cursor: 'pointer', marginLeft: '8px', color: "#1e1e1f", marginRight: '10px' }}
    //                         />
    //                     </Tooltip>
    //                     <span
    //                         onClick={() => {
    //                             const url = `/LiveHistory/LiveCampaignHistory/${params.value}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
    //                             window.open(url, '_blank');
    //                         }}
    //                     >
    //                         {valueWithCount}
    //                     </span>
    //                     <Modal
    //                         title={firstColumnValue}
    //                         visible={isModalVisibles}
    //                         onOk={handleOks}
    //                         onCancel={handleCancels}
    //                     >
    //                         <Input.TextArea
    //                             placeholder="Enter your comments here"
    //                             value={comment}
    //                             onChange={(e) => setComment(e.target.value)}
    //                         />
    //                     </Modal>
    //                 </div>
    //             );
    //         }
    //     }
    // }; tech modified 

    // const updatedComments = campaignComments.some(cmt => cmt.campaignname === campaignName)
    //     ? campaignComments.map(cmt =>
    //         cmt.campaignname === campaignName ? { ...cmt, pinned: updatedPinStatus } : cmt
    //     )
    //     : [...campaignComments, { campaignname: campaignName, pinned: updatedPinStatus }];


    {/* {relatedStatus === true &&
        <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
            <CheckCircleFilled style={{ color: 'green', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
        </Tooltip>
    }
    {relatedStatus === false &&
        <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
            <CloseCircleFilled style={{ color: 'red', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
        </Tooltip>
    } */}

    {/* <Modal
        title={firstColumnValue}
        visible={isModalVisibles}
        onOk={handleOks}
        onCancel={handleCancels}
        footer={[
            <Button
                key="delete"
                type="danger"
                onClick={handleDelete}
            >
                Delete
            </Button>,
        ]}
    >
        <Input.TextArea
            placeholder="Enter your comments here"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
        />
        <div style={{display: 'flex',justifyContent: 'flex-end', flexDirection: 'column'}}>
            <Button
                type="danger"
                onClick={handleDelete}
            >
                Delete
            </Button>
        </div>
    </Modal> */}

    // comparator: (campaignA, campaignB) => {
    //     if (!campaignA) return 1;
    //     if (!campaignB) return -1;

    //     const getStarredForCampaign = (campaignName) => {
    //         const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //         return relatedComment ? relatedComment.starred : false;
    //     };

    //     const isStarredA = getStarredForCampaign(campaignA);
    //     const isStarredB = getStarredForCampaign(campaignB);

    //     if (isStarredA === isStarredB) {
    //         return campaignA.localeCompare(campaignB);
    //     }
    //     return isStarredA ? -1 : 1;
    // },

    // const getStarredForCampaign = (campaignName) => {
    //     const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //     return relatedComment ? relatedComment.starred : false;
    // };

    // const sendStarStatusToAPI = async (campaignname, isStarred) => {
    //     try {
    //         const endpoint = isStarred ? 'https://prodapis.adsgoat.in/Star' : 'https://prodapis.adsgoat.in/Unstar';
    //         const response = await axios.post(endpoint, {
    //             campaignname: campaignname,
    //             Account: account,
    //             usercommit: userdetails?.email,
    //             campaignid: campaignid,
    //             adsetid: adsetid
    //         }, {
    //             headers: {
    //                 Authorization: token,
    //             }
    //         });
    //         // console.log('Response from server (starred status):', response.data);
    //     } catch (error) {
    //         console.error('Error updating star status:', error);
    //     }
    // };

    // const handleStarClick = async () => {
    //     const updatedStarred = !starred;
    //     setStarred(updatedStarred);
    //     await sendStarStatusToAPI(firstColumnValue, updatedStarred);
    //     message.success(updatedStarred ? "Campaign starred!" : "Campaign unstarred!");

    //     const updatedComments = campaignComments.map(cmt =>
    //         cmt.campaignname === firstColumnValue ? { ...cmt, starred: updatedStarred } : cmt
    //     );
    //     setCampaignComments(updatedComments);
    //     changeRRefrst();
    // };

    // const updatedComments = campaignComments.some(cmt => cmt.campaignname === campaignName)
    //     ? campaignComments.map(cmt =>
    //         cmt.campaignname === campaignName ? { ...cmt, pinned: updatedPinStatus } : cmt
    //     )
    //     : [...campaignComments, { campaignname: campaignName, pinned: updatedPinStatus }];

    {/* {relatedStatus === true &&
        <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
            <CheckCircleFilled style={{ color: 'green', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
        </Tooltip>
    }
    {relatedStatus === false &&
        <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
            <CloseCircleFilled style={{ color: 'red', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
        </Tooltip>
    } */}
    {/* {relatedComment && (
        starred ? (
            <StarFilled className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px', color: "gold" }} />
        ) : (
            <StarOutlined className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px' }} />
        )
    )} */}
    {/* <Modal
        title={firstColumnValue}
        visible={isModalVisibles}
        onOk={handleOks}
        onCancel={handleCancels}
    >
        <Input.TextArea
            placeholder="Enter your comments here"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
        />
    </Modal> */}

    // comparator: (campaignA, campaignB) => {
    //     if (!campaignA) return 1;
    //     if (!campaignB) return -1;

    //     // Function to get the 'pinned' status of a campaign
    //     const getPinStatusForCampaign = (campaignName) => {
    //         const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //         return relatedComment ? relatedComment.pinned : false;
    //     };

    //     // Prioritize pinned campaigns first (pinned campaigns should come to the top)
    //     const isPinnedA = getPinStatusForCampaign(campaignA);
    //     const isPinnedB = getPinStatusForCampaign(campaignB);

    //     if (isPinnedA !== isPinnedB) {
    //         return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
    //     }

    //     // If both campaigns have the same pinned status, fall back to other sorting logic

    //     // For example: Prioritize by starred status
    //     const getStarredForCampaign = (campaignName) => {
    //         const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //         return relatedComment ? relatedComment.starred : false;
    //     };

    //     const isStarredA = getStarredForCampaign(campaignA);
    //     const isStarredB = getStarredForCampaign(campaignB);

    //     if (isStarredA !== isStarredB) {
    //         return isStarredA ? -1 : 1;  // Starred campaigns should come first
    //     }

    //     // Finally, fallback to alphabetical sorting if no pinned or starred criteria
    //     return campaignA.localeCompare(campaignB);
    // },

    // const getStarredForCampaign = (campaignName) => {
    //     const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //     return relatedComment ? relatedComment.starred : false;
    // };

    // const sendStarStatusToAPI = async (campaignname, isStarred) => {
    //     try {
    //         const endpoint = isStarred ? 'https://prodapis.adsgoat.in/Star' : 'https://prodapis.adsgoat.in/Unstar';
    //         const response = await axios.post(endpoint, {
    //             campaignname: campaignname,
    //             Account: account,
    //             usercommit: userdetails?.email,
    //             campaignid: campaignid,
    //             adsetid: adsetid
    //         }, {
    //             headers: {
    //                 Authorization: token,
    //             }
    //         });
    //         console.log('Response from server (starred status):', response.data);
    //     } catch (error) {
    //         console.error('Error updating star status:', error);
    //     }
    // };

    // const handleStarClick = async () => {
    //     const updatedStarred = !starred;
    //     setStarred(updatedStarred);
    //     await sendStarStatusToAPI(firstColumnValue, updatedStarred);
    //     message.success(updatedStarred ? "Campaign starred!" : "Campaign unstarred!");

    //     const updatedComments = campaignComments.map(cmt =>
    //         cmt.campaignname === firstColumnValue ? { ...cmt, starred: updatedStarred } : cmt
    //     );
    //     setCampaignComments(updatedComments);
    //     changeRRefrst();
    // };

    // const updatedComments = campaignComments.some(cmt => cmt.campaignname === campaignName)
    //     ? campaignComments.map(cmt =>
    //         cmt.campaignname === campaignName ? { ...cmt, pinned: updatedPinStatus } : cmt
    //     )
    //     : [...campaignComments, { campaignname: campaignName, pinned: updatedPinStatus }];

    {/* {relatedStatus === true &&
        <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
            <CheckCircleFilled style={{ color: 'green', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
        </Tooltip>
    }
    {relatedStatus === false &&
        <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
            <CloseCircleFilled style={{ color: 'red', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
        </Tooltip>
    } */}
    {/* {relatedComment && (
        starred ? (
            <StarFilled className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px', color: 'gold' }} />
        ) : (
            <StarOutlined className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px' }} />
        )
    )} */}
    {/* <Modal
        title={firstColumnValue}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
    >
        <Input.TextArea
            placeholder="Enter your comments here"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
        />
    </Modal> */}
    {/* {relatedStatus === true &&
        <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
            <CheckCircleFilled style={{ color: 'green', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
        </Tooltip>
    }
    {relatedStatus === false &&
        <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
            <CloseCircleFilled style={{ color: 'red', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
        </Tooltip>
    } */}

    // const gridOptions4 = {
    //     onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid5'),
    //     defaultColDef: {
    //         suppressMenu: true,
    //         headerClass: "custom-header" // Apply to all columns by default

    //     }
    // };

    const gridOptions4 = {
        groupUseEntireRow: true,  // Ensure the entire row is used for grouping
        groupSuppressAutoColumn: true, // Hide the auto group column
    };







    // const pinnedBottomRowData1 = [
    //     {
    //         campaignName: 'Total',
    //         spend: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
    //         revenue: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
    //         profit: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
    //         margin: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / rowData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
    //         rpc: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / rowData?.length).toFixed(2)),
    //         cpl: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / rowData?.length).toFixed(2)),
    //         ncpl: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / rowData?.length).toFixed(2)),
    //         fbleads: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
    //         conversions: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
    //         fmargin: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / rowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
    //         roi: parseFloat(((rowData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - rowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / rowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
    //         cpc: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / rowData?.length).toFixed(2)),
    //         fbclicks: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
    //         impressions: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
    //         ctr: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / rowData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
    //     }
    // ];

    // const pinnedBottomRowData2 = [
    //     {
    //         campaignName: 'Total',
    //         spend: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
    //         revenue: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
    //         profit: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
    //         margin: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
    //         rpc: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / dailyData.length).toFixed(2)),
    //         cpl: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / dailyData.length).toFixed(2)),
    //         ncpl: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / dailyData.length).toFixed(2)),
    //         fbleads: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
    //         conversions: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
    //         fmargin: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
    //         roi: parseFloat(((dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
    //         cpc: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / dailyData.length).toFixed(2)),
    //         fbclicks: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
    //         impressions: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
    //         ctr: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
    //     }
    // ];

    // const pinnedBottomRowData3 = (campaignData) =>{
    //     return([
    //         {
    //             campaignName: 'Total',
    //             spend: campaignData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0),
    //             revenue: campaignData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0),
    //             profit: campaignData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0),
    //             margin: `${(campaignData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / campaignData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)}%`,
    //             rpc: campaignData.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / campaignData.length,
    //             cpl: campaignData.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / campaignData.length,
    //             ncpl: campaignData.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / campaignData.length,
    //             fbleads: campaignData.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
    //             conversions: campaignData.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0),
    //             fmargin: `${(campaignData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / campaignData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)}%`,
    //             roi: `${(campaignData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - campaignData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / campaignData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100}%`,
    //             cpc: campaignData.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / campaignData.length,
    //             fbclicks: campaignData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0),
    //             impressions: campaignData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0),
    //             ctr: `${(campaignData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / campaignData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)}%`
    //         }
    //     ]);
    // };

    // console.log(fixedFooter, "fixed");


    // console.log(dailyData, "Daily");
    {/* <Col xs={24} sm={24} md={15} lg={5}>
        <Tooltip title="Refresh and Search">
            <Button
                type="primary"
                shape="circle"
                style={{ backgroundColor: '#C7F39A', border: 'solid 1px #C7F39A', color: 'black', fontWeight: '600', float: 'inline-end' }}
                icon={<SubnodeOutlined />}
                onClick={handleSearchClick} // Toggle search bar visibility on button click
            />
        </Tooltip>
    </Col> */}
    {/* <div className={`secondRow ${isSecondRowVisible ? '' : 'hidden'}`}>
        <Row style={{ padding: '10px', paddingRight: '30px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                <Text style={{ fontWeight: '600', display: 'flex', justifyContent: 'flex-end' }}>
                    FbAcc Status: {`${fbCron.current}`}
                </Text>
            </Col>
            <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                <Text style={{ fontWeight: '600', display: 'flex', justifyContent: 'flex-end', marginRight: '20%' }}>
                    RevAcc Status: {`${revenueCron.current}`}
                </Text>
            </Col>
            <Col style={{ marginRight: '15px' }}>
                {isSearching ? (
                <Row gutter={8}>
                    <Col>
                        <Input
                            placeholder="Search here"
                            autoFocus
                            value={inputValue}
                            onChange={handleChangeInput}
                            onBlur={handleBlur}
                            style={{ width: '100%', borderRadius: '5px' }}
                        />
                    </Col>
                    <Col>
                        <Button icon={<SearchOutlined />} />
                    </Col>
                    
                </Row>
            ) : (
                <Button
                    icon={<SearchOutlined />}
                    onClick={handleSearchClick}

                />
            )}
                <Row gutter={8}>
                    <Col>
                        <Input
                            placeholder="Search here"
                            // autoFocus
                            value={newInputValue}
                            onChange={handleChangeNewInputValue}
                            onBlur={handleBlur}
                            onPressEnter={handleChangeInput}
                            style={{ width: '100%', borderRadius: '5px' }}
                        />
                    </Col>
                    <Col>
                        <Button style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<SearchOutlined />} onClick={handleChangeInput} />
                    </Col>
                </Row>
            </Col>
            <Col>
                <Tooltip title="Click to Refresh Tables">
                    <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<ReloadOutlined />} onClick={onClickRefresh} />
                </Tooltip>
            </Col>
        </Row>
    </div> */}

    // api.forEachNodeAfterFilterAndSort((node) => {
    //     if (!node.rowPinned) {
    //         filteredData.push(node.data);
    //     }
    // });

    {/* <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
        <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
            <Space align="center">
                <div className="blinking-circle-1"></div>
                <Text style={{ paddingLeft: '3px', fontSize: '15px', fontWeight: '600' }}>Live</Text>
            </Space>
        </Col>
        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
            <Text style={{ fontWeight: '600' }}>Acc: {newaccount}</Text>
        </Col>
        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
            <Text style={{ fontWeight: '600' }}>AccName: {newAccountName}</Text>
        </Col>
        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
            <Text style={{ fontWeight: '600' }}>Timezone: {timezone.current}</Text>
        </Col>
        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
            <Text style={{ fontWeight: '600' }}>F/N Hour: {maxHour.current}:00 / {maxNetworkHour.current}:00</Text>
        </Col>
        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
            <Text style={{ fontWeight: '600' }}>
                Cron/Acc status: {cronStatus.current} /{' '}
                <span style={{ color: accountStatus.current === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
                    {accountStatus.current}
                </span>
            </Text>
        </Col>
        <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
            <Tooltip title="Export to CSV">
                <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined />} onClick={onBtExport1} />
            </Tooltip>
        </Col>
    </Row> */}




            {/* <Draggable>
                <FloatButton.Group
                    trigger="hover"
                    type="primary"
                    style={{
                        position: 'fixed',
                        bottom: 20, // Distance from the bottom
                        right: 80,  // Distance from the right
                        opacity: 1,
                    }}
                    icon={<CustomerServiceOutlined />}
                >
                    <FloatButton icon={<ImHistory />} onClick={handleCommentClick1} />
                    <FloatButton icon={<FaDailymotion />} onClick={handleCustomerServiceClick} />
                    <FloatButton icon={<RiLiveFill />} onClick={handleCommentClick} />

                </FloatButton.Group>
            </Draggable> */}

            // const campaignNamesDataForDActiveLive = async()=>{
            //     try{
            //         const fetchData = await apiClient.get(`https://prodapis.adsgoat.in/Live?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=Facebook_DActive_Names`);
            //         const mainData = fetchData.data;
            //         const specifiedTimeZone = selectTimezone[time];
            //         const filteredData = mainData && mainData.length > 0 ?
            //         mainData.map((eachData) => {
            //             let revenueData;
            //             if (eachData.estimated_revenue === 0 || isNaN(eachData.estimated_revenue)) {
            //                 revenueData = 0;
            //             }
            //             else if (eachData.estimated_revenue === undefined) {
            //                 revenueData = 0;
            //             }
            //             else if (eachData.estimated_revenue === null) {
            //                 revenueData = 0;
            //             }
            //             else {
            //                 revenueData = eachData.estimated_revenue;
            //             }
            //             const profit = (revenueData - eachData.spend).toFixed(2);
            //             let margin;
            //             if (revenueData === 0) {
            //                 margin = "0";
            //             }
            //             else {
            //                 margin = `${Math.round((((revenueData - eachData.spend) / revenueData) * 100) * 100) / 100}%`;
            //             }
            //             const rpc = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((revenueData / eachData.conversions) * 100) / 100;
        
            //             let cpl;
            //             if (eachData.fbLeads == 0) {
            //                 cpl = 0;
            //             } else {
            //                 cpl = Math.round((eachData.spend / eachData.fbLeads) * 100) / 100;
            //             }
            //             const ncpl = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((eachData.spend / eachData.conversions) * 100) / 100;
            //             // console.log(revenueData, "revenueData");
            //             const relatedComment = campaignComments.find(comment => comment.campaignname === eachData.campaign_name);
            //             return (
        
            //                 {
            //                     campaignname: eachData.campaign_name,
            //                     adsetname: eachData.adsetName,
            //                     date: eachData[specifiedTimeZone],
            //                     'fb-hour': eachData.hour,
            //                     'mnet-hour': eachData.updatedHour,
            //                     spend: parseFloat(eachData.spend),
            //                     revenue: revenueData ? revenueData : 0,
            //                     profit: parseFloat(profit),
            //                     margin: margin,
            //                     fbleads: parseInt(eachData.fbLeads),
            //                     conversions: eachData.conversions !== null && eachData.conversions !== 0 ? parseInt(eachData.conversions) : 0,
            //                     cpc: parseFloat(eachData.cpc),
            //                     fbclicks: parseInt(eachData.fbClicks),
            //                     impressions: parseInt(eachData.impressions),
            //                     rpc: parseFloat(rpc),
            //                     cpl: parseFloat(cpl),
            //                     ncpl: parseFloat(ncpl),
            //                     adsetid: eachData.adset_id,
            //                     campaignid: eachData.campaign_id,
            //                     timezone: eachData[time],
            //                     comment: relatedComment ? relatedComment.comment : null,
            //                     actions: '...'
            //                 }
            //             )
            //         })
            //         : null;
            //         // console.log(filteredData);
            //         setCampaignNamesDActiveLive(filteredData);
            //         newCampaignNamesDActiveLive.current = filteredData;
            //         setCampaignNamesDActiveLiveLoading(false);
            //         setCampaignNamesDActiveFixedFooterLive([
            //             {
            //                 campaignname: 'Total',
            //                 spend: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
            //                 revenue: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
            //                 profit: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
            //                 margin: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
            //                 rpc: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / filteredData?.length).toFixed(2)),
            //                 cpl: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / filteredData?.length).toFixed(2)),
            //                 ncpl: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / filteredData?.length).toFixed(2)),
            //                 fbleads: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
            //                 conversions: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
            //                 fmargin: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
            //                 roi: parseFloat(((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
            //                 cpc: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / filteredData?.length).toFixed(2)),
            //                 fbclicks: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
            //                 impressions: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
            //                 ctr: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
            //             }
            //         ]);
            //     }catch(error){
            //         console.log(error);
            //     }
            // };
            // const autoGroupColumnDefLive = {
            //     headerName: 'Campaign-Name',
            //     minWidth: 450,
            //     pinned: 'left',
            //     sortable: true, // Enable sorting
        
            //     comparator: (campaignA, campaignB) => {
            //         if (!campaignA) return 1;
            //         if (!campaignB) return -1;
        
            //         // Function to get the 'pinned' status of a campaign
            //         const getPinStatusForCampaign = (campaignName) => {
            //             const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
            //             return relatedComment ? relatedComment.pinned : false;
            //         };
        
            //         // Prioritize pinned campaigns first (pinned campaigns should come to the top)
            //         const isPinnedA = getPinStatusForCampaign(campaignA);
            //         const isPinnedB = getPinStatusForCampaign(campaignB);
        
            //         if (isPinnedA !== isPinnedB) {
            //             return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
            //         }
        
            //         // If both campaigns have the same pinned status, fallback to alphabetical sorting
            //         return campaignA.localeCompare(campaignB);
            //     },
            //     cellRendererParams: {
            //         suppressCount: false,
            //         innerRenderer: (params) => {
            //             if (params.node.footer) {
            //                 return 'Total';
            //             }
            //             // console.log(params.value, "value");
        
            //             const firstColumnValue = params.node.key;  // campaign name
            //             const campaignName = params.node.key;
        
            //             let campaignid, adsetid;
        
            //             if (params.node.group && params.node.childrenAfterGroup && params.node.childrenAfterGroup.length > 0) {
            //                 const firstChild = params.node.childrenAfterGroup[0].data;
            //                 campaignid = firstChild.campaignid;
            //                 adsetid = firstChild.adsetid;
            //             } else if (params.data) {
            //                 campaignid = params.data.campaignid;
            //                 adsetid = params.data.adsetid;
            //             } else {
            //                 console.error('Missing campaignid or adsetid for campaign:', campaignName);
            //                 return (
            //                     <div style={{ color: 'red' }}>
            //                         Error: campaignid or adsetid missing for {campaignName}
            //                     </div>
            //                 );
            //             }
        
            //             const getEditedUserAndTime = (campaignName, newaccount) => {
            //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
            //                 return relatedStatus ? relatedStatus : null;
            //             };
        
            //             const getPinEditedUserAndTime = (campaignName, newaccount) => {
            //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
            //                 return relatedStatus ? relatedStatus : null;
            //             };
        
            //             const getStatusForCampaign = (campaignName, newaccount) => {
            //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
            //                 return relatedStatus !== undefined && relatedStatus.status === true ? true : relatedStatus !== undefined ? false : null;
            //             };
        
            //             const getCommentForCampaign = (campaignName) => {
            //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
            //                 return relatedComment ? relatedComment.comment : null;
            //             };
        
            //             const getPinStatusForCampaign = (campaignName) => {
            //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
            //                 return relatedComment ? relatedComment.pinned : false;
            //             };
        
            //             const editUserANdTime = getEditedUserAndTime(campaignName, newaccount);
            //             const editPinUserANdTime = getPinEditedUserAndTime(campaignName, newaccount);
            //             const relatedStatus = getStatusForCampaign(campaignName, newaccount);
            //             const relatedComment = getCommentForCampaign(campaignName);
            //             const valueWithCount = `${firstColumnValue}`;
        
            //             const [tooltipText, setTooltipText] = useState("Click to Copy");
            //             const [isModalVisibles, setIsModalVisibles] = useState(false);
            //             const [comment, setComment] = useState(relatedComment || '');
            //             const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));
        
            //             const copyToClipboard = () => {
            //                 navigator.clipboard.writeText(firstColumnValue)
            //                     .then(() => {
            //                         setTooltipText("Copied!");
            //                         setTimeout(() => setTooltipText("Click to Copy"), 2000);
            //                     })
            //                     .catch(() => {
            //                         console.error('Failed to copy to clipboard');
            //                     });
            //             };
        
            //             const handleEditClick = () => {
            //                 setIsModalVisibles(true);
            //             };
        
            //             const sendNewCommentToAPI = async (logData) => {
            //                 try {
            //                     const response = await apiClient.post('/Comments', {
            //                         commentsdatas: logData,
            //                     });
            //                 } catch (error) {
            //                     console.error('Error sending data to server:', error);
            //                 }
            //             };
        
            //             const handleDelete = async () => {
            //                 try {
            //                     // Prepare the payload for the API call
            //                     const payload = {
            //                         campaignname: firstColumnValue,
            //                         Account: newaccount,
            //                         adsetid: adsetid,
            //                         campaignid: campaignid,
            //                     };
                        
            //                     // Call the backend API to delete the comment
            //                     const response = await apiClient.post('/Comments/delete', payload,
            //                         {
            //                             headers: { Authorization: token } 
            //                         }
            //                     );
                        
            //                     if (response.status === 200) {
            //                         // Remove the comment from the local state
            //                         const updatedComments = campaignComments.filter(
            //                             (comment) => comment.campaignname !== firstColumnValue
            //                         );
                        
            //                         // Update the state with the updated comments
            //                         setCampaignComments(updatedComments);
                        
            //                         // Refresh the table or any other UI component
            //                         // changeRRefrst();
                        
            //                         message.success('Comment deleted successfully!');
            //                         setIsModalVisibles(false); // Close the popup
            //                     } else {
            //                         message.error('Failed to delete the comment. Please try again.');
            //                     }
            //                 } catch (error) {
            //                     console.error('Error deleting the comment:', error);
            //                     message.error('Failed to delete the comment. Please try again.');
            //                 }
            //             };
                        
        
            //             const sendEditedCommentToAPI = async (logData) => {
            //                 try {
            //                     const response = await apiClient.post('/Comments/edit', {
            //                         campaignname: logData.campaignname,
            //                         comment: logData.comment,
            //                         Account: logData.Account,
            //                         adsetid: logData.adsetid,
            //                         campaignid: logData.campaignid,
            //                         status: true
        
            //                     });
            //                     return response.data;
            //                 } catch (error) {
            //                     console.error('Error sending edited comment to server:', error);
            //                     throw error;
            //                 }
            //             };
        
            //             const handleOks = async () => {
            //                 try {
            //                     const logData = {
            //                         Account: newaccount,
            //                         usercommit: userdetails?.email,
            //                         campaignname: firstColumnValue,
            //                         comment: comment,
            //                         campaignid: campaignid,
            //                         adsetid: adsetid
            //                     };
        
            //                     if (relatedComment) {
            //                         await sendEditedCommentToAPI(logData);
            //                         message.success("Comment updated successfully!");
            //                     } else {
            //                         await sendNewCommentToAPI(logData);
            //                         message.success("New comment added successfully!");
            //                     }
        
            //                     const updatedComments = relatedComment
            //                         ? campaignComments.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
            //                         : [...campaignComments, logData];
            //                     setCampaignComments(updatedComments);
        
            //                     changeRRefrst();
            //                     setIsModalVisibles(false);
            //                 } catch (error) {
            //                     console.error('Error while submitting comment:', error);
            //                     message.error("Error while submitting the comment.");
            //                 }
            //             };
        
            //             const handleCancels = () => {
            //                 setIsModalVisibles(false);
            //             };
        
            //             const CustomTooltipContent = ({ editedTime, usercommit }) => (
            //                 <div style={{ padding: '5px', borderRadius: '5px' }}>
            //                     <p style={{ margin: 0, color: "#ffffff" }}>{usercommit}</p>
            //                     <p style={{ margin: 0, color: "#ffffff" }}>{editedTime}</p>
            //                 </div>
            //             );
        
            //             const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
            //                 const updatedPinStatus = !currentPinStatus;
        
            //                 try {
            //                     let response;
            //                     if (updatedPinStatus) {
            //                         response = await apiClient.post('/Pin', {
            //                             campaignname: campaignName,
            //                             Account: account,
            //                             campaignid: campaignid,
            //                             adsetid: adsetid,
            //                             userPin: userdetails?.email,
            //                             comment: comment || ''
            //                         });
            //                         changeRRefrst();
        
            //                         message.success("Campaign pinned!");
            //                     } else {
            //                         response = await apiClient.post('/Unpin', {
            //                             campaignname: campaignName,
            //                             Account: account,
            //                             campaignid: campaignid,
            //                             adsetid: adsetid
            //                         });
            //                         changeRRefrst();
        
            //                         message.success("Campaign unpinned!");
            //                     }
        
            //                     // Update campaignComments with the new pinned status and edited user/time
            //                     const updatedComments = campaignComments.map(cmt =>
            //                         cmt.campaignname === campaignName
            //                             ? {
            //                                 ...cmt,
            //                                 pinned: updatedPinStatus,
            //                                 editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            //                                 userPin: userdetails?.email
            //                             }
            //                             : cmt
            //                     );
        
            //                     if (!campaignComments.some(cmt => cmt.campaignname === campaignName)) {
            //                         updatedComments.push({
            //                             campaignname: campaignName,
            //                             pinned: updatedPinStatus,
            //                             editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            //                             userPin: userdetails?.email
            //                         });
            //                     }
            //                     const sortedComments = updatedComments.sort((a, b) => b.pinned - a.pinned);
            //                     setCampaignComments(sortedComments);
            //                     setPinned(updatedPinStatus);
            //                 } catch (error) {
            //                     console.error('Error toggling pin status:', error);
            //                     message.error('Error while updating pin status.');
            //                 }
            //             };
        
            //             const PinIcon = ({ campaignName, campaignid, adsetid, pinned }) => {
            //                 return (
            //                     <Tooltip title={pinned ? <CustomTooltipContent editedTime={editPinUserANdTime?.editedPinTime} usercommit={editPinUserANdTime?.userPin} /> : null}>
            //                         <button
            //                             onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
            //                             style={{
            //                                 border: "none",
            //                                 background: "none",
            //                                 cursor: "pointer",
            //                                 fontSize: "16px",
            //                             }}
            //                         >
            //                             {pinned ? "📌" : "📍"}
            //                         </button>
            //                     </Tooltip>
            //                 );
            //             };
        
            //             return (
            //                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            //                     <PinIcon
            //                         campaignName={campaignName}
            //                         campaignid={campaignid}
            //                         adsetid={adsetid}
            //                         pinned={pinned}
            //                     />
            //                     <div style={{ marginLeft: '10px' }}>
            //                         {(() => {
            //                             // Find the matching campaign in the Camapignlevelstatus array
            //                             const campaignStatus = Camapignlevelstatus.find(statusObj => statusObj.name === campaignName);
        
            //                             if (campaignStatus) {
            //                                 const { status, start, end } = campaignStatus;
        
            //                                 // Tooltip content with start and end dates
            //                                 const tooltipContent = (
            //                                     <div>
            //                                         <p style={{ margin: 0 }}>Start: {start || 'N/A'}</p>
            //                                         <p style={{ margin: 0 }}>End: {end || 'N/A'}</p>
            //                                     </div>
            //                                 );
        
            //                                 if (status === 'PAUSED') {
            //                                     return (
            //                                         <Tooltip title={tooltipContent}>
            //                                             <PauseCircleOutlined style={{ color: 'orange', fontSize: '18px' }} />
            //                                         </Tooltip>
            //                                     );
            //                                 } else if (status === 'ACTIVE') {
            //                                     return (
            //                                         <Tooltip title={tooltipContent}>
            //                                             <CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} />
            //                                         </Tooltip>
            //                                     );
            //                                 } else {
            //                                     // Default for unknown status
            //                                     return (
            //                                         <Tooltip title={tooltipContent}>
            //                                             <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
            //                                         </Tooltip>
            //                                     );
            //                                 }
            //                             } else {
            //                                 // Fallback if no matching campaign is found
            //                                 return (
            //                                     <Tooltip title="No campaign data available">
            //                                         <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
            //                                     </Tooltip>
            //                                 );
            //                             }
            //                         })()}
            //                     </div>
            //                     {relatedComment && (
            //                         <Tooltip title={(
            //                             <div style={{ display: 'flex', alignItems: 'center' }}>
            //                                 <span>{relatedComment || 'No comment available'}</span>
            //                                 <EditOutlined onClick={handleEditClick} style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }} />
            //                             </div>
            //                         )}>
            //                             <MessageOutlined className='Message' style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: 'blue' }} />
            //                             <Tooltip title={tooltipText}></Tooltip>
            //                         </Tooltip>
            //                     )}
            //                     {!relatedComment && (
            //                         <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
            //                     )}
            //                     <Tooltip title={tooltipText}>
            //                         <CopyOutlined
            //                             onClick={copyToClipboard}
            //                             style={{ cursor: 'pointer', marginLeft: '8px', color: "#1e1e1f", marginRight: '10px' }}
            //                         />
            //                     </Tooltip>
            //                     <span
            //                         onClick={() => {
            //                             const url = `/LiveHistory/LiveCampaignHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
            //                             window.open(url, '_blank', 'noopener,noreferrer');
            //                         }}
            //                     >
            //                         {valueWithCount}
            //                     </span>
            //                     <Modal
            //                         title={firstColumnValue}
            //                         visible={isModalVisibles}
            //                         onOk={handleOks} // Default Ok button functionality
            //                         onCancel={handleCancels} // Default Cancel button functionality
            //                         footer={[
            //                             <Button
            //                                 key="delete"
            //                                 type="danger"
            //                                 onClick={handleDelete}
            //                                 style={{ marginRight: 'auto', border: "1px solid black" }} // Push Delete button to the far left
            //                             >
            //                                 Delete
            //                             </Button>,
            //                             <Button key="cancel" onClick={handleCancels}>
            //                                 Cancel
            //                             </Button>,
            //                             <Button key="ok" type="primary" onClick={handleOks}>
            //                                 Ok
            //                             </Button>,
            //                         ]}
            //                     >
            //                         <Input.TextArea
            //                             placeholder="Enter your comments here"
            //                             value={comment}
            //                             onChange={(e) => setComment(e.target.value)}
            //                         />
            //                     </Modal>
            //                 </div>
            //             );
            //         }
            //     }
            // };
        
            // const autoGroupColumnDef = {
            //     headerName: 'Campaign-Name',
            //     minWidth: 450,
            //     pinned: 'left',
            //     sortable: true, // Enable sorting
        
            //     comparator: (campaignA, campaignB) => {
            //         if (!campaignA) return 1;
            //         if (!campaignB) return -1;
        
            //         // Function to get the 'pinned' status of a campaign
            //         const getPinStatusForCampaign = (campaignName) => {
            //             const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
            //             return relatedComment ? relatedComment.pinned : false;
            //         };
        
            //         // Prioritize pinned campaigns first (pinned campaigns should come to the top)
            //         const isPinnedA = getPinStatusForCampaign(campaignA);
            //         const isPinnedB = getPinStatusForCampaign(campaignB);
        
            //         if (isPinnedA !== isPinnedB) {
            //             return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
            //         }
        
            //         // If both campaigns have the same pinned status, fallback to alphabetical sorting
            //         return campaignA.localeCompare(campaignB);
            //     },
        
            //     cellRendererParams: {
            //         suppressCount: false,
            //         innerRenderer: (params) => {
            //             if (params.node.footer) {
            //                 return 'Total';
            //             }
        
            //             const firstColumnValue = params.node.key;  // campaign name
            //             const campaignName = params.node.key;
        
            //             let campaignid, adsetid;
        
            //             if (params.node.group && params.node.childrenAfterGroup && params.node.childrenAfterGroup.length > 0) {
            //                 const firstChild = params.node.childrenAfterGroup[0].data;
            //                 campaignid = firstChild.campaignid;
            //                 adsetid = firstChild.adsetid;
            //             } else if (params.data) {
            //                 campaignid = params.data.campaignid;
            //                 adsetid = params.data.adsetid;
            //             } else {
            //                 console.error('Missing campaignid or adsetid for campaign:', campaignName);
            //                 return (
            //                     <div style={{ color: 'red' }}>
            //                         Error: campaignid or adsetid missing for {campaignName}
            //                     </div>
            //                 );
            //             }
            //             const getEditedUserAndTime = (campaignName, newaccount) => {
            //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
            //                 // console.log(relatedStatus, "relatedStatus");
            //                 const relatedStatusEditedTime = relatedStatus ? relatedStatus : null;
            //                 // console.log(relatedStatusTrue);
            //                 return relatedStatusEditedTime;
            //             }
        
            //             const getPinEditedUserAndTime = (campaignName, newaccount) => {
            //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
            //                 return relatedStatus ? relatedStatus : null;
            //             };
        
            //             const getStatusForCampaign = (campaignName, newaccount) => {
            //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
            //                 // console.log(relatedStatus, "relatedStatus");
            //                 const relatedStatusTrue = relatedStatus !== undefined && relatedStatus.status === true ? true : relatedStatus !== undefined ? false : null;
            //                 // console.log(relatedStatusTrue);
            //                 return relatedStatusTrue;
            //             }
        
            //             const getCommentForCampaign = (campaignName) => {
            //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
            //                 return relatedComment ? relatedComment.comment : null;
            //             };
        
            //             const getPinStatusForCampaign = (campaignName) => {
            //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
            //                 return relatedComment ? relatedComment.pinned : false;
            //             };
        
            //             const editUserANdTime = getEditedUserAndTime(campaignName, newaccount);
            //             const editPinUserANdTime = getPinEditedUserAndTime(campaignName, newaccount);
            //             const relatedStatus = getStatusForCampaign(campaignName, newaccount);
            //             const relatedComment = getCommentForCampaign(campaignName);
            //             // const isStarred = getStarredForCampaign(campaignName);
            //             const valueWithCount = `${firstColumnValue}`;
        
            //             const [tooltipText, setTooltipText] = useState("Click to Copy");
            //             const [isModalVisibles, setIsModalVisibles] = useState(false);
            //             const [comment, setComment] = useState(relatedComment || '');
            //             // const [starred, setStarred] = useState(isStarred);
            //             const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));
        
            //             const copyToClipboard = () => {
            //                 navigator.clipboard.writeText(firstColumnValue)
            //                     .then(() => {
            //                         setTooltipText("Copied!");
            //                         setTimeout(() => setTooltipText("Click to Copy"), 2000);
            //                     })
            //                     .catch(() => {
            //                         console.error('Failed to copy to clipboard');
            //                     });
            //             };
        
            //             const handleEditClick = () => {
            //                 setIsModalVisibles(true);
            //             };
        
            //             const sendNewCommentToAPI = async (logData) => {
            //                 try {
            //                     const response = await apiClient.post('/Comments', {
            //                         commentsdatas: logData,
            //                     });
            //                     // console.log('Response from server:', response.data);
            //                 } catch (error) {
            //                     console.error('Error sending data to server:', error);
            //                 }
            //             };
        
            //             const sendEditedCommentToAPI = async (logData) => {
            //                 try {
            //                     const response = await apiClient.post('/Comments/edit', {
            //                         campaignname: logData.campaignname,
            //                         comment: logData.comment,
            //                         Account: logData.Account,
            //                         adsetid: logData.adsetid,
            //                         campaignid: logData.campaignid,
            //                         status: true
            //                     });
            //                     // console.log('Response from server (edited comment):', response.data);
            //                     return response.data;
            //                 } catch (error) {
            //                     console.error('Error sending edited comment to server:', error);
            //                     throw error;
            //                 }
            //             };
        
            //             const handleDelete = async () => {
            //                 try {
            //                     // Prepare the payload for the API call
            //                     const payload = {
            //                         campaignname: firstColumnValue,
            //                         Account: newaccount,
            //                         adsetid: adsetid,
            //                         campaignid: campaignid,
            //                     };
                        
            //                     // Call the backend API to delete the comment
            //                     const response = await apiClient.post('/Comments/delete', payload,
            //                         {
            //                             headers: { Authorization: token } 
            //                         }
            //                     );
                        
            //                     if (response.status === 200) {
            //                         // Remove the comment from the local state
            //                         const updatedComments = campaignComments.filter(
            //                             (comment) => comment.campaignname !== firstColumnValue
            //                         );
                        
            //                         // Update the state with the updated comments
            //                         setCampaignComments(updatedComments);
                        
            //                         // Refresh the table or any other UI component
            //                         // changeRRefrst();
                        
            //                         message.success('Comment deleted successfully!');
            //                         setIsModalVisibles(false); // Close the popup
            //                     } else {
            //                         message.error('Failed to delete the comment. Please try again.');
            //                     }
            //                 } catch (error) {
            //                     console.error('Error deleting the comment:', error);
            //                     message.error('Failed to delete the comment. Please try again.');
            //                 }
            //             };
        
            //             const handleOks = async () => {
            //                 try {
            //                     const logData = {
            //                         Account: newaccount,
            //                         usercommit: userdetails?.email,
            //                         campaignname: firstColumnValue,
            //                         comment: comment,
            //                         campaignid: campaignid,
            //                         adsetid: adsetid
            //                     };
        
            //                     if (relatedComment) {
            //                         await sendEditedCommentToAPI(logData);
            //                         message.success("Comment updated successfully!");
            //                     } else {
            //                         await sendNewCommentToAPI(logData);
            //                         message.success("New comment added successfully!");
            //                     }
        
            //                     const updatedComments = relatedComment
            //                         ? campaignComments.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
            //                         : [...campaignComments, logData];
            //                     setCampaignComments(updatedComments);
        
            //                     changeRRefrst();
            //                     setIsModalVisibles(false);
            //                 } catch (error) {
            //                     console.error('Error while submitting comment:', error);
            //                     message.error("Error while submitting the comment.");
            //                 }
            //             };
        
            //             const handleCancels = () => {
            //                 setIsModalVisibles(false);
            //             };
        
            //             const CustomTooltipContent = ({ editedTime, usercommit }) => (
            //                 <div style={{ padding: '5px', borderRadius: '5px' }}>
            //                     <p style={{ margin: 0, color: "#ffffff" }}>{usercommit}</p>
            //                     <p style={{ margin: 0, color: "#ffffff" }}>{editedTime}</p>
            //                 </div>
            //             );
        
            //             const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
            //                 const updatedPinStatus = !currentPinStatus;
        
            //                 try {
            //                     let response;
            //                     if (updatedPinStatus) {
            //                         response = await apiClient.post('/Pin', {
            //                             campaignname: campaignName,
            //                             Account: account,
            //                             campaignid: campaignid,
            //                             adsetid: adsetid,
            //                             userPin: userdetails?.email,
            //                             comment: comment || ''
            //                         });
            //                         changeRRefrst();
        
            //                         message.success("Campaign pinned!");
            //                     } else {
            //                         response = await apiClient.post('/Unpin', {
            //                             campaignname: campaignName,
            //                             Account: account,
            //                             campaignid: campaignid,
            //                             adsetid: adsetid
            //                         });
            //                         changeRRefrst();
        
            //                         message.success("Campaign unpinned!");
            //                     }
        
            //                     // Update campaignComments with the new pinned status and edited user/time
            //                     const updatedComments = campaignComments.map(cmt =>
            //                         cmt.campaignname === campaignName
            //                             ? {
            //                                 ...cmt,
            //                                 pinned: updatedPinStatus,
            //                                 editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            //                                 userPin: userdetails?.email
            //                             }
            //                             : cmt
            //                     );
        
            //                     if (!campaignComments.some(cmt => cmt.campaignname === campaignName)) {
            //                         updatedComments.push({
            //                             campaignname: campaignName,
            //                             pinned: updatedPinStatus,
            //                             editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            //                             userPin: userdetails?.email
            //                         });
            //                     }
            //                     const sortedComments = updatedComments.sort((a, b) => b.pinned - a.pinned);
            //                     setCampaignComments(sortedComments);
            //                     setPinned(updatedPinStatus);
            //                 } catch (error) {
            //                     console.error('Error toggling pin status', error);
            //                     message.error('Error while updating pin status.');
            //                 }
            //             };
        
            //             const PinIcon = ({ campaignName, campaignid, adsetid, pinned }) => {
            //                 return (
            //                     <Tooltip title={pinned ? <CustomTooltipContent editedTime={editPinUserANdTime?.editedPinTime} usercommit={editPinUserANdTime?.userPin} /> : null}>
            //                         <button
            //                             onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
            //                             style={{
            //                                 border: "none",
            //                                 background: "none",
            //                                 cursor: "pointer",
            //                                 fontSize: "16px",
            //                             }}
            //                         >
            //                             {pinned ? "📌" : "📍"}
            //                         </button>
            //                     </Tooltip>
            //                 );
            //             };
        
            //             return (
            //                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            //                     <PinIcon
            //                         campaignName={campaignName}
            //                         campaignid={campaignid}
            //                         adsetid={adsetid}
            //                         // pinned={getPinStatusForCampaign(campaignName)}
            //                         pinned={pinned}
            //                     />
            //                     <div style={{ marginLeft: '10px' }}>
            //                         {(() => {
            //                             // Find the matching campaign in the Camapignlevelstatus array
            //                             const campaignStatus = Camapignlevelstatus.find(statusObj => statusObj.name === campaignName);
        
            //                             if (campaignStatus) {
            //                                 const { status, start, end } = campaignStatus;
        
            //                                 // Tooltip content with start and end dates
            //                                 const tooltipContent = (
            //                                     <div>
            //                                         <p style={{ margin: 0 }}>Start: {start || 'N/A'}</p>
            //                                         <p style={{ margin: 0 }}>End: {end || 'N/A'}</p>
            //                                     </div>
            //                                 );
        
            //                                 if (status === 'PAUSED') {
            //                                     return (
            //                                         <Tooltip title={tooltipContent}>
            //                                             <PauseCircleOutlined style={{ color: 'orange', fontSize: '18px' }} />
            //                                         </Tooltip>
            //                                     );
            //                                 } else if (status === 'ACTIVE') {
            //                                     return (
            //                                         <Tooltip title={tooltipContent}>
            //                                             <CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} />
            //                                         </Tooltip>
            //                                     );
            //                                 } else {
            //                                     // Default for unknown status
            //                                     return (
            //                                         <Tooltip title={tooltipContent}>
            //                                             <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
            //                                         </Tooltip>
            //                                     );
            //                                 }
            //                             } else {
            //                                 // Fallback if no matching campaign is found
            //                                 return (
            //                                     <Tooltip title="No campaign data available">
            //                                         <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
            //                                     </Tooltip>
            //                                 );
            //                             }
            //                         })()}
            //                     </div>
            //                     {relatedComment ? (
            //                         <Tooltip title={(
            //                             <div style={{ display: 'flex', alignItems: 'center' }}>
            //                                 <span>{relatedComment || 'No comment available'}</span>
            //                                 <EditOutlined onClick={handleEditClick} style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }} />
            //                             </div>
            //                         )}>
            //                             <MessageOutlined className='Message' style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: 'blue' }} />
            //                             <Tooltip title={tooltipText}></Tooltip>
            //                         </Tooltip>
            //                     ) : (
            //                         <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
            //                     )}
            //                     <Tooltip title={tooltipText}>
            //                         <CopyOutlined
            //                             onClick={copyToClipboard}
            //                             style={{ cursor: 'pointer', marginLeft: '8px', color: "#1e1e1f", marginRight: '10px' }}
            //                         />
            //                     </Tooltip>
            //                     <span
            //                         onClick={() => {
            //                             const url = `/DailyAndCampaignHistory/CampaignHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
            //                             window.open(url, '_blank', 'noopener,noreferrer');
            //                         }}
            //                     >
            //                         {valueWithCount}
            //                     </span>
            //                     <Modal
            //                         title={firstColumnValue}
            //                         visible={isModalVisibles}
            //                         onOk={handleOks} // Default Ok button functionality
            //                         onCancel={handleCancels} // Default Cancel button functionality
            //                         footer={[
            //                             <Button
            //                                 key="delete"
            //                                 type="danger"
            //                                 onClick={handleDelete}
            //                                 style={{ marginRight: 'auto', border: "1px solid black" }} // Push Delete button to the far left
            //                             >
            //                                 Delete
            //                             </Button>,
            //                             <Button key="cancel" onClick={handleCancels}>
            //                                 Cancel
            //                             </Button>,
            //                             <Button key="ok" type="primary" onClick={handleOks}>
            //                                 Ok
            //                             </Button>,
            //                         ]}
            //                     >
            //                         <Input.TextArea
            //                             placeholder="Enter your comments here"
            //                             value={comment}
            //                             onChange={(e) => setComment(e.target.value)}
            //                         />
            //                     </Modal>
            //                 </div>
            //             );
            //         }
            //     }
            // };
        
            // const autoGroupColumnDef2 = {
            //     headerName: 'Campaign-Name',
            //     minWidth: 450,
            //     pinned: 'left',
        
            //     comparator: (campaignA, campaignB) => {
            //         if (!campaignA) return 1;
            //         if (!campaignB) return -1;
            //         const getPinStatusForCampaign = (campaignName) => {
            //             const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
            //             return relatedComment ? relatedComment.pinned : false;
            //         };
            //         const isPinnedA = getPinStatusForCampaign(campaignA);
            //         const isPinnedB = getPinStatusForCampaign(campaignB);
        
            //         if (isPinnedA !== isPinnedB) {
            //             return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
            //         }
            //         return campaignA.localeCompare(campaignB);
            //     },
        
            //     cellRendererParams: {
            //         suppressCount: false, // Allow count to be shown
            //         innerRenderer: (params) => {
            //             if (params.node.footer) {
            //                 return 'Total'; // Custom footer label
            //             }
        
            //             const firstColumnValue = params.node.key; // This should give you the campaign name
            //             const campaignName = params.node.key;
        
            //             let campaignid, adsetid;
        
            //             if (params.node.group && params.node.childrenAfterGroup && params.node.childrenAfterGroup.length > 0) {
            //                 const firstChild = params.node.childrenAfterGroup[0].data;
            //                 campaignid = firstChild.campaignid;
            //                 adsetid = firstChild.adsetid;
            //             } else if (params.data) {
            //                 campaignid = params.data.campaignid;
            //                 adsetid = params.data.adsetid;
            //             } else {
            //                 console.error('Missing campaignid or adsetid for campaign:', campaignName);
            //                 return (
            //                     <div style={{ color: 'red' }}>
            //                         Error: campaignid or adsetid missing for {campaignName}
            //                     </div>
            //                 );
            //             } const getEditedUserAndTime = (campaignName, newaccount) => {
            //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
            //                 // console.log(relatedStatus, "relatedStatus");
            //                 const relatedStatusEditedTime = relatedStatus ? relatedStatus : null;
            //                 // console.log(relatedStatusTrue);
            //                 return relatedStatusEditedTime;
            //             }
        
            //             const getPinEditedUserAndTime = (campaignName, newaccount) => {
            //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
            //                 return relatedStatus ? relatedStatus : null;
            //             };
        
            //             const getStatusForCampaign = (campaignName, newaccount) => {
            //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
            //                 // console.log(relatedStatus, "relatedStatus");
            //                 const relatedStatusTrue = relatedStatus !== undefined && relatedStatus.status === true ? true : relatedStatus !== undefined ? false : null;
            //                 // console.log(relatedStatusTrue);
            //                 return relatedStatusTrue;
            //             }
        
            //             const getCommentForCampaign = (campaignName) => {
            //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
            //                 return relatedComment ? relatedComment.comment : null;
            //             };
        
            //             const getPinStatusForCampaign = (campaignName) => {
            //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
            //                 return relatedComment ? relatedComment.pinned : false;
            //             };
        
            //             const editUserANdTime = getEditedUserAndTime(campaignName, newaccount);
            //             const editPinUserANdTime = getPinEditedUserAndTime(campaignName, newaccount);
            //             const relatedStatus = getStatusForCampaign(campaignName, newaccount);
            //             const relatedComment = getCommentForCampaign(campaignName);
            //             // const isStarred = getStarredForCampaign(campaignName);
            //             const valueWithCount = `${firstColumnValue}`;
        
            //             const [tooltipText, setTooltipText] = useState("Click to Copy");
            //             const [isModalVisible, setIsModalVisible] = useState(false);
            //             const [comment, setComment] = useState(relatedComment || '');
            //             // const [starred, setStarred] = useState(isStarred);
            //             const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));
        
            //             const copyToClipboard = () => {
            //                 navigator.clipboard.writeText(firstColumnValue)
            //                     .then(() => {
            //                         setTooltipText("Copied!");
            //                         setTimeout(() => setTooltipText("Click to Copy"), 2000);
            //                     })
            //                     .catch(() => {
            //                         console.error('Failed to copy to clipboard');
            //                     });
            //             };
        
            //             const handleEditClick = () => {
            //                 setIsModalVisible(true);
            //             };
        
            //             const sendNewCommentToAPI = async (logData) => {
            //                 try {
            //                     const response = await apiClient.post('/Comments', {
            //                         commentsdatas: logData,
            //                     });
            //                     console.log('Response from server:', response.data);
            //                 } catch (error) {
            //                     console.error('Error sending data to server:', error);
            //                 }
            //             };
        
            //             const sendEditedCommentToAPI = async (logData) => {
            //                 try {
            //                     const response = await apiClient.post('/Comments/edit', {
            //                         campaignname: logData.campaignname,
            //                         comment: logData.comment,
            //                         Account: logData.Account,
            //                         adsetid: logData.adsetid,
            //                         campaignid: logData.campaignid,
            //                         status: true
            //                     });
            //                     console.log('Response from server (edited comment):', response.data);
            //                     return response.data;
            //                 } catch (error) {
            //                     console.error('Error sending edited comment to server:', error);
            //                     throw error;
            //                 }
            //             };
        
            //             const handleDelete = async () => {
            //                 try {
            //                     // Prepare the payload for the API call
            //                     const payload = {
            //                         campaignname: firstColumnValue,
            //                         Account: newaccount,
            //                         adsetid: adsetid,
            //                         campaignid: campaignid,
            //                     };
                        
            //                     // Call the backend API to delete the comment
            //                     const response = await apiClient.post('/Comments/delete', payload,
            //                         {
            //                             headers: { Authorization: token } 
            //                         }
            //                     );
                        
            //                     if (response.status === 200) {
            //                         // Remove the comment from the local state
            //                         const updatedComments = campaignComments.filter(
            //                             (comment) => comment.campaignname !== firstColumnValue
            //                         );
            //                         setCampaignComments(updatedComments);
                        
            //                         message.success('Comment deleted successfully!');
            //                         setIsModalVisibles(false); // Close the popup
            //                     } else {
            //                         message.error('Failed to delete the comment. Please try again.');
            //                     }
            //                 } catch (error) {
            //                     console.error('Error deleting the comment:', error);
            //                     message.error('Failed to delete the comment. Please try again.');
            //                 }
            //             };
        
            //             const handleOk = async () => {
            //                 const logData = {
            //                     Account: account,
            //                     usercommit: userdetails?.email,
            //                     campaignname: firstColumnValue,
            //                     comment: comment,
            //                     campaignid: campaignid,
            //                     adsetid: adsetid
            //                 };
        
            //                 if (relatedComment) {
            //                     await sendEditedCommentToAPI(logData);
            //                     message.success("Comment updated successfully!");
            //                 } else {
            //                     await sendNewCommentToAPI(logData);
            //                     message.success("New comment added successfully!");
            //                 }
        
            //                 const updatedComments = relatedComment
            //                     ? campaignComments.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
            //                     : [...campaignComments, logData];
            //                 setCampaignComments(updatedComments);
        
            //                 changeRRefrst();
            //                 setIsModalVisible(false);
            //             };
        
            //             const handleCancel = () => {
            //                 setIsModalVisible(false);
            //             };
        
            //             const CustomTooltipContent = ({ editedTime, usercommit }) => (
            //                 <div style={{ padding: '5px', borderRadius: '5px' }}>
            //                     <p style={{ margin: 0, color: "#ffffff" }}>{usercommit}</p>
            //                     <p style={{ margin: 0, color: "#ffffff" }}>{editedTime}</p>
            //                 </div>
            //             );
        
            //             const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
            //                 const updatedPinStatus = !currentPinStatus;
        
            //                 try {
            //                     let response;
            //                     if (updatedPinStatus) {
            //                         response = await apiClient.post('/Pin', {
            //                             campaignname: campaignName,
            //                             Account: account,
            //                             campaignid: campaignid,
            //                             adsetid: adsetid,
            //                             userPin: userdetails?.email,
            //                             comment: comment || ''
            //                         });
            //                         changeRRefrst();
        
            //                         message.success("Campaign pinned!");
            //                     } else {
            //                         response = await apiClient.post('/Unpin', {
            //                             campaignname: campaignName,
            //                             Account: account,
            //                             campaignid: campaignid,
            //                             adsetid: adsetid
            //                         });
            //                         changeRRefrst();
        
            //                         message.success("Campaign unpinned!");
            //                     }
        
            //                     // Update campaignComments with the new pinned status and edited user/time
            //                     const updatedComments = campaignComments.map(cmt =>
            //                         cmt.campaignname === campaignName
            //                             ? {
            //                                 ...cmt,
            //                                 pinned: updatedPinStatus,
            //                                 editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            //                                 userPin: userdetails?.email
            //                             }
            //                             : cmt
            //                     );
        
            //                     if (!campaignComments.some(cmt => cmt.campaignname === campaignName)) {
            //                         updatedComments.push({
            //                             campaignname: campaignName,
            //                             pinned: updatedPinStatus,
            //                             editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            //                             userPin: userdetails?.email
            //                         });
            //                     }
            //                     const sortedComments = updatedComments.sort((a, b) => b.pinned - a.pinned);
            //                     setCampaignComments(sortedComments);
            //                     setPinned(updatedPinStatus);
            //                 } catch (error) {
            //                     console.error('Error toggling pin status:', error);
            //                     message.error('Error while updating pin status.');
            //                 }
            //             };
        
            //             const PinIcon = ({ campaignName, campaignid, adsetid, pinned }) => {
            //                 return (
            //                     <Tooltip title={pinned ? <CustomTooltipContent editedTime={editPinUserANdTime?.editedPinTime} usercommit={editPinUserANdTime?.userPin} /> : null}>
            //                         <button
            //                             onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
            //                             style={{
            //                                 border: "none",
            //                                 background: "none",
            //                                 cursor: "pointer",
            //                                 fontSize: "16px",
            //                             }}
            //                         >
            //                             {pinned ? "📌" : "📍"}
            //                         </button>
            //                     </Tooltip>
            //                 );
            //             };
        
            //             return (
            //                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            //                     <PinIcon
            //                         campaignName={campaignName}
            //                         campaignid={campaignid}
            //                         adsetid={adsetid}
            //                         // pinned={getPinStatusForCampaign(campaignName)}
            //                         pinned={pinned}
            //                     />
            //                     <div style={{ marginLeft: '10px' }}>
            //                         {(() => {
            //                             // Find the matching campaign in the Camapignlevelstatus array
            //                             const campaignStatus = Camapignlevelstatus.find(statusObj => statusObj.name === campaignName);
        
            //                             if (campaignStatus) {
            //                                 const { status, start, end } = campaignStatus;
        
            //                                 // Tooltip content with start and end dates
            //                                 const tooltipContent = (
            //                                     <div>
            //                                         <p style={{ margin: 0 }}>Start: {start || 'N/A'}</p>
            //                                         <p style={{ margin: 0 }}>End: {end || 'N/A'}</p>
            //                                     </div>
            //                                 );
        
            //                                 if (status === 'PAUSED') {
            //                                     return (
            //                                         <Tooltip title={tooltipContent}>
            //                                             <PauseCircleOutlined style={{ color: 'orange', fontSize: '18px' }} />
            //                                         </Tooltip>
            //                                     );
            //                                 } else if (status === 'ACTIVE') {
            //                                     return (
            //                                         <Tooltip title={tooltipContent}>
            //                                             <CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} />
            //                                         </Tooltip>
            //                                     );
            //                                 } else {
            //                                     // Default for unknown status
            //                                     return (
            //                                         <Tooltip title={tooltipContent}>
            //                                             <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
            //                                         </Tooltip>
            //                                     );
            //                                 }
            //                             } else {
            //                                 // Fallback if no matching campaign is found
            //                                 return (
            //                                     <Tooltip title="No campaign data available">
            //                                         <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
            //                                     </Tooltip>
            //                                 );
            //                             }
            //                         })()}
            //                     </div>
            //                     {relatedComment ? (
            //                         <Tooltip title={(
            //                             <div style={{ display: 'flex', alignItems: 'center' }}>
            //                                 <span>{relatedComment || 'No comment available'}</span>
            //                                 <EditOutlined onClick={handleEditClick} style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }} />
            //                             </div>
            //                         )}>
            //                             <MessageOutlined className='Message' style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: 'blue' }} />
            //                             <Tooltip title={tooltipText}></Tooltip>
            //                         </Tooltip>
            //                     ) : (
            //                         <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
            //                     )}
            //                     <Tooltip title={tooltipText}>
            //                         <CopyOutlined
            //                             onClick={copyToClipboard}
            //                             style={{ cursor: 'pointer', marginLeft: '8px', color: "#1e1e1f", marginRight: '10px' }}
            //                         />
            //                     </Tooltip>
            //                     <span
            //                         onClick={() => {
            //                             const url = `/AllCampaigns/CampaignHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
            //                             window.open(url, '_blank', 'noopener,noreferrer');
            //                         }}
            //                     >
            //                         {valueWithCount}
            //                     </span>
            //                     <Modal
            //                         title={firstColumnValue}
            //                         visible={isModalVisible}
            //                         onOk={handleOk} // Default Ok button functionality
            //                         onCancel={handleCancel} // Default Cancel button functionality
            //                         footer={[
            //                             <Button
            //                                 key="delete"
            //                                 type="danger"
            //                                 onClick={handleDelete}
            //                                 style={{ marginRight: 'auto', border: "1px solid black" }} // Push Delete button to the far left
            //                             >
            //                                 Delete
            //                             </Button>,
            //                             <Button key="cancel" onClick={handleCancel}>
            //                                 Cancel
            //                             </Button>,
            //                             <Button key="ok" type="primary" onClick={handleOk}>
            //                                 Ok
            //                             </Button>,
            //                         ]}
            //                     >
            //                         <Input.TextArea
            //                             placeholder="Enter your comments here"
            //                             value={comment}
            //                             onChange={(e) => setComment(e.target.value)}
            //                         />
            //                     </Modal>
            //                 </div>
            //             );
            //         }
            //     }
            // };
        
        
            // const autoGroupColumnDef3 = {
            //     headerName: 'Campaign-Name',
            //     minWidth: 450,
            //     pinned: 'left',
            //     sortable: true, // Enable sorting
        
            //     comparator: (campaignA, campaignB) => {
            //         if (!campaignA) return 1;
            //         if (!campaignB) return -1;
        
            //         const getStarredForCampaign = (campaignName) => {
            //             const relatedComment = campaignComments.find(comment => comment?.campaignname === campaignName);
            //             return relatedComment ? relatedComment.starred : false;
            //         };
        
            //         const isStarredA = getStarredForCampaign(campaignA);
            //         const isStarredB = getStarredForCampaign(campaignB);
        
            //         if (isStarredA === isStarredB) {
            //             return campaignA.localeCompare(campaignB);
            //         }
            //         return isStarredA ? -1 : 1;
            //     },
        
            //     cellRendererParams: {
            //         suppressCount: false,
            //         innerRenderer: (params) => {
            //             if (params.node.footer) {
            //                 return 'Total';
            //             }
        
            //             const firstColumnValue = params?.node?.key;  // campaign name
            //             const campaignName = params?.node?.key;
        
            //             let campaignid, adsetid;
        
            //             if (params?.node?.group && params?.node?.childrenAfterGroup && params?.node?.childrenAfterGroup?.length > 0) {
            //                 const firstChild = params?.node?.childrenAfterGroup[0]?.data;
            //                 campaignid = firstChild?.campaignid;
            //                 adsetid = firstChild?.adsetid;
            //             } else if (params?.data) {
            //                 campaignid = params?.data?.campaignid;
            //                 adsetid = params?.data?.adsetid;
            //             } else {
            //                 console.error('Missing campaignid or adsetid for campaign:', campaignName);
            //                 return (
            //                     <div style={{ color: 'red' }}>
            //                         Error: campaignid or adsetid missing for {campaignName}
            //                     </div>
            //                 );
            //             }
            //             const getEditedUserAndTime = (campaignName, newaccount) => {
            //                 const relatedStatus = campaignComments?.find(comment => comment?.campaignname === campaignName && comment?.Account === newaccount);
            //                 // console.log(relatedStatus, "relatedStatus");
            //                 const relatedStatusEditedTime = relatedStatus ? relatedStatus : null;
            //                 // console.log(relatedStatusTrue);
            //                 return relatedStatusEditedTime;
            //             }
            //             const getStatusForCampaign = (campaignName, newaccount) => {
            //                 const relatedStatus = campaignComments?.find(comment => comment?.campaignname === campaignName && comment?.Account === newaccount);
            //                 // console.log(relatedStatus, "relatedStatus");
            //                 const relatedStatusTrue = relatedStatus !== undefined && relatedStatus?.status === true ? true : relatedStatus !== undefined ? false : null;
            //                 // console.log(relatedStatusTrue);
            //                 return relatedStatusTrue;
            //             }
        
            //             const getCommentForCampaign = (campaignName) => {
            //                 const relatedComment = campaignComments?.find(comment => comment?.campaignname === campaignName);
            //                 return relatedComment ? relatedComment?.comment : null;
            //             };
        
            //             const getStarredForCampaign = (campaignName) => {
            //                 const relatedComment = campaignComments?.find(comment => comment?.campaignname === campaignName);
            //                 return relatedComment ? relatedComment?.starred : false;
            //             };
            //             const editUserANdTime = getEditedUserAndTime(campaignName, newaccount);
            //             const relatedStatus = getStatusForCampaign(campaignName, newaccount);
            //             const relatedComment = getCommentForCampaign(campaignName);
            //             const isStarred = getStarredForCampaign(campaignName);
            //             const valueWithCount = `${firstColumnValue}`;
        
            //             const [tooltipText, setTooltipText] = useState("Click to Copy");
            //             const [isModalVisibles, setIsModalVisibles] = useState(false);
            //             const [comment, setComment] = useState(relatedComment || '');
            //             const [starred, setStarred] = useState(isStarred);
        
            //             const copyToClipboard = () => {
            //                 navigator?.clipboard?.writeText(firstColumnValue)
            //                     .then(() => {
            //                         setTooltipText("Copied!");
            //                         setTimeout(() => setTooltipText("Click to Copy"), 2000);
            //                     })
            //                     .catch(() => {
            //                         console.error('Failed to copy to clipboard');
            //                     });
            //             };
        
            //             const handleEditClick = () => {
            //                 setIsModalVisibles(true);
            //             };
        
            //             const sendNewCommentToAPI = async (logData) => {
            //                 try {
            //                     const response = await apiClient.post('/Comments', {
            //                         commentsdatas: logData,
            //                     });
            //                     console.log('Response from server:', response.data);
            //                 } catch (error) {
            //                     console.error('Error sending data to server:', error);
            //                 }
            //             };
        
            //             const sendEditedCommentToAPI = async (logData) => {
            //                 try {
            //                     const response = await apiClient.post('/Comments/edit', {
            //                         campaignname: logData?.campaignname,
            //                         comment: logData?.comment,
            //                         Account: logData?.Account,
            //                         adsetid: logData?.adsetid,
            //                         campaignid: logData?.campaignid,
            //                         status: true
            //                     });
            //                     console.log('Response from server (edited comment):', response.data);
            //                     return response.data;
            //                 } catch (error) {
            //                     console.error('Error sending edited comment to server:', error);
            //                     throw error;
            //                 }
            //             };
        
            //             const sendStarStatusToAPI = async (campaignname, isStarred) => {
            //                 try {
            //                     const endpoint = isStarred ? '/Star' : '/Unstar';
            //                     const response = await apiClient.post(endpoint, {
            //                         campaignname: campaignname,
            //                         Account: account,
            //                         usercommit: userdetails?.email,
            //                         campaignid: campaignid,
            //                         adsetid: adsetid
            //                     });
            //                     console.log('Response from server (starred status):', response.data);
            //                 } catch (error) {
            //                     console.error('Error updating star status:', error);
            //                 }
            //             };
        
            //             const handleStarClick = async () => {
            //                 const updatedStarred = !starred;
            //                 setStarred(updatedStarred);
            //                 await sendStarStatusToAPI(firstColumnValue, updatedStarred);
            //                 message.success(updatedStarred ? "Campaign starred!" : "Campaign unstarred!");
        
            //                 const updatedComments = campaignComments?.map(cmt =>
            //                     cmt.campaignname === firstColumnValue ? { ...cmt, starred: updatedStarred } : cmt
            //                 );
            //                 setCampaignComments(updatedComments);
            //                 changeRRefrst();
            //             };
        
            //             const handleOks = async () => {
            //                 try {
            //                     const logData = {
            //                         Account: newaccount,
            //                         usercommit: userdetails?.email,
            //                         campaignname: firstColumnValue,
            //                         comment: comment,
            //                         campaignid: campaignid,
            //                         adsetid: adsetid
            //                     };
        
            //                     if (relatedComment) {
            //                         await sendEditedCommentToAPI(logData);
            //                         message.success("Comment updated successfully!");
            //                     } else {
            //                         await sendNewCommentToAPI(logData);
            //                         message.success("New comment added successfully!");
            //                     }
        
            //                     const updatedComments = relatedComment
            //                         ? campaignComments?.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
            //                         : [...campaignComments, logData];
            //                     setCampaignComments(updatedComments);
        
            //                     changeRRefrst();
            //                     setIsModalVisibles(false);
            //                 } catch (error) {
            //                     console.error('Error while submitting comment:', error);
            //                     message.error("Error while submitting the comment.");
            //                 }
            //             };
        
            //             const handleCancels = () => {
            //                 setIsModalVisibles(false);
            //             };
        
            //             const CustomTooltipContent = ({ editedTime, usercommit }) => (
            //                 <div style={{ padding: '5px', borderRadius: '5px' }}>
            //                     <p style={{ margin: 0, color: "#ffffff" }}>{usercommit}</p>
            //                     <p style={{ margin: 0, color: "#ffffff" }}>{editedTime}</p>
            //                 </div>
            //             );
        
            //             return (
            //                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            //                     <div style={{ marginLeft: '10px' }}>
            //                         {(() => {
            //                             // Find the matching campaign in the Camapignlevelstatus array
            //                             const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
        
            //                             if (campaignStatus) {
            //                                 const { status, start, end } = campaignStatus;
        
            //                                 // Tooltip content with start and end dates
            //                                 const tooltipContent = (
            //                                     <div>
            //                                         <p style={{ margin: 0 }}>Start: {start || 'N/A'}</p>
            //                                         <p style={{ margin: 0 }}>End: {end || 'N/A'}</p>
            //                                     </div>
            //                                 );
        
            //                                 if (status === 'PAUSED') {
            //                                     return (
            //                                         <Tooltip title={tooltipContent}>
            //                                             <PauseCircleOutlined style={{ color: 'orange', fontSize: '18px' }} />
            //                                         </Tooltip>
            //                                     );
            //                                 } else if (status === 'ACTIVE') {
            //                                     return (
            //                                         <Tooltip title={tooltipContent}>
            //                                             <CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} />
            //                                         </Tooltip>
            //                                     );
            //                                 } else {
            //                                     // Default for unknown status
            //                                     return (
            //                                         <Tooltip title={tooltipContent}>
            //                                             <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
            //                                         </Tooltip>
            //                                     );
            //                                 }
            //                             } else {
            //                                 // Fallback if no matching campaign is found
            //                                 return (
            //                                     <Tooltip title="No campaign data available">
            //                                         <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
            //                                     </Tooltip>
            //                                 );
            //                             }
            //                         })()}
            //                     </div>
            //                     {relatedComment && (
            //                         starred ? (
            //                             <StarFilled className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px', color: "gold" }} />
            //                         ) : (
            //                             <StarOutlined className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px' }} />
            //                         )
            //                     )}
            //                     {relatedComment ? (
            //                         <Tooltip title={(
            //                             <div style={{ display: 'flex', alignItems: 'center' }}>
            //                                 <span>{relatedComment || 'No comment available'}</span>
            //                                 <EditOutlined onClick={handleEditClick} style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }} />
            //                             </div>
            //                         )}>
            //                             <MessageOutlined className='Message' style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: 'blue' }} />
            //                             <Tooltip title={tooltipText}></Tooltip>
            //                         </Tooltip>
            //                     ) : (
            //                         <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
            //                     )}
            //                     <Tooltip title={tooltipText}>
            //                         <CopyOutlined
            //                             onClick={copyToClipboard}
            //                             style={{ cursor: 'pointer', marginLeft: '8px', color: "#1e1e1f", marginRight: '10px' }}
            //                         />
            //                     </Tooltip>
            //                     <span
            //                         onClick={() => {
            //                             const url = `/DailyAndCampaignHistory/CampaignHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
            //                             window.open(url, '_blank', 'noopener,noreferrer');
            //                         }}
            //                     >
            //                         {valueWithCount}
            //                     </span>
            //                     <Modal
            //                         title={firstColumnValue}
            //                         visible={isModalVisibles}
            //                         onOk={handleOks}
            //                         onCancel={handleCancels}
            //                     >
            //                         <Input.TextArea
            //                             placeholder="Enter your comments here"
            //                             value={comment}
            //                             onChange={(e) => setComment(e.target.value)}
            //                         />
            //                     </Modal>
            //                 </div>
            //             );
            //         }
            //     }
            // };
        
            // const autoGroupColumnDefDomain = {
            //     headerName: 'Domain', // Display name for the grouped column
            //     minWidth: 300, // Set width for grouped rows
            //     resizable: true, // Enable resizing
            //     sortable: true, // Enable sorting
            //     cellRendererParams: {
            //         suppressCount: true, // Suppress row count in the grouped column
            //     },
            // };
        
            // const GroupRowRenderer = (props) => {
            //     const { node } = props;
            //     const groupName = node.key;
            //     const groupCount = node.allLeafChildren.length;
            //     return (
            //         <span>
            //             {groupName} ({groupCount})
            //         </span>
            //     );
            // };
            // const onGridReady = (params, gridId, gridRef) => {
            //     gridRef.current = params;
            //     params.api.applyColumnState({ state: columnDefs, applyOrder: true });
            //     params.api.addEventListener('dragStopped', (e) => debouncedHandleColumnMove(e, gridId));
            // };
        
            // const gridOptions = {
            //     onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid1'),
            //     defaultColDef: {
            //         suppressMenu: true,
            //         headerClass: "custom-header" // Apply to all columns by default
        
            //     }
            // };
        
            // const gridOptions1 = {
            //     onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid2'),
            //     defaultColDef: {
            //         suppressMenu: true,
            //         headerClass: "custom-header" // Apply to all columns by default
        
            //     }
            // };
        
            // const gridOptions2 = {
            //     onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid3'),
            //     defaultColDef: {
            //         suppressMenu: true,
            //         headerClass: "custom-header" // Apply to all columns by default
        
            //     }
            // };
        
            // const gridOptions3 = {
            //     onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid4'),
            //     defaultColDef: {
            //         suppressMenu: true,
            //         headerClass: "custom-header" // Apply to all columns by default
        
            //     }
            // };
        
            // const gridOptions5 = {
            //     onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid5'),
            //     defaultColDef: {
            //         suppressMenu: true,
            //         headerClass: "custom-header" // Apply to all columns by default
        
            //     }
            // };
        
            // const defaultDates = [dayjs(startDateFromDashboard ? startDateFromDashboard : yesterday), dayjs(endDateFromDashboard ? endDateFromDashboard : yesterday)];
        
            // const onBtExport1 = () => {
            //     // console.log(gridRef.current.api,"in")
            //     const Details = {
            //         network : newRevenuePratner,
            //         account: newaccount,
            //         dateRange: `From ${newStartDate} to ${newendDate}`,
            //         type: "Live",
            //         email: userdetails?.email,
            //         time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")
            //     }
            //     gridRef.current.api.exportDataAsCsv({
            //         processCellCallback: (params) => {
            //             const node = params.node;
            //             if (node.group) {
            //                 return null;
            //             }
            //             return params.value;
            //         },
            //         shouldRowBeSkipped: (params) => {
            //             return params.node.group;
            //         },
            //     });
            //     const updateDetails = async()=>{
            //         await apiClient.post('/UserExportActivities/', { Details });
            //     }
            //     updateDetails();
        
            // };
        
            // const onBtExport = (gridRef, text) => {
            //     const Details = {
            //         network : newRevenuePratner,
            //         account: newaccount,
            //         dateRange: `From ${newStartDate} to ${newendDate}`,
            //         type: text,
            //         email: userdetails?.email,
            //         time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")
            //     }
            //     if (gridRef.current) {
            //         gridRef.current.api.exportDataAsCsv({
            //             processCellCallback: (params) => {
            //                 const node = params.node;
            //                 if (node.group) {
            //                     return null;
            //                 }
            //                 return params.value;
            //             },
            //             shouldRowBeSkipped: (params) => {
            //                 return params.node.group;
            //             },
            //         });
            //     } else {
            //         console.error("Grid reference is null");
            //     }
            //     const updateDetails = async()=>{
            //         await apiClient.post('/UserExportActivities/', { Details });
            //     }
            //     updateDetails();
            // };
        
            // const itemRender = (_, type, originalElement) => {
            //     if (type === 'prev') {
            //         return <a><ArrowLeftOutlined /></a>;
            //     }
            //     if (type === 'next') {
            //         return <a><ArrowRightOutlined /></a>;
            //     }
            //     return originalElement;
            // };
        
            // const handlePageClick = (page, pageSize) => {
            //     // console.log(`Clicked page: ${page}, Page size: ${pageSize}`);
            //     setLoading2(true);
            //     setPageSize(page);
            //     // Add your custom onClick functionality here
            // };
//const refreshGrid = (gridRef) => {

    //     setLoading(true);
    //     if (gridRef.current) {
    //         const gridApi = gridRef.current.api;

    //         // Clear filters
    //         gridApi.setFilterModel(null);

    //         // Clear sorting by resetting the row data state
    //         setRowData([]); // Temporarily clear the data
    //         setTimeout(() => setRowData(newRowData.current), 0); // Reset the data
    //         setTimeout(() => setLoading(false), 1500);
    //         // Force refresh the grid cells and redraw the rows
    //         gridApi.refreshCells({ force: true });
    //         gridApi.redrawRows();
    //     } else {
    //         console.error('Grid reference is not available.');
    //     }
    // };

    // const refreshGrid1 = (gridRef1) => {
    //     setLoading1(true);
    //     if (gridRef1.current) {
    //         const gridApi = gridRef1.current.api;

    //         // Clear filters
    //         gridApi.setFilterModel(null);

    //         // Clear sorting by resetting the row data state
    //         setdailyData([]); // Temporarily clear the data
    //         setTimeout(() => setdailyData(newDailyData.current), 0); // Reset the data
    //         setTimeout(() => setLoading1(false), 1500);
    //         // Force refresh the grid cells and redraw the rows
    //         gridApi.refreshCells({ force: true });
    //         gridApi.redrawRows();
    //     } else {
    //         console.error('Grid reference is not available.');
    //     }
    // };

    // const refreshGrid2 = (gridRef2) => {
    //     setLoading2(true);
    //     if (gridRef2.current) {
    //         const gridApi = gridRef2.current.api;

    //         // Clear filters
    //         gridApi.setFilterModel(null);

    //         // Clear sorting by resetting the row data state
    //         setCampaignData([]); // Temporarily clear the data
    //         setTimeout(() => setCampaignData(newCampaignData.current), 0); // Reset the data
    //         setTimeout(() => setLoading2(false), 1500);

    //         // Force refresh the grid cells and redraw the rows
    //         gridApi.refreshCells({ force: true });
    //         gridApi.redrawRows();
    //     } else {
    //         console.error('Grid reference is not available.');
    //     }
    // };


    // const refreshGrid3 = (gridRef3) => {
    //     setLoading1(true);
    //     if (gridRef3.current) {
    //         const gridApi = gridRef3.current.api;

    //         // Clear filters
    //         gridApi.setFilterModel(null);

    //         // Clear sorting by resetting the row data state
    //         setKeywordData([]); // Temporarily clear the data
    //         setTimeout(() => setKeywordData(newDailyData.current), 0); // Reset the data
    //         setTimeout(() => setLoading1(false), 1500);
    //         // Force refresh the grid cells and redraw the rows
    //         gridApi.refreshCells({ force: true });
    //         gridApi.redrawRows();
    //     } else {
    //         console.error('Grid reference is not available.');
    //     }
    // };

    // const refreshGrid4 = (gridRef4) => {
    //     setLoading4(true);
    //     if (gridRef4.current) {
    //         const gridApi = gridRef4.current.api;

    //         // Clear filters
    //         gridApi.setFilterModel(null);

    //         // Temporarily clear the data and reset after a timeout
    //         setSystem1KeywordData([]); // Temporarily clear the data
    //         setTimeout(() => setSystem1KeywordData(newDailyData.current), 0); // Reset the data
    //         setTimeout(() => setLoading4(false), 1500); // Stop loading after timeout

    //         // Force refresh the grid cells and redraw the rows
    //         gridApi.refreshCells({ force: true });
    //         gridApi.redrawRows();
    //     } else {
    //         console.error('Grid reference is not available.');
    //     }
    // };

    // const refreshGrid5 = (gridRef5) => {
    //     setTonicKeywordLoading(true);
    //     if (gridRef5.current) {
    //         const gridApi = gridRef5.current.api;
    
    //         // Clear filters
    //         gridApi.setFilterModel(null);
    
    //         // Temporarily clear the data and reset after a timeout
    //         setTonicKeywordData([]); // Temporarily clear the data
    //         setTimeout(() => setTonicKeywordData(newTonicKeywordData.current), 0); // Reset the data
    //         setTimeout(() => setTonicKeywordLoading(false), 1500); // Stop loading after timeout
    
    //         // Force refresh the grid cells and redraw the rows
    //         gridApi.refreshCells({ force: true });
    //         gridApi.redrawRows();
    //     } else {
    //         console.error('Grid reference is not available.');
    //     }
    // };

    // const refreshGrid6 = (gridRefForCampaignNamesLive) => {
    //     setTonicKeywordLoading(true);
    //     if (gridRefForCampaignNamesLive.current) {
    //         const gridApi = gridRefForCampaignNamesLive.current.api;
    
    //         // Clear filters
    //         gridApi.setFilterModel(null);
    
    //         // Temporarily clear the data and reset after a timeout
    //         setCampaignNamesDActiveLive([]); // Temporarily clear the data
    //         setTimeout(() => setCampaignNamesDActiveLive(newCampaignNamesDActiveLive.current), 0); // Reset the data
    //         setTimeout(() => setCampaignNamesDActiveLiveLoading(false), 1500); // Stop loading after timeout
    
    //         // Force refresh the grid cells and redraw the rows
    //         gridApi.refreshCells({ force: true });
    //         gridApi.redrawRows();
    //     } else {
    //         console.error('Grid reference is not available.');
    //     }
    // };

    // const refreshGrid7 = (gridRefForCampaignNamesDaily) => {
    //     setTonicKeywordLoading(true);
    //     if (gridRefForCampaignNamesDaily.current) {
    //         const gridApi = gridRefForCampaignNamesDaily.current.api;
    
    //         // Clear filters
    //         gridApi.setFilterModel(null);
    
    //         // Temporarily clear the data and reset after a timeout
    //         setCampaignNamesDActiveDaily([]); // Temporarily clear the data
    //         setTimeout(() => setCampaignNamesDActiveDaily(newCampaignNamesDActiveDaily.current), 0); // Reset the data
    //         setTimeout(() => setCampaignNamesDActiveDailyLoading(false), 1500); // Stop loading after timeout
    
    //         // Force refresh the grid cells and redraw the rows
    //         gridApi.refreshCells({ force: true });
    //         gridApi.redrawRows();
    //     } else {
    //         console.error('Grid reference is not available.');
    //     }
    // };


    // const onCellClicked = (event) => {
        
    //     if (event.colDef.field === 'adsetname') {
    //         const value = event.value;
    //         if (value !== undefined) {
    //             const url = `/DailyAndCampaignHistory/AdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
    //             window.open(url, '_blank', 'noopener,noreferrer');
    //         }
    //     }

    // };

    // const onCellClickedAllCampaigns = (event) => {
    //     if (event.colDef.field === 'adsetname') {
    //         const value = event.value;
    //         if (value !== undefined) {
    //             const url = `/AllCampaigns/AdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
    //             window.open(url, '_blank', 'noopener,noreferrer');
    //         }
    //     }
    // };

    // const onCellClickedLive = (event) => {
    //     if (event.colDef.field === 'adsetname') {
    //         const value = event.value;
    //         if (value !== undefined) {
    //             const url = `/LiveHistory/LiveAdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
    //             window.open(url, '_blank', 'noopener,noreferrer');
    //             // console.log(`Adset clicked: ${value}`);
    //         }
    //     }
    // };

    {/* <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>
                                                Cron/Acc status: {cronStatus.current} /{' '}
                                                <span style={{ color: accountStatus.current === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
                                                    {accountStatus.current}
                                                </span>
                                            </Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={4} lg={2} style={{ flex: "0.2 0 auto" }}>
                                            <Tooltip
                                            title={
                                                <>
                                                <div>FbAcc Status: {`${fbCron.current}`}</div>
                                                <div>RevAcc Status: {`${revenueCron.current}`}</div>
                                                </>
                                            }
                                            >
                                                <InfoCircleOutlined style={{ fontSize: '18px', cursor: 'pointer', marginRight: '10px' }} />
                                            </Tooltip>
                                        </Col> */}