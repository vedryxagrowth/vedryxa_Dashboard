

// 'use client';

// import React, { useState } from 'react';
// import { Button, Typography, Card, Space, Select, Row, Col } from 'antd';

// const { Text } = Typography;

// export default function Calculator() {
//   const [display, setDisplay] = useState('0');
//   const [operator, setOperator] = useState(null);
//   const [prevValue, setPrevValue] = useState(null);
//   const [overwrite, setOverwrite] = useState(true);
//   const [history, setHistory] = useState([]);
//   const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);

//   const handleNumber = (num) => {
//     if (display === '0' || overwrite) {
//       setDisplay(num);
//     } else {
//       setDisplay(display + num);
//     }
//     setOverwrite(false);
//   };

//   const handleOperator = (op) => {
//     if (prevValue !== null && operator) {
//       calculate();
//     } else {
//       setPrevValue(parseFloat(display));
//     }
//     setOperator(op);
//     setOverwrite(true);
//   };

//   const calculate = () => {
//     if (operator && prevValue !== null) {
//       const current = parseFloat(display);
//       let result = 0;

//       switch (operator) {
//         case '+': result = prevValue + current; break;
//         case '-': result = prevValue - current; break;
//         case '*': result = prevValue * current; break;
//         case '/': result = current !== 0 ? prevValue / current : 'Error'; break;
//         default: return;
//       }

//       const historyEntry = `${prevValue} ${operator} ${current} = ${result}`;
//       setHistory([historyEntry, ...history]);
//       setSelectedHistoryIndex(0);

//       setDisplay(String(result));
//       setPrevValue(null);
//       setOperator(null);
//       setOverwrite(true);
//     }
//   };

//   const handleClear = () => {
//     setDisplay('0');
//     setPrevValue(null);
//     setOperator(null);
//     setOverwrite(true);
//   };

//   const handleBackspace = () => {
//     setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
//   };

//   const handlePercent = () => {
//     setDisplay(String(parseFloat(display) / 100));
//   };

//   const handleToggleSign = () => {
//     setDisplay(String(parseFloat(display) * -1));
//   };

//   const handleDecimal = () => {
//     if (!display.includes('.')) {
//       setDisplay(display + '.');
//     }
//   };

//   const clearHistory = () => {
//     setHistory([]);
//     setSelectedHistoryIndex(null);
//   };

//   const renderButton = (label, onClick, type = 'default') => (
//     <Button onClick={onClick} style={{ width: 70, height: 50 }} type={type}>{label}</Button>
//   );

//   return (
//     <div>
//       <Card
//         title={
//           <Row justify="space-between" align="middle">
//             <Col>🧮 Enhanced Calculator</Col>
//             <Col>
//               {history.length > 0 && (
//                 <Select
//                   placeholder="History"
//                   size="small"
//                   value={selectedHistoryIndex}
//                   onChange={(value) => setSelectedHistoryIndex(value)}
//                   style={{ width: 180 }}
//                   options={history.map((item, index) => ({ label: item, value: index }))}
//                 />
//               )}
//             </Col>
//           </Row>
//         }
//         style={{ maxWidth: 350, margin: 'auto' }}
//         extra={<Button size="small" onClick={clearHistory}>Clear</Button>}
//       >
//         <div style={{ background: '#f0f0f0', padding: '12px', textAlign: 'right', fontSize: 24, borderRadius: 4, marginBottom: 12 }}>
//         <div style={{ fontSize: 16, color: '#888' }}>
//   {prevValue !== null && operator ? `${prevValue} ${operator}` : ''}
// </div>
// <div style={{ fontSize: 24 }}>
//   <Text>{display}</Text>
// </div>

//         </div>

//         <Space direction="vertical">
//           <Space>
//             {renderButton('%', handlePercent)}
//             {renderButton('CE', handleClear)}
//             {renderButton('C', handleClear)}
//             {renderButton('⌫', handleBackspace)}
//           </Space>
//           <Space>
//             {renderButton('7', () => handleNumber('7'))}
//             {renderButton('8', () => handleNumber('8'))}
//             {renderButton('9', () => handleNumber('9'))}
//             {renderButton('÷', () => handleOperator('/'))}
//           </Space>
//           <Space>
//             {renderButton('4', () => handleNumber('4'))}
//             {renderButton('5', () => handleNumber('5'))}
//             {renderButton('6', () => handleNumber('6'))}
//             {renderButton('×', () => handleOperator('*'))}
//           </Space>
//           <Space>
//             {renderButton('1', () => handleNumber('1'))}
//             {renderButton('2', () => handleNumber('2'))}
//             {renderButton('3', () => handleNumber('3'))}
//             {renderButton('−', () => handleOperator('-'))}
//           </Space>
//           <Space>
//             {renderButton('±', handleToggleSign)}
//             {renderButton('0', () => handleNumber('0'))}
//             {renderButton('.', handleDecimal)}
//             {renderButton('+', () => handleOperator('+'))}
//           </Space>
//           <Space style={{ justifyContent: 'flex-end' }}>
//             <Button
//               type="primary"
//               style={{ width: 292 }}
//               onClick={calculate}
//             >
//               =
//             </Button>
//           </Space>
//         </Space>

    
//       </Card>
//     </div>
//   );
// }

