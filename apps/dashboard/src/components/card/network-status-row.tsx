import {
  Badge,
  HStack,
  Icon,
  Link,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { IoWifi } from 'react-icons/io5';
import { FiWifiOff } from 'react-icons/fi';
import { LuExternalLink } from 'react-icons/lu';

export interface NetworkStatusRowProps {
  name: string;
  description: string;
  isOnline: boolean;
  endpointBase: string;
  responseKey: string;
  statusPath?: string;
  docsUrl?: string;
}

function parseEndpoint(base: string): { protocol: string; endpoint: string } {
  try {
    const url = new URL(base);
    const pathname = url.pathname.replace(/\/$/, '');
    return {
      protocol: url.protocol.replace(':', '').toUpperCase(),
      endpoint: url.host + pathname,
    };
  } catch {
    return { protocol: 'HTTP', endpoint: base };
  }
}

export function NetworkStatusRow(props: NetworkStatusRowProps) {
  const { name, description, isOnline, endpointBase, docsUrl } = props;

  const StatusIcon = isOnline ? IoWifi : FiWifiOff;
  const iconColor = isOnline ? 'green.500' : 'red.500';
  const statusLabel = isOnline ? 'Online' : 'Offline';
  const statusColor = isOnline ? 'green.600' : 'red.600';
  const { protocol, endpoint } = parseEndpoint(endpointBase);

  return (
    <Table.Row>
      <Table.Cell verticalAlign="middle">
        <HStack gap="3">
          <Icon as={StatusIcon} color={iconColor} boxSize="40px" aria-hidden />
          <Text fontSize="sm" fontWeight="medium" color={statusColor}>
            {statusLabel}
          </Text>
        </HStack>
      </Table.Cell>
      <Table.Cell verticalAlign="top">
        <Text fontWeight="semibold">{name}</Text>
      </Table.Cell>
      <Table.Cell verticalAlign="top">
        <VStack align="start" gap="1">
          <HStack gap="1" flexWrap="wrap">
            <Badge colorPalette="purple" size="sm" fontFamily="mono">
              {protocol}
            </Badge>
            <Text fontSize="xs" fontFamily="mono" color="fg.muted">
              {endpoint}
            </Text>
          </HStack>
          {docsUrl && (
            <Link
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              fontSize="xs"
              color="blue.500"
            >
              <HStack gap="1">
                <Text>Docs</Text>
                <Icon as={LuExternalLink} boxSize="3" />
              </HStack>
            </Link>
          )}
        </VStack>
      </Table.Cell>
      <Table.Cell verticalAlign="top" color="fg.muted">
        {description}
      </Table.Cell>
    </Table.Row>
  );
}

export default NetworkStatusRow;
