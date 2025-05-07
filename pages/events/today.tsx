import { Box, Container, Heading, SimpleGrid, Text, Button, Flex, Badge, Icon, Divider } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CalendarIcon, TimeIcon, InfoIcon } from '@chakra-ui/icons';
import { EventDisplay } from '../../actions/events';
import { getAllEvents } from '../../actions/events';
import EventCard from '../../components/EventCard';

interface TodayEventsPageProps {
  events: EventDisplay[];
}

export default function TodayEventsPage({ events }: TodayEventsPageProps) {
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
            Today's Events
            <Box 
              className="absolute bottom-0 left-0 w-full h-1 bg-secondary-500 transform -translate-y-1"
            />
          </Heading>
          <Text className="text-gray-600 mt-2">
            Gaming events happening today
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
          <Text fontSize="xl" mb={4} className="text-primary-700">No events scheduled for today</Text>
          {session ? (
            <Link href="/events/create" passHref>
              <Button as="a" colorScheme="primary" size="lg" className="btn-primary mt-4">
                Create an event for today
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
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              description={event.description}
              date={event.date}
              game={event.game}
              address={event.address}
              author={event.author}
            />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const allEvents = await getAllEvents();
    
    // Filter events for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayEvents = allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate < tomorrow;
    });
    
    // Sort events by time (ascending)
    const sortedEvents = [...todayEvents].sort((a, b) => {
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
