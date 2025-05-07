import { Box, Container, Heading, SimpleGrid, Text, Button, Flex, Badge, Icon, Divider, useToast, Spinner } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useSession, getSession } from 'next-auth/react';
import { CalendarIcon, TimeIcon, InfoIcon, StarIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import EventCard from '../components/EventCard';
import { useState, useEffect } from 'react';

interface FavoriteEvent {
  favoriteId: number;
  eventId: number;
  userId: number;
  createdAt: string;
  title: string;
  description: string;
  date: string;
  location: string;
  hostId: number;
  hostUsername: string;
  hostFirstName: string;
  hostLastName: string;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [favoriteEvents, setFavoriteEvents] = useState<FavoriteEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirect to login if not authenticated and fetch favorites if authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchFavorites();
    }
  }, [status, router]);
  
  // Fetch user's favorite events
  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/favorites');
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      const data = await response.json();
      setFavoriteEvents(data.favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to load favorite events',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const removeFromFavorites = async (eventId: number) => {
    try {
      const response = await fetch(`/api/favorites?eventId=${eventId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }
      
      // Update the UI by removing the event from the local state
      setFavoriteEvents(favoriteEvents.filter(event => event.eventId !== eventId));
      
      toast({
        title: 'Removed from favorites',
        description: 'Event has been removed from your favorites',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
            <Box key={event.favoriteId} position="relative">
              <Button
                position="absolute"
                top={2}
                right={2}
                size="sm"
                variant="solid"
                colorScheme="red"
                onClick={() => removeFromFavorites(event.eventId)}
                aria-label="Remove from favorites"
                zIndex={1}
                borderRadius="full"
              >
                <StarIcon />
              </Button>
              <EventCard
                id={event.eventId}
                title={event.title}
                description={event.description}
                date={event.date}
                address={event.location}
                author={`${event.hostFirstName} ${event.hostLastName}`}
                game="Gaming Event"
              />
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
