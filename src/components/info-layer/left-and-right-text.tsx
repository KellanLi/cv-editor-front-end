import { Input, Label, TextField } from '@heroui/react';
import InfoLayerHoc, { TFormFC, TShowFC, TWrapperFC } from './hoc';

const Wrapper: TWrapperFC = ({ children }) => (
  <div className="flex justify-between">{children}</div>
);

const Form: TFormFC = (props) => {
  const { labels, values, onChange } = props;

  return (
    <>
      <TextField>
        <Label>{labels[0]}</Label>
        <Input
          value={values[0]}
          onChange={(e) => onChange([e.target.value, values[1]])}
        />
      </TextField>
      <TextField>
        <Label>{labels[1]}</Label>
        <Input
          value={values[1]}
          onChange={(e) => onChange([values[0], e.target.value])}
        />
      </TextField>
    </>
  );
};

const Show: TShowFC = ({ values }) => {
  return (
    <>
      <div>{values[0]}</div>
      <div>{values[1]}</div>
    </>
  );
};

const LeftAndRightText = InfoLayerHoc({ Form, Show, Wrapper });

export default LeftAndRightText;
