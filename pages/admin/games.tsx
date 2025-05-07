import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useAdmin } from '../../hooks/useAdmin';
import { useState, useEffect } from 'react';
import { Game } from '../../actions/games';

interface GamesPageProps {
  initialGames: Game[];
}

export default function GamesPage({ initialGames }: GamesPageProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGame, setCurrentGame] = useState<Partial<Game>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  
  // Debug information
  console.log('Games admin page - Session:', session);
  console.log('Games admin page - isAdmin:', isAdmin);
  console.log('Initial games data:', initialGames);
  
  // Load games data when component mounts
  useEffect(() => {
    if (initialGames && initialGames.length > 0) {
      console.log('Setting games from initialGames:', initialGames);
      setGames(initialGames);
    } else {
      console.log('No initial games data, fetching from API');
      refreshGames();
    }
  }, []);
  
  // Refresh games list
  const refreshGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      
      const data = await response.json();
      // Ensure games is an array
      const gamesArray = Array.isArray(data) ? data : data.games || [];
      console.log('Refreshed games data:', gamesArray);
      setGames(gamesArray);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: 'Error',
        description: 'Failed to load games',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Open modal for creating/editing a game
  const handleOpenModal = (game?: Game) => {
    if (game) {
      setCurrentGame(game);
      setIsEditing(true);
    } else {
      setCurrentGame({});
      setIsEditing(false);
    }
    onOpen();
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!currentGame.title) {
      toast({
        title: 'Error',
        description: 'Game title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const url = isEditing ? `/api/games/${currentGame.id}` : '/api/games';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentGame),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save game');
      }
      
      await refreshGames();
      onClose();
      
      toast({
        title: 'Success',
        description: isEditing ? 'Game updated successfully' : 'Game created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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
  
  // Handle game deletion
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/games/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete game');
      }
      
      await refreshGames();
      
      toast({
        title: 'Success',
        description: 'Game deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Show loading state while session is being fetched
  if (status === "loading" || isAdminLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box className="bg-white rounded-lg shadow-md p-8 mb-8" textAlign="center">
          <Heading as="h2" size="lg" mb={4}>Loading...</Heading>
          <Text>Please wait while we load the games management page.</Text>
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
  
  return (
    <Container maxW="container.xl" py={8}>
      <Box className="bg-white rounded-lg shadow-md p-8 mb-8">
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading as="h1" size="xl" className="text-primary-700">
            Games Management
          </Heading>
          
          <Button 
            colorScheme="primary"
            onClick={() => handleOpenModal()}
          >
            Add New Game
          </Button>
        </Flex>
        
        {games.length === 0 ? (
          <Text className="text-gray-600 text-center py-8">
            No games found. Create your first game to get started.
          </Text>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Title</Th>
                <Th>Description</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {games.map((game) => (
                <Tr key={game.id}>
                  <Td>{game.id}</Td>
                  <Td>{game.title}</Td>
                  <Td>{game.description}</Td>
                  <Td>
                    <Flex gap={2}>
                      <Button 
                        size="sm" 
                        colorScheme="blue"
                        onClick={() => handleOpenModal(game)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        colorScheme="red"
                        onClick={() => handleDelete(game.id)}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
      
      {/* Create/Edit Game Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Game' : 'Create New Game'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <FormControl isRequired mb={4}>
              <FormLabel>Title</FormLabel>
              <Input 
                value={currentGame.title || ''}
                onChange={(e) => setCurrentGame({...currentGame, title: e.target.value})}
                placeholder="Enter game title"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea 
                value={currentGame.description || ''}
                onChange={(e) => setCurrentGame({...currentGame, description: e.target.value})}
                placeholder="Enter game description"
                rows={4}
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="primary" 
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
    // Fetch games from API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    console.log('Fetching games from:', `${baseUrl}/api/games`);
    const response = await fetch(`${baseUrl}/api/games`);
    const data = await response.json();
    
    // Ensure games is an array
    const games = Array.isArray(data) ? data : data.games || [];
    
    return {
      props: {
        initialGames: games,
      },
    };
  } catch (error) {
    console.error('Error fetching games:', error);
    return {
      props: {
        initialGames: [],
      },
    };
  }
};
