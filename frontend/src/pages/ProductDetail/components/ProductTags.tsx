import { useState } from 'react';
import {
  Tag,
  Button,
  Input,
  Select,
  Typography,
  Divider,
  Row,
  Col,
  Card,
  Popconfirm,
  message,
  Space,
} from 'antd';
import {
  PlusOutlined,
  TagsOutlined,
  GlobalOutlined,
  TeamOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { ProductTag, TagCategory } from '../../../types';

const { Title, Text } = Typography;

interface Props {
  tags: ProductTag[];
}

const CATEGORY_CONFIG: Record<
  TagCategory,
  { label: string; color: string; icon: React.ReactNode; bg: string }
> = {
  attribute: {
    label: '产品属性',
    color: 'blue',
    icon: <TagsOutlined />,
    bg: '#e6f4ff',
  },
  market: {
    label: '市场场景',
    color: 'green',
    icon: <GlobalOutlined />,
    bg: '#f6ffed',
  },
  competitor: {
    label: '竞品对比',
    color: 'orange',
    icon: <TeamOutlined />,
    bg: '#fff7e6',
  },
  custom: {
    label: '自定义标签',
    color: 'purple',
    icon: <EditOutlined />,
    bg: '#f9f0ff',
  },
};

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_CONFIG) as TagCategory[]).map((k) => ({
  label: CATEGORY_CONFIG[k].label,
  value: k,
}));

export default function ProductTags({ tags: initialTags }: Props) {
  const [tags, setTags] = useState<ProductTag[]>(initialTags);
  const [adding, setAdding] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<TagCategory>('custom');

  const grouped = (Object.keys(CATEGORY_CONFIG) as TagCategory[]).reduce(
    (acc, cat) => {
      acc[cat] = tags.filter((t) => t.category === cat);
      return acc;
    },
    {} as Record<TagCategory, ProductTag[]>,
  );

  const handleAdd = () => {
    if (!newTagText.trim()) {
      message.warning('请输入标签文字');
      return;
    }
    const newTag: ProductTag = {
      id: `T${Date.now()}`,
      text: newTagText.trim(),
      category: newTagCategory,
    };
    setTags([...tags, newTag]);
    setNewTagText('');
    setAdding(false);
    message.success('标签已添加');
  };

  const handleDelete = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
    message.success('标签已删除');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={5} style={{ margin: 0 }}>
          产品标签管理
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAdding(true)}
        >
          添加标签
        </Button>
      </div>

      {/* 添加标签表单 */}
      {adding && (
        <Card
          size="small"
          bordered
          style={{ marginBottom: 20, borderColor: '#1677ff', borderStyle: 'dashed' }}
        >
          <Space wrap>
            <Input
              placeholder="输入标签内容"
              value={newTagText}
              onChange={(e) => setNewTagText(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={handleAdd}
              autoFocus
            />
            <Select
              value={newTagCategory}
              onChange={setNewTagCategory}
              options={CATEGORY_OPTIONS}
              style={{ width: 140 }}
            />
            <Button type="primary" size="small" onClick={handleAdd}>
              确认
            </Button>
            <Button size="small" onClick={() => setAdding(false)}>
              取消
            </Button>
          </Space>
        </Card>
      )}

      {/* 分类展示 */}
      <Row gutter={[16, 16]}>
        {(Object.keys(CATEGORY_CONFIG) as TagCategory[]).map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const catTags = grouped[cat];
          return (
            <Col span={12} key={cat}>
              <Card
                size="small"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: `var(--ant-color-${config.color === 'blue' ? 'primary' : config.color})` }}>
                      {config.icon}
                    </span>
                    <Text strong style={{ fontSize: 13 }}>
                      {config.label}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ({catTags.length})
                    </Text>
                  </div>
                }
                bordered={false}
                style={{ background: config.bg, minHeight: 100 }}
              >
                {catTags.length === 0 ? (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    暂无标签
                  </Text>
                ) : (
                  <Space size={[6, 8]} wrap>
                    {catTags.map((tag) => (
                      <Popconfirm
                        key={tag.id}
                        title="确定删除这个标签吗？"
                        onConfirm={() => handleDelete(tag.id)}
                        okText="删除"
                        cancelText="取消"
                        okType="danger"
                      >
                        <Tag
                          color={tag.color || config.color}
                          closable={cat === 'custom'}
                          onClose={(e) => {
                            e.preventDefault();
                            handleDelete(tag.id);
                          }}
                          style={{ cursor: 'pointer', fontSize: 12 }}
                        >
                          {tag.text}
                        </Tag>
                      </Popconfirm>
                    ))}
                  </Space>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>

      <Divider />
      <Text type="secondary" style={{ fontSize: 12 }}>
        共 {tags.length} 个标签 · 点击自定义标签可删除 · 其他类别标签由系统自动生成
      </Text>
    </div>
  );
}
