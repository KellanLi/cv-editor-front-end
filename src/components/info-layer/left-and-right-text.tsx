import { Input, Label, TextField } from '@heroui/react';
import InfoLayerHoc, { TFormFC, TShowFC, TWrapperFC } from './hoc';
import { INFO_LAYER_VALUE_HINT, ValueHintPlaceholder } from './value-hint-placeholder';

const Wrapper: TWrapperFC = ({ children }) => (
  <div className="flex flex-wrap justify-between gap-4">{children}</div>
);

const Form: TFormFC = (props) => {
  const { labels, values, onChange, sectionStatus } = props;
  const ph = sectionStatus === 'edit' ? INFO_LAYER_VALUE_HINT : undefined;

  return (
    <>
      <TextField className="min-w-0 flex-1">
        <Label>{labels[0]}</Label>
        <Input
          placeholder={ph}
          value={values[0]}
          onChange={(e) => onChange([e.target.value, values[1]])}
        />
      </TextField>
      <TextField className="min-w-0 flex-1">
        <Label>{labels[1]}</Label>
        <Input
          placeholder={ph}
          value={values[1]}
          onChange={(e) => onChange([values[0], e.target.value])}
        />
      </TextField>
    </>
  );
};

const Show: TShowFC = ({ values, sectionStatus }) => {
  const isEdit = sectionStatus === 'edit';
  const leftEmpty = !String(values[0] ?? '').trim();
  const rightEmpty = !String(values[1] ?? '').trim();
  const rightTextClass = 'min-w-0 flex-1 text-right';

  return (
    <>
      {isEdit && leftEmpty ? (
        <ValueHintPlaceholder className="min-w-0 flex-1" />
      ) : (
        <div className="min-w-0 flex-1 text-left">{values[0]}</div>
      )}
      {isEdit && rightEmpty ? (
        <ValueHintPlaceholder
          className="min-w-0 flex-1"
          endAlign
        />
      ) : (
        <div className={rightTextClass}>{values[1]}</div>
      )}
    </>
  );
};

const LeftAndRightText = InfoLayerHoc({ Form, Show, Wrapper });

export default LeftAndRightText;
