import React, { useRef, useEffect } from 'react';
import { FilterOutlined } from '@ant-design/icons';

const GroupHeaderWithFilter = (props) => {
  const { displayName, showColumnMenu, column, api } = props;
  const filterBtnRef = useRef(null);

  const showFilterPopup = () => {
    if (filterBtnRef.current) {
      api.showColumnMenuAfterButtonClick(column, filterBtnRef.current);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingRight: '6px',
        cursor: 'default'
      }}
      onClick={(e) => e.stopPropagation()} // Prevent row open
    >
      <span style={{ fontWeight: 'bold' }}>{displayName}</span>
      <FilterOutlined
        ref={filterBtnRef}
        onClick={(e) => {
          e.stopPropagation();
          showFilterPopup();
        }}
        style={{ cursor: 'pointer', fontSize: '14px', marginLeft: 8 }}
      />
    </div>
  );
};

export default GroupHeaderWithFilter;
