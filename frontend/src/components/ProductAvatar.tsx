import { Typography } from 'antd';

const { Text } = Typography;

// 根据产品 id 生成稳定的色系
const COLOR_PALETTES = [
  { bg: '#e6f4ff', text: '#1677ff', border: '#91caff' },
  { bg: '#f6ffed', text: '#389e0d', border: '#b7eb8f' },
  { bg: '#fff7e6', text: '#d46b08', border: '#ffd591' },
  { bg: '#f9f0ff', text: '#531dab', border: '#d3adf7' },
  { bg: '#fff0f6', text: '#c41d7f', border: '#ffadd2' },
  { bg: '#e6fffb', text: '#006d75', border: '#87e8de' },
  { bg: '#fff1f0', text: '#a8071a', border: '#ffa39e' },
  { bg: '#f0f9ff', text: '#0958d9', border: '#69b1ff' },
];

function getPalette(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % COLOR_PALETTES.length;
  }
  return COLOR_PALETTES[hash];
}

interface Props {
  productId: string;
  name: string;
  size?: number;
  fontSize?: number;
  borderRadius?: number;
}

export default function ProductAvatar({
  productId,
  name,
  size = 48,
  fontSize,
  borderRadius = 8,
}: Props) {
  const palette = getPalette(productId);
  const displayChar = name.slice(0, 2);
  const computedFontSize = fontSize ?? Math.max(10, Math.round(size * 0.28));

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Text
        style={{
          color: palette.text,
          fontSize: computedFontSize,
          fontWeight: 600,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {displayChar}
      </Text>
    </div>
  );
}
