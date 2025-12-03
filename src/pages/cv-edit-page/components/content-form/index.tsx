import { type FC } from 'react';
import { Col, Form, Input, Row, Button, Flex } from 'antd';
import BlockTitle from '../block-title';
import { CloseOutlined, FormOutlined, UserOutlined } from '@ant-design/icons';

const ContentForm: FC = () => {
  return (
    <div
      style={{
        padding: 10,
      }}
    >
      <BlockTitle title="基本信息" icon={<UserOutlined />} size="large" />
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
        <Form.List name="moreInfo">
          {(fields, { add, remove }) => (
            <Flex vertical gap={16}>
              {fields.map((field) => (
                <Flex gap={16} key={field.key}>
                  <Form.Item
                    noStyle
                    style={{ flex: 1 }}
                    name={[field.name, 'label']}
                  >
                    <Input placeholder="名称" />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    style={{ flex: 1 }}
                    name={[field.name, 'value']}
                  >
                    <Input placeholder="值" />
                  </Form.Item>
                  <CloseOutlined
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                </Flex>
              ))}
              <Button type="dashed" onClick={() => add()} block>
                + 添加子项
              </Button>
            </Flex>
          )}
        </Form.List>
        <BlockTitle title="详细介绍" icon={<FormOutlined />} size="large" />
      </Form>
    </div>
  );
};

export default ContentForm;
