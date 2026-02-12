export interface AppleChartThemeOptions {
  title?: string;
  xTickAngle?: number;
  margin?: {
    t: number;
    r: number;
    b: number;
    l: number;
  };
}

const chartFont = "'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function getCssColor(variableName: string, fallback: string): string {
  if (typeof document === 'undefined') {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  return value || fallback;
}

export function createAppleBarTrace(
  labels: string[],
  values: number[],
  unitLabel = 'valor(es)',
): Record<string, unknown> {
  const barColor = getCssColor('--apple-chart-bar', '#0071e3');
  const lineColor = getCssColor('--apple-chart-bar-line', '#005bb5');

  return {
    type: 'bar',
    x: labels,
    y: values,
    marker: {
      color: barColor,
      line: {
        color: lineColor,
        width: 1.2,
      },
      opacity: 0.92,
    },
    hovertemplate: `%{x}<br>%{y} ${unitLabel}<extra></extra>`,
  };
}

export function createAppleChartLayout(options: AppleChartThemeOptions = {}): Record<string, unknown> {
  const gridColor = getCssColor('--apple-chart-grid', 'rgba(29, 29, 31, 0.1)');
  return {
    margin: options.margin ?? { t: 12, r: 12, b: 38, l: 40 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      family: chartFont,
      color: '#1d1d1f',
      size: 12,
    },
    yaxis: {
      title: options.title ?? undefined,
      tick0: 0,
      dtick: 1,
      rangemode: 'tozero',
      gridcolor: gridColor,
      zerolinecolor: 'rgba(29, 29, 31, 0.18)',
    },
    xaxis: {
      tickangle: options.xTickAngle ?? -28,
      tickfont: {
        color: '#6e6e73',
      },
    },
  };
}

export const APPLE_CHART_CONFIG: Record<string, unknown> = {
  displayModeBar: false,
  responsive: true,
};
