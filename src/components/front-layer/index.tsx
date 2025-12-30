import { type FC } from 'react';
import {
  FrontLayerType,
  FrontLayerMap,
  FrontLayerPreviewPropsMap,
} from './const';

import * as style from './index.module.less';

interface LayerPreviewProps {
  layerType: FrontLayerType;
}

export const LayerPreview: FC<LayerPreviewProps> = (props) => {
  const { layerType } = props;
  const FrontLayerComponent = FrontLayerMap[layerType];
  const previewProps = FrontLayerPreviewPropsMap[layerType];
  return (
    <div className={style.layerPreview}>
      <FrontLayerComponent />
    </div>
  );
};
