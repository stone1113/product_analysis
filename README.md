# 产品数据中心

跨境电商内部 ERP —— 产品多维分析模块，服务于运营人员和开品人员。

## 功能概览

### 产品列表页
- 全量产品底表，支持关键词搜索、多维筛选
- 展示 ERP 核心字段：公库ID、SKU、采购成本、热销周期、重要等级、开品平台、在售状态等
- 点击任意产品进入深度分析详情页

### 产品详情页
六个分析维度一体呈现：

| 模块 | 说明 |
|------|------|
| 基础信息 | 产品属性、五点描述、ERP 管理字段 |
| 销量分析 | 月度趋势折线图、收入柱状图、环比增长 |
| 评论分析 | 评分分布、好差评关键词、近期评论列表 |
| 产品标签 | 属性 / 市场 / 竞品 / 自定义标签管理 |
| 出单关键词 | 广告关键词明细、ACOS / 转化率 / ROAS |
| 生命周期 | S 曲线定位、阶段判断、运营建议 |

### 深度分析页
从详情页下钻进入，提供：
- **关键词深度分析**：散点图（ACOS vs 转化率）、出单量排名、全量关键词明细
- **评论深度分析**：星级分布、好差评关键词 TOP、评论全文筛选

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5 |
| UI | Ant Design 5 |
| 图表 | Recharts |
| 路由 | React Router v6 |
| 数据 | Mock 数据（本地 TS 文件） |

## 目录结构

```
frontend/
├── src/
│   ├── components/        # 公共组件（ProductAvatar 等）
│   ├── layouts/           # 主布局（侧边栏 + 顶栏）
│   ├── mock/              # Mock 数据
│   │   ├── products.ts    # 产品列表数据（12 条）
│   │   └── productDetail.ts  # 产品详情完整数据
│   ├── pages/
│   │   ├── ProductList/   # 产品列表页
│   │   ├── ProductDetail/ # 产品详情页
│   │   │   └── components/  # 六个分析模块组件
│   │   └── DeepAnalysis/  # 深度分析页
│   ├── router/            # 路由配置
│   └── types/             # TypeScript 类型定义
├── package.json
└── vite.config.ts         # 开发端口 5173，API 代理至 8000
```

## 快速启动

```bash
cd frontend
npm install
npm run dev
```

浏览器访问 [http://localhost:5173](http://localhost:5173)

## 接口约定

后端服务运行在 `http://localhost:8000`，前端通过 Vite 代理转发所有 `/api` 请求：

```
/api/** → http://localhost:8000/**
```

## 路由结构

| 路径 | 页面 |
|------|------|
| `/` | 重定向至 `/products` |
| `/products` | 产品列表页 |
| `/products/:id` | 产品详情页 |
| `/products/:id/deep-analysis?type=keywords` | 关键词深度分析 |
| `/products/:id/deep-analysis?type=reviews` | 评论深度分析 |
