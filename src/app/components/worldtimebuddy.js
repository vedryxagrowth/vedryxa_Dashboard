// "use client"

// import { useState, useEffect, useMemo, useRef } from "react"
// import { DateTime } from "luxon"
// import {
//   Card,
//   Button,
//   Row,
//   Col,
//   Space,
//   Typography,
//   Tooltip,
//   theme,
//   Select,
// } from "antd"
// import {
//   CloseOutlined,
//   SettingOutlined,
//   LinkOutlined,
//   StarOutlined,
//   StarFilled,
//   LeftOutlined,
//   RightOutlined,
// } from "@ant-design/icons"
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

// const { Text } = Typography
// const { useToken } = theme

// const timezones = [
//   { zone: "Europe/London", city: "London", country: "United Kingdom", abbr: "BST" },
//   { zone: "Africa/Cairo", city: "Cairo", country: "Egypt", abbr: "EET" },
//   { zone: "Europe/Moscow", city: "Moscow", country: "Russia", abbr: "MSK" },
//   { zone: "UTC", city: "UTC", country: "Coordinated Universal Time", abbr: "UTC" },
//   { zone: "Asia/Kolkata", city: "Kolkata", country: "India", abbr: "IST" },
//   { zone: "America/New_York", city: "New York", country: "USA", abbr: "EDT" },
//   { zone: "America/Los_Angeles", city: "Los Angeles", country: "USA", abbr: "PDT" },
//   { zone: "Asia/Tokyo", city: "Tokyo", country: "Japan", abbr: "JST" },
//   { zone: "Australia/Sydney", city: "Sydney", country: "Australia", abbr: "AEST" },
//   { zone: "Europe/Paris", city: "Paris", country: "France", abbr: "CEST" },
//   { zone: "Asia/Dubai", city: "Dubai", country: "UAE", abbr: "GST" },
//   { zone: "Asia/Singapore", city: "Singapore", country: "Singapore", abbr: "SGT" },
// ]

// export default function WorldTimeBuddy() {
//   const { token } = useToken()
//   const [selectedTimezones, setSelectedTimezones] = useState(["Europe/London", "Asia/Kolkata"])
//   const [favorites, setFavorites] = useState([])
//   const [currentDate, setCurrentDate] = useState(DateTime.now())
//   const [hoveredHourIndex, setHoveredHourIndex] = useState(null)
//   const scrollRef = useRef()

//   useEffect(() => {
//     const interval = setInterval(() => setCurrentDate(DateTime.now()), 60000)
//     return () => clearInterval(interval)
//   }, [])

//   const goToPreviousDay = () => setCurrentDate(currentDate.minus({ days: 1 }))
//   const goToNextDay = () => setCurrentDate(currentDate.plus({ days: 1 }))

//   const addTimezone = (zone) => {
//     if (!selectedTimezones.includes(zone)) setSelectedTimezones([...selectedTimezones, zone])
//   }

//   const removeTimezone = (zone) => setSelectedTimezones(selectedTimezones.filter((z) => z !== zone))

//   const toggleFavorite = (zone) => {
//     const isFavorite = favorites.includes(zone)
//     const updatedFavorites = isFavorite ? favorites.filter((z) => z !== zone) : [zone, ...favorites]
//     const reorderedTimezones = [
//       ...updatedFavorites.filter((z) => selectedTimezones.includes(z)),
//       ...selectedTimezones.filter((z) => !updatedFavorites.includes(z)),
//     ]
//     setFavorites(updatedFavorites)
//     setSelectedTimezones(reorderedTimezones)
//   }

//   const getRelativeOffset = (zone) => {
//     const base = DateTime.now().setZone(selectedTimezones[0])
//     const target = DateTime.now().setZone(zone)
//     const diff = (target.offset - base.offset) / 60
//     return diff > 0 ? `+${diff}` : diff.toString()
//   }

//   const onDragEnd = (result) => {
//     if (!result.destination) return
//     const reordered = [...selectedTimezones]
//     const [moved] = reordered.splice(result.source.index, 1)
//     reordered.splice(result.destination.index, 0, moved)
//     setSelectedTimezones(reordered)
//   }

