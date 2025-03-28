'use client';

import React, { useState } from 'react';
import { InputNumber, Button, Space, Typography, Card } from 'antd';
// import 'antd/dist/antd.css';

const { Title, Text } = Typography;

export default function Calculator() {
  const [num1, setNum1] = useState(null);
  const [num2, setNum2] = useState(null);
  const [result, setResult] = useState(null);

  const calculate = (operator) => {
    if (num1 === null || num2 === null) return;

    let res = 0;
    switch (operator) {
      case '+': res = num1 + num2; break;
      case '-': res = num1 - num2; break;
      case '*': res = num1 * num2; break;
      case '/': res = num2 !== 0 ? num1 / num2 : 'Error'; break;
      default: break;
    }
    setResult(res);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="🧮 Simple Calculator" style={{ maxWidth: 400, margin: 'auto' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter first number"
            value={num1}
            onChange={setNum1}
          />
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter second number"
            value={num2}
            onChange={setNum2}
          />

          <Space wrap>
            <Button onClick={() => calculate('+')}>+</Button>
            <Button onClick={() => calculate('-')}>−</Button>
            <Button onClick={() => calculate('*')}>×</Button>
            <Button onClick={() => calculate('/')}>÷</Button>
          </Space>

          {result !== null && (
            <Text strong>Result: {result}</Text>
          )}
        </Space>
      </Card>
    </div>
  );
}