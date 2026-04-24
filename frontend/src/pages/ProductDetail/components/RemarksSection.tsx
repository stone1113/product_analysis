import { useState } from 'react';
import { Input, Typography, Row, Col } from 'antd';

const { Text } = Typography;
const { TextArea } = Input;

const QUICK_TAGS = ['现货', '源边', '特签', '当天发货', '全签', '48小时发货'];

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ background: '#f5f7fa', borderLeft: '3px solid #1677ff', padding: '7px 14px', marginBottom: 16, borderRadius: '0 4px 4px 0' }}>
      <Text strong style={{ fontSize: 13, color: '#262626' }}>{title}</Text>
    </div>
  );
}

export default function RemarksSection() {
  const [sampleRemark, setSampleRemark]     = useState('');
  const [imageRemark, setImageRemark]       = useState('');
  const [purchaseRemark, setPurchaseRemark] = useState('');

  const appendTag = (tag: string) => {
    setPurchaseRemark(prev => (prev ? `${prev} ${tag}` : tag));
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '16px 20px', marginTop: 12 }}>
      <SectionTitle title="备注" />

      {/* 采样备注 + 图片备注 */}
      <Row gutter={12} style={{ marginBottom: 14 }}>
        <Col span={18}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Text style={{ fontSize: 13, color: '#595959', whiteSpace: 'nowrap', paddingTop: 4 }}>采样备注</Text>
            <TextArea
              value={sampleRemark}
              onChange={e => setSampleRemark(e.target.value)}
              placeholder="采样备注"
              rows={3}
              style={{ resize: 'none', flex: 1 }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Text style={{ fontSize: 13, color: '#595959', whiteSpace: 'nowrap', paddingTop: 4 }}>图片备注</Text>
            <TextArea
              value={imageRemark}
              onChange={e => setImageRemark(e.target.value)}
              placeholder="图片备注"
              rows={3}
              style={{ resize: 'none', flex: 1 }}
            />
          </div>
        </Col>
      </Row>

      {/* 采购备注 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Text style={{ fontSize: 13, color: '#595959', whiteSpace: 'nowrap', paddingTop: 4 }}>采购备注</Text>
          <TextArea
            value={purchaseRemark}
            onChange={e => setPurchaseRemark(e.target.value)}
            placeholder="采购备注"
            rows={3}
            style={{ resize: 'none', flex: 1 }}
          />
        </div>

        {/* 快捷标签 */}
        <div style={{ display: 'flex', gap: 8, paddingLeft: 54 }}>
          {QUICK_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => appendTag(tag)}
              style={{
                background: 'none',
                border: '1px solid #1677ff',
                borderRadius: 4,
                padding: '2px 12px',
                fontSize: 12,
                color: '#1677ff',
                cursor: 'pointer',
                lineHeight: '22px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: '#e8f0ff' })}
              onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'none' })}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
