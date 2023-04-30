import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import {
  Canvas,
  Form,
  FormLabel,
  SelectField,
  TextField,
} from 'datocms-react-ui';
import { WEEKDAYS } from '../lib/constants';
import styles from './Plugin.module.css';
import {
  FunctionComponent,
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';
import CloseButton from '../utils/CloseButton';
import { generateId } from '../lib/helper';
import AddButton from '../utils/AddButton';
import saveFieldValue from '../lib/saveFieldValue';
import TIMEZONES from '../lib/timezones';

type Weekday = (typeof WEEKDAYS)[number];
type Timezone = (typeof TIMEZONES)[number];

interface PluginProps {
  ctx: RenderFieldExtensionCtx;
}

interface TimeSlot {
  id: string;
  time: string;
  timezone: Timezone;
}

interface TimeSlotsProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  isOnlySlot: boolean;
  slotValue: TimeSlot;
  onChangeValue: (key: string, value: string | Timezone) => void;
  onRemove: () => void;
}

const TimeSlots: FunctionComponent<TimeSlotsProps> = ({
  id,
  isOnlySlot,
  slotValue,
  onChangeValue,
  onRemove,
}) => {
  const timeZoneOptions = TIMEZONES.map((tz) => ({
    label: tz.value,
    value: tz,
  }));

  return (
    <div className={styles.timeSlot}>
      <div className={styles.timeWrapper}>
        <TextField
          required
          name='Time'
          id={id}
          label='Time'
          value={slotValue.time}
          onChange={(e) => onChangeValue('time', e)}
          textInputProps={{ type: 'time', className: styles.timeInput }}
        />
      </div>
      <div className={styles.dropdownWrapper}>
        <SelectField
          name='option'
          id='option'
          label='Timezone'
          value={{
            label: slotValue.timezone.value,
            value: slotValue.timezone,
          }}
          selectInputProps={{
            isMulti: false,
            options: timeZoneOptions,
          }}
          onChange={(value) => onChangeValue('timezone', value!.value)}
        />
      </div>
      {!isOnlySlot && (
        <button className={styles.closeButton} onClick={onRemove}>
          <CloseButton />
        </button>
      )}
    </div>
  );
};

export default function Plugin({ ctx }: PluginProps) {
  const initialValue = useRef(
    JSON.parse(ctx.formValues[ctx.fieldPath] as string),
  );

  const [weekdays, setWeekdays] = useState<Weekday[]>(
    initialValue.current ? initialValue.current.weekdays : [],
  );

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(
    initialValue.current
      ? initialValue.current.timeSlots
      : [{ id: generateId(ctx), time: '', timezone: TIMEZONES[0] }],
  );

  useEffect(() => {
    saveFieldValue(ctx, { weekdays, timeSlots });
  }, [weekdays, timeSlots, ctx]);

  return (
    <Canvas ctx={ctx}>
      <Form className={styles.form}>
        <div className={styles.formRoot}>
          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h2 className={styles.h2}>Weekdays</h2>
            </div>
            <div className={styles.weekdaysWrapper}>
              {WEEKDAYS.map((weekday) => {
                const id = `${ctx.field.id}-${weekday.long}`;
                return (
                  <FormLabel
                    key={weekday.long}
                    htmlFor={id}
                    className={styles.label}
                  >
                    <input
                      type='checkbox'
                      id={id}
                      className={styles.checkbox}
                      checked={weekdays.some(
                        (w) => w.position === weekday.position,
                      )}
                      onChange={(e) => {
                        if (
                          e.target.checked &&
                          !weekdays.some((w) => w.position === weekday.position)
                        ) {
                          setWeekdays(weekdays.concat(weekday));
                        } else {
                          setWeekdays(
                            weekdays.filter(
                              (w) => w.position !== weekday.position,
                            ),
                          );
                        }
                      }}
                    />
                    <span className={styles.weekday}>{weekday.long}</span>
                  </FormLabel>
                );
              })}
              <div className={styles.placeholder}></div>
            </div>
          </section>
          <hr className={styles.hr} />
          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h2 className={styles.h2}>Time Slots</h2>
            </div>
            <button
              className={styles.addTimeSlotButton}
              onClick={() => {
                setTimeSlots([
                  ...timeSlots,
                  { id: generateId(ctx), time: '', timezone: TIMEZONES[0] },
                ]);
              }}
            >
              <AddButton />
              <span>New Time Slot</span>
            </button>
            <div className={styles.timeSlots}>
              {timeSlots.map((slot) => (
                <TimeSlots
                  key={slot.id}
                  id={slot.id}
                  isOnlySlot={timeSlots.length === 1}
                  slotValue={slot}
                  onRemove={() =>
                    setTimeSlots(
                      timeSlots.filter((timeSlot) => timeSlot.id !== slot.id),
                    )
                  }
                  onChangeValue={(key, value) => {
                    setTimeSlots(
                      timeSlots.map((timeSlot) => {
                        if (timeSlot.id === slot.id) {
                          return { ...slot, [key]: value };
                        } else {
                          return timeSlot;
                        }
                      }),
                    );
                  }}
                />
              ))}
            </div>
          </section>
        </div>
      </Form>
    </Canvas>
  );
}