//   return (
//     <div style={{ padding: 16, maxWidth: 1400, margin: "0 auto" }}>
//       <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 16 }}>
//         <Col flex="auto">
//           <Select
//             showSearch
//             placeholder="Select timezone"
//             style={{ width: "100%" }}
//             onChange={addTimezone}
//             options={timezones
//               .filter((tz) => !selectedTimezones.includes(tz.zone))
//               .map((tz) => ({
//                 value: tz.zone,
//                 label: `${tz.city}, ${tz.country} (${tz.abbr})`,
//               }))}
//           />
//         </Col>
//         <Col>
//           <Space>
//             <Button icon={<LeftOutlined />} onClick={goToPreviousDay} />
//             <Text>{currentDate.toFormat("ccc, LLL d")}</Text>
//             <Button icon={<RightOutlined />} onClick={goToNextDay} />
//           </Space>
//         </Col>
//         <Col>
//           <Tooltip title="Settings">
//             <Button icon={<SettingOutlined />} />
//           </Tooltip>
//         </Col>
//         <Col>
//           <Tooltip title="Copy Shareable Link">
//             <Button icon={<LinkOutlined />} />
//           </Tooltip>
//         </Col>
//       </Row>

//       <Card bodyStyle={{ padding: 0, overflow: "auto" }}>
//         <div style={{ display: "flex" }} ref={scrollRef}>
//           <div style={{ width: 380, background: "#f7f7f7", borderRight: `1px solid ${token.colorBorderSecondary}` }}>
//             <div style={{ height: 0 }}></div>
//             <DragDropContext onDragEnd={onDragEnd}>
//               <Droppable droppableId="zones">
//                 {(provided) => (
//                   <div {...provided.droppableProps} ref={provided.innerRef}>
//                     {selectedTimezones.map((zone, index) => {
//                       const info = timezones.find((tz) => tz.zone === zone) || { city: zone, country: "", abbr: "", zone }
//                       const zonedTime = currentDate.setZone(zone)
//                       const offset = getRelativeOffset(zone)
//                       return (
//                         <Draggable key={zone} draggableId={zone} index={index}>
//                           {(provided) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               style={{
//                                 ...provided.draggableProps.style,
//                                 display: "flex",
//                                 alignItems: "center",
//                                 height: 60,
//                                 paddingLeft: 8,
//                                 borderBottom: `1px solid ${token.colorBorderSecondary}`,
//                                 background: "#fff",
//                                 borderRadius: 4,
//                                 marginBottom: 4,
//                                 cursor: "grab",
//                               }}
//                             >
//                               <div style={{ width: 50, textAlign: "right", paddingRight: 8 }}>
//                                 <Text type="secondary">{offset}</Text>
//                               </div>
//                               <div>
//                                 <Text strong>{info.city}</Text> <Text type="secondary">{info.abbr}</Text>
//                                 <br />
//                                 <Text type="secondary" style={{ fontSize: 12 }}>{info.country}</Text>
//                               </div>
//                               <div style={{ marginLeft: "auto", paddingRight: 8 }}>
//                                 <Text>{zonedTime.toFormat("h:mm a")}</Text>
//                                 <br />
//                                 <Text type="secondary" style={{ fontSize: 12 }}>{zonedTime.toFormat("ccc, LLL d")}</Text>
//                               </div>
//                               <Button
//                                 type="text"
//                                 size="small"
//                                 icon={favorites.includes(zone) ? <StarFilled /> : <StarOutlined />}
//                                 onClick={() => toggleFavorite(zone)}
//                                 style={{ color: favorites.includes(zone) ? "#faad14" : undefined }}
//                               />
//                               <Button type="text" danger size="small" icon={<CloseOutlined />} onClick={() => removeTimezone(zone)} />
//                             </div>
//                           )}
//                         </Draggable>
//                       )
//                     })}
//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             </DragDropContext>
//           </div>

