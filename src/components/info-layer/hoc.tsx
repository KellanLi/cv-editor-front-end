import { FC, ReactNode } from 'react';

export type TShowFC = FC<{
  values: string[];
  sectionStatus: 'edit' | 'view';
}>;
export type TFormFC = FC<{
  labels: string[];
  values: string[];
  onChange: (values: string[]) => void;
  sectionStatus: 'edit' | 'view';
}>;
export type TWrapperFC = FC<{ children: ReactNode }>;
export type TInfoLayerFC = FC<{
  active: boolean;
  values: string[];
  labels: string[];
  onChange: (values: string[]) => void;
  sectionStatus: 'edit' | 'view';
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
    const { active, labels, values, onChange, sectionStatus } = props;

    return (
      <Wrapper>
        {!active ? (
          <Show values={values} sectionStatus={sectionStatus} />
        ) : (
          <Form
            labels={labels}
            values={values}
            onChange={onChange}
            sectionStatus={sectionStatus}
          />
        )}
      </Wrapper>
    );
  };

  return Comp;
};

export default InfoLayerHoc;
