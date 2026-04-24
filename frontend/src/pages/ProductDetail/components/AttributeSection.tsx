import { useState } from 'react';
import {
  Checkbox,
  Radio,
  Input,
  Select,
  Button,
  Typography,
  Divider,
  Space,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;

// ─── Section title ────────────────────────────────────────────────
function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ background: '#f5f7fa', borderLeft: '3px solid #1677ff', padding: '7px 14px', marginBottom: 16, borderRadius: '0 4px 4px 0' }}>
      <Text strong style={{ fontSize: 13, color: '#262626' }}>{title}</Text>
    </div>
  );
}

// ─── Row layout helper ────────────────────────────────────────────
function AttrRow({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 14, gap: 0 }}>
      {/* Label */}
      <div style={{ minWidth: 90, paddingRight: 12, paddingTop: 3, textAlign: 'right', flexShrink: 0 }}>
        <div>
          {required && <span style={{ color: '#ff4d4f', marginRight: 3 }}>*</span>}
          <Text style={{ fontSize: 13, color: '#595959' }}>{label}</Text>
        </div>
        {hint && (
          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>（{hint}）</Text>
        )}
      </div>
      {/* Content */}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

// ─── Checkbox group with consistent spacing ───────────────────────
function AttrCheckboxGroup({ options, value, onChange }: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <Checkbox.Group
      value={value}
      onChange={onChange as (v: (string | number | boolean)[]) => void}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 0', lineHeight: '28px' }}
    >
      {options.map(opt => (
        <Checkbox key={opt} value={opt} style={{ marginRight: 16, fontSize: 13 }}>{opt}</Checkbox>
      ))}
    </Checkbox.Group>
  );
}

// ─── Options data ─────────────────────────────────────────────────
const BASIC_OPTS    = ['易碎品', '普货类', '轻抛类', '重货', '高价值产品'];
const HOLIDAY_OPTS  = ['万圣节', '圣帕特里克节', '圣诞节', '复活节', '情人节', '愚人节', '感恩节', '斋月', '母亲节', '父亲节'];
const SEASON_OPTS   = ['冬季', '夏季', '早季', '春季', '秋季', '雨季'];
const BATTERY_OPTS  = ['内置电池', '无电池', '纯电池', '配套电池'];
const PLUG_OPTS     = ['中标插头', '欧规插头', '美规插头', '英规插头'];
const VOLTAGE_OPTS  = ['110-240v(宽电压)', '110v', '110v以下', '220v'];
const FORM_OPTS     = ['气雾产品', '液体产品', '粉末产品', '育体产品'];
const PACK_OPTS     = ['充气袋', '其他异形包装', '圆柱', '布料', '朔料袋', '木制', '梯形', '皮革', '纸箱', '缠绕膜', '金属', '锥形'];
const BANNED_OPTS   = ['刺激气味产品', '压缩气瓶', '尖锐器具', '强磁产品', '易燃易爆', '枪支弹药', '管制刀具', '腐蚀产品', '间谍专用器材'];
const OTHER_OPTS    = [
  'DOT产品', 'HDMI产品', '仿币', '儿童玩具', '动漫IP', '动物制品', '化学原料', '医疗设备',
  '反倾销产品', '地球仪', '大功率电器', '纺织品', '美容及个人护理产品', '药品/药膏',
  '蓝牙产品', '钢铁制品', '铝制品', '防疫', '食品相关产品', '食品类',
];
const CERT_OPTS     = ['ASTM', 'CCPSA', 'CE', 'CMDCAS', 'CPSC', 'CPSIA', 'CSA', 'DISC', 'DOT', 'EMC', 'EN71', 'EPA', 'FCC', 'FDA', '检验检疫证明', '熏蒸证明', '进口许可证'];
const MANUAL_OPTS   = ['无', '中文', '英文', '韩语', '日语', '德语', '其他'];
const SOURCE_TYPE_OPTS = ['运营/供应商推荐', '市场调研', '竞品分析', '平台趋势'].map(v => ({ label: v, value: v }));
const MONTH_OPTS = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, value: i + 1 }));

