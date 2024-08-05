// pages/dashboard.js
"use client"
// pages/index.js
import {
    Card,
    Row,
    Col,
    Statistic,
    Progress,
    List,
    Avatar,
    Divider,
    Typography,
} from 'antd';
import {
    TrophyOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    DollarOutlined,
    UserOutlined,
    ShoppingOutlined,
    SmileOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const Dashboard = () => {
    return (
        <div style={{ padding: '20px' }}>
            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Congratulations John!"
                            value="$42.8k"
                            prefix={<TrophyOutlined />}
                        />
                        <p>Best seller of the month</p>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Earnings" value={24895} prefix="$" />
                        <p>Best seller of the month</p>
                        {/* <div>10% increase compared to last year</div> */}
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Profit"
                            value={25600}
                            prefix="$"
                            suffix={<ArrowUpOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                        <p>Best seller of the month</p>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '20px' }}>
                <Col span={8}>
                    <Card style={{ marginBottom: '16px' }}>
                        <Statistic title="Weekly Overview" value="45%" />
                        <Progress percent={45} status="active" />
                    </Card>
                    <Card>
                        <Statistic
                            title="New Projects"
                            value={862}
                            suffix={<ArrowDownOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                        <div>Yearly Project</div>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="Total Earning">
                        <List
                            itemLayout="horizontal"
                            dataSource={[
                                {
                                    title: 'Zipcar',
                                    description: 'Vue.js, React & HTML',
                                    amount: '$24,895.65',
                                },
                                {
                                    title: 'Bitbank',
                                    description: 'Sketch, Figma & XD',
                                    amount: '$8,650.20',
                                },
                                {
                                    title: 'Aviato',
                                    description: 'HTML & Angular',
                                    amount: '$1,245.80',
                                },
                            ]}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar>{item.title[0]}</Avatar>}
                                        title={item.title}
                                        description={item.description}
                                    />
                                    <div>{item.amount}</div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card style={{ marginBottom: '16px' }}>
                        <Statistic title="Weekly Overview" value="45%" />
                        <Progress percent={45} status="active" />
                    </Card>
                    <Card>
                        <Statistic
                            title="New Projects"
                            value={862}
                            suffix={<ArrowDownOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                        <div>Yearly Project</div>
                    </Card>
                </Col>

            </Row>

            <Row gutter={16} style={{ marginTop: '20px' }}>
                <Col span={12}>
                    <Card title="Sales by Countries">
                        <List
                            itemLayout="horizontal"
                            dataSource={[
                                { country: 'USA', sales: '$8,656k', growth: '25.8%', flag: '🇺🇸' },
                                { country: 'UK', sales: '$2,415k', growth: '6.2%', flag: '🇬🇧' },
                                { country: 'India', sales: '$865k', growth: '12.4%', flag: '🇮🇳' },
                                { country: 'Japan', sales: '$745k', growth: '11.9%', flag: '🇯🇵' },
                                { country: 'Korea', sales: '$45k', growth: '16.2%', flag: '🇰🇷' },
                            ]}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar>{item.flag}</Avatar>}
                                        title={item.country}
                                        description={item.sales}
                                    />
                                    <div>{item.growth}</div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Deposit and Withdraw">
                        <Row>
                            <Col span={12}>
                                <Title level={5}>Deposit</Title>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={[
                                        { source: 'Gumroad Account', amount: '+$4,650' },
                                        { source: 'Mastercard', amount: '+$92,705' },
                                        { source: 'Stripe Account', amount: '+$957' },
                                        { source: 'American Bank', amount: '+$6,837' },
                                        { source: 'Bank Account', amount: '+$446' },
                                    ]}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar icon={<DollarOutlined />} />}
                                                title={item.source}
                                            />
                                            <div style={{ color: 'green' }}>{item.amount}</div>
                                        </List.Item>
                                    )}
                                />
                            </Col>
                            <Col span={12}>
                                <Title level={5}>Withdraw</Title>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={[
                                        { source: 'Google Adsense', amount: '-$145' },
                                        { source: 'Github Enterprise', amount: '-$1,870' },
                                        { source: 'Upgrade Slack Plan', amount: '-$450' },
                                        { source: 'Digital Ocean', amount: '-$50' },
                                        { source: 'AWS Account', amount: '-$21' },
                                    ]}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar icon={<ShoppingOutlined />} />}
                                                title={item.source}
                                            />
                                            <div style={{ color: 'red' }}>{item.amount}</div>
                                        </List.Item>
                                    )}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
