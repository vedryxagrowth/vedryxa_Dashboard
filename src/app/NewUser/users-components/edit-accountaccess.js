"use client";
import { useState, useEffect, useRef } from "react";
import { Form, Input, Button, Drawer, Modal, message, Select } from "antd";
import axios from "axios";
import { useTokenContext } from '../../components/parent';

const { Option } = Select;
import { CloseOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { FaTrashCan } from "react-icons/fa6";

const timezones = [
  "UTC",
  "EEST",
  "CEST",
  "EDT",
  "CST",
  "PDT",
  "IST",
  "BST",
  "GMT",
  "MST",
  "CDT",
  "AST",
  "DST",
  "HST",
  "EST",
];

const timeZoneFullNames = {
  EDT: "America/New_York",
  UTC: "Atlantic/Azores",
  EEST: "Europe/Athens",
  CEST: "Europe/Paris",
  CST: "America/Mexico_City",
  PDT: "America/Los_Angeles",
  BST: "Europe/London",
  GMT: "Africa/Accra",
  IST: "Asia/Kolkata",
  MST: "America/Dawson",
  CDT: "America/Chicago",
  AST: "America/Puerto_Rico",
  DST: "Asia/Dubai",
  HST: "Pacific/Honolulu",
  EST: "America/Toronto",
};

const timeZoneShortNames = {
  "America/New_York": "EDT",
  "Atlantic/Azores": "UTC",
  "Europe/Athens": "EEST",
  "Europe/Paris": "CEST",
  "America/Mexico_City": "CST",
  "America/Los_Angeles": "PDT",
  "Europe/London": "BST",
  "Africa/Accra": "GMT",
  "Asia/Kolkata": "IST",
  "America/Dawson": "MST",
  "America/Chicago": "CDT",
  "America/Puerto_Rico": "AST",
  "Asia/Dubai": "DST",
  "Pacific/Honolulu": "HST",
  "America/Toronto": "EST",
};

const availableNetworks = [
  "MEDIA_DOT_NET",
  "MEDIA_DOT_NET_BING",
  "ENKI",
  "TONIC",
  "System1",
  "Bodies",
  "Bodies1",
  "Rsoc",
  "Domain Active",
];

const EditAccountAccess = ({ editeddata, visible, onClose, AccountsData }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [BMName, setBMName] = useState("");
  const { theme } = useTokenContext();
  const { apiClient } = useTokenContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isCustomBMName, setIsCustomBMName] = useState(false);

  const [isVisibleBMId, setIsVisibleBMId] = useState(null);
  const [uniquePartners, setUniquePartners] = useState([]);
  const [options, setOptions] = useState([
    "Winkleads Search",
    "MODO LEO BM X1",
  ]);
  const [newOptions, setNewOptions] = useState([
    "Winkleads Search",
    "MODO LEO BM X1",
  ]);
  const containerRef = useRef(null);
  const token = localStorage.getItem("token");
  // console.log(editeddata, "edit");
  const [pixels, setPixels] = useState([{ pixelName: "", pixelId: "" }]);
  const [pages, setPages] = useState([{ pageName: "", pageId: "" }]);



  // useEffect(() => {
  //   if (editeddata) {
  //     form.setFieldsValue({
  //       ...editeddata,
  //       timeZone: timeZoneShortNames[editeddata.timeZone],
  //       pixelID: editeddata?.pixelID || "",
  //       pageID: editeddata?.pageID || "",
  //       AgencyName: editeddata?.AgencyName || "",
  //       BMName: editeddata?.BMName || ""
  //     });
  //     setBMName(editeddata.BMName || "");

  //   }
  // }, [editeddata, form]);
  const addPixelRow = () => {
    setPixels(prev => [...prev, { pixelName: "", pixelId: "" }]);
  };

  const handlePixelChange = (index, field, value) => {
    setPixels(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const removePixelRow = (index) => {
    setPixels(prev => prev.filter((_, i) => i !== index));
  };

  const handlePageChange = (index, field, value) => {
    setPages(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addPage = () => {
    setPages(prev => [...prev, { pageName: "", pageId: "" }]);
  };

  const removePage = (index) => {
    setPages(prev => prev.filter((_, i) => i !== index));
  };
  useEffect(() => {
    if (editeddata && visible) {
      form.setFieldsValue({
        ...editeddata,
        timeZone: timeZoneShortNames[editeddata.timeZone] || "",
        AgencyName: editeddata?.AgencyName || "",
        BMName: editeddata?.BMName || ""
      });
      if (typeof editeddata.pixelID === "string") {
        setPixels([{ pixelName: "", pixelId: editeddata.pixelID }]);
      } else if (editeddata.pixelID && typeof editeddata.pixelID === "object") {
        setPixels(
          Object.entries(editeddata.pixelID).map(([name, id]) => ({
            pixelName: name,
            pixelId: id
          }))
        );
      }
      if (typeof editeddata.pageID === "string") {
        setPages([{ pageName: editeddata.pageName || "", pageId: editeddata.pageID }]);
      } else if (editeddata.pageID && typeof editeddata.pageID === "object") {
        setPages(
          Object.entries(editeddata.pageID).map(([name, id]) => ({
            pageName: name,
            pageId: id
          }))
        );
      }
      setBMName(editeddata.BMName || "");
    }
  }, [editeddata, visible]);

  const onFinish = async (values) => {
    let formattedPixels;
    if (pixels.length === 1) {
      formattedPixels = pixels[0].pixelId.trim();
    } else {
      formattedPixels = {};
      pixels.forEach(p => {
        if (p.pixelName && p.pixelId) {
          formattedPixels[p.pixelName.trim()] = p.pixelId.trim();
        }
      });
    }

    let formattedPages;
    let formattedPageName;

    if (pages.length === 1) {
      formattedPages = pages[0].pageId.trim();
      formattedPageName = pages[0].pageName.trim();
    } else {
      formattedPages = {};
      pages.forEach(p => {
        if (p.pageName && p.pageId) {
          formattedPages[p.pageName.trim()] = p.pageId.trim();
        }
      });
    }

    try {
      // const newValues = {
      //   ...editeddata,
      //   ...values,
      //   BMName: BMName,
      //   BMId: values.BMId || editeddata.BMId,
      //   timeZone: timeZoneFullNames[values.timeZone],
      // };
      const newValues = {
        ...editeddata,
        ...values,
        pixelID: formattedPixels,
        pageID: formattedPages,
        pageName: formattedPageName,
        BMName: BMName,
        BMId: values.BMId || editeddata.BMId,
        timeZone: timeZoneFullNames[values.timeZone],
      };

      // console.log(newValues, "new");
      const response = await apiClient.put(
        "/userrole/accounts",
        { newAccount: newValues }
      );

      if (response.status === 200) {

        message.open({
          type: 'success',
          content: `Account Updated successfully`,
          className: theme === 'dark' ? 'dark-message' : '',
        })
        form.resetFields();
        onClose(newValues);
      } else {
        message.open({
          type: 'error',
          content: `Failed to update account`,
          className: theme === 'dark' ? 'dark-message' : '',
        })
      }
    } catch (error) {
      console.error("Error creating account:", error);
      message.open({
        type: 'error',
        content: `Failed to update account`,
        className: theme === 'dark' ? 'dark-message' : '',
      })
    }
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };
  const functionCallBMNames = async () => {
    const fetchData = await apiClient.get(`/getBMNames/`);
    const mainData = fetchData.data;
    setOptions(mainData);
    setNewOptions(mainData);
  }
  useEffect(() => {
    if (visible) {
      const uniqueBMName = [...new Set(AccountsData?.map(item => item?.BMName).filter(val => val && val.trim() !== ""))].sort((a, b) => a.localeCompare(b));
      const uniquePartners = [...new Set(AccountsData?.map(item => item?.revenuePartner).filter(val => val && val.trim() !== ""))].sort((a, b) => a.localeCompare(b));
      setUniquePartners(uniquePartners);
      setOptions(uniqueBMName);
      setNewOptions(uniqueBMName);
    }
  }, [visible, AccountsData]);
  const handleAddNewValue = () => {
    if (newValue && !options.includes(newValue)) {
      setOptions([...options, newValue]);
      setBMName(newValue);
      setIsCustomBMName(true);
      form.setFieldsValue({ BMName: newValue, BMId: undefined });
    }
    setNewValue("");
    setIsModalOpen(false);
  };
  useEffect(() => {
    if (isModalOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setModalPosition({ top: rect.top, left: rect.left });
    }
  }, [isModalOpen]);
  // useEffect(() => {
  //   form.setFieldsValue({ BMName: BMName });
  //   setIsVisibleBMId("visible");
  // }, [newValue, form]);
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        BMName: BMName
      });

      setIsVisibleBMId("visible");
    }
  }, [newValue, visible]);
  return (
    <>
      <Drawer
        title="Edit Account"
        open={visible}
        onClose={onClose}
        width="60%"
        closeIcon={<CloseOutlined />}
        style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
      >
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          style={{ width: "80%" }}
          initialValues={{
            ...editeddata,
          }}
          className={theme === 'dark' ? 'form-dark' : 'form-light'}
        >
          <Form.Item
            label="Spend Partner"
            name="spendPartner"
            rules={[{ required: true, message: "Please select a Spend partner!" }]}
            disabled style={{ backgroundColor: 'transparent', color: 'black' }}
          >
            <Select
              placeholder="Select a partner"
              disabled
              style={{
                backgroundColor: theme === 'dark' && '#333',
                color: theme === 'dark' && '#fff',
              }}
              // dropdownClassName={theme === 'dark' && "custom-dropdown"}
              classNames={{
                popup: {
                  root: theme === 'dark' ? 'custom-dropdown' : ''
                }
              }}
            >
              <Option value="Facebook">Facebook</Option>
              <Option value="Google">Google</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Spend Account ID"
            name="accountNumber"
            rules={[{ required: true, message: "Please input the spend account ID!" }]}
          >
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
          </Form.Item>

          <Form.Item label="Account Name" name="accountName">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
          </Form.Item>

          {/* <Form.Item label="Pixel ID" name="pixelID">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
          </Form.Item> */}
          <Form.Item label="Pixel ID">
            {pixels.map((row, index) => (
              <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>

                {pixels.length > 1 && (
                  <Input
                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                    placeholder="Pixel Name"
                    value={row.pixelName}
                    onChange={(e) =>
                      handlePixelChange(index, "pixelName", e.target.value)
                    }
                  />
                )}

                <Input
                  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                  placeholder="Pixel ID"
                  value={row.pixelId}
                  onChange={(e) =>
                    handlePixelChange(index, "pixelId", e.target.value)
                  }
                />

                {pixels.length > 1 && (
                  <Button type="text" onClick={() => removePixelRow(index)} icon={<FaTrashCan color="#EC7117" />}></Button>
                )}

                {index === pixels.length - 1 && (
                  <Button type="text" onClick={addPixelRow}>
                    <PlusOutlined />
                  </Button>
                )}
              </div>
            ))}
          </Form.Item>
          {/* <Form.Item label="Page ID" name="pageID">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
          </Form.Item> */}
          {pages.length === 1 ? (
            <>
              <Form.Item label="Page ID" required style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <Input
                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                    placeholder="Page ID"
                    value={pages[0].pageId}
                    onChange={(e) => handlePageChange(0, "pageId", e.target.value)}
                  />

                  {/* Add second row */}
                  <Button type="text" onClick={addPage} icon={<PlusOutlined />} />
                </div>
              </Form.Item>

              <Form.Item label="Page Name" required style={{ marginTop: 8 }}>
                <Input
                  className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                  placeholder="Page Name"
                  value={pages[0].pageName}
                  onChange={(e) => handlePageChange(0, "pageName", e.target.value)}
                />
              </Form.Item>
            </>
          ) : (

            <Form.Item label="Page ID">
              {pages.map((p, index) => (
                <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>

                  <Input
                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                    placeholder="Page Name"
                    value={p.pageName}
                    onChange={(e) => handlePageChange(index, "pageName", e.target.value)}
                  />

                  <Input
                    className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                    placeholder="Page ID"
                    value={p.pageId}
                    onChange={(e) => handlePageChange(index, "pageId", e.target.value)}
                  />

                  <Button type="text" onClick={() => removePage(index)} icon={<FaTrashCan color="#EC7117" />}>

                  </Button>

                  {index === pages.length - 1 && (
                    <Button type="text" onClick={addPage} icon={<PlusOutlined />} />
                  )}
                </div>
              ))}
            </Form.Item>
          )}

          {/* <Form.Item label="Page Name" name="pageName">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
          </Form.Item> */}

          <Form.Item label="Agency Name" name="AgencyName">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
          </Form.Item>
          <Form.Item
            label="BM Name"
            name="BMName"
            rules={[{ required: true, message: "Please select a BM Name!" }]}
          >
            <div ref={containerRef} style={{ display: "flex" }}>
              <Select
                showSearch
                placeholder="Select or add a value"
                value={BMName}
                onChange={(value) => {
                  setBMName(value);
                  form.setFieldsValue({
                    BMName: value,
                    BMId: options.includes(value) ? undefined : ""
                  });
                }}
                options={options.map((opt) => ({ label: opt, value: opt }))}
                style={{ flex: 1 }}
              />
              <Button
                style={{ backgroundColor: "#91C25F", width: "24px", marginLeft: "5px" }}
                onClick={() => setIsModalOpen(true)}
              >
                <PlusOutlined className="black-icon" />
              </Button>
            </div>
          </Form.Item>

          {/* Modal for adding new BM Name */}
          <Modal
            title="Add new value"
            className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
            open={isModalOpen}
            onOk={handleAddNewValue}
            onCancel={() => setIsModalOpen(false)}
            okText="Add"
            cancelText="Cancel"
            centered={false}
            getContainer={false}
            style={{
              position: "absolute",
              top: `${modalPosition.top - 50}px`,
              left: `${modalPosition.left}px`,
              transform: "translateY(0)",
              width: "200px",
            }}
          >
            <Input
              placeholder="Enter new value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
          </Modal>

          {!newOptions.includes(BMName) && (
            <Form.Item
              label="BM ID"
              name="BMId"
              rules={[{ required: true, message: "Please input the BM ID!" }]}
            >
              <Input
                autoComplete="off"
                className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                style={{
                  backgroundColor: theme === 'dark' ? '#555' : "white",
                  color: theme === 'dark' ? 'white' : 'black'
                }}
              />
            </Form.Item>
          )}


          <Form.Item
            label="Time Zone"
            name="timeZone"
            rules={[{ required: true, message: "Please select a Time Zone!" }]}
          >
            <Select
              showSearch
              style={{
                backgroundColor: 'transparent', // Background color
                color: theme === 'dark' && '#fff',
              }}
              placeholder="Select Timezone"
              // dropdownClassName={theme === 'dark' && "custom-dropdown"}
              classNames={{
                popup: {
                  root: theme === 'dark' ? 'custom-dropdown' : ''
                }
              }}
              options={timezones.map((item) => ({
                value: item,
                label: item,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select a Status!" }]}
          >
            <Select
              placeholder="Select a status"
              style={{
                width: '100%',
                backgroundColor: theme === 'dark' && '#333', // Background color
                color: theme === 'dark' && '#fff',
              }}
              // dropdownClassName={theme === 'dark' && "custom-dropdown"}
              classNames={{
                popup: {
                  root: theme === 'dark' ? 'custom-dropdown' : ''
                }
              }}
            >
              <Option value="Active">Active</Option>
              <Option value="InActive">InActive</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Revenue Partner"
            name="revenuePartner"
            rules={[{ required: true, message: "Please select a Revenue Partner!" }]}
          >
            <Select
              showSearch
              style={{
                width: '100%',
                backgroundColor: theme === 'dark' && '#333', // Background color
                color: theme === 'dark' && '#fff',
              }}
              placeholder="Select Revenue Partner"
              // dropdownClassName={theme === 'dark' && "custom-dropdown"}
              classNames={{
                popup: {
                  root: theme === 'dark' ? 'custom-dropdown' : ''
                }
              }}
              options={uniquePartners.map((item) => ({
                value: item,
                label: item,
              }))}
            />
          </Form.Item>
          <Form.Item label="Beneficiary" name="Beneficiary">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
          </Form.Item>
          <Form.Item label="Payer" name="Payer">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
          </Form.Item>
          <Form.Item label="Media Buyer" name="MediaBuyerName">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
          </Form.Item>

          <Form.Item label="Holder" name="Holder">
            <Input className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} style={{ backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : 'black' }} />
          </Form.Item>

          <Form.Item>
            <Button style={{ border: 'none', backgroundColor: '#91C25F', color: 'black', fontWeight: '600' }} onClick={showModal}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="Confirmation"
        className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
        open={isModalVisible}
        onOk={() => {
          form.submit();
          setIsModalVisible(false);
        }}
        onCancel={handleCancel}
      >
        <p>Are you sure you want to submit?</p>
      </Modal>
    </>
  );
};

export default EditAccountAccess;