//           <div style={{ overflowX: "auto", width: "100%", background: "#fff" }}>
//             <div>
//               {selectedTimezones.map((zone) => {
//                 const zonedStart = currentDate.startOf("day").setZone(zone)
//                 const hours = Array.from({ length: 24 }, (_, i) => {
//                   const dt = zonedStart.plus({ hours: i })
//                   const isCurrentHour = dt.hasSame(DateTime.now().setZone(zone), "hour")
//                   const isNewDay = i > 0 && dt.day !== zonedStart.plus({ hours: i - 1 }).day
//                   return {
//                     label: dt.toFormat("h"),
//                     fullDay: dt.toFormat("ccc, LLL d"),
//                     ampm: dt.toFormat("a"),
//                     isCurrentHour,
//                     dt,
//                     isNewDay,
//                   }
//                 })
//                 return (
//                   <div key={zone} style={{ display: "flex", height: 60, gap: 2, borderBottom: `1px solid ${token.colorBorderSecondary}`, marginBottom: 6 }}> 
//                     {hours.map((h, i) => (
//                       <div
//                         key={i}
//                         onMouseEnter={() => setHoveredHourIndex(i)}
//                         onMouseLeave={() => setHoveredHourIndex(null)}
//                         style={{
//                           width: 60,
//                           borderRadius: h.isNewDay ? '8px' : 0,
//                           textAlign: "center",
//                           padding: "4px 0",
//                           backgroundColor: h.isCurrentHour ? "#3b82f6" : h.dt.hasSame(DateTime.now().setZone(zone), 'day') ? "#e6f0ff" : "#fffbe6",
//                           color: h.isCurrentHour ? "#fff" : "#000",
//                           borderLeft: `1px solid ${token.colorBorderSecondary}`,
//                           position: "relative",
//                         }}
//                       >
//                         <div>{h.isNewDay && <div style={{ fontSize: 10, fontWeight: 'bold', color: '#666' }}>{h.dt.toFormat('ccc').toUpperCase()}<br />{h.dt.toFormat('LLL d')}</div>}{h.label}</div>
//                         <div style={{ fontSize: 10 }}>{h.ampm}</div>
//                         {hoveredHourIndex === i && (
//                           <div
//                             style={{
//                               position: "absolute",
//                               top: 0,
//                               bottom: 0,
//                               left: 0,
//                               right: 0,
//                               border: "2px solid black",
//                               pointerEvents: "none",
//                             }}
//                           ></div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </div>
//       </Card>

//       <div style={{ marginTop: 16, textAlign: "center" }}>
//         <Text type="secondary">WorldTimeBuddy Clone – Drag & Drop + Star to Pin</Text>
//       </div>
//     </div>
//   )
// }
// Full layout updated to match original World Time Buddy look with draggable rows and star-to-pin functionality
// "use client"

// import { useState, useEffect, useMemo, useRef } from "react"
// import { DateTime } from "luxon"
// import {
//   Card,
//   Button,
//   Row,
//   Col,
//   Space,
//   Typography,
//   Tooltip,
//   theme,
//   Select,
// } from "antd"
// import {
//   CloseOutlined,
//   SettingOutlined,
//   LinkOutlined,
//   StarOutlined,
//   StarFilled,
//   LeftOutlined,
//   RightOutlined,
// } from "@ant-design/icons"
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

// const { Text } = Typography
// const { useToken } = theme

// const timezones = Intl.supportedValuesOf('timeZone').map(zone => {
//   const dt = DateTime.now().setZone(zone)
//   return {
//     zone,
//     city: zone.split("/").pop().replace(/_/g, " "),
//     country: zone.split("/")[0].replace(/_/g, " "),
//     abbr: dt.offsetNameShort || zone,
//   }
// })


// export default function WorldTimeBuddy() {
//   const { token } = useToken()
//   const [selectedTimezones, setSelectedTimezones] = useState(["Europe/London", "Asia/Kolkata"])
//   const [favorites, setFavorites] = useState([])
//   const [currentDate, setCurrentDate] = useState(DateTime.now())
//   const [hoveredHourIndex, setHoveredHourIndex] = useState(null)
//   const scrollRef = useRef()

//   useEffect(() => {
//     const interval = setInterval(() => setCurrentDate(DateTime.now()), 60000)
//     return () => clearInterval(interval)
//   }, [])

//   const goToPreviousDay = () => setCurrentDate(currentDate.minus({ days: 1 }))
//   const goToNextDay = () => setCurrentDate(currentDate.plus({ days: 1 }))

//   const addTimezone = (zone) => {
//     if (!selectedTimezones.includes(zone)) setSelectedTimezones([...selectedTimezones, zone])
//   }

//   const removeTimezone = (zone) => setSelectedTimezones(selectedTimezones.filter((z) => z !== zone))

//   const toggleFavorite = (zone) => {
//     const isFavorite = favorites.includes(zone)
//     const updatedFavorites = isFavorite ? favorites.filter((z) => z !== zone) : [zone, ...favorites]
//     const reorderedTimezones = [
//       ...updatedFavorites.filter((z) => selectedTimezones.includes(z)),
//       ...selectedTimezones.filter((z) => !updatedFavorites.includes(z)),
//     ]
//     setFavorites(updatedFavorites)
//     setSelectedTimezones(reorderedTimezones)
//   }

//   const getRelativeOffset = (zone) => {
//     const base = DateTime.now().setZone(selectedTimezones[0])
//     const target = DateTime.now().setZone(zone)
//     const diff = (target.offset - base.offset) / 60
//     return diff > 0 ? `+${diff}` : diff.toString()
//   }

