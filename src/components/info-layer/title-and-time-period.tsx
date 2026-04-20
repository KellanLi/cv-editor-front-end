import {
  DateField,
  DateRangePicker,
  Input,
  Label,
  RangeCalendar,
  TextField,
} from '@heroui/react';
import { parseDate } from '@internationalized/date';
import InfoLayerHoc, { TFormFC, TShowFC, TWrapperFC } from './hoc';

const Wrapper: TWrapperFC = ({ children }) => (
  <div className="flex justify-between">{children}</div>
);

const Form: TFormFC = ({ labels, values, onChange }) => {
  const { start, end } = JSON.parse(values[1]);
  return (
    <>
      <TextField>
        <Label>{labels[0]}</Label>
        <Input
          value={values[0]}
          onChange={(e) => onChange([e.target.value, values[1]])}
        />
      </TextField>
      <DateRangePicker
        className="w-72"
        endName="endDate"
        startName="startDate"
        value={{ start: parseDate(start), end: parseDate(end) }}
        onChange={(value) =>
          onChange([
            values[0],
            JSON.stringify({
              start: value?.start?.toString(),
              end: value?.end?.toString(),
            }),
          ])
        }
      >
        <Label>{labels[1]}</Label>
        <DateField.Group fullWidth>
          <DateField.Input slot="start">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateRangePicker.RangeSeparator />
          <DateField.Input slot="end">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix>
            <DateRangePicker.Trigger>
              <DateRangePicker.TriggerIndicator />
            </DateRangePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DateRangePicker.Popover>
          <RangeCalendar aria-label="Trip dates">
            <RangeCalendar.Header>
              <RangeCalendar.YearPickerTrigger>
                <RangeCalendar.YearPickerTriggerHeading />
                <RangeCalendar.YearPickerTriggerIndicator />
              </RangeCalendar.YearPickerTrigger>
              <RangeCalendar.NavButton slot="previous" />
              <RangeCalendar.NavButton slot="next" />
            </RangeCalendar.Header>
            <RangeCalendar.Grid>
              <RangeCalendar.GridHeader>
                {(day) => (
                  <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                )}
              </RangeCalendar.GridHeader>
              <RangeCalendar.GridBody>
                {(date) => <RangeCalendar.Cell date={date} />}
              </RangeCalendar.GridBody>
            </RangeCalendar.Grid>
            <RangeCalendar.YearPickerGrid>
              <RangeCalendar.YearPickerGridBody>
                {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
              </RangeCalendar.YearPickerGridBody>
            </RangeCalendar.YearPickerGrid>
          </RangeCalendar>
        </DateRangePicker.Popover>
      </DateRangePicker>
    </>
  );
};

const Show: TShowFC = ({ values }) => {
  const { start, end } = JSON.parse(values[1]);
  return (
    <>
      <div className="text-base font-bold">{values[0]}</div>
      <div className="text-base font-bold">
        {start} ~ {end}
      </div>
    </>
  );
};

const TitleAndTimePeriod = InfoLayerHoc({ Form, Show, Wrapper });

export default TitleAndTimePeriod;