// ─── Component ────────────────────────────────────────────────────
export default function AttributeSection() {
  const [basic, setBasic]       = useState<string>('普货类');
  const [holiday, setHoliday]   = useState<string[]>([]);
  const [season, setSeason]     = useState<string[]>([]);
  const [battery, setBattery]   = useState<string[]>(['无电池']);
  const [batteryModel, setBatteryModel]  = useState('');
  const [batteryCapacity, setBatteryCapacity] = useState('');
  const [plug, setPlug]         = useState<string[]>([]);
  const [voltage, setVoltage]   = useState<string[]>([]);
  const [form, setForm]         = useState<string[]>([]);
  const [pack, setPack]         = useState<string[]>([]);
  const [banned, setBanned]     = useState<string[]>([]);
  const [other, setOther]       = useState<string[]>([]);
  const [cert, setCert]         = useState<string[]>([]);
  const [manual, setManual]     = useState<string[]>(['中文']);
  const [hotKeyword, setHotKeyword]   = useState('矫姿器');
  const [sourceType, setSourceType]   = useState('运营/供应商推荐');
  const [hotMonths, setHotMonths]     = useState<number[]>([1, 2]);

  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 6, padding: '16px 20px', marginTop: 12 }}>
      <SectionTitle title="属性信息" />

      {/* 基础属性 – 单选 */}
      <AttrRow label="基础属性" hint="单选">
        <Radio.Group value={basic} onChange={e => setBasic(e.target.value)} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 0' }}>
          {BASIC_OPTS.map(opt => (
            <Radio key={opt} value={opt} style={{ marginRight: 16, fontSize: 13 }}>{opt}</Radio>
          ))}
        </Radio.Group>
      </AttrRow>

      <Divider style={{ margin: '4px 0 14px' }} />

      {/* 节日属性 */}
      <AttrRow label="节日属性" hint="多选">
        <AttrCheckboxGroup options={HOLIDAY_OPTS} value={holiday} onChange={setHoliday} />
      </AttrRow>

      <Divider style={{ margin: '4px 0 14px' }} />

      {/* 季节属性 */}
      <AttrRow label="季节属性" hint="多选">
        <AttrCheckboxGroup options={SEASON_OPTS} value={season} onChange={setSeason} />
      </AttrRow>

      <Divider style={{ margin: '4px 0 14px' }} />

      {/* 电池属性 */}
      <AttrRow label="电池属性" hint="多选">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <AttrCheckboxGroup options={BATTERY_OPTS} value={battery} onChange={setBattery} />
          <Space size={12} wrap>
            <Space size={6}>
              <Text style={{ fontSize: 12 }}>电池型号备注</Text>
              <Input
                value={batteryModel}
                onChange={e => setBatteryModel(e.target.value)}
                placeholder="请输入"
                style={{ width: 200 }}
                size="small"
              />
            </Space>
            <Space size={6}>
              <Text style={{ fontSize: 12 }}>电池容量备注</Text>
              <Input
                value={batteryCapacity}
                onChange={e => setBatteryCapacity(e.target.value)}
                placeholder="请输入"
                style={{ width: 200 }}
                size="small"
              />
            </Space>
          </Space>
        </Space>
      </AttrRow>

      <Divider style={{ margin: '4px 0 14px' }} />

      {/* 插头属性 */}
      <AttrRow label="插头属性" hint="多选">
        <AttrCheckboxGroup options={PLUG_OPTS} value={plug} onChange={setPlug} />
      </AttrRow>

      <Divider style={{ margin: '4px 0 14px' }} />

      {/* 电压属性 */}
      <AttrRow label="电压属性" hint="多选">
        <AttrCheckboxGroup options={VOLTAGE_OPTS} value={voltage} onChange={setVoltage} />
      </AttrRow>

      <Divider style={{ margin: '4px 0 14px' }} />

      {/* 形态属性 */}
      <AttrRow label="形态属性" hint="多选">
        <AttrCheckboxGroup options={FORM_OPTS} value={form} onChange={setForm} />
      </AttrRow>

      <Divider style={{ margin: '4px 0 14px' }} />

      {/* 包装属性 */}
      <AttrRow label="包装属性" hint="多选">
        <AttrCheckboxGroup options={PACK_OPTS} value={pack} onChange={setPack} />
      </AttrRow>

      <Divider style={{ margin: '4px 0 14px' }} />

      {/* 违禁属性 */}
      <AttrRow label="违禁属性" hint="多选">
        <AttrCheckboxGroup options={BANNED_OPTS} value={banned} onChange={setBanned} />
      </AttrRow>

      <Divider style={{ margin: '4px 0 14px' }} />

      {/* 其他属性 */}
      <AttrRow label="其他属性" hint="多选">
        <AttrCheckboxGroup options={OTHER_OPTS} value={other} onChange={setOther} />
      </AttrRow>

      <Divider style={{ margin: '4px 0 14px' }} />

      {/* 证书属性 */}
      <AttrRow label="证书属性" hint="多选">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <AttrCheckboxGroup options={CERT_OPTS} value={cert} onChange={setCert} />
          <Space size={8}>
            <Text style={{ fontSize: 12 }}>上传证书：</Text>
            <Button size="small" icon={<UploadOutlined />}>上传文件</Button>
          </Space>
        </Space>
      </AttrRow>

      <Divider style={{ margin: '4px 0 14px' }} />

      {/* 销售周期参考 – 必填 */}
      <AttrRow label="销售周期参考" hint="多选" required>
        <Space size={12} wrap>
          <Space size={6}>
            <Text style={{ fontSize: 12 }}>热销来源关键词</Text>
            <Input
              value={hotKeyword}
              onChange={e => setHotKeyword(e.target.value)}
              style={{ width: 160 }}
              size="small"
            />
          </Space>
          <Space size={6}>
            <Text style={{ fontSize: 12 }}>开品来源类型</Text>
            <Select
              value={sourceType}
              onChange={setSourceType}
              options={SOURCE_TYPE_OPTS}
              style={{ width: 180 }}
              size="small"
            />
          </Space>
          <Space size={6}>
            <Text style={{ fontSize: 12 }}>热销月份</Text>
            <Select
              mode="multiple"
              value={hotMonths}
              onChange={setHotMonths}
              options={MONTH_OPTS}
              style={{ minWidth: 160 }}
              size="small"
              maxTagCount={4}
            />
          </Space>
        </Space>
      </AttrRow>

      <Divider style={{ margin: '4px 0 14px' }} />

      {/* 说明书 */}
      <AttrRow label="说明书">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <AttrCheckboxGroup options={MANUAL_OPTS} value={manual} onChange={setManual} />
          <Space size={8}>
            <Text style={{ fontSize: 12 }}>上传说明书：</Text>
            <Button size="small" icon={<UploadOutlined />}>上传文件</Button>
          </Space>
        </Space>
      </AttrRow>
    </div>
  );
}
