import { type FC } from 'react';

export interface SingleTitleProps {
  title?: string;
}

/** 单标题 */
const SingleTitle: FC<SingleTitleProps> = ({ title }) => {
  return <h3>{title}</h3>;
};

export default SingleTitle;