//   const onDragEnd = (result) => {
//     if (!result.destination) return
//     const reordered = [...selectedTimezones]
//     const [moved] = reordered.splice(result.source.index, 1)
//     reordered.splice(result.destination.index, 0, moved)
//     setSelectedTimezones(reordered)
//   }

//   return (
//     <div style={{ padding: 16, maxWidth: 1400, margin: "0 auto" }}>
//       <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 16 }}>
//         <Col flex="auto">
//           <Select
//             showSearch
//             placeholder="Select timezone"
//             style={{ width: "100%" }}
//             onChange={addTimezone}
//             options={timezones
//               .filter((tz) => !selectedTimezones.includes(tz.zone))
//               .map((tz) => ({
//                 value: tz.zone,
//                 label: `${tz.city}, ${tz.country} (${tz.abbr})`,
//               }))}
//           />
//         </Col>
//         <Col>
//           <Space>
//             <Button icon={<LeftOutlined />} onClick={goToPreviousDay} />
//             <Text>{currentDate.toFormat("ccc, LLL d")}</Text>
//             <Button icon={<RightOutlined />} onClick={goToNextDay} />
//           </Space>
//         </Col>
//         <Col>
//           <Tooltip title="Settings">
//             <Button icon={<SettingOutlined />} />
//           </Tooltip>
//         </Col>
//         <Col>
//           <Tooltip title="Copy Shareable Link">
//             <Button icon={<LinkOutlined />} />
//           </Tooltip>
//         </Col>
//       </Row>

//       <Card bodyStyle={{ padding: 0, overflow: "auto" }}>
//         <div style={{ display: "flex" }} ref={scrollRef}>
//           <div style={{ width: 380, background: "#f7f7f7", borderRight: `1px solid ${token.colorBorderSecondary}` }}>
//             <div style={{ height: 0 }}></div>
//             <DragDropContext onDragEnd={onDragEnd}>
//               <Droppable droppableId="zones">
//                 {(provided) => (
//                   <div {...provided.droppableProps} ref={provided.innerRef}>
//                     {selectedTimezones.map((zone, index) => {
//                       const info = timezones.find((tz) => tz.zone === zone) || { city: zone, country: "", abbr: "", zone }
//                       const zonedTime = currentDate.setZone(zone)
//                       const offset = getRelativeOffset(zone)
//                       return (
//                         <Draggable key={zone} draggableId={zone} index={index}>
//                           {(provided) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               style={{
//                                 ...provided.draggableProps.style,
//                                 display: "flex",
//                                 alignItems: "center",
//                                 height: 60,
//                                 paddingLeft: 8,
//                                 borderBottom: `1px solid ${token.colorBorderSecondary}`,
//                                 background: "#fff",
//                                 borderRadius: 4,
//                                 marginBottom: 4,
//                                 cursor: "grab",
//                               }}
//                             >
//                               <div style={{ width: 50, textAlign: "right", paddingRight: 8 }}>
//                                 <Text type="secondary">{offset}</Text>
//                               </div>
//                               <div>
//                                 <Text strong>{info.city}</Text> <Text type="secondary">{info.abbr}</Text>
//                                 <br />
//                                 <Text type="secondary" style={{ fontSize: 12 }}>{info.country}</Text>
//                               </div>
//                               <div style={{ marginLeft: "auto", paddingRight: 8 }}>
//                                 <Text>{zonedTime.toFormat("h:mm a")}</Text>
//                                 <br />
//                                 <Text type="secondary" style={{ fontSize: 12 }}>{zonedTime.toFormat("ccc, LLL d")}</Text>
//                               </div>
//                               <Button
//                                 type="text"
//                                 size="small"
//                                 icon={favorites.includes(zone) ? <StarFilled /> : <StarOutlined />}
//                                 onClick={() => toggleFavorite(zone)}
//                                 style={{ color: favorites.includes(zone) ? "#faad14" : undefined }}
//                               />
//                               <Button type="text" danger size="small" icon={<CloseOutlined />} onClick={() => removeTimezone(zone)} />
//                             </div>
//                           )}
//                         </Draggable>
//                       )
//                     })}
//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             </DragDropContext>
//           </div>

