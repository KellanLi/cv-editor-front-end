import { type FC } from 'react';
import { Col, Form, Input, Row } from 'antd';
import BlockTitle from '../block-title';
import { UserOutlined } from '@ant-design/icons';

const ContentForm: FC = () => {
  return (
    <div
      style={{
        padding: 10,
      }}
    >
      <BlockTitle title="基本信息" icon={<UserOutlined />} editable />
      <Form layout="vertical">
        <Form.Item label="头像" name="profilePicture">
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="全名" name="fullName">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="职位" name="position">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="邮箱" name="email">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="个人主页" name="homepage">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="地址" name="address">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="电话" name="phone">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ContentForm;
