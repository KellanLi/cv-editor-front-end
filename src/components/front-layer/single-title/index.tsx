import { type FC } from 'react';

export interface SingleTitleProps {
  title?: string;
}

/** 单标题 */
const SingleTitle: FC<SingleTitleProps> = () => {
  return <h3>单表题</h3>;
};

export default SingleTitle;