//           <div style={{ overflowX: "auto", width: "100%", background: "#fff" }}>
//             <div>
//               {selectedTimezones.map((zone) => {
//                 const zonedStart = currentDate.startOf("day").setZone(zone)
//                 const hours = Array.from({ length: 24 }, (_, i) => {
//                   const dt = zonedStart.plus({ hours: i })
//                   const isCurrentHour = dt.hasSame(DateTime.now().setZone(zone), "hour")
//                   const isNewDay = i > 0 && dt.day !== zonedStart.plus({ hours: i - 1 }).day
//                   return {
//                     label: dt.toFormat("h"),
//                     fullDay: dt.toFormat("ccc, LLL d"),
//                     ampm: dt.toFormat("a"),
//                     isCurrentHour,
//                     dt,
//                     isNewDay,
//                   }
//                 })
//                 return (
//                   <div key={zone} style={{ display: "flex", height: 60, gap: 2, borderBottom: `1px solid ${token.colorBorderSecondary}`, marginBottom: 6 }}> 
//                     {hours.map((h, i) => (
//                       <div
//                         key={i}
//                         onMouseEnter={() => setHoveredHourIndex(i)}
//                         onMouseLeave={() => setHoveredHourIndex(null)}
//                         style={{
//                           width: 60,
//                           borderRadius: h.isNewDay ? '8px' : 0,
//                           textAlign: "center",
//                           padding: "4px 0",
//                           backgroundColor: h.isCurrentHour ? "#3b82f6" : h.dt.hasSame(DateTime.now().setZone(zone), 'day') ? "#e6f0ff" : "#fffbe6",
//                           color: h.isCurrentHour ? "#fff" : "#000",
//                           borderLeft: `1px solid ${token.colorBorderSecondary}`,
//                           position: "relative",
//                         }}
//                       >
//                         <div>{h.isNewDay && <div style={{ fontSize: 10, fontWeight: 'bold', color: '#666' }}>{h.dt.toFormat('ccc').toUpperCase()}<br />{h.dt.toFormat('LLL d')}</div>}{h.label}</div>
//                         <div style={{ fontSize: 10 }}>{h.ampm}</div>
//                         {hoveredHourIndex === i && (
//                           <div
//                             style={{
//                               position: "absolute",
//                               top: 0,
//                               bottom: 0,
//                               left: 0,
//                               right: 0,
//                               border: "2px solid black",
//                               pointerEvents: "none",
//                             }}
//                           ></div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </div>
//       </Card>

