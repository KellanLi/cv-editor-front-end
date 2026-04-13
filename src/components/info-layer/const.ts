import TitleAndTimePeriod from './title-and-time-period';
import LeftAndRightText from './left-and-right-text';
import RichText from './rich-text';

export const enum INFO_LAYER {
  TITLE_AND_TIME_PERIOD = 'TITLE_AND_TIME_PERIOD',
  LEFT_AND_RIGHT_TEXT = 'LEFT_AND_RIGHT_TEXT',
  RICH_TEXT = 'RICH_TEXT',
}

export const INFO_LAYER_MAP = {
  [INFO_LAYER.TITLE_AND_TIME_PERIOD]: {
    component: TitleAndTimePeriod,
    name: '标题 + 时间段',
    defaultProps: {
      active: false,
      labels: ['标题', '时间段'],
      values: ['示例标题', '{"start":"2026-04-01","end":"2026-04-18"}'],
      onChange: (values: string[]) => {
        console.log('onChange', values);
      },
    },
  },
  [INFO_LAYER.LEFT_AND_RIGHT_TEXT]: {
    component: LeftAndRightText,
    name: '左右文本',
    defaultProps: {
      active: false,
      labels: ['左文本', '右文本'],
      values: ['示例左文本', '示例右文本'],
      onChange: (values: string[]) => {
        console.log('onChange', values);
      },
    },
  },
  [INFO_LAYER.RICH_TEXT]: {
    component: RichText,
    name: '富文本',
    defaultProps: {
      active: false,
      labels: ['富文本'],
      values: ['<p>示例富文本</p>'],
      onChange: (values: string[]) => {
        console.log('onChange', values);
      },
    },
  },
};
