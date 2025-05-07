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
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import MapComponent from '../../components/GoogleMap';
import { Game } from '../../actions/games';
import { Location } from '../../actions/locations';

export default function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [game, setGame] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const toast = useToast();
  const { data: session } = useSession();



  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const handleLocationSelect = (selectedLocation: { lat: number; lng: number; address: string }) => {
    setLocation(selectedLocation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast({
        title: 'Missing location',
        description: 'Please select a location on the map',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!game.trim()) {
      toast({
        title: 'Missing game',
        description: 'Please enter a game for this event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use the simplified API endpoint to create both location and event in one call
      const response = await fetch('/api/simple-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          date,
          game,
          location
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();

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
                  <Input
                    value={game}
                    onChange={(e) => setGame(e.target.value)}
                    className="form-input"
                    placeholder="Enter the game name (e.g., Dungeons & Dragons, Magic: The Gathering)"
                  />
                </FormControl>
              </div>
              
              <div className="space-y-4">
                <FormControl isRequired>
                  <FormLabel className="text-gray-700 font-medium">Location</FormLabel>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Click on the map to select a location
                  </Text>
                  <MapComponent onLocationSelect={handleLocationSelect} />
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
