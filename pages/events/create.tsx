import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Textarea,
  VStack,
  useToast,
  Select,
  Text,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Game } from '../../actions/games';
import { Location } from '../../actions/locations';

export default function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [gameId, setGameId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  
  const router = useRouter();
  const toast = useToast();
  const { data: session, status } = useSession();

  // Fetch games and locations when component mounts
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/get-options');
        if (!response.ok) {
          throw new Error('Failed to fetch options');
        }
        
        const data = await response.json();
        setGames(data.games || []);
        setLocations(data.locations || []);
      } catch (error) {
        console.error('Error fetching options:', error);
        toast({
          title: 'Error',
          description: 'Failed to load games and locations',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchOptions();
  }, [toast]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading...</Text>
      </Container>
    );
  }
  
  if (status === 'unauthenticated') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationId) {
      toast({
        title: 'Missing location',
        description: 'Please select a location for this event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!gameId) {
      toast({
        title: 'Missing game',
        description: 'Please select a game for this event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use the simplified API endpoint to create the event
      const response = await fetch('/api/simple-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          date,
          gameId: parseInt(gameId),
          locationId: parseInt(locationId)
        }),
      });

      if (!response.ok) {
        // Try to parse as JSON, but handle case where response is not JSON
        let errorMessage = 'Failed to create event';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page)
          console.error('Error parsing response:', parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Parse the successful response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing success response:', parseError);
        throw new Error('Received invalid response from server');
      }

      toast({
        title: 'Success',
        description: 'Event created successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push('/events');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.lg" py={8} className="bg-white rounded-lg shadow-md p-6 my-8">
      <VStack spacing={8} align="stretch">
        <Heading className="text-primary-700 text-center">Create New Gaming Event</Heading>
        <Divider />
        
        <Box as="form" w="100%" onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormControl isRequired>
                  <FormLabel className="text-gray-700 font-medium">Event Title</FormLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input"
                    placeholder="Enter a catchy title for your event"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel className="text-gray-700 font-medium">Description</FormLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input"
                    placeholder="Describe your event, what players should expect, etc."
                    rows={4}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel className="text-gray-700 font-medium">Date & Time</FormLabel>
                  <Input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-input"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel className="text-gray-700 font-medium">Game</FormLabel>
                  {isFetching ? (
                    <Spinner size="sm" />
                  ) : (
                    <Select
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value)}
                      placeholder="Select a game"
                      className="form-select"
                    >
                      {games.map((game) => (
                        <option key={game.id} value={game.id}>
                          {game.title}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormControl>
              </div>
              
              <div className="space-y-4">
                <FormControl isRequired>
                  <FormLabel className="text-gray-700 font-medium">Location</FormLabel>
                  {isFetching ? (
                    <Spinner size="sm" />
                  ) : (
                    <Select
                      value={locationId}
                      onChange={(e) => setLocationId(e.target.value)}
                      placeholder="Select a location"
                      className="form-select"
                    >
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.address}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormControl>
              </div>
            </div>
            
            <Button 
              type="submit" 
              colorScheme="primary" 
              size="lg" 
              w="100%"
              isLoading={isLoading}
              className="mt-6 btn-primary"
            >
              Create Event
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
