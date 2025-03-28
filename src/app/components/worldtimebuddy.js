
'use client';

import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import {
  Select,
  Typography,
  Button,
  Space
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const generateHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(i.toString().padStart(2, '0') + ':00');
  }
  return hours;
};

const getWeekDays = () => {
  const today = DateTime.now().startOf('day');
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const day = today.plus({ days: i });
    days.push(day);
  }
  return days;
};

export default function WorldTime() {
  const [zones, setZones] = useState(['UTC', 'Asia/Kolkata']);
  const [selectedZone, setSelectedZone] = useState('');
  const [currentTime, setCurrentTime] = useState(DateTime.now());
  const [selectedDate, setSelectedDate] = useState(DateTime.now().startOf('day'));
  const [timeZones, setTimeZones] = useState([]);

  useEffect(() => {
    const zones = Intl.supportedValuesOf('timeZone');
    setTimeZones(zones);
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(DateTime.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const addZone = () => {
    if (selectedZone && !zones.includes(selectedZone)) {
      setZones([...zones, selectedZone]);
      setSelectedZone('');
    }
  };

  const removeZone = (zone) => {
    setZones(zones.filter((z) => z !== zone));
  };

  const hours = generateHours();
  const weekDays = getWeekDays();

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ textAlign: 'center' }}>
        🌍 World Time Buddy
      </Title>

      <Space style={{ marginBottom: 24 }}>
        <Select
          showSearch
          style={{ width: 300 }}
          placeholder="Select a time zone"
          value={selectedZone || undefined}
          onChange={setSelectedZone}
        >
          {timeZones.map((tz) => (
            <Option key={tz} value={tz}>
              {tz}
            </Option>
          ))}
        </Select>
        <Button type="primary" onClick={addZone}>
          Add
        </Button>
      </Space>

      {/* Date Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {weekDays.map((day) => (
          <Button
            key={day.toISODate()}
            type={day.hasSame(selectedDate, 'day') ? 'primary' : 'default'}
            onClick={() => setSelectedDate(day)}
          >
            {day.toFormat('ccc')}<br />{day.toFormat('MMM dd')}
          </Button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `250px repeat(24, 80px)` }}>
          <div style={{
    fontWeight: 'bold',
    background: '#fafafa',
    padding: 8,
    border: '1px solid #ddd',
    width: 250,               // ✅ match column width
    whiteSpace: 'nowrap'
  }}>
            Time Zone
          </div>
          {hours.map((hr, i) => (
            <div
              key={i}
              style={{
                padding: 8,
                textAlign: 'center',
                border: '1px solid #ddd',
                backgroundColor:
                  selectedDate.hasSame(currentTime, 'day') && parseInt(hr.split(':')[0]) === currentTime.hour
                    ? '#e6f7ff'
                    : undefined
              }}
            >
              {hr}
            </div>
          ))}

          {zones.map((zone) => {
            const nowInZone = currentTime.setZone(zone);
            return (
              <React.Fragment key={zone}>
            <div
  style={{
    padding: 8,
    background: '#f0f0f0',
    border: '1px solid #ddd',
    width: 250,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    gap: 4
  }}
>
  {/* Row 1: Name + Time */}
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <Text strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {zone}
    </Text>
    <Text style={{ whiteSpace: 'nowrap' }}>
      {nowInZone.toFormat('hh:mm a')}
    </Text>
  </div>

  {/* Row 2: GMT + Delete */}
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
      GMT {nowInZone.offset / 60 >= 0 ? '+' : ''}{nowInZone.offset / 60}
    </Text>
    <Button
      icon={<DeleteOutlined />}
      danger
      size="small"
      onClick={() => removeZone(zone)}
    />
  </div>
</div>


                {hours.map((hr, idx) => {
                  const hourTime = selectedDate.setZone(zone).plus({ hours: idx });
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: 8,
                        textAlign: 'center',
                        border: '1px solid #ddd',
                        backgroundColor:
                          selectedDate.hasSame(currentTime, 'day') && hourTime.hour === nowInZone.hour
                            ? '#d9f7be'
                            : undefined
                      }}
                    >
                      {hourTime.toFormat('hh:mm a')}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}