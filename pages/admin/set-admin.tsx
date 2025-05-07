import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';

export default function SetAdminPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  const router = useRouter();
  const toast = useToast();

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <Container maxW="container.xl" py={8}>
        <Box className="bg-white rounded-lg shadow-md p-8 mb-8" textAlign="center">
          <Heading as="h2" size="lg" mb={4}>Loading...</Heading>
          <Text>Please wait while we load the page.</Text>
        </Box>
      </Container>
    );
  }

  const handleSetAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/set-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setEmail('');
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to set admin privileges',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error setting admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box className="bg-white rounded-lg shadow-md p-8 mb-8">
        <Heading as="h1" size="xl" mb={6}>Set Admin Privileges</Heading>
        
        <Text mb={6}>
          Use this form to grant admin privileges to a user. The user must already exist in the system.
        </Text>
        
        <Box as="form" onSubmit={handleSetAdmin} maxW="md">
          <VStack spacing={4} align="flex-start">
            <FormControl isRequired>
              <FormLabel>User Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter user email"
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              loadingText="Setting admin..."
            >
              Set as Admin
            </Button>
          </VStack>
        </Box>
      </Box>
    </Container>
  );
}
