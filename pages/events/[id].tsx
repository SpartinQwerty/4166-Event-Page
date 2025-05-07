import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Badge,
  Divider,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  List,
  ListItem,
  ListIcon,
  Spinner,
  Avatar,
  Tooltip,
} from '@chakra-ui/react';
import { CalendarIcon, TimeIcon, InfoIcon, CheckIcon, AddIcon, CloseIcon, StarIcon } from '@chakra-ui/icons';
import MapComponent from '../../components/GoogleMap';
import { EventInfo } from '../../actions/events';

interface Participant {
  participantId: number;
  eventId: number;
  userId: number;
  joinedAt: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface EventDetailProps {
  event: EventInfo;
}

export default function EventDetail({ event }: EventDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const isEventHost = session?.user?.email === event.author.username;

  // Fetch participants when component mounts or when event changes
  useEffect(() => {
    fetchParticipants();
    if (session) {
      checkIfFavorited();
    }
  }, [event.id, session]);

  // Check if the current user has joined this event
  useEffect(() => {
    if (session?.user?.email && participants.length > 0) {
      const userHasJoined = participants.some(p => p.username === session.user?.email);
      setHasJoined(userHasJoined);
    }
  }, [participants, session]);
  
  // Check if the current user has favorited this event
  const checkIfFavorited = async () => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/favorites?eventId=${event.id}`);
      if (!response.ok) {
        throw new Error('Failed to check favorite status');
      }
      
      const data = await response.json();
      const favorites = data.favorites || [];
      
      // Check if current user has favorited this event
      const userEmail = session?.user?.email;
      const isFav = favorites.some((fav: any) => fav.username === userEmail);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!session) {
      toast({
        title: 'Authentication required',
        description: 'You must be signed in to favorite an event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsTogglingFavorite(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?eventId=${event.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove from favorites');
        }
        
        toast({
          title: 'Removed from favorites',
          description: 'Event removed from your favorites',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setIsFavorite(false);
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventId: event.id }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add to favorites');
        }
        
        toast({
          title: 'Added to favorites',
          description: 'Event added to your favorites',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setIsFavorite(true);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update favorites',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Fetch participants for this event
  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/participants?eventId=${event.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load participants',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Join this event
  const handleJoinEvent = async () => {
    if (!session) {
      toast({
        title: 'Authentication required',
        description: 'You must be signed in to join an event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId: event.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join event');
      }

      toast({
        title: 'Success',
        description: 'You have joined this event',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh participants list
      fetchParticipants();
      setHasJoined(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to join event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Leave this event
  const handleLeaveEvent = async () => {
    if (!session) {
      toast({
        title: 'Authentication required',
        description: 'You must be signed in to leave an event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLeaving(true);
    try {
      const response = await fetch(`/api/participants?eventId=${event.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to leave event');
      }

      toast({
        title: 'Success',
        description: 'You have left this event',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh participants list
      fetchParticipants();
      setHasJoined(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to leave event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLeaving(false);
    }
  };
  
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!session) {
      toast({
        title: 'Authentication required',
        description: 'You must be signed in to delete an event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/events?id=${event.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast({
        title: 'Event deleted',
        description: 'The event has been successfully deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      closeDeleteDialog();
    }
  };

  const formatDate = (date: Date | string) => {
    // Ensure we're working with a Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    // Ensure we're working with a Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (router.isFallback) {
    return (
      <Container maxW="container.md" py={8}>
        <Text>Loading event details...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Box className="bg-white rounded-lg shadow-md p-8 my-8">
        <Flex justifyContent="space-between" alignItems="flex-start" mb={6} flexWrap="wrap">
          <Box>
            <Heading as="h1" size="xl" className="text-primary-700">
              {event.title}
            </Heading>
            <Flex mt={2} alignItems="center">
              <Badge colorScheme="purple" mr={2} p={1} borderRadius="md">
                {event.game.title}
              </Badge>
              <Text fontSize="sm" color="gray.500">
                Hosted by {event.author.firstName} {event.author.lastName}
              </Text>
            </Flex>
          </Box>
          
          <Flex mt={{ base: 4, md: 0 }} gap={2}>
            {session && (
              <Tooltip label={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                <Button
                  colorScheme={isFavorite ? "yellow" : "gray"}
                  variant={isFavorite ? "solid" : "outline"}
                  onClick={toggleFavorite}
                  isLoading={isTogglingFavorite}
                  leftIcon={<StarIcon />}
                  mr={2}
                >
                  {isFavorite ? "Favorited" : "Favorite"}
                </Button>
              </Tooltip>
            )}
            
            {isEventHost && (
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleDeleteClick}
                isLoading={isDeleting}
                leftIcon={<InfoIcon />}
                className="hover:bg-red-50"
              >
                Delete Event
              </Button>
            )}
            
            {!isEventHost && session && (
              hasJoined ? (
                <Button
                  colorScheme="red"
                  variant="outline"
                  onClick={handleLeaveEvent}
                  isLoading={isLeaving}
                  leftIcon={<CloseIcon />}
                  className="hover:bg-red-50"
                >
                  Leave Event
                </Button>
              ) : (
                <Button
                  colorScheme="green"
                  variant="solid"
                  onClick={handleJoinEvent}
                  isLoading={isJoining}
                  leftIcon={<AddIcon />}
                  className="hover:bg-green-600"
                >
                  Join Event
                </Button>
              )
            )}
            
            {!session && (
              <>
                <Button
                  as="a"
                  href="/auth/signin"
                  colorScheme="yellow"
                  variant="outline"
                  leftIcon={<StarIcon />}
                  mr={2}
                >
                  Sign in to favorite
                </Button>
                <Button
                  as="a"
                  href="/auth/signin"
                  colorScheme="blue"
                  variant="outline"
                >
                  Sign in to join
                </Button>
              </>
            )}
          </Flex>
        </Flex>

        <Divider mb={6} />

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Box>
            <Box mb={6}>
              <Heading as="h3" size="md" mb={3} className="text-primary-700">
                About This Event
              </Heading>
              <Text className="text-gray-700 whitespace-pre-line">{event.description}</Text>
            </Box>

            <Box mb={6}>
              <Heading as="h3" size="md" mb={3} className="text-primary-700">
                Date & Time
              </Heading>
              <Flex alignItems="center" mb={2}>
                <CalendarIcon mr={2} color="secondary.500" />
                <Text>{formatDate(event.date)}</Text>
              </Flex>
              <Flex alignItems="center">
                <TimeIcon mr={2} color="secondary.500" />
                <Text>{formatTime(event.date)}</Text>
              </Flex>
            </Box>

            <Box mb={6}>
              <Heading as="h3" size="md" mb={3} className="text-primary-700">
                Game Details
              </Heading>
              <Text fontWeight="bold" className="text-secondary-600">
                {event.game.title}
              </Text>
              <Text className="text-gray-700 mt-1">{event.game.description}</Text>
            </Box>

            <Box mb={6}>
              <Heading as="h3" size="md" mb={3} className="text-primary-700">
                Participants ({participants.length})
              </Heading>
              {isLoading ? (
                <Flex justify="center" my={4}>
                  <Spinner size="md" color="secondary.500" />
                </Flex>
              ) : participants.length > 0 ? (
                <List spacing={2}>
                  {participants.map((participant) => (
                    <ListItem key={participant.participantId} className="flex items-center py-1">
                      <Avatar 
                        size="sm" 
                        name={`${participant.firstName} ${participant.lastName}`} 
                        mr={2} 
                        bg="secondary.500"
                      />
                      <Text>
                        {participant.firstName} {participant.lastName}
                        {participant.username === event.author.username && (
                          <Badge ml={2} colorScheme="purple">Host</Badge>
                        )}
                        {participant.username === session?.user?.email && (
                          <Badge ml={2} colorScheme="green">You</Badge>
                        )}
                      </Text>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Text className="text-gray-500 italic">No participants yet. Be the first to join!</Text>
              )}
            </Box>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={3} className="text-primary-700">
              Location
            </Heading>
            
            <Box className="rounded-lg overflow-hidden border border-gray-200 p-4 bg-gray-50">
              <Text className="text-gray-700 font-medium mb-2">
                <InfoIcon mr={2} color="secondary.500" />
                Event Location
              </Text>
              <Text className="text-gray-600">{event.location.address}</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Event
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDeleteDialog}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={isDeleting}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  if (!id || typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  try {
    // Use absolute URL with protocol
    const baseUrl = process.env.NEXTAUTH_URL || `http://${context.req.headers.host}`;
    const res = await fetch(`${baseUrl}/api/events?id=${id}`);
    
    if (!res.ok) {
      console.error('Failed to fetch event:', await res.text());
      throw new Error('Failed to fetch event');
    }
    
    const eventData = await res.json();
    
    // Log successful fetch
    console.log('Successfully fetched event:', id);
    
    // Ensure the date is properly formatted as an ISO string
    const event = {
      ...eventData,
      date: new Date(eventData.date).toISOString()
    };

    return {
      props: {
        event,
      },
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    return {
      notFound: true,
    };
  }
};
