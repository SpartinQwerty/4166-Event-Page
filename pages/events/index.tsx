import { Box, Container, Heading, SimpleGrid, Text, Button, Flex, Badge, Icon, Divider } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CalendarIcon, TimeIcon, InfoIcon } from '@chakra-ui/icons';
import { EventDisplay } from '../../actions/events';
import { getAllEvents } from '../../actions/events';

interface EventsPageProps {
  events: EventDisplay[];
}

export default function EventsPage({ events }: EventsPageProps) {
  const { data: session } = useSession();
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Flex 
        mb={8} 
        justifyContent="space-between" 
        alignItems="center"
        flexWrap="wrap"
        gap={4}
      >
        <Box>
          <Heading 
            as="h1" 
            size="xl" 
            className="text-primary-700 relative inline-block"
          >
            All Events
            <Box 
              className="absolute bottom-0 left-0 w-full h-1 bg-secondary-500 transform -translate-y-1"
            />
          </Heading>
          <Text className="text-gray-600 mt-2">
            Browse all gaming events
          </Text>
        </Box>
        
        {session && (
          <Link href="/events/create" passHref>
            <Button 
              as="a" 
              colorScheme="primary"
              size="lg"
              className="btn-primary"
              leftIcon={<Icon as={CalendarIcon} />}
            >
              Create New Event
            </Button>
          </Link>
        )}
      </Flex>

      {events.length === 0 ? (
        <Box 
          textAlign="center" 
          py={10} 
          className="bg-white shadow-md rounded-lg p-8"
        >
          <Text fontSize="xl" mb={4} className="text-primary-700">No events found</Text>
          {session ? (
            <Text className="text-gray-600">Create your first event to get started!</Text>
          ) : (
            <Link href="/auth/signin" passHref>
              <Button as="a" colorScheme="primary" size="lg" className="btn-primary mt-4">
                Sign in to create events
              </Button>
            </Link>
          )}
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {events.map((event) => (
            <Link href={`/events/${event.id}`} key={event.id}>
              <Box
                className="card hover:border-secondary-300 cursor-pointer"
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'md',
                }}
                transition="all 0.3s ease"
              >
                <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
                  <Heading size="md" className="text-primary-700 line-clamp-2">
                    {event.title}
                  </Heading>
                  <Badge colorScheme="purple" p={1} borderRadius="md">
                    {event.game}
                  </Badge>
                </Flex>
                
                <Text 
                  className="text-gray-600 mb-4 line-clamp-3" 
                  title={event.description}
                >
                  {event.description}
                </Text>
                
                <Divider my={4} />
                
                <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={2}>
                  <Flex alignItems="center">
                    <CalendarIcon className="text-secondary-500 mr-2" />
                    <Text fontSize="sm" className="text-gray-700">
                      {formatDate(event.date)}
                    </Text>
                  </Flex>
                  
                  <Flex alignItems="center">
                    <TimeIcon className="text-secondary-500 mr-2" />
                    <Text fontSize="sm" className="text-gray-700">
                      {formatTime(event.date)}
                    </Text>
                  </Flex>
                </Flex>
                
                <Flex alignItems="center" mt={3}>
                  <InfoIcon className="text-primary-500 mr-2" />
                  <Text fontSize="sm" className="text-gray-700 truncate" title={event.address || ''}>
                    {event.address || 'Location not specified'}
                  </Text>
                </Flex>
                
                <Text fontSize="sm" className="text-gray-500 mt-3">
                  Hosted by: {event.author}
                </Text>
              </Box>
            </Link>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const events = await getAllEvents();

    // Sort events by date (ascending)
    const sortedEvents = [...events].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return {
      props: {
        events: JSON.parse(JSON.stringify(sortedEvents)),
      },
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      props: {
        events: [],
      },
    };
  }
};
