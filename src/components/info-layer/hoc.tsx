import { FC, ReactNode } from 'react';

export type TShowFC = FC<{ values: string[] }>;
export type TFormFC = FC<{
  labels: string[];
  values: string[];
  onChange: (values: string[]) => void;
}>;
export type TWrapperFC = FC<{ children: ReactNode }>;
export type TInfoLayerFC = FC<{
  active: boolean;
  values: string[];
  labels: string[];
  onChange: (values: string[]) => void;
}>;

type THoc = (props: {
  Show: TShowFC;
  Form: TFormFC;
  Wrapper?: TWrapperFC;
}) => TInfoLayerFC;

const InfoLayerHoc: THoc = ({
  Show,
  Form,
  Wrapper = ({ children }) => children,
}) => {
  const Comp: ReturnType<THoc> = (props) => {
    const { active, labels, values, onChange } = props;

    return (
      <Wrapper>
        {!active ? (
          <Show values={values} />
        ) : (
          <Form labels={labels} values={values} onChange={onChange} />
        )}
      </Wrapper>
    );
  };

  return Comp;
};

export default InfoLayerHoc;
