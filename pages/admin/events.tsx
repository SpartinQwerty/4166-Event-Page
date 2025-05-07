import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { format } from 'date-fns';

export default function AdminEventsManagement() {
  const router = useRouter();
  const toast = useToast();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  
  interface Event {
    id: number;
    title: string;
    date: string;
    author?: {
      username: string;
    };
    game?: {
      title: string;
    };
    location?: {
      address: string;
    };
  }
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: 'Error',
          description: 'Failed to load events',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated' && isAdmin) {
      fetchEvents();
    }
  }, [status, isAdmin, toast]);
  
  // Show loading state while session is being fetched
  if (status === "loading" || isAdminLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box className="bg-white rounded-lg shadow-md p-8 mb-8" textAlign="center">
          <Heading as="h2" size="lg" mb={4}>Loading...</Heading>
          <Text>Please wait while we load the events management page.</Text>
        </Box>
      </Container>
    );
  }
  
  // Check if user is admin
  if (!isAdmin) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box className="bg-white rounded-lg shadow-md p-8 mb-8" textAlign="center">
          <Heading as="h2" size="lg" mb={4}>Access Denied</Heading>
          <Text mb={4}>You do not have admin privileges to access this page.</Text>
          <Button colorScheme="blue" onClick={() => router.push('/')}>Go to Homepage</Button>
        </Box>
      </Container>
    );
  }
  
  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/events?id=${eventToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      
      // Remove the deleted event from the state
      setEvents(events.filter(event => event.id !== eventToDelete.id));
      
      toast({
        title: 'Success',
        description: `Event "${eventToDelete.title}" has been deleted`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setEventToDelete(null);
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Box className="bg-white rounded-lg shadow-md p-8 mb-8">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h1" size="xl" className="text-primary-700">
            Admin Events Management
          </Heading>
          <Button colorScheme="blue" onClick={() => router.push('/admin')}>
            Back to Admin Dashboard
          </Button>
        </Flex>
        
        <Text className="text-gray-600 mb-8">
          Manage all events on the platform. As an admin, you can view and delete any event.
        </Text>
        
        {isLoading ? (
          <Flex justify="center" align="center" py={10}>
            <Spinner size="xl" />
            <Text ml={4}>Loading events...</Text>
          </Flex>
        ) : events.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg">No events found</Text>
          </Box>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Date</Th>
                  <Th>Host</Th>
                  <Th>Game</Th>
                  <Th>Location</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {events.map((event) => (
                  <Tr key={event.id}>
                    <Td>{event.title}</Td>
                    <Td>{format(new Date(event.date), 'MMM d, yyyy')}</Td>
                    <Td>{event.author?.username || 'Unknown'}</Td>
                    <Td>{event.game?.title || 'Unknown'}</Td>
                    <Td>{event.location?.address || 'Unknown'}</Td>
                    <Td>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        mr={2}
                        onClick={() => router.push(`/events/${event.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteClick(event)}
                        isLoading={isDeleting && eventToDelete?.id === event.id}
                      >
                        Delete
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleDeleteCancel}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Event
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the event "{eventToDelete?.title}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3} isLoading={isDeleting}>
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
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }
  
  return {
    props: {
      session,
    },
  };
};
