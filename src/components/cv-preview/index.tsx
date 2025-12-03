import { type FC } from 'react';
import type { CVPreviewProps } from './types';
import * as styles from './index.module.less';

const CVPreview: FC<CVPreviewProps> = (props) => {
  const { cvData, width = 600 } = props;

  if (!cvData) return null;

  return (
    <div style={{ width }} className={styles.cvPreview}>
      <header className={styles.baseInfo}>
        <div>
          <div>{cvData.fullName}</div>
          <div>{cvData.targetPosition}</div>
          <ul>
            {cvData.basicInfo?.map((item) => (
              <li key={item.label}>
                {item.icon}
                {item.value}
              </li>
            ))}
          </ul>
        </div>
        {cvData.profilePicture && (
          <img
            className={styles.profileImage}
            src={cvData.profilePicture}
            alt="证件照"
          />
        )}
      </header>
      <main></main>
    </div>
  );
};

export default CVPreview;
