import { type FC } from 'react';
import type { CVPreviewProps } from './types';

const CVPreview: FC<CVPreviewProps> = (props) => {
  const { cvData, width = 600 } = props;

  if (!cvData) return null;

  return (
    <div style={{ width }}>
      <header>
        <div>
          <div>{cvData.name}</div>
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
          <img src={cvData.profilePicture} alt="证件照" />
        )}
      </header>
      <main></main>
    </div>
  );
};

export default CVPreview;
