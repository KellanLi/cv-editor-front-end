import { type FC } from 'react';

export interface LeftTitleDescriptionRightTimeProps {
  title: string;
  description: string;
  time: string;
}

/** 左标题 + 描述，右时间 + 地点 */
const LeftTitleDescriptionRightTime: FC<
  Partial<LeftTitleDescriptionRightTimeProps>
> = () => {
  return <div>LeftTitleDescriptionRightTime</div>;
};

export default LeftTitleDescriptionRightTime;
