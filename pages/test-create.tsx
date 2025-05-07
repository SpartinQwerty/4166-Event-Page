import { useState, useEffect } from 'react';
import { Box, Button, Container, Heading, Text, VStack, useToast } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';

export default function TestCreate() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    // Check session on client side only
    if (status === 'unauthenticated') {
      window.location.href = '/auth/signin';
    }
  }, [status]);

  const handleTestLocation = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Call the test location API
      const response = await fetch('/api/test-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Empty body - the test endpoint uses hardcoded values
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }
      
      setResult(data);
      toast({
        title: 'Success',
        description: 'Test location created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast({
        title: 'Error',
        description: err.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">Test Event Creation</Heading>
        <Text>This page helps diagnose issues with event creation.</Text>
        
        <Box>
          <Button 
            colorScheme="blue" 
            onClick={handleTestLocation} 
            isLoading={isLoading}
            loadingText="Creating..."
          >
            Test Location Creation
          </Button>
        </Box>
        
        {error && (
          <Box p={4} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
            <Text fontWeight="bold" color="red.500">Error:</Text>
            <Text>{error}</Text>
          </Box>
        )}
        
        {result && (
          <Box p={4} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
            <Text fontWeight="bold" color="green.500">Success:</Text>
            <Text whiteSpace="pre-wrap">{JSON.stringify(result, null, 2)}</Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
