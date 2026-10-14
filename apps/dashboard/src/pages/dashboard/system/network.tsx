import { Box, Stack, Table } from '@chakra-ui/react';
import { NetworkStatusRow } from '@/components/card';
import { useState, useEffect } from 'react';
import {
  Vda5050MasterConfig,
  PlanServerConfig,
  PlanExecutorConfig,
} from '@/clients';

const MQTT_BASE = import.meta.env.VITE_MQTT_BASE ?? 'http://localhost:1883';
const AMQP_BASE = import.meta.env.VITE_AMQP_BASE ?? 'http://localhost:5672';
const ORCHESTRATOR_BASE =
  import.meta.env.VITE_ORCHESTRATOR_BASE ??
  'http://localhost:8080/orchestrator';

async function checkHealth(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function Network() {
  const [status, setStatus] = useState({
    planServer: false,
    planExecutor: false,
    vda5050Master: false,
  });

  useEffect(() => {
    const planServerBase =
      PlanServerConfig.BASE ?? 'http://localhost:8080/plan_server';
    const planExecutorBase =
      PlanExecutorConfig.BASE ?? 'http://localhost:8080/plan_executor';
    const vda5050Base =
      Vda5050MasterConfig.BASE ?? 'http://localhost:8080/vda5050_master';

    const poll = async () => {
      const [planServer, planExecutor, vda5050Master] = await Promise.all([
        checkHealth(planServerBase + '/health'),
        checkHealth(planExecutorBase + '/health'),
        checkHealth(vda5050Base + '/health'),
      ]);
      setStatus({ planServer, planExecutor, vda5050Master });
    };

    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box>
      <Stack>
        <Table.ScrollArea maxW="full">
          <Table.Root
            size="sm"
            variant="outline"
            striped
            minW={{ base: '520px', md: 'full' }}
          >
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader minW="124px">Status</Table.ColumnHeader>
                <Table.ColumnHeader minW="180px">Name</Table.ColumnHeader>
                <Table.ColumnHeader minW="240px">Endpoint</Table.ColumnHeader>
                <Table.ColumnHeader>Description</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <NetworkStatusRow
                name="Task Scheduler"
                description="Schedule and optimize tasks across processes and series"
                isOnline={true}
                endpointBase="http://localhost:8080/task_scheduler"
                responseKey="scheduler"
                statusPath="/health"
                docsUrl="http://localhost:8080/task_scheduler/docs"
              />
              <NetworkStatusRow
                name="Task Orchestrator"
                description="Design and execute complex multi-step workflows across services and robots"
                isOnline={true}
                endpointBase={ORCHESTRATOR_BASE}
                responseKey="orchestrator"
                statusPath="/health"
                docsUrl={ORCHESTRATOR_BASE + '/docs'}
              />
              <NetworkStatusRow
                name="Plan Server"
                description="MAPF (Multi-Agent Path Finding) planner that computes collision-free paths and caches motion plans for fleet execution"
                isOnline={status.planServer}
                endpointBase={
                  PlanServerConfig.BASE ?? 'http://localhost:8080/plan_server'
                }
                responseKey="planServer"
                statusPath="/health"
                docsUrl={
                  (PlanServerConfig.BASE ??
                    'http://localhost:8080/plan_server') + '/docs'
                }
              />
              <NetworkStatusRow
                name="Plan Executor"
                description="Executes pre-computed motion plans deterministically, following each step in sequence with guaranteed ordering"
                isOnline={status.planExecutor}
                endpointBase={
                  PlanExecutorConfig.BASE ??
                  'http://localhost:8080/plan_executor'
                }
                responseKey="planExecutor"
                statusPath="/health"
                docsUrl={
                  (PlanExecutorConfig.BASE ??
                    'http://localhost:8080/plan_executor') + '/docs'
                }
              />
              <NetworkStatusRow
                name="VDA5050 Master"
                description="VDA5050 master control that dispatches orders and monitors state for AMRs and AGVs"
                isOnline={status.vda5050Master}
                endpointBase={
                  Vda5050MasterConfig.BASE ??
                  'http://localhost:8080/vda5050_master'
                }
                responseKey="vda5050Master"
                statusPath="/health"
                docsUrl={
                  (Vda5050MasterConfig.BASE ??
                    'http://localhost:8080/vda5050_master') + '/docs'
                }
              />
              <NetworkStatusRow
                name="MQTT Broker"
                description="Connects to robots and edge devices such as VDA5050 agents"
                isOnline={true}
                endpointBase={MQTT_BASE}
                responseKey="mqtt"
                statusPath=""
              />
              <NetworkStatusRow
                name="AMQP Broker"
                description="Handles inter-service communication with reliable message passing between backend services"
                isOnline={true}
                endpointBase={AMQP_BASE}
                responseKey="amqp"
                statusPath=""
                docsUrl={
                  import.meta.env.VITE_AMQP_ADMIN_BASE ??
                  'http://localhost:15672'
                }
              />
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Stack>
    </Box>
  );
}

export default Network;