//       <div style={{ marginTop: 16, textAlign: "center" }}>
//         <Text type="secondary">WorldTimeBuddy Clone – Drag & Drop + Star to Pin</Text>
//       </div>
//     </div>
//   )
// }
// Full layout updated to match original World Time Buddy look with draggable rows and star-to-pin functionality
// Full layout updated to match original World Time Buddy look with draggable rows and star-to-pin functionality
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { DateTime } from "luxon"
import dayjs from 'dayjs';
import {
  Card,
  Button,
  Row,
  Col,
  Space,
  Typography,
  Tooltip,
  theme,
  Select,
} from "antd"
import {
  CloseOutlined,
  SettingOutlined,
  LinkOutlined,
  StarOutlined,
  StarFilled,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

const { Text } = Typography
const { useToken } = theme

const timezoneAbbreviations = [
  { abbr: 'UTC', city: 'Universal Time', country: 'Worldwide' },
  { abbr: 'EEST', city: 'Eastern European Summer Time', country: 'Eastern Europe' },
  { abbr: 'EDT', city: 'Eastern Daylight Time', country: 'USA/Canada' },
  { abbr: 'CST', city: 'Central Standard Time', country: 'USA/Canada' },
  { abbr: 'PDT', city: 'Pacific Daylight Time', country: 'USA/Canada' },
  { abbr: 'IST', city: 'India Standard Time', country: 'India' },
  { abbr: 'BST', city: 'British Summer Time', country: 'UK' },
  { abbr: 'GMT', city: 'Greenwich Mean Time', country: 'UK' },
  { abbr: 'MST', city: 'Mountain Standard Time', country: 'USA/Canada' },
  { abbr: 'CDT', city: 'Central Daylight Time', country: 'USA/Canada' },
  { abbr: 'AST', city: 'Atlantic Standard Time', country: 'Canada/Caribbean' },
  { abbr: 'DST', city: 'Daylight Saving Time', country: 'Various' },
  { abbr: 'ADT', city: 'Atlantic Daylight Time', country: 'Canada' },
  { abbr: 'AKDT', city: 'Alaska Daylight Time', country: 'USA' },
  { abbr: 'AKST', city: 'Alaska Standard Time', country: 'USA' },
  { abbr: 'ART', city: 'Argentina Time', country: 'Argentina' },
  { abbr: 'BDT', city: 'Bangladesh Time', country: 'Bangladesh' },
  { abbr: 'CET', city: 'Central European Time', country: 'Europe' },
  { abbr: 'CEST', city: 'Central European Summer Time', country: 'Europe' },
  { abbr: 'CLT', city: 'Chile Standard Time', country: 'Chile' },
  { abbr: 'CLST', city: 'Chile Summer Time', country: 'Chile' },
  { abbr: 'EAT', city: 'East Africa Time', country: 'Africa' },
  { abbr: 'EST', city: 'Eastern Standard Time', country: 'USA/Canada' },
  { abbr: 'HKT', city: 'Hong Kong Time', country: 'Hong Kong' },
  { abbr: 'HST', city: 'Hawaii Standard Time', country: 'USA' },
  { abbr: 'ICT', city: 'Indochina Time', country: 'Thailand, Vietnam' },
  { abbr: 'IRDT', city: 'Iran Daylight Time', country: 'Iran' },
  { abbr: 'IRST', city: 'Iran Standard Time', country: 'Iran' },
  { abbr: 'JST', city: 'Japan Standard Time', country: 'Japan' },
  { abbr: 'KST', city: 'Korea Standard Time', country: 'South Korea' },
  { abbr: 'MDT', city: 'Mountain Daylight Time', country: 'USA/Canada' },
  { abbr: 'MSD', city: 'Moscow Daylight Time', country: 'Russia' },
  { abbr: 'MSK', city: 'Moscow Standard Time', country: 'Russia' },
  { abbr: 'NZDT', city: 'New Zealand Daylight Time', country: 'New Zealand' },
  { abbr: 'NZST', city: 'New Zealand Standard Time', country: 'New Zealand' },
  { abbr: 'PKT', city: 'Pakistan Standard Time', country: 'Pakistan' },
  { abbr: 'PST', city: 'Pacific Standard Time', country: 'USA/Canada' },
  { abbr: 'SAMT', city: 'Samara Time', country: 'Russia' },
  { abbr: 'SAST', city: 'South Africa Standard Time', country: 'South Africa' },
  { abbr: 'SGT', city: 'Singapore Time', country: 'Singapore' },
  { abbr: 'THA', city: 'Thailand Time', country: 'Thailand' },
  { abbr: 'WAT', city: 'West Africa Time', country: 'Africa' },
  { abbr: 'WET', city: 'Western European Time', country: 'Europe' },
  { abbr: 'WEST', city: 'Western European Summer Time', country: 'Europe' },
  { abbr: 'WIB', city: 'Western Indonesia Time', country: 'Indonesia' },
  { abbr: 'WIT', city: 'Eastern Indonesia Time', country: 'Indonesia' },
  { abbr: 'YAKT', city: 'Yakutsk Time', country: 'Russia' },
]

const timezones = [
  { zone: "Europe/London", city: "London", country: "United Kingdom", abbr: "BST" },
  { zone: "Africa/Cairo", city: "Cairo", country: "Egypt", abbr: "EET" },
  { zone: "Europe/Moscow", city: "Moscow", country: "Russia", abbr: "MSK" },
  { zone: "UTC", city: "UTC", country: "Coordinated Universal Time", abbr: "UTC" },
  { zone: "Asia/Kolkata", city: "Kolkata", country: "India", abbr: "IST" },
  { zone: "America/New_York", city: "New York", country: "USA", abbr: "EDT" },
  { zone: "America/Los_Angeles", city: "Los Angeles", country: "USA", abbr: "PDT" },
  { zone: "Asia/Tokyo", city: "Tokyo", country: "Japan", abbr: "JST" },
  { zone: "Australia/Sydney", city: "Sydney", country: "Australia", abbr: "AEST" },
  { zone: "Europe/Paris", city: "Paris", country: "France", abbr: "CEST" },
  { zone: "Asia/Dubai", city: "Dubai", country: "UAE", abbr: "GST" },
  { zone: "Asia/Singapore", city: "Singapore", country: "Singapore", abbr: "SGT" },
  { zone: "America/Chicago", city: "Chicago", country: "USA", abbr: "CDT" },
  { zone: "America/Denver", city: "Denver", country: "USA", abbr: "MDT" },
  { zone: "America/Toronto", city: "Toronto", country: "Canada", abbr: "EDT" },
  { zone: "America/Vancouver", city: "Vancouver", country: "Canada", abbr: "PDT" },
  { zone: "America/Sao_Paulo", city: "Sao Paulo", country: "Brazil", abbr: "BRT" },
  { zone: "Europe/Berlin", city: "Berlin", country: "Germany", abbr: "CEST" },
  { zone: "Europe/Madrid", city: "Madrid", country: "Spain", abbr: "CEST" },
  { zone: "Europe/Rome", city: "Rome", country: "Italy", abbr: "CEST" },
  { zone: "Asia/Bangkok", city: "Bangkok", country: "Thailand", abbr: "ICT" },
  { zone: "Asia/Seoul", city: "Seoul", country: "South Korea", abbr: "KST" },
  { zone: "Asia/Ho_Chi_Minh", city: "Ho Chi Minh", country: "Vietnam", abbr: "ICT" },
  { zone: "Asia/Jakarta", city: "Jakarta", country: "Indonesia", abbr: "WIB" },
  { zone: "Africa/Lagos", city: "Lagos", country: "Nigeria", abbr: "WAT" },
  { zone: "Africa/Johannesburg", city: "Johannesburg", country: "South Africa", abbr: "SAST" },
  { zone: "Pacific/Auckland", city: "Auckland", country: "New Zealand", abbr: "NZDT" },
  { zone: "Pacific/Honolulu", city: "Honolulu", country: "USA", abbr: "HST" },
  { zone: "Asia/Kathmandu", city: "Kathmandu", country: "Nepal", abbr: "NPT" },
  { zone: "Asia/Tehran", city: "Tehran", country: "Iran", abbr: "IRST" },
  { zone: "Asia/Tashkent", city: "Tashkent", country: "Uzbekistan", abbr: "UZT" },
  { zone: "Asia/Yangon", city: "Yangon", country: "Myanmar", abbr: "MMT" }
]

export default function WorldTimeBuddy() {
  const { token } = useToken()
  const [selectedTimezones, setSelectedTimezones] = useState(["Europe/London", "Asia/Kolkata"])
  const [favorites, setFavorites] = useState([])
  const [currentDate, setCurrentDate] = useState(DateTime.now())
  const [hoveredHourIndex, setHoveredHourIndex] = useState(null)
  const scrollRef = useRef()

  useEffect(() => {
    const interval = setInterval(() => setCurrentDate(DateTime.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  const goToPreviousDay = () => setCurrentDate(currentDate.minus({ days: 1 }))
  const goToNextDay = () => setCurrentDate(currentDate.plus({ days: 1 }))

  const addTimezone = (zone) => {
    if (!selectedTimezones.includes(zone)) setSelectedTimezones([...selectedTimezones, zone])
  }

  const removeTimezone = (zone) => setSelectedTimezones(selectedTimezones.filter((z) => z !== zone))

  const toggleFavorite = (zone) => {
    const isFavorite = favorites.includes(zone)
    const updatedFavorites = isFavorite ? favorites.filter((z) => z !== zone) : [zone, ...favorites]
    const reorderedTimezones = [
      ...updatedFavorites.filter((z) => selectedTimezones.includes(z)),
      ...selectedTimezones.filter((z) => !updatedFavorites.includes(z)),
    ]
    setFavorites(updatedFavorites)
    setSelectedTimezones(reorderedTimezones)
  }

  const getRelativeOffset = (zone) => {
    const base = DateTime.now().setZone(selectedTimezones[0])
    const target = DateTime.now().setZone(zone)
    const diff = (target.offset - base.offset) / 60
    return diff > 0 ? `+${diff}` : diff.toString()
  }

  const onDragEnd = (result) => {
    if (!result.destination) return
    const reordered = [...selectedTimezones]
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    setSelectedTimezones(reordered)
  }

  return (
    <div style={{ padding: 16, maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 600, marginBottom: 24 }}>🌐 Global Clockwise</h1>
      <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Select
            showSearch
            placeholder="Select timezone"
            style={{ width: "100%" }}
            onChange={addTimezone}
            options={timezones
              .filter((tz) => !selectedTimezones.includes(tz.zone))
              .map((tz) => ({
                value: tz.zone,
                label: `${tz.city}, ${tz.country} (${tz.abbr})`,
              }))}
          />
        </Col>
        <Col>
          <Space>
            <Button icon={<LeftOutlined />} onClick={goToPreviousDay} />
            <Text>{currentDate.toFormat("ccc, LLL d")}</Text>
            <Button icon={<RightOutlined />} onClick={goToNextDay} />
          </Space>
        </Col>
        <Col>
          <Tooltip title="Settings">
            <Button icon={<SettingOutlined />} />
          </Tooltip>
        </Col>
        <Col>
          <Tooltip title="Copy Shareable Link">
            <Button icon={<LinkOutlined />} />
          </Tooltip>
        </Col>
      </Row>

      <Card bodyStyle={{ padding: 0, overflow: "auto" }}>
        <div style={{ display: "flex" }} ref={scrollRef}>
          <div style={{ width: 380, background: "#f7f7f7", borderRight: `1px solid ${token.colorBorderSecondary}` }}>
            <div style={{ height: 0 }}></div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="zones">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {selectedTimezones.map((zone, index) => {
                      const info = timezones.find((tz) => tz.zone === zone) || { city: zone, country: "", abbr: "", zone }
                      const zonedTime = currentDate.setZone(zone)
                      const offset = getRelativeOffset(zone)
                      return (
                        <Draggable key={zone} draggableId={zone} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                display: "flex",
                                alignItems: "center",
                                height: 60,
                                paddingLeft: 8,
                                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                                background: "#fff",
                                borderRadius: 4,
                                marginBottom: 4,
                                cursor: "grab",
                              }}
                            >
                              <div style={{ width: 50, textAlign: "right", paddingRight: 8 }}>
                                <Text type="secondary">{offset}</Text>
                              </div>
                              <div>
                                <Text strong>{info.city}</Text> <Text type="secondary">{info.abbr}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>{info.country}</Text>
                              </div>
                              <div style={{ marginLeft: "auto", paddingRight: 8 }}>
                                <Text>{zonedTime.toFormat("h:mm a")}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>{zonedTime.toFormat("ccc, LLL d")}</Text>
                              </div>
                              <Button
                                type="text"
                                size="small"
                                icon={favorites.includes(zone) ? <StarFilled /> : <StarOutlined />}
                                onClick={() => toggleFavorite(zone)}
                                style={{ color: favorites.includes(zone) ? "#faad14" : undefined }}
                              />
                              <Button type="text" danger size="small" icon={<CloseOutlined />} onClick={() => removeTimezone(zone)} />
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <div style={{ overflowX: "auto", width: "100%", background: "#fff" }}>
            <div>
              {selectedTimezones.map((zone) => {
                const zonedStart = currentDate.startOf("day").setZone(zone)
                const hours = Array.from({ length: 24 }, (_, i) => {
                  const dt = zonedStart.plus({ hours: i })
                  const isCurrentHour = dt.hasSame(DateTime.now().setZone(zone), "hour")
                  const isNewDay = i > 0 && dt.day !== zonedStart.plus({ hours: i - 1 }).day
                  return {
                    label: dt.toFormat("h"),
                    fullDay: dt.toFormat("ccc, LLL d"),
                    ampm: dt.toFormat("a"),
                    isCurrentHour,
                    dt,
                    isNewDay,
                  }
                })
                return (
                  <div key={zone} style={{ display: "flex", height: 60, gap: 2, borderBottom: `1px solid ${token.colorBorderSecondary}`, marginBottom: 6 }}> 
                    {hours.map((h, i) => (
                      <div
                        key={i}
                        onMouseEnter={() => setHoveredHourIndex(i)}
                        onMouseLeave={() => setHoveredHourIndex(null)}
                        style={{
                          width: 60,
                          borderRadius: h.isNewDay ? '8px' : 0,
                          textAlign: "center",
                          padding: "4px 0",
                          backgroundColor: h.isCurrentHour ? "#3b82f6" : h.dt.hasSame(DateTime.now().setZone(zone), 'day') ? "#e6f0ff" : "#fffbe6",
                          color: h.isCurrentHour ? "#fff" : "#000",
                          borderLeft: `1px solid ${token.colorBorderSecondary}`,
                          position: "relative",
                        }}
                      >
                        <div>{h.isNewDay && <div style={{ fontSize: 10, fontWeight: 'bold', color: '#666' }}>{h.dt.toFormat('ccc').toUpperCase()}<br />{h.dt.toFormat('LLL d')}</div>}{h.label}</div>
                        <div style={{ fontSize: 10 }}>{h.ampm}</div>
                        {hoveredHourIndex === i && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              bottom: 0,
                              left: 0,
                              right: 0,
                              border: "2px solid black",
                              pointerEvents: "none",
                            }}
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>
      <div style={{ marginTop: '50px', marginLeft: '15px', marginBottom:'10px' }}>
        <h4 style={{ fontWeight: "200", margin: 0 }}>
          Copyright © {dayjs().format('YYYY')} All rights reserved | vyaktimetrics
        </h4>
      </div>
    </div>
  )
}

