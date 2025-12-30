import { type FC } from 'react';

import * as style from './index.module.less';

export interface SingleTitleProps {
  title: string;
}

/** 单标题 */
const SingleTitle: FC<Partial<SingleTitleProps>> = ({ title }) => {
  return (
    <div className={style.singleTitle}>
      <h3>{title}</h3>
    </div>
  );
};

export default SingleTitle;
