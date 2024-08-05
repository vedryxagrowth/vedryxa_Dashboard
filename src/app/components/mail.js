import { Modal, Form, Input, Button, message } from 'antd';
import { useState } from 'react';
import emailjs from 'emailjs-com';

// Initialize EmailJS outside the component
emailjs.init('YuvB6pBrVHNld_VA2');

const ContactForm = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const params = {
                form_name: values.name,
                email_id: values.email,
                phoneInput: values.phone,
                subjectInput: values.subject,
                message: values.message,
            };
            await emailjs.send('service_d2zvko7', 'template_u3yhnqf', params);
            message.success('Email sent successfully!');
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Failed to send email:', error);
            message.error('Failed to send email. Please try again later.');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                Contact Adsgoat
            </Button>
            <Modal
                title="Add Details"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter your name' }]}
                    >
                        <Input placeholder="Enter your name" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' },
                        ]}
                    >
                        <Input placeholder="Enter your email" />
                    </Form.Item>

                    <Form.Item
                        label="Phone Num"
                        name="phone"
                        rules={[{ required: true, message: 'Please enter your phone number' }]}
                    >
                        <Input type="number" placeholder="Enter your phone number" />
                    </Form.Item>

                    <Form.Item
                        label="Subject"
                        name="subject"
                        rules={[{ required: true, message: 'Please enter the subject' }]}
                    >
                        <Input placeholder="Enter the subject" />
                    </Form.Item>

                    <Form.Item
                        label="Message"
                        name="message"
                        rules={[{ required: true, message: 'Please enter your message' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Enter your message" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ContactForm;
