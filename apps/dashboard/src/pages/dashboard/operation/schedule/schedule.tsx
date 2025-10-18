import { useState, useEffect } from 'react';
import { Box, Button, Flex, Spacer } from '@chakra-ui/react';
import { Horizon } from '@rmf2-ui/chakra';
import Card = Horizon.Card;
import { LightMode } from '@/components/ui/color-mode';
import { toaster } from '@/components/ui/toaster';
import { DateTimeSelector } from './components/date-time-selector';
import { ScheduleGantt } from './components/schedule-gantt';
import { fetchAllTasks } from './components/api-helper';

export function Schedule() {
  // Chakra Color Mode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const currentDate = new Date();

  const sendTask = async () => {
    console.log('Start Send Task button clicked.');
    // setIsStopSimEnabled(true);
    toaster.create({
      title: 'Work Order',
      description: `Send Task succesfully`,
      type: 'success',
      duration: 5000,
      closable: true,
    });

    try {
      const response = await fetch('http://localhost:8084/send_task', {
        method: 'POST',
        headers: {
          Accept: '*/*',
        },
      });

      const result = await response.text();
      console.log('Task sent:', result);
    } catch (error) {
      console.error('Failed to send task:', error);
    }
  };

  const sendSchedule = async () => {
    console.log('Start Send Schedule button clicked.');

    try {
      const response = await fetch('http://localhost:8083/send_task', {
        method: 'POST',
        headers: {
          Accept: '*/*',
        },
      });

      const result = await response.text();
      console.log('Schedule sent:', result);
    } catch (error) {
      console.error('Failed to send schedule:', error);
    }
  };

  async function fetchData() {
    try {
      const data = await fetchAllTasks();

      setFilteredTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      // setLoading(false);
      //console.log(filteredTasks)
    }
  }
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 50000);
    return () => clearInterval(interval);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertToCSV = (data: any[]) => {
    const header = Object.keys(data[0]);
    const rows = data.map((row) => header.map((field) => row[field]).join(','));
    return [header.join(','), ...rows].join('\n');
  };

  const downloadCSV = () => {
    const csv = convertToCSV(filteredTasks);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'task-data.csv';
    link.click();
  };
  return (
    <Box>
      <Card>
        <Flex direction="column">
          <Flex justify="end" direction={{ base: 'column', sm: 'row' }}>
            <Button
              onClick={() => {
                sendTask();
                sendSchedule();
              }}
              colorPalette="blue"
              mt="5px"
            >
              Send Task
            </Button>
            <LightMode>
              <Button
                onClick={downloadCSV}
                colorPalette="orange"
                mt="5px"
                ml="5px"
              >
                Export to CSV
              </Button>
            </LightMode>
            <Spacer />

            <DateTimeSelector currentDate={currentDate} />
          </Flex>
          <ScheduleGantt tasks={filteredTasks} />
        </Flex>
      </Card>
    </Box>
  );
}
