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
import { useTokenContext } from "./parent";

const { Text } = Typography
const { useToken } = theme



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
//   { zone: "America/Chicago", city: "Chicago", country: "USA", abbr: "CDT" },
//   { zone: "America/Denver", city: "Denver", country: "USA", abbr: "MDT" },
//   { zone: "America/Toronto", city: "Toronto", country: "Canada", abbr: "EDT" },
//   { zone: "America/Vancouver", city: "Vancouver", country: "Canada", abbr: "PDT" },
//   { zone: "America/Sao_Paulo", city: "Sao Paulo", country: "Brazil", abbr: "BRT" },
//   { zone: "Europe/Berlin", city: "Berlin", country: "Germany", abbr: "CEST" },
//   { zone: "Europe/Madrid", city: "Madrid", country: "Spain", abbr: "CEST" },
//   { zone: "Europe/Rome", city: "Rome", country: "Italy", abbr: "CEST" },
//   { zone: "Asia/Bangkok", city: "Bangkok", country: "Thailand", abbr: "ICT" },
//   { zone: "Asia/Seoul", city: "Seoul", country: "South Korea", abbr: "KST" },
//   { zone: "Asia/Ho_Chi_Minh", city: "Ho Chi Minh", country: "Vietnam", abbr: "ICT" },
//   { zone: "Asia/Jakarta", city: "Jakarta", country: "Indonesia", abbr: "WIB" },
//   { zone: "Africa/Lagos", city: "Lagos", country: "Nigeria", abbr: "WAT" },
//   { zone: "Africa/Johannesburg", city: "Johannesburg", country: "South Africa", abbr: "SAST" },
//   { zone: "Pacific/Auckland", city: "Auckland", country: "New Zealand", abbr: "NZDT" },
//   { zone: "Pacific/Honolulu", city: "Honolulu", country: "USA", abbr: "HST" },
//   { zone: "Asia/Kathmandu", city: "Kathmandu", country: "Nepal", abbr: "NPT" },
//   { zone: "Asia/Tehran", city: "Tehran", country: "Iran", abbr: "IRST" },
//   { zone: "Asia/Tashkent", city: "Tashkent", country: "Uzbekistan", abbr: "UZT" },
//   { zone: "Asia/Yangon", city: "Yangon", country: "Myanmar", abbr: "MMT" }
// ]

const timezones = [
  { zone: "Asia/Kolkata", city: "Kolkata", country: "India", abbr: "IST" },
  { zone: "Europe/London", city: "London", country: "United Kingdom", abbr: "BST" },
  { zone: "Africa/Cairo", city: "Cairo", country: "Egypt", abbr: "EET" },
  { zone: "America/Los_Angeles", city: "Los Angeles", country: "USA", abbr: "PDT" },
  { zone: "UTC", city: "UTC", country: "Coordinated Universal Time", abbr: "UTC" },
  { zone: "Europe/Moscow", city: "Moscow", country: "Russia", abbr: "MSK" },
  { zone: "America/New_York", city: "New York", country: "USA", abbr: "EDT" },
  { zone: "Asia/Tokyo", city: "Tokyo", country: "Japan", abbr: "JST" },
  { zone: "Australia/Sydney", city: "Sydney", country: "Australia", abbr: "AEST" },
  { zone: "Europe/Paris", city: "Paris", country: "France", abbr: "CEST" },
  { zone: "Asia/Dubai", city: "Dubai", country: "United Arab Emirates", abbr: "GST" },
  { zone: "Asia/Singapore", city: "Singapore", country: "Singapore", abbr: "SGT" },
  { zone: "America/Chicago", city: "Chicago", country: "USA", abbr: "CDT" },
  { zone: "America/Denver", city: "Denver", country: "USA", abbr: "MDT" },
  { zone: "America/Sao_Paulo", city: "Sao Paulo", country: "Brazil", abbr: "BRT" },
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
  { zone: "Asia/Yangon", city: "Yangon", country: "Myanmar", abbr: "MMT" },
  { zone: "Europe/Berlin", city: "Berlin", country: "Germany", abbr: "CEST" },
  { zone: "Europe/Madrid", city: "Madrid", country: "Spain", abbr: "CEST" },
  { zone: "Europe/Rome", city: "Rome", country: "Italy", abbr: "CEST" },
  { zone: "America/Toronto", city: "Toronto", country: "Canada", abbr: "EDT" },
  { zone: "America/Vancouver", city: "Vancouver", country: "Canada", abbr: "PDT" }
]


