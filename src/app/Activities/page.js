"use client";
import React, { useEffect, useState } from "react";
import { Table, Card, Tooltip } from "antd";
import { useTokenContext } from "../components/parent";

const UserTable = () => {
  const { apiClient } = useTokenContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/UserActivities");
      if (response.status === 200) {
        setData(response.data);
      } else {
        console.error("Failed to fetch users data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data only once on component mount
  useEffect(() => {
    fetchUsersData();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      filters: data
        ? Array.from(new Set(data.map((item) => item.name))).map((name) => ({
            text: name,
            value: name,
          }))
        : [],
      onFilter: (value, record) => record.name === value,
    },
    {
      title: "Last Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      sorter: (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    },
    {
      title: "IP Address",
      dataIndex: "ip",
      key: "ip",
      sorter: (a, b) => a.ip.localeCompare(b.ip),
      filters: data
        ? Array.from(new Set(data.map((item) => item.ip))).map((ip) => ({
            text: ip,
            value: ip,
          }))
        : [],
      onFilter: (value, record) => record.ip === value,
      render: (ip, record) => {
        const { lat, lon } = record.location || {};
        const mapUrl =
          lat && lon
            ? `https://static-maps.yandex.ru/1.x/?ll=${lon},${lat}&size=200,200&z=14&l=map`
            : null;

        return (
          <Tooltip
            title={
              record.location?.status === "success" ? (
                <div>
                  {mapUrl && (
                    <img
                      src={mapUrl}
                      alt="Map"
                      style={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "8px",
                        marginBottom: "8px",
                      }}
                    />
                  )}
                  <p>
                    <strong>City:</strong> {record.location.city || "Unknown"}
                  </p>
                  <p>
                    <strong>Region:</strong>{" "}
                    {record.location.regionName || "Unknown"}
                  </p>
                  <p>
                    <strong>Country:</strong> {record.location.country || "Unknown"}
                  </p>
                  <p>
                    <strong>ISP:</strong> {record.location.isp || "Unknown"}
                  </p>
                </div>
              ) : (
                "Details unavailable"
              )
            }
          >
            <span>{ip || "Unknown"}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Last Location",
      dataIndex: "location",
      key: "location",
      sorter: (a, b) =>
        `${a.location?.city || ""}, ${a.location?.regionName || ""}`.localeCompare(
          `${b.location?.city || ""}, ${b.location?.regionName || ""}`
        ),
      filters: data
        ? Array.from(
            new Set(
              data.map(
                (item) =>
                  `${item.location?.city || ""}, ${item.location?.regionName || ""}`
              )
            )
          ).map((location) => ({
            text: location,
            value: location,
          }))
        : [],
      onFilter: (value, record) =>
        `${record.location?.city || ""}, ${
          record.location?.regionName || ""
        }`.includes(value),
      render: (location) =>
        location && location.city && location.regionName && location.country
          ? `${location.city}, ${location.regionName}, ${location.country}`
          : "Unknown",
    },
    {
      title: "Last Device Type",
      dataIndex: ["device", "type"],
      key: "deviceType",
      sorter: (a, b) =>
        (a.device?.type || "").localeCompare(b.device?.type || ""),
      filters: data
        ? Array.from(
            new Set(data.map((item) => item.device?.type || "Unknown"))
          ).map((type) => ({
            text: type,
            value: type,
          }))
        : [],
      onFilter: (value, record) => record.device?.type === value,
      render: (type) => (type ? type : "Unknown"),
    },
  ];

  // Group data by user name and get the most recent activity for each user
  const groupedData = Object.values(
    data.reduce((acc, curr) => {
      if (
        !acc[curr.name] ||
        new Date(curr.timestamp) > new Date(acc[curr.name].timestamp)
      ) {
        acc[curr.name] = { ...curr }; // Store the most recent activity
      }
      return acc;
    }, {})
  );

  // Sort grouped data by the most recent timestamp (descending)
  groupedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Table
      columns={columns}
      dataSource={groupedData.map((item) => ({
        ...item,
        key: item.name,
      }))}
      rowKey={(record) => record.name}
      expandable={{
        expandedRowRender: (record) => (
          <div style={{ display: "flex", overflowX: "auto", gap: "16px" }}>
            {data
              .filter((activity) => activity.name === record.name)
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort user activities
              .map((activity) => {
                const { lat, lon } = activity.location || {};
                const mapUrl =
                  lat && lon
                    ? `https://static-maps.yandex.ru/1.x/?ll=${lon},${lat}&size=200,200&z=14&l=map`
                    : null;

                return (
                  <Card
                    key={activity._id}
                    bordered={true}
                    style={{ width: 300, minWidth: 300 }}
                  >
                    <p>
                      <strong>Timestamp:</strong> {activity.timestamp}
                    </p>
                    <p>
                      <Tooltip
                        title={
                          mapUrl ? (
                            <img
                              src={mapUrl}
                              alt="Map"
                              style={{
                                width: "200px",
                                height: "200px",
                                borderRadius: "8px",
                              }}
                            />
                          ) : (
                            "Map unavailable"
                          )
                        }
                      >
                        <strong>IP Address:</strong>{" "}
                        <span style={{backgroundColor:"yellow"}}>{activity.ip || "Unknown"}</span>
                      </Tooltip>
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {activity.location?.city || "Unknown"},{" "}
                      {activity.location?.regionName || "Unknown"},{" "}
                      {activity.location?.country || "Unknown"} (
                      {activity.location?.zip || "Unknown"})
                    </p>
                    <p>
                      <strong style={{backgroundColor:"yellow"}}>Device:</strong> {activity.device?.type || "Unknown"}
                    </p>
                    <p>
                      <strong>User Agent:</strong>{" "}
                      {activity.userAgent || "Unknown"}
                    </p>
                  </Card>
                );
              })}
          </div>
        ),
      }}
      scroll={{ x: 1200, y: 500 }} // Enable scrolling
      loading={loading}
    />
  );
};

export default UserTable;
