import {
  DateField,
  DateRangePicker,
  Input,
  Label,
  RangeCalendar,
  TextField,
} from '@heroui/react';
import { parseDate, type CalendarDate } from '@internationalized/date';
import InfoLayerHoc, { TFormFC, TShowFC, TWrapperFC } from './hoc';
import { INFO_LAYER_VALUE_HINT, ValueHintPlaceholder } from './value-hint-placeholder';

const Wrapper: TWrapperFC = ({ children }) => (
  <div className="flex flex-wrap justify-between gap-4">{children}</div>
);

/**
 * 兜底解析 `{ start, end }`：空串 / 非法 JSON / 字段缺失 均返回空字符串，
 * 避免在渲染期抛错阻塞整棵模块树。
 */
function parseRange(raw: string | undefined): { start: string; end: string } {
  if (!raw) return { start: '', end: '' };
  try {
    const o = JSON.parse(raw) as { start?: unknown; end?: unknown };
    const start = typeof o?.start === 'string' ? o.start : '';
    const end = typeof o?.end === 'string' ? o.end : '';
    return { start, end };
  } catch {
    return { start: '', end: '' };
  }
}

/** 空串 / 非法日期返回 `null`，避免 `parseDate('')` 抛错 */
function parseCalendarDateSafe(v: string): CalendarDate | null {
  if (!v?.trim()) return null;
  try {
    return parseDate(v);
  } catch {
    return null;
  }
}

const Form: TFormFC = ({ labels, values, onChange, sectionStatus }) => {
  const { start, end } = parseRange(values[1]);
  const startDate = parseCalendarDateSafe(start);
  const endDate = parseCalendarDateSafe(end);
  const rangeValue =
    startDate && endDate ? { start: startDate, end: endDate } : null;
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
      <div className="w-72 min-w-0 shrink-0">
        <DateRangePicker
          className="w-72"
          endName="endDate"
          startName="startDate"
          value={rangeValue}
          onChange={(value) =>
            onChange([
              values[0],
              JSON.stringify({
                start: value?.start?.toString() ?? '',
                end: value?.end?.toString() ?? '',
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
      </div>
    </>
  );
};

const Show: TShowFC = ({ values, sectionStatus }) => {
  const { start, end } = parseRange(values[1]);
  const hasRange = Boolean(
    (start && start.trim()) || (end && end.trim()),
  );
  const isEdit = sectionStatus === 'edit';
  const titleEmpty = !String(values[0] ?? '').trim();
  const timeTextClass = 'min-w-0 flex-1 text-right text-base font-bold';

  return (
    <>
      {isEdit && titleEmpty ? (
        <ValueHintPlaceholder className="min-w-0 flex-1" />
      ) : (
        <div className="min-w-0 flex-1 text-left text-base font-bold">
          {values[0]}
        </div>
      )}
      {isEdit && !hasRange ? (
        <ValueHintPlaceholder className="min-w-0 flex-1" endAlign />
      ) : hasRange ? (
        <div className={timeTextClass}>
          {start} ~ {end}
        </div>
      ) : null}
    </>
  );
};

const TitleAndTimePeriod = InfoLayerHoc({ Form, Show, Wrapper });

export default TitleAndTimePeriod;
