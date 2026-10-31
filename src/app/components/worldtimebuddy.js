"use client";


import { useState, useEffect, useRef } from "react";
import { DateTime } from "luxon";
import moment from "moment-timezone";
import ct from "countries-and-timezones";
import {
  Card, Button, Row, Col, Space, Typography, Tooltip, theme, Select, Spin,
  Dropdown,
  Menu
} from "antd";
import {
  LeftOutlined, RightOutlined, SettingOutlined, LinkOutlined,
  CloseOutlined, StarOutlined, StarFilled
} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useTokenContext } from "./parent";


const { Text } = Typography;
const { useToken } = theme;




export default function WorldTimeBuddy() {
  const { theme } = useTokenContext();
  const token =localStorage.getItem("token")
  const [timezones, setTimezones] = useState([]);
  const [selectedTimezones, setSelectedTimezones] = useState(["Europe/London", "Asia/Kolkata"]);
  const [favorites, setFavorites] = useState([]);
  const [now, setNow] = useState(DateTime.now());
  const [dayOffset, setDayOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showTimezones, setShowTimezones] = useState(false);
  const [markWeekends, setMarkWeekends] = useState(false);
  const [hoveredHourIndex, setHoveredHourIndex] = useState(null)


  const scrollRef = useRef();


  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://app.vyaktimetrics.com/open/globalclock/timezones", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token
          }
        });
        const apiData = await res.json();  
        const zones = apiData.timezones || [];
        const enriched = zones.map(zone => {
          const m = moment().tz(zone);
          const parts = zone.split("/");
          const city = parts.pop()?.replace(/_/g, " ") || zone;
          const region = parts.join(" / ");
          const abbr = m.format("z");
          const offset = m.format("Z");
          const tzInfo = ct.getTimezone(zone);
          let country = "";
          if (tzInfo?.countries?.length) {
            const c = tzInfo.countries[0];
            country = ct.getCountry(c)?.name || region;
          } else country = region || "—";
          return { zone, city, country, abbr, offset, searchKey: `${zone} ${city} ${country} ${abbr}`.toLowerCase() };
        });
        setTimezones(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);


  useEffect(() => {
    const id = setInterval(() => setNow(DateTime.now()), 1000);
    return () => clearInterval(id);
  }, []);


  const displayNow = now.plus({ days: dayOffset });
  const goToPreviousDay = () => setDayOffset((d) => d - 1);
  const goToNextDay = () => setDayOffset((d) => d + 1);
  const goToToday = () => setDayOffset(0);


  const addTimezone = (zone) => {
    if (!selectedTimezones.includes(zone)) setSelectedTimezones([...selectedTimezones, zone]);
  };
  const removeTimezone = (zone) => setSelectedTimezones(selectedTimezones.filter(z => z !== zone));


  const toggleFavorite = (zone) => {
    const isFav = favorites.includes(zone);
    const updated = isFav ? favorites.filter(z => z !== zone) : [zone, ...favorites];
    const reordered = [...updated.filter(z => selectedTimezones.includes(z)), ...selectedTimezones.filter(z => !updated.includes(z))];
    setFavorites(updated);
    setSelectedTimezones(reordered);
  };


  const getRelativeOffset = (zone) => {
    if (!selectedTimezones.length) return "";
    const base = now.setZone(selectedTimezones[0]);
    const target = now.setZone(zone);
    const diff = (target.offset - base.offset) / 60;
    return diff > 0 ? `+${diff}` : diff.toString();
  };
  const getAlignedHours = (baseZone, targetZone, displayNow) => {
    const baseNow = displayNow.setZone(baseZone);
    const targetNow = displayNow.setZone(targetZone);


    const offsetDiffHours = (targetNow.offset - baseNow.offset) / 60;
    const startOfBaseDay = baseNow.startOf("day");
    const startAligned = startOfBaseDay.plus({ hours: offsetDiffHours });


    return Array.from({ length: 24 }, (_, i) => {
      const dt = startAligned.plus({ hours: i });
      const isCurrentHour =
        dayOffset === 0 && dt.hasSame(targetNow, "hour");
      const isNewDay =
        i > 0 && dt.day !== startAligned.plus({ hours: i - 1 }).day;
      return { dt, isCurrentHour, isNewDay };
    });
  };


  const onDragEnd = (result) => {
    if (!result.destination) return;
    const r = [...selectedTimezones];
    const [moved] = r.splice(result.source.index, 1);
    r.splice(result.destination.index, 0, moved);
    setSelectedTimezones(r);
  };


  const filterOption = (input, option) => (option?.searchKey ?? "").includes(input.toLowerCase());




  return (
    <div style={{ padding: 16, maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", fontSize: 20, fontWeight: 600, marginBottom: 24, color: theme === "dark" ? "#fff" : "#000" }}>
        🌐 Global Clockwise
      </h1>


      <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Select
            showSearch
            loading={loading}
            placeholder="Search..."
            // className={` ${theme === "dark" ? "custom-input-dark" : "custom-input-light"}`}
            dropdownClassName={theme === "dark" && "custom-dropdown"}
            style={{ width: "100%" }}
            filterOption={filterOption}
            onChange={addTimezone}
            options={timezones.filter(tz => !selectedTimezones.includes(tz.zone)).map(tz => ({
              value: tz.zone,
              // label: `${tz.city}, ${tz.country} (${tz.abbr}) — UTC${tz.offset}`,
              label: `${tz.city}, ${tz.country} (${tz.abbr})`,
              searchKey: tz.searchKey
            }))}
          />
        </Col>


        <Col>
          <Space>
            <Button icon={<LeftOutlined />} onClick={goToPreviousDay} style={{ backgroundColor: theme === "dark" ? "#333" : "#fff", border: "1px solid #5B8CFF", color: theme === "dark" ? "#fff" : "#333" }} />
            <Text style={{ color: theme === "dark" ? "#fff" : "#000" }}>{displayNow.toFormat("ccc, LLL d")}{dayOffset !== 0 ? " " : ""}</Text>
            <Button icon={<RightOutlined />} onClick={goToNextDay} style={{ backgroundColor: theme === "dark" ? "#333" : "#fff", border: "1px solid #5B8CFF", color: theme === "dark" ? "#5B8CFF" : "#2f4f2f" }} />
            {/* quick "today" button */}
            {dayOffset !== 0 && <Button onClick={goToToday} size="small">Today</Button>}
          </Space>
        </Col>


        <Col>
          {/* <Tooltip title="Settings"><Button icon={<SettingOutlined />} style={{ backgroundColor: "#5B8CFF", border: "1px solid #5B8CFF" }} /></Tooltip> */}
          <Dropdown
            trigger={["click"]}
            overlay={
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  padding: 8,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  width: 180,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    cursor: "pointer",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={showTimezones}
                    onChange={() => setShowTimezones(!showTimezones)}
                    style={{
                      accentColor: "#5B8CFF",
                      height: 16,
                      width: 16,
                      cursor: "pointer",
                    }}
                  />
                  Show Timezones
                </label>


                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    cursor: "pointer",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={markWeekends}
                    onChange={() => setMarkWeekends(!markWeekends)}
                    style={{
                      accentColor: "#5B8CFF",
                      width: 16,
                      height: 16,
                      cursor: "pointer",
                    }}
                  />
                  Mark Weekends
                </label>
              </div>
            }
          >
            <Button
              icon={<SettingOutlined />}
              style={{
                backgroundColor: "#5B8CFF",
                border: "1px solid #5B8CFF",
                color: "#fff",
              }}
            />
          </Dropdown>


        </Col>
        {/* <Col>
          <Tooltip title="Copy Shareable Link"><Button icon={<LinkOutlined />} style={{ backgroundColor: "#5B8CFF", border: "1px solid #5B8CFF" }} /></Tooltip>
        </Col> */}
      </Row>


      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spin /> Loading all timezones...</div>
      ) : (
        <Card bodyStyle={{ padding: 0, overflow: "auto" }}>
          <div style={{ display: "flex" }} ref={scrollRef}>
            <div style={{ width: 380, background: theme === "dark" ? "#333" : "#f7f7f7", borderRight: `1px solid ${token.colorBorderSecondary}` }}>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="zones">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {selectedTimezones.map((zone, index) => {
                        const info = timezones.find(t => t.zone === zone);
                        if (!info) return null;
                        const zonedTime = displayNow.setZone(zone);
                        const offsetRel = getRelativeOffset(zone);
                        return (
                          <Draggable key={zone} draggableId={zone} index={index}>
                            {(prov) => (
                              <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} style={{ ...prov.draggableProps.style, display: "flex", alignItems: "center", height: 60, paddingLeft: 8, borderBottom: `1px solid ${token.colorBorderSecondary}`, background: theme === "dark" ? "#555" : "#fff", borderRadius: 4, marginBottom: 4, cursor: "grab" }}>
                                <div style={{ width: 50, textAlign: "right", paddingRight: 8 }}>
                                  <Text style={{ color: theme === "dark" ? "#ccc" : "#555" }}>{offsetRel}</Text>
                                </div>


                                <div>
                                  <Text style={{ fontWeight: 500, color: theme === "dark" ? "#fff" : "#000" }}>{info.city}</Text>
                                  {showTimezones && (
                                    <Text style={{ color: theme === "dark" ? "#aaa" : "#888", marginLeft: 4 }}>
                                      {info.abbr}
                                    </Text>
                                  )}


                                  <br></br>


                                  <Text style={{ fontSize: 12, color: theme === "dark" ? "#aaa" : "#666" }}>{info.country}</Text>
                                </div>


                                <div style={{ marginLeft: "auto", paddingRight: 8 }}>
                                  <Text style={{ color: theme === "dark" ? "#fff" : "#000" }}>{zonedTime.toFormat("h:mm a")}</Text><br />
                                  <Text style={{ fontSize: 12, color: theme === "dark" ? "#aaa" : "#888" }}>{zonedTime.toFormat("ccc, LLL d")}</Text>
                                </div>


                                <Button type="text" size="small" icon={favorites.includes(zone) ? <StarFilled /> : <StarOutlined />} onClick={() => toggleFavorite(zone)} style={{ color: favorites.includes(zone) ? "#faad14" : undefined }} />
                                <Button type="text" danger size="small" icon={<CloseOutlined />} onClick={() => removeTimezone(zone)} />
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>


            <div style={{ overflowX: "auto", width: "100%", background: theme === "dark" ? "#555" : "#fff" }}>
              {selectedTimezones.map(zone => {
                const zonedNow = now.setZone(zone);
                const zonedDisplay = displayNow.setZone(zone);
                const startOfDay = zonedDisplay.startOf("day");
                // const hours = Array.from({ length: 24 }, (_, i) => {
                //   const dt = startOfDay.plus({ hours: i });
                //   // highlight only if viewing today (dayOffset === 0) and dt is current hour in that zone
                //   const isCurrentHour = dayOffset === 0 && dt.hasSame(zonedNow, "hour");
                //   const isNewDay = i > 0 && dt.day !== startOfDay.plus({ hours: i - 1 }).day;
                //   return { dt, isCurrentHour, isNewDay };
                // });
                const hours = getAlignedHours(selectedTimezones[0], zone, displayNow);
                // console.log("markWeekends:", markWeekends);




                return (
                  <div key={zone} style={{ display: "flex", height: 60, gap: 2, borderBottom: `1px solid ${token.colorBorderSecondary}`, marginBottom: 6 }}>
                    {/* {hours.map((h, i) => (
                      <div key={i} style={{
                        width: 60, textAlign: "center", padding: "4px 0",
                        borderRadius: h.isNewDay ? "8px" : 0,
                        // backgroundColor: h.isCurrentHour ? "#3b82f6" : h.dt.hasSame(displayNow.setZone(zone), "day") ? "#e6f0ff" : "#fffbe6",
                        backgroundColor:
                          h.isCurrentHour
                            ? "#3b82f6"
                            : markWeekends && (h.dt.weekday === 6 || h.dt.weekday === 7)
                              ? "#fbe9e7"
                              : h.dt.hasSame(displayNow.setZone(zone), "day")
                                ? "#e6f0ff"
                                : "#fffbe6",


                        color: h.isCurrentHour ? "#fff" : "#000",
                        borderLeft: `1px solid ${token.colorBorderSecondary}`
                      }}>
                        <div>{h.dt.toFormat("h")}</div>
                        <div style={{ fontSize: 10 }}>{h.dt.toFormat("a")}</div>
                      </div>
                    ))} */}
                    {hours.map((h, i) => (
                      <div
                        key={i}
                        onMouseEnter={() => setHoveredHourIndex(i)}
                        onMouseLeave={() => setHoveredHourIndex(null)}
                        style={{
                          width: 60,
                          textAlign: "center",
                          padding: "4px 0",
                          borderRadius: h.isNewDay ? "8px" : 0,
                          backgroundColor:
                            h.isCurrentHour
                              ? "#3b82f6" // current hour
                              : markWeekends && (h.dt.weekday === 6 || h.dt.weekday === 7)
                                ? "#fbe9e7" // weekend
                                : h.dt.hasSame(displayNow.setZone(zone), "day")
                                  ? "#e6f0ff" // current day
                                  : "#fffbe6", // other days
                          color: h.isCurrentHour ? "#fff" : "#000",
                          borderLeft: `1px solid ${token.colorBorderSecondary}`,
                          position: "relative",
                          cursor: "pointer",
                        }}
                      >
                        <div>{h.dt.toFormat("h")}</div>
                        <div style={{ fontSize: 10 }}>{h.dt.toFormat("a")}</div>


                        {hoveredHourIndex === i && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              border: "2px solid black",
                              pointerEvents: "none",
                            }}
                          ></div>
                        )}
                      </div>
                    ))}


                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}



