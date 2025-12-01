import { type FC } from 'react';

export interface SingleTitleProps {
  title: string;
}

const SingleTitle: FC<SingleTitleProps> = ({ title }) => {
  return <h3>{title}</h3>;
};

export default SingleTitle;
