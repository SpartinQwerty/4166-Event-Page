import { Box, Container, Heading, SimpleGrid, Text, Button, Flex, Badge, Icon, Divider, useToast } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useSession, getSession } from 'next-auth/react';
import { CalendarIcon, TimeIcon, InfoIcon, StarIcon } from '@chakra-ui/icons';
import { EventDisplay } from '../actions/events';
import { getAllEvents } from '../actions/events';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

interface FavoritesPageProps {
  events: EventDisplay[];
}

export default function FavoritesPage({ events: initialEvents }: FavoritesPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [favoriteEvents, setFavoriteEvents] = useState<EventDisplay[]>(initialEvents);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, router]);

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

  const removeFromFavorites = (eventId: number) => {
    // In a real application, this would call an API to remove from favorites
    // For now, we'll just filter it out of the local state
    setFavoriteEvents(favoriteEvents.filter(event => event.id !== eventId));
    
    toast({
      title: 'Removed from favorites',
      description: 'Event has been removed from your favorites',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  if (!session) {
    return null; // Don't render anything while redirecting
  }
  
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
            My Favorites
            <Box 
              className="absolute bottom-0 left-0 w-full h-1 bg-secondary-500 transform -translate-y-1"
            />
          </Heading>
          <Text className="text-gray-600 mt-2">
            Gaming events you've saved as favorites
          </Text>
        </Box>
        
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
      </Flex>

      {favoriteEvents.length === 0 ? (
        <Box 
          textAlign="center" 
          py={10} 
          className="bg-white shadow-md rounded-lg p-8"
        >
          <Text fontSize="xl" mb={4} className="text-primary-700">No favorite events yet</Text>
          <Text className="text-gray-600 mb-6">
            Browse events and add them to your favorites to see them here.
          </Text>
          <Link href="/events" passHref>
            <Button as="a" colorScheme="primary" size="lg" className="btn-primary mt-4">
              Browse Events
            </Button>
          </Link>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {favoriteEvents.map((event) => (
            <Box
              key={event.id}
              className="card hover:border-secondary-300 cursor-pointer"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'md',
              }}
              transition="all 0.3s ease"
              position="relative"
            >
              <Button
                position="absolute"
                top={2}
                right={2}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromFavorites(event.id);
                }}
                zIndex={1}
                title="Remove from favorites"
              >
                <StarIcon color="secondary.500" />
              </Button>
              
              <Link href={`/events/${event.id}`}>
                <Box>
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
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }
  
  try {
    // In a real application, you would fetch only the user's favorite events
    // For demonstration purposes, we'll just get a few random events
    const allEvents = await getAllEvents();
    
    // Simulate favorite events by taking the first 3 events
    // In a real app, you would query the user's favorites from the database
    const favoriteEvents = allEvents.slice(0, 3);

    return {
      props: {
        events: JSON.parse(JSON.stringify(favoriteEvents)),
      },
    };
  } catch (error) {
    console.error('Error fetching favorite events:', error);
    return {
      props: {
        events: [],
      },
    };
  }
};
