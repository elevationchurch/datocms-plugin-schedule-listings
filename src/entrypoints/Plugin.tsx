import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import {
  Button,
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
  useState,
} from 'react';
import CloseButton from '../utils/CloseButton';
import { generateId } from '../lib/helper';
import AddButton from '../utils/AddButton';
import saveFieldValue from '../lib/saveFieldValue';
import TIMEZONES from '../lib/timezones';
import MinusIcon from '../utils/MinusIcon';

type Weekday = (typeof WEEKDAYS)[number];
type Timezone = (typeof TIMEZONES)[number];

interface TimeSlotProps {
  id: string;
  time: string;
  timezone: Timezone;
}

interface ListingProps {
  ctx: RenderFieldExtensionCtx;
  weekdays: Weekday[];
  timeSlots: TimeSlotProps[];
  id: string;
  onChange: (
    key: 'weekdays' | 'timeSlots',
    v: Weekday[] | TimeSlotProps[],
  ) => void;
  onRemove: (id: string) => void;
}

interface TimeSlotComponentProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  isOnlySlot: boolean;
  slotValue: TimeSlotProps;
  onChangeValue: (key: string, value: string | Timezone) => void;
  onRemove: () => void;
}

const TimeSlotComponent: FunctionComponent<TimeSlotComponentProps> = ({
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

export const Listing = ({
  ctx,
  id,
  weekdays,
  timeSlots,
  onChange,
  onRemove,
}: ListingProps) => (
  <Form className={styles.form}>
    <div className={styles.formRoot}>
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2 className={styles.h2}>Weekdays</h2>
          <button className={styles.minusButton} onClick={() => onRemove(id)}>
            <MinusIcon />
          </button>
        </div>
        <div className={styles.weekdaysWrapper}>
          {WEEKDAYS.map((weekday) => {
            const weekdayId = `${ctx.field.id}-${weekday.long}-${id}`;

            return (
              <FormLabel
                key={weekdayId}
                htmlFor={weekdayId}
                className={styles.label}
              >
                <input
                  type='checkbox'
                  id={weekdayId}
                  className={styles.checkbox}
                  checked={weekdays.some(
                    (w) => w.position === weekday.position,
                  )}
                  onChange={(e) => {
                    if (
                      e.target.checked &&
                      !weekdays.some((w) => w.position === weekday.position)
                    ) {
                      onChange('weekdays', weekdays.concat(weekday));
                    } else {
                      onChange(
                        'weekdays',
                        weekdays.filter((w) => w.position !== weekday.position),
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
            onChange('timeSlots', [
              ...timeSlots,
              {
                id: generateId(ctx, 'timeslot'),
                time: '',
                timezone: TIMEZONES[0],
              },
            ]);
          }}
        >
          <AddButton />
          <span>New Time Slot</span>
        </button>
        <div className={styles.timeSlots}>
          {timeSlots.map((slot) => (
            <TimeSlotComponent
              key={slot.id}
              id={slot.id}
              isOnlySlot={timeSlots.length === 1}
              slotValue={slot}
              onRemove={() => {
                onChange(
                  'timeSlots',
                  timeSlots.filter((timeSlot) => timeSlot.id !== slot.id),
                );
              }}
              onChangeValue={(key, value) => {
                onChange(
                  'timeSlots',
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
);

interface IndividualListing {
  weekdays: Weekday[];
  timeSlots: TimeSlotProps[];
  id: string;
}

const Listings = ({ ctx }: { ctx: RenderFieldExtensionCtx }) => {
  const defaultListing = {
    timeSlots: [
      {
        id: generateId(ctx, 'timeslot'),
        time: '',
        timezone: TIMEZONES[0],
      },
    ],
    weekdays: [],
    id: generateId(ctx, 'listing'),
  };

  const [listings, setListings] = useState<IndividualListing[]>(() => {
    const initial = ctx.formValues[ctx.fieldPath];

    if (!initial) return [defaultListing];

    try {
      return JSON.parse(initial as string);
    } catch (_) {
      return [defaultListing];
    }
  });

  useEffect(() => {
    saveFieldValue(ctx, listings);
  }, [ctx, listings]);

  return (
    <Canvas ctx={ctx}>
      <div className={styles.listingsWrapper}>
        {listings.map(({ timeSlots, weekdays, id }) => (
          <Listing
            key={id}
            ctx={ctx}
            id={id}
            timeSlots={timeSlots}
            weekdays={weekdays}
            onChange={(k, v) => {
              setListings(
                listings.map((listing) => {
                  return listing.id === id ? { ...listing, [k]: v } : listing;
                }),
              );
            }}
            onRemove={(id) => {
              setListings(listings.filter((listing) => listing.id !== id));
            }}
          />
        ))}

        <Button
          onClick={() => {
            setListings([...listings, defaultListing]);
          }}
        >
          Add Listing
        </Button>
      </div>
    </Canvas>
  );
};

export default Listings;
