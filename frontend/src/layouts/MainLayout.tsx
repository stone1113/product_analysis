import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Badge, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  {
    key: 'overview',
    icon: <AppstoreOutlined />,
    label: '数据概览',
    disabled: true,
  },
  {
    key: 'products',
    icon: <ShoppingOutlined />,
    label: '产品管理',
    children: [
      {
        key: '/products',
        icon: <DatabaseOutlined />,
        label: '产品数据中心',
      },
      {
        key: 'entry',
        label: '产品录入',
        disabled: true,
      },
    ],
  },
  {
    key: 'ads',
    icon: <BarChartOutlined />,
    label: '广告管理',
    disabled: true,
  },
  {
    key: 'finance',
    icon: <FileTextOutlined />,
    label: '财务报表',
    disabled: true,
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '系统设置',
    disabled: true,
  },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname.startsWith('/products')
    ? '/products'
    : location.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── 侧边栏 ── */}
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        style={{
          background: '#001529',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <DatabaseOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          {!collapsed && (
            <div>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                跨境ERP
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                数据管理平台
              </Text>
            </div>
          )}
        </div>

        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['products']}
          items={menuItems}
          onClick={({ key }) => {
            if (key.startsWith('/')) navigate(key);
          }}
          style={{ border: 'none', marginTop: 8 }}
        />
      </Sider>

      {/* ── 主内容区 ── */}
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            height: 64,
          }}
        >
          {/* 折叠按钮 */}
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 18,
              cursor: 'pointer',
              color: '#595959',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          {/* 右侧操作区 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Tooltip title="消息通知">
              <Badge count={3} size="small">
                <BellOutlined style={{ fontSize: 18, color: '#595959', cursor: 'pointer' }} />
              </Badge>
            </Tooltip>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar size={32} icon={<UserOutlined />} style={{ background: '#1677ff' }} />
              <Text style={{ fontSize: 13, color: '#262626' }}>运营管理员</Text>
            </div>
          </div>
        </Header>

        {/* 页面内容 */}
        <Content
          style={{
            minHeight: 'calc(100vh - 64px)',
            background: '#f0f2f5',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