export default function WorldTimeBuddy() {
  const { token } = useToken()
  const [selectedTimezones, setSelectedTimezones] = useState(["Europe/London", "Asia/Kolkata"])
  const [favorites, setFavorites] = useState([])
  const [currentDate, setCurrentDate] = useState(DateTime.now())
  const [hoveredHourIndex, setHoveredHourIndex] = useState(null)
  const scrollRef = useRef()
  const { theme } = useTokenContext();

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
      <h1 style={{ textAlign: "center", fontSize: 20, fontWeight: 600, marginBottom: 24, color: theme === 'dark' ? '#fff' : '#000' }}>🌐 Global clockwise</h1>
      <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 16 }}>
        <Col flex="auto">

          <Select
            dropdownClassName={theme === 'dark' && "custom-dropdown"}
            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
            showSearch
            filterOption={(input, option) => {
              const label = option?.label?.toLowerCase?.() || ""
              const value = option?.value?.toLowerCase?.() || ""
              return (
                label.includes(input.toLowerCase()) ||
                value.includes(input.toLowerCase())
              )
            }}
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
            <Button style={{
              backgroundColor: theme === 'dark' ? '#333' : '#fff',
              color: theme === 'dark' ? '#fff' : '#333',
              border: '1px solid #91C25F'
            }} icon={<LeftOutlined />} onClick={goToPreviousDay} />
            <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{currentDate.toFormat("ccc, LLL d")}</Text>
            <Button style={{
              backgroundColor: theme === 'dark' ? '#333' : '#fff',
              color: theme === 'dark' ? '#91C25F' : '#2f4f2f',
              border: '1px solid #91C25F'
            }} icon={<RightOutlined />} onClick={goToNextDay} />
          </Space>
        </Col>
        <Col>
          <Tooltip title="Settings">
            <Button icon={<SettingOutlined />} style={{
              backgroundColor: '#91C25F',
              border: '1px solid #91C25F'
            }} />
          </Tooltip>
        </Col>
        <Col>
          <Tooltip title="Copy Shareable Link">
            <Button icon={<LinkOutlined />} style={{
              backgroundColor: '#91C25F',
              border: '1px solid #91C25F'
            }} />
          </Tooltip>
        </Col>
      </Row>

      <Card bodyStyle={{ padding: 0, overflow: "auto" }} >
        <div style={{ display: "flex" }} ref={scrollRef}>
          <div style={{ width: 380, background: theme === 'dark' ? '#333' : '#f7f7f7', borderRight: `1px solid ${token.colorBorderSecondary}` }}>
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
                                background: theme === 'dark' ? '#555' : '#fff',
                                borderRadius: 4,
                                marginBottom: 4,
                                cursor: "grab",
                              }}
                            >
                              <div style={{ width: 50, textAlign: "right", paddingRight: 8 }}>
                                <Text style={{ color: theme === 'dark' ? '#ccc' : '#555' }}>{offset}</Text>
                              </div>
                              <div>
                                <Text style={{ fontWeight: 500, color: theme === 'dark' ? '#fff' : '#000' }}>{info.city}</Text>
                                <Text style={{ color: theme === 'dark' ? '#aaa' : '#888', marginLeft: 4 }}>{info.abbr}</Text>
                                <br />
                                <Text style={{ fontSize: 12, color: theme === 'dark' ? '#aaa' : '#666' }}>{info.country}</Text>
                              </div>

                              <div style={{ marginLeft: "auto", paddingRight: 8 }}>
                                <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{zonedTime.toFormat("h:mm a")}</Text>
                                <br />
                                <Text style={{ fontSize: 12, color: theme === 'dark' ? '#aaa' : '#888' }}>
                                  {zonedTime.toFormat("ccc, LLL d")}
                                </Text>
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

          <div style={{ overflowX: "auto", width: "100%", background:theme === 'dark' ? '#555' : '#fff'}}>
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
                        <div>{h.isNewDay && <div style={{ fontSize: 7, fontWeight: 'bold', color: '#666' }}>{h.dt.toFormat('ccc').toUpperCase()}<br />{h.dt.toFormat('LLL d')}</div>}{h.label}</div>
                        <div style={{ fontSize: 10 }}>{h.ampm}</div>
                        {hoveredHourIndex === i && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              bottom: 0,
                              left: 0,
                              right: 0,
                              border: "1px solid black",
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
      {/* <div style={{ marginTop: '50px', marginLeft: '15px', marginBottom: '10px', color: theme === 'dark' ? '#fff' : '#000' }}>
        <h4 style={{ fontWeight: "200", margin: 0 }}>
          Copyright © {dayjs().format('YYYY')} All rights reserved | vyaktimetrics
        </h4>
      </div> */}
    </div>
  )
}

