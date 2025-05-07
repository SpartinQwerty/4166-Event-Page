import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { CalendarIcon, TimeIcon, InfoIcon } from '@chakra-ui/icons';
import MapComponent from '../../components/GoogleMap';
import { EventInfo } from '../../actions/events';

interface EventDetailProps {
  event: EventInfo;
}

export default function EventDetail({ event }: EventDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const isEventHost = session?.user?.email === event.author.username;
  
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
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
          
          {isEventHost && (
            <Flex mt={{ base: 4, md: 0 }}>
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
            </Flex>
          )}
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
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={3} className="text-primary-700">
              Location
            </Heading>
            <Text mb={4} className="text-gray-700">{event.location.address}</Text>
            
            <Box className="rounded-lg overflow-hidden border border-gray-200">
              <MapComponent 
                readOnly={true}
                initialLocation={{
                  lat: event.location.latitude,
                  lng: event.location.longitude,
                  address: event.location.address
                }}
              />
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
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/events?id=${id}`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch event');
    }
    
    const event = await res.json();

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
