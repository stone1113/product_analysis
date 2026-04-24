import { Descriptions, Tag, Typography, Divider, List } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import type { ProductDetail } from '../../../types';

const { Text, Title } = Typography;

interface Props {
  product: ProductDetail;
}

export default function BasicInfo({ product }: Props) {
  return (
    <div>
      {/* 产品属性 */}
      <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
        产品属性
      </Title>
      <Descriptions
        bordered
        column={2}
        size="small"
        labelStyle={{ width: 120, background: '#fafafa', fontWeight: 500 }}
        contentStyle={{ background: '#fff' }}
      >
        <Descriptions.Item label="ASIN">
          <Text copyable style={{ fontFamily: 'monospace', color: '#1677ff' }}>
            {product.asin}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="类目">
          <Tag color="blue">{product.category}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="BSR 排名">
          <Text strong style={{ color: '#faad14' }}>
            #{product.bsr.toLocaleString()}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="所属排行榜">
          <Text type="secondary" style={{ fontSize: 12 }}>
            {product.rankCategory}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="售价">
          <Text strong style={{ fontSize: 16, color: '#262626' }}>
            ${product.price.toFixed(2)} {product.currency}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="配送方式">
          <Tag color={product.fulfillmentType === 'FBA' ? 'blue' : 'default'}>
            {product.fulfillmentType}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="材质">{product.material}</Descriptions.Item>
        <Descriptions.Item label="颜色 / 款式">{product.color}</Descriptions.Item>
        <Descriptions.Item label="重量">{product.weight}</Descriptions.Item>
        <Descriptions.Item label="尺寸">{product.dimensions}</Descriptions.Item>
        <Descriptions.Item label="变体数量">
          {product.variationCount} 款
        </Descriptions.Item>
        <Descriptions.Item label="上架时间">{product.launchDate}</Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* 产品描述 */}
      <Title level={5} style={{ marginBottom: 12 }}>
        产品描述
      </Title>
      <Text style={{ color: '#595959', lineHeight: 1.8 }}>{product.description}</Text>

      <Divider />

      {/* 五点描述 */}
      <Title level={5} style={{ marginBottom: 12 }}>
        五点描述（Bullet Points）
      </Title>
      <List
        dataSource={product.bulletPoints}
        renderItem={(item) => (
          <List.Item style={{ padding: '8px 0', borderBottom: 'none' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <CheckCircleFilled style={{ color: '#52c41a', fontSize: 14, marginTop: 3 }} />
              <Text style={{ color: '#595959', lineHeight: 1.7 }}>{item}</Text>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}