'use client';

import React, { useState } from 'react';
import { Button, Typography, Card, Space, Select, Row, Col } from 'antd';
import { useTokenContext } from './parent';

const { Text } = Typography;

export default function Calculator() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState([]);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const { theme } = useTokenContext();
  

  const handleNumber = (num) => {
    setExpression((prev) => prev + num);
    setDisplay((prev) => (prev === '0' ? num : prev + num));
  };

  const handleOperator = (op) => {
    const symbol = op === '*' ? '×' : op === '/' ? '÷' : op;
    setExpression((prev) => prev + ` ${op} `);
    setDisplay((prev) => prev + symbol);
  };

  const handleBracket = (bracket) => {
    setExpression((prev) => prev + bracket);
    setDisplay((prev) => prev + bracket);
  };

  const calculate = () => {
    try {
      const result = eval(expression);
      const historyEntry = `${expression} = ${result}`;
      setHistory([historyEntry, ...history]);
      setSelectedHistoryIndex(0);
      setDisplay(String(result));
      setExpression(String(result));
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handlePercent = () => {
    const value = parseFloat(display) / 100;
    setDisplay(String(value));
    setExpression(String(value));
  };

  const handleToggleSign = () => {
    if (expression) {
      const value = parseFloat(display) * -1;
      setDisplay(String(value));
      setExpression(String(value));
    }
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setExpression(expression + '.');
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setSelectedHistoryIndex(null);
  };

  const renderButton = (label, onClick, type = 'default') => (
    <Button onClick={onClick} style={{ width: 70, height: 50,background:theme === 'dark' ? '#555' : '#f0f0f0',  color: theme === 'dark' ? '#fff' : '#000'}} type={type}>{label}</Button>
  );

  return (
    <div>
      <Card
        title={
          <Row justify="space-between" align="middle">
            <Col style={{ color: theme === 'dark' ? '#fff' : '#000' }}>🧮 Enhanced Calculator</Col>
            <Col>
              {history.length > 0 && (
                <Select
                  placeholder="History"
                  size="small"
                  value={selectedHistoryIndex}
                  onChange={(value) => setSelectedHistoryIndex(value)}
                  style={{ width: 180 }}
                  options={history.map((item, index) => ({ label: item, value: index }))}
                />
              )}
            </Col>
          </Row>
        }
        style={{ maxWidth: 350, margin: 'auto' }}
        extra={<Button size="small" onClick={clearHistory} style={{backgroundColor:'transparent',border:'1px solid green', color: theme === 'dark' ? '#fff' : '#000'}}>Clear</Button>}
      >
        <div style={{ background:theme === 'dark' ? '#555' : '#f0f0f0', padding: '12px', textAlign: 'right', fontSize: 24, borderRadius: 4, marginBottom: 12 }}>
          <div style={{ fontSize: 16, color:theme === 'dark' ? '#fff' : '#000', }}>{expression}</div>
          <div style={{ fontSize: 24}}>
            <Text style={{color:theme === 'dark' ? '#fff' : '#333'}}>{display}</Text>
          </div>
        </div>

        <Space direction="vertical">
          <Space>
            {renderButton('(', () => handleBracket('('))}
            {renderButton(')', () => handleBracket(')'))}
            {renderButton('%', handlePercent)}
            {renderButton('⌫', handleBackspace)}
          </Space>
          <Space>
            {renderButton('7', () => handleNumber('7'))}
            {renderButton('8', () => handleNumber('8'))}
            {renderButton('9', () => handleNumber('9'))}
            {renderButton('÷', () => handleOperator('/'))}
          </Space>
          <Space>
            {renderButton('4', () => handleNumber('4'))}
            {renderButton('5', () => handleNumber('5'))}
            {renderButton('6', () => handleNumber('6'))}
            {renderButton('×', () => handleOperator('*'))}
          </Space>
          <Space>
            {renderButton('1', () => handleNumber('1'))}
            {renderButton('2', () => handleNumber('2'))}
            {renderButton('3', () => handleNumber('3'))}
            {renderButton('−', () => handleOperator('-'))}
          </Space>
          <Space>
            {renderButton('±', handleToggleSign)}
            {renderButton('0', () => handleNumber('0'))}
            {renderButton('.', handleDecimal)}
            {renderButton('+', () => handleOperator('+'))}
          </Space>
          <Space style={{ justifyContent: 'flex-end' }}>
            
            {renderButton('CE', handleClear)}
            {renderButton('C', handleClear)}
            <Button
              style={{ width: 150,backgroundColor:'#5B8CFF',border:'#5B8CFF' }}
              onClick={calculate}
            >
              =
            </Button>
          </Space>
          
        </Space>
      </Card>
    </div>
  );
}