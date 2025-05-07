import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Button,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import Link from 'next/link';
import { CalendarIcon, StarIcon } from '@chakra-ui/icons';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  const { isAdmin, isLoading } = useAdmin();
  
  // Debug information
  console.log('Admin page - Session:', session);
  console.log('Admin page - isAdmin:', isAdmin);
  
  // Show loading state while session is being fetched
  if (status === "loading" || isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box className="bg-white rounded-lg shadow-md p-8 mb-8" textAlign="center">
          <Heading as="h2" size="lg" mb={4}>Loading...</Heading>
          <Text>Please wait while we load your dashboard.</Text>
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
        <Heading as="h1" size="xl" className="text-primary-700 mb-6">
          Admin Dashboard
        </Heading>
        
        <Text className="text-gray-600 mb-8">
          Welcome to the admin dashboard. From here, you can manage all aspects of your event platform.
        </Text>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <Box 
            p={6} 
            borderWidth="1px" 
            borderRadius="lg" 
            className="hover:border-secondary-300 cursor-pointer"
            _hover={{
              transform: 'translateY(-4px)',
              transition: 'transform 0.2s',
              boxShadow: 'lg',
            }}
            onClick={() => router.push('/admin/games')}
          >
            <Flex direction="column" align="center" justify="center" textAlign="center">
              <Icon as={StarIcon} w={10} h={10} color="blue.500" mb={4} />
              <Heading as="h3" size="md" mb={2}>Manage Games</Heading>
              <Text>Add, edit, or remove games available for events.</Text>
            </Flex>
          </Box>
          
          <Box 
            p={6} 
            borderWidth="1px" 
            borderRadius="lg"
            className="hover:border-secondary-300 cursor-pointer"
            _hover={{
              transform: 'translateY(-4px)',
              transition: 'transform 0.2s',
              boxShadow: 'lg',
            }}
            onClick={() => router.push('/admin/locations')}
          >
            <Flex direction="column" align="center" justify="center" textAlign="center">
              <Icon as={CalendarIcon} w={10} h={10} color="green.500" mb={4} />
              <Heading as="h3" size="md" mb={2}>Manage Locations</Heading>
              <Text>Add, edit, or remove locations available for events.</Text>
            </Flex>
          </Box>
          
          <Box 
            p={6} 
            borderWidth="1px" 
            borderRadius="lg"
            className="hover:border-secondary-300 cursor-pointer"
            _hover={{
              transform: 'translateY(-4px)',
              transition: 'transform 0.2s',
              boxShadow: 'lg',
            }}
            onClick={() => router.push('/admin/set-admin')}
          >
            <Flex direction="column" align="center" justify="center" textAlign="center">
              <Icon as={StarIcon} w={10} h={10} color="purple.500" mb={4} />
              <Heading as="h3" size="md" mb={2}>Set Admin User</Heading>
              <Text>Grant admin privileges to existing users.</Text>
            </Flex>
          </Box>
          
          <Box 
            p={6} 
            borderWidth="1px" 
            borderRadius="lg" 
            className="hover:border-secondary-300 cursor-pointer"
            _hover={{
              transform: 'translateY(-4px)',
              transition: 'transform 0.2s',
              boxShadow: 'lg',
            }}
            onClick={() => router.push('/admin/events')}
          >
            <Flex direction="column" align="center" justify="center" textAlign="center">
              <Icon as={CalendarIcon} w={10} h={10} color="red.500" mb={4} />
              <Heading as="h3" size="md" mb={2}>Manage Events</Heading>
              <Text>View, edit, or delete events on the platform.</Text>
            </Flex>
          </Box>
        </SimpleGrid>
      </Box>
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
    props: {},
  };
};
