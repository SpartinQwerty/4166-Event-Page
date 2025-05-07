import { Box, Container, Heading, SimpleGrid, Text, Button, Flex, Badge, Icon, Divider, useToast } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CalendarIcon, TimeIcon, InfoIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { EventDisplay } from '../../actions/events';
import { getAllEvents } from '../../actions/events';
import { useState, useEffect } from 'react';
import MapComponent from '../../components/GoogleMap';

interface NearbyEventsPageProps {
  events: EventDisplay[];
}

export default function NearbyEventsPage({ events: initialEvents }: NearbyEventsPageProps) {
  const { data: session } = useSession();
  const toast = useToast();
  const [events, setEvents] = useState<EventDisplay[]>(initialEvents);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  
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

  // Get user's current location
  const getUserLocation = () => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userCoords);
          sortEventsByDistance(userCoords);
          setIsLocating(false);
          setMapVisible(true);
          
          toast({
            title: 'Location found',
            description: 'Events have been sorted by distance from your location',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
          
          toast({
            title: 'Location error',
            description: 'Could not access your location. Please check your browser settings.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      );
    } else {
      setIsLocating(false);
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  // Sort events by distance from user location
  const sortEventsByDistance = (userCoords: { lat: number; lng: number }) => {
    // Create a copy of events with distance information
    const eventsWithDistance = initialEvents.map(event => {
      // For demonstration purposes, we're assuming each event has location data
      // In a real app, you would use the actual location data from the event
      const eventLat = event.locationId ? 35.2271 + (Math.random() * 0.1 - 0.05) : 35.2271;
      const eventLng = event.locationId ? -80.8431 + (Math.random() * 0.1 - 0.05) : -80.8431;
      
      const distance = calculateDistance(
        userCoords.lat, 
        userCoords.lng, 
        eventLat, 
        eventLng
      );
      
      return { ...event, distance };
    });
    
    // Sort by distance
    const sortedEvents = eventsWithDistance.sort((a, b) => {
      return (a.distance || Infinity) - (b.distance || Infinity);
    });
    
    setEvents(sortedEvents);
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
            Events Near Me
            <Box 
              className="absolute bottom-0 left-0 w-full h-1 bg-secondary-500 transform -translate-y-1"
            />
          </Heading>
          <Text className="text-gray-600 mt-2">
            Find gaming events close to your location
          </Text>
        </Box>
        
        <Flex gap={4}>
          <Button 
            colorScheme="secondary"
            size="lg"
            isLoading={isLocating}
            loadingText="Finding location..."
            onClick={getUserLocation}
          >
            Find Nearby Events
          </Button>
          
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
      </Flex>

      {userLocation && mapVisible && (
        <Box mb={8} className="bg-white p-4 rounded-lg shadow-md">
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md" className="text-primary-700">Your Location</Heading>
            <Button 
              size="sm" 
              variant="ghost" 
              rightIcon={<ChevronDownIcon />}
              onClick={() => setMapVisible(!mapVisible)}
            >
              {mapVisible ? 'Hide Map' : 'Show Map'}
            </Button>
          </Flex>
          <Box height="400px" className="rounded-lg overflow-hidden">
            <MapComponent 
              readOnly={true}
              initialLocation={{
                lat: userLocation.lat,
                lng: userLocation.lng,
                address: 'Your Location'
              }}
            />
          </Box>
        </Box>
      )}

      {events.length === 0 ? (
        <Box 
          textAlign="center" 
          py={10} 
          className="bg-white shadow-md rounded-lg p-8"
        >
          <Text fontSize="xl" mb={4} className="text-primary-700">No events found nearby</Text>
          <Text className="text-gray-600 mb-6">
            There are no events in your area yet. Why not create one?
          </Text>
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
          {events.map((event: any) => (
            <Link href={`/events/${event.id}`} key={event.id}>
              <Box
                className="card hover:border-secondary-300 cursor-pointer"
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'md',
                }}
                transition="all 0.3s ease"
              >
                {event.distance && (
                  <Badge colorScheme="green" position="absolute" top={3} right={3} px={2} py={1}>
                    {event.distance.toFixed(1)} km away
                  </Badge>
                )}
                
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
    const allEvents = await getAllEvents();
    
    // Filter for upcoming events
    const upcomingEvents = allEvents.filter(event => {
      return new Date(event.date) >= new Date();
    });

    return {
      props: {
        events: JSON.parse(JSON.stringify(upcomingEvents)),
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
