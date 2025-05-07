import React from 'react';
import { Box, Heading, Text, Badge, Flex, Divider, Icon } from '@chakra-ui/react';
import { CalendarIcon, TimeIcon, InfoIcon } from '@chakra-ui/icons';
import Link from 'next/link';

interface EventCardProps {
  id: number;
  title: string;
  description: string;
  date: string | Date;
  game?: string;
  address?: string;
  author?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  description,
  date,
  game,
  address,
  author,
}) => {
  const formatDate = (date: Date | string) => {
    // Ensure we're working with a Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    // Ensure we're working with a Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Link href={`/events/${id}`}>
      <Box
        className="card hover:border-secondary-300 cursor-pointer"
        borderWidth="1px"
        borderRadius="lg"
        borderColor="gray.200"
        p={4}
        bg="white"
        boxShadow="sm"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: 'md',
          borderColor: 'secondary.300',
        }}
        transition="all 0.3s ease"
      >
        <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Heading size="md" className="text-primary-700 line-clamp-2">
            {title}
          </Heading>
          {game && (
            <Badge colorScheme="purple" p={1} borderRadius="md">
              {game}
            </Badge>
          )}
        </Flex>
        
        <Text 
          className="text-gray-600 mb-4 line-clamp-3" 
          title={description}
        >
          {description}
        </Text>
        
        <Divider my={4} />
        
        <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={2}>
          <Flex alignItems="center">
            <CalendarIcon className="text-secondary-500 mr-2" />
            <Text fontSize="sm" className="text-gray-700">
              {formatDate(date)}
            </Text>
          </Flex>
          
          <Flex alignItems="center">
            <TimeIcon className="text-secondary-500 mr-2" />
            <Text fontSize="sm" className="text-gray-700">
              {formatTime(date)}
            </Text>
          </Flex>
        </Flex>
        
        {(address || author) && (
          <>
            <Divider my={4} />
            <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={2}>
              {address && (
                <Flex alignItems="center">
                  <InfoIcon className="text-secondary-500 mr-2" />
                  <Text fontSize="sm" className="text-gray-700 line-clamp-1" title={address}>
                    {address}
                  </Text>
                </Flex>
              )}
              
              {author && (
                <Text fontSize="sm" className="text-gray-600">
                  Hosted by: {author}
                </Text>
              )}
            </Flex>
          </>
        )}
      </Box>
    </Link>
  );
};

export default EventCard;
