import { type FC } from 'react';
import type { CVPreviewProps } from './types';

const CVPreview: FC<CVPreviewProps> = (props) => {
  const { cvData, width = 600 } = props;

  if (!cvData) return null;

  return (
    <div style={{ width }}>
      <h1>CV Preview</h1>
      <p>This is a preview of the CV.</p>
    </div>
  );
};

export default CVPreview;
