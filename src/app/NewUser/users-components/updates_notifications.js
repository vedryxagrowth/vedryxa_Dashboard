'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Modal, message, Select } from 'antd'; // Add Ant components
import { useTokenContext } from '../../components/parent';

const { Option } = Select;

const UploadComponent = forwardRef(({ onSubmit, isLoading = false }, ref) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });

  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [networkOptions, setNetworkOptions] = useState([]);

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { userdetails, theme } = useTokenContext();

  useEffect(() => {
    if (userdetails?.adAccounts) {
      const userNetworks = Object.keys(userdetails.adAccounts);
      const options = [{ value: 'All', label: 'All' }, ...userNetworks.map(key => ({ value: key, label: key }))];
      setNetworkOptions(options);

      if (!selectedNetwork) {
        setSelectedNetwork('All'); // Default to All
      }
    }
  }, [userdetails]);

  const handleNetworkChange = (value) => {
    setSelectedNetwork(value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', image: null });
    setImagePreview(null);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Expose resetForm to parent
  useImperativeHandle(ref, () => ({
    resetForm
  }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    Modal.confirm({
      //   title: 'Confirm Submission',
      content: 'Are you sure you want to submit this notification?',
      okText: 'Yes',
      cancelText: 'No',
      icon: null,
      className: theme === 'dark' ? 'dark-confirm-modal' : '',
      onOk: async () => {
        try {
          const formDataToSend = new FormData();
          formDataToSend.append('title', formData.title);
          formDataToSend.append('description', formData.description);
          formDataToSend.append('email', userdetails?.email);
          formDataToSend.append('network', selectedNetwork);
          formDataToSend.append('networks', JSON.stringify(selectedNetwork));

          if (formData.image) {
            formDataToSend.append('image', formData.image);
          }

          const res = await fetch('https://prodapis.adsgoat.in/api/notifications/updatenew', {
            method: 'POST',
            body: formDataToSend
          });

          const result = await res.json();
          if (result.success) {
            message.success('Notification submitted successfully!');
            resetForm();
          } else {
            message.error('Something went wrong.');
          }
        } catch (err) {
          console.error('Error submitting form:', err);
          message.error('Error submitting form.');
        }
      }
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  //   const handleImageChange = (file) => {
  //     if (!file) return;
  //     if (!file.type.startsWith('image/')) {
  //       setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
  //       return;
  //     }
  //     if (file.size > 5 * 1024 * 1024) {
  //       setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
  //       return;
  //     }

  //     setFormData(prev => ({ ...prev, image: file }));
  //     const reader = new FileReader();
  //     reader.onload = (e) => setImagePreview(e.target?.result);
  //     reader.readAsDataURL(file);
  //     setErrors(prev => ({ ...prev, image: undefined }));
  //   };

  const handleMediaChange = (file) => {
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image or video file' }));
      return;
    }

    if (file.size > 20 * 1024 * 1024) { // Optional: limit to 20MB
      setErrors(prev => ({ ...prev, image: 'File size must be less than 20MB' }));
      return;
    }

    setFormData(prev => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result);
    reader.readAsDataURL(file);

    setErrors(prev => ({ ...prev, image: undefined }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0] || null;
    handleMediaChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleMediaChange(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-form-wrapper full-screen-wrapper">
      <div className="form-container">
        <h1 style={{color: theme === 'dark' ? '#fff' : '#333'}} className="form-title">Notification</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              style={{color: theme === 'dark' ? '#fff' : '#333'}}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter your title"
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              style={{color: theme === 'dark' ? '#fff' : '#333'}}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter your description"
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="network">Action</label>
            <Select
              id="network"
              value={selectedNetwork}
              onChange={handleNetworkChange}
              placeholder="Select network"
              style={{ width: '100%' }}
              className={theme === 'dark' ? 'custom-select-dark' : ''}
              dropdownClassName={theme === 'dark' ? 'custom-dropdown' : ''}
              title={''}
              mode="multiple"
            >
              {networkOptions.map((option) => (
                <Option key={option.value} value={option.value} title={''}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>


          <div className="form-group">
            <label>Image</label>
            {!imagePreview && (
              <div
                className="image-upload-box"
                onClick={openFileDialog}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <p style={{
                  color: theme === 'dark' ? '#fff' : '#333'

                }}>Click to upload or drag and drop</p>
                <p style={{
                  color: theme === 'dark' ? '#fff' : '#333'

                }} >PNG, JPG, GIF </p>
              </div>
            )}
            {/* {imagePreview && (
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <div className="image-info">
                  <span>{formData.image?.name}</span>
                  <span>({Math.round((formData.image?.size || 0) / 1024)} KB)</span>
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )} */}
            {imagePreview && (
              <div className="image-preview-wrapper">
                {formData.image?.type.startsWith('image/') ? (
                  <img style={{ maxHeight: '120px', objectFit: 'cover', cursor: 'pointer' }} src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <video
                    controls
                    src={imagePreview}
                    className="image-preview"
                    // style={{ maxHeight: '200px', objectFit: 'cover' }}
                    style={{ maxHeight: '120px', objectFit: 'cover', cursor: 'pointer' }}
                  />
                )}
                <div className="image-info">
                  <span>{formData.image?.name}</span>
                  <span>({Math.round((formData.image?.size || 0) / 1024)} KB)</span>
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {errors.image && <span className="form-error">{errors.image}</span>}
          </div>

          <button type="submit" disabled={isLoading}>Submit</button>
        </form>
      </div>
    </div>
  );
});

export default UploadComponent;
