import { Button, Input } from '@chakra-ui/react';
// import { MdOutlineCalendarMonth } from "react-icons/md";
import { useState } from 'react';

export function DateTimeSelector(props: { currentDate: Date }) {
  const { currentDate } = props;

  function resetDatetime() {
    const localDate = new Date(currentDate);
    const timezoneOffset = localDate.getTimezoneOffset();
    localDate.setMinutes(localDate.getMinutes() - timezoneOffset);
    const datetimeString = localDate.toISOString().slice(0, -8);
    return datetimeString;
  }

  const [selectedDatetime, setSelectedDatetime] = useState(resetDatetime());

  return (
    <>
      <Button id="todayId" onClick={() => setSelectedDatetime(resetDatetime)}>
        Today
      </Button>

      <Input
        id="datetimeInputId"
        value={selectedDatetime}
        color={{ base: 'gray.700', _dark: 'white' }}
        size="md"
        type="datetime-local"
        width={280}
        ms="8px"
        rounded="2xl"
        onChange={(event) => setSelectedDatetime(event.target.value)}
      />
    </>
  );
}

export default DateTimeSelector;
