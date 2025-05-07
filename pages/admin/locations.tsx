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
import { Location } from '../../actions/locations';

interface LocationsPageProps {
  initialLocations: Location[];
}

export default function LocationsPage({ initialLocations }: LocationsPageProps) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Partial<Location>>({
    address: ''
  });
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
  console.log('Locations admin page - Session:', session);
  console.log('Locations admin page - isAdmin:', isAdmin);
  console.log('Initial locations data:', initialLocations);
  
  // Load locations data when component mounts
  useEffect(() => {
    if (initialLocations && initialLocations.length > 0) {
      console.log('Setting locations from initialLocations:', initialLocations);
      setLocations(initialLocations);
    } else {
      console.log('No initial locations data, fetching from API');
      refreshLocations();
    }
  }, [initialLocations]);
  
  // Refresh locations list
  const refreshLocations = async () => {
    try {
      console.log('Fetching locations from API');
      const response = await fetch('/api/locations');
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      
      const data = await response.json();
      // Ensure locations is an array
      const locationsArray = Array.isArray(data) ? data : data.locations || [];
      console.log('Refreshed locations data:', locationsArray);
      setLocations(locationsArray);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load locations',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Open modal for creating/editing a location
  const handleOpenModal = (location?: Location) => {
    if (location) {
      setCurrentLocation(location);
      setIsEditing(true);
    } else {
      setCurrentLocation({});
      setIsEditing(false);
    }
    onOpen();
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!currentLocation.address) {
        toast({
          title: 'Error',
          description: 'Address is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }
      
      // Format data for API call
      const locationData = {
        address: currentLocation.address
      };
      
      let response;
      
      if (isEditing && currentLocation.id) {
        // Update existing location
        response = await fetch(`/api/locations/${currentLocation.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(locationData),
        });
      } else {
        // Create new location
        response = await fetch('/api/locations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(locationData),
        });
      }
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || 'Failed to save location');
      }
      
      const result = await response.json();
      console.log('API success response:', result);
      
      await refreshLocations();
      onClose();
      
      toast({
        title: 'Success',
        description: isEditing ? 'Location updated successfully' : 'Location created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle location deletion
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete location');
      }
      
      await refreshLocations();
      
      toast({
        title: 'Success',
        description: 'Location deleted successfully',
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
          <Text>Please wait while we load the locations management page.</Text>
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
            Locations Management
          </Heading>
          
          <Button 
            colorScheme="primary"
            onClick={() => handleOpenModal()}
          >
            Add New Location
          </Button>
        </Flex>
        
        {locations.length === 0 ? (
          <Text className="text-gray-600 text-center py-8">
            No locations found. Create your first location to get started.
          </Text>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Address</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {locations.map((location) => (
                <Tr key={location.id}>
                  <Td>{location.id}</Td>
                  <Td>{location.address}</Td>
                  <Td>
                    <Flex gap={2}>
                      <Button 
                        size="sm" 
                        colorScheme="blue"
                        onClick={() => handleOpenModal(location)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        colorScheme="red"
                        onClick={() => handleDelete(location.id)}
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
      
      {/* Create/Edit Location Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Location' : 'Create New Location'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <FormControl isRequired mb={4}>
              <FormLabel>Address</FormLabel>
              <Input 
                value={currentLocation.address || ''}
                onChange={(e) => setCurrentLocation({...currentLocation, address: e.target.value})}
                placeholder="Enter location address"
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
    // Fetch locations from API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    console.log('Fetching locations from:', `${baseUrl}/api/locations`);
    const response = await fetch(`${baseUrl}/api/locations`);
    const data = await response.json();
    
    // Ensure locations is an array
    const locations = Array.isArray(data) ? data : data.locations || [];
    console.log('Locations data structure:', locations);
    
    return {
      props: {
        initialLocations: locations,
      },
    };
  } catch (error) {
    console.error('Error fetching locations:', error);
    return {
      props: {
        initialLocations: [],
      },
    };
  }
};
