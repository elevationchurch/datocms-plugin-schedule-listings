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
  useRef,
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

interface TimeSlotValue {
  id: string;
  time: string;
  timezone: Timezone;
}

interface ListingProps {
  ctx: RenderFieldExtensionCtx;
  weekdays: Weekday[];
  timeSlots: TimeSlotValue[];
  id: string;
  onChange: (
    key: 'weekdays' | 'timeSlots',
    v: Weekday[] | TimeSlotValue[],
  ) => void;
  onRemove: (id: string) => void;
}

interface TimeSlotProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  isOnlySlot: boolean;
  slotValue: TimeSlotValue;
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
            <TimeSlot
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
  timeSlots: TimeSlotValue[];
  id: string;
}

const Listings = ({ ctx }: { ctx: RenderFieldExtensionCtx }) => {
  const [listings, setListings] = useState<IndividualListing[]>([
    {
      timeSlots: [
        { id: generateId(ctx, 'timeslot'), time: '', timezone: TIMEZONES[0] },
      ],
      weekdays: [],
      id: generateId(ctx, 'listing'),
    },
  ]);

  useEffect(() => {
    console.log(listings);
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
            setListings([
              ...listings,
              { timeSlots: [], weekdays: [], id: generateId(ctx, 'listing') },
            ]);
          }}
        >
          Add Listing
        </Button>
      </div>
    </Canvas>
  );
};

export default Listings;
