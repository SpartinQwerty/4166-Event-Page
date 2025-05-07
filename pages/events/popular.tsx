import { Box, Container, Heading, SimpleGrid, Text, Button, Flex, Badge, Icon, Divider } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CalendarIcon, TimeIcon, InfoIcon, StarIcon } from '@chakra-ui/icons';
import { EventDisplay } from '../../actions/events';
import { getAllEvents } from '../../actions/events';
import EventCard from '../../components/EventCard';

interface PopularEventsPageProps {
  events: EventDisplay[];
}

export default function PopularEventsPage({ events }: PopularEventsPageProps) {
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
            Popular Events
            <Box 
              className="absolute bottom-0 left-0 w-full h-1 bg-secondary-500 transform -translate-y-1"
            />
          </Heading>
          <Text className="text-gray-600 mt-2">
            Most popular gaming events in your area
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
          <Text fontSize="xl" mb={4} className="text-primary-700">No popular events found</Text>
          {session ? (
            <Link href="/events/create" passHref>
              <Button as="a" colorScheme="primary" size="lg" className="btn-primary mt-4">
                Create a new event
              </Button>
            </Link>
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
          {events.map((event, index) => (
            <Box key={event.id} position="relative" overflow="hidden">
              {index < 3 && (
                <Box 
                  position="absolute" 
                  top="0" 
                  right="0" 
                  bg="secondary.500" 
                  color="white" 
                  px={3} 
                  py={1}
                  borderBottomLeftRadius="md"
                  className="flex items-center"
                  zIndex="1"
                >
                  <StarIcon mr={1} boxSize={3} />
                  <Text fontSize="xs" fontWeight="bold">
                    {index === 0 ? 'Top Event' : index === 1 ? '2nd Popular' : '3rd Popular'}
                  </Text>
                </Box>
              )}
              <EventCard
                id={event.id}
                title={event.title}
                description={event.description}
                date={event.date}
                game={event.game}
                address={event.address}
                author={event.author}
              />
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const allEvents = await getAllEvents();
    
    // For demonstration purposes, we'll just sort by date as a proxy for popularity
    // In a real application, you might have a popularity metric like views or favorites
    const upcomingEvents = allEvents.filter(event => {
      return new Date(event.date) >= new Date();
    });
    
    // Return only upcoming events, limited to 10 for the popular page
    const popularEvents = upcomingEvents.slice(0, 10);

    return {
      props: {
        events: JSON.parse(JSON.stringify(popularEvents)),
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
