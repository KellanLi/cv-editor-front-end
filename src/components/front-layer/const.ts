import SingleTitle, { SingleTitleProps } from './single-title';
import SingleDescription from './single-description';
import SingleTime from './single-time';
import SingleDetailedDescription from './single-detailed-description';
import SingleLink from './single-link';
import LeftTitleRightDescription from './left-title-right-description';
import LeftTitleDescriptionRightTime from './left-title-description-right-time';
import LeftTitleDescriptionRightTimePlace from './left-title-description-right-time-place';

/** 前端层类型 */
export const enum FrontLayerType {
  /** 单标题 */
  SingleTitle = 1,
  /** 单描述 */
  SingleDescription = 2,
  /** 单时间 */
  SingleTime = 3,
  /** 单详细描述 */
  SingleDetailedDescription = 4,
  /** 左标题右时间 */
  LeftTitleRightDescription = 5,
  /** 左标题+描述，右时间 */
  LeftTitleDescriptionRightTime = 6,
  /** 左标题+描述，右时间+地点 */
  LeftTitleDescriptionRightTimePlace = 7,
  /** 单链接 */
  SingleLink = 8,
}

export const FrontLayerMap = {
  [FrontLayerType.SingleTitle]: SingleTitle,
  [FrontLayerType.SingleDescription]: SingleDescription,
  [FrontLayerType.SingleTime]: SingleTime,
  [FrontLayerType.SingleDetailedDescription]: SingleDetailedDescription,
  [FrontLayerType.SingleLink]: SingleLink,
  [FrontLayerType.LeftTitleRightDescription]: LeftTitleRightDescription,
  [FrontLayerType.LeftTitleDescriptionRightTime]: LeftTitleDescriptionRightTime,
  [FrontLayerType.LeftTitleDescriptionRightTimePlace]:
    LeftTitleDescriptionRightTimePlace,
};

export const FrontLayerNameMap = {
  [FrontLayerType.SingleTitle]: '单标题',
  [FrontLayerType.SingleDescription]: '单描述',
  [FrontLayerType.SingleTime]: '单时间',
  [FrontLayerType.SingleDetailedDescription]: '单详细描述',
  [FrontLayerType.SingleLink]: '单链接',
  [FrontLayerType.LeftTitleRightDescription]: '左标题右描述',
  [FrontLayerType.LeftTitleDescriptionRightTime]: '左标题+描述，右时间',
  [FrontLayerType.LeftTitleDescriptionRightTimePlace]:
    '左标题+描述，右时间+地点',
};

const SingleTitlePreviewProps: SingleTitleProps = {
  title: '单标题测试内容',
};

export const FrontLayerPreviewPropsMap = {
  [FrontLayerType.SingleTitle]: SingleTitlePreviewProps,
  [FrontLayerType.SingleDescription]: {
    description: '单描述测试内容',
  },
};
