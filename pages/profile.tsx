import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Avatar,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Divider,
  SimpleGrid,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useSession, getSession } from 'next-auth/react';
import { CalendarIcon, TimeIcon, InfoIcon, EditIcon } from '@chakra-ui/icons';
import { EventDisplay } from '../actions/events';
import { getAllEvents } from '../actions/events';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

interface ProfilePageProps {
  hostedEvents: EventDisplay[];
  joinedEvents: EventDisplay[];
}

export default function ProfilePage({ hostedEvents, joinedEvents }: ProfilePageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
    } else if (session.user) {
      // Initialize form with user data
      const nameParts = session.user.name?.split(' ') || ['', ''];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts[1] || '');
      setEmail(session.user.email || '');
    }
  }, [session, router]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPasswordError('');
    
    // Validate passwords if attempting to change
    if (password) {
      if (password.length < 8) {
        setPasswordError('Password must be at least 8 characters');
        setIsLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        setIsLoading(false);
        return;
      }
    }
    
    try {
      // Make API call to update profile
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password: password || undefined, // Only send if changed
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      // Clear password fields after successful update
      setPassword('');
      setConfirmPassword('');
      setIsEditing(false);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!session) {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Box className="bg-white rounded-lg shadow-md p-8 mb-8">
        <Flex 
          justifyContent="space-between" 
          alignItems="center"
          flexWrap="wrap"
          gap={4}
          mb={6}
        >
          <Heading 
            as="h1" 
            size="xl" 
            className="text-primary-700"
          >
            My Profile
          </Heading>
          
          {!isEditing && (
            <Button 
              leftIcon={<EditIcon />}
              colorScheme="secondary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Flex>
        
        {isEditing ? (
          <Box as="form" onSubmit={handleProfileUpdate}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired>
                <FormLabel className="text-gray-700">First Name</FormLabel>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="form-input"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel className="text-gray-700">Last Name</FormLabel>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="form-input"
                />
              </FormControl>
              
              <FormControl isRequired gridColumn={{ md: 'span 2' }}>
                <FormLabel className="text-gray-700">Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </FormControl>
              
              <Divider my={6} gridColumn={{ md: 'span 2' }} />
              
              <Heading as="h3" size="md" gridColumn={{ md: 'span 2' }} mb={4}>
                Change Password (Optional)
              </Heading>
              
              <FormControl gridColumn={{ md: 'span 2' }}>
                <FormLabel className="text-gray-700">New Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Leave blank to keep current password"
                />
              </FormControl>
              
              <FormControl gridColumn={{ md: 'span 2' }} isInvalid={!!passwordError}>
                <FormLabel className="text-gray-700">Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Confirm new password"
                />
                {passwordError && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {passwordError}
                  </Text>
                )}
              </FormControl>
            </SimpleGrid>
            
            <Flex mt={6} gap={4} justifyContent="flex-end">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                colorScheme="primary"
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </Flex>
          </Box>
        ) : (
          <Flex alignItems="center" gap={6} flexWrap={{ base: 'wrap', md: 'nowrap' }}>
            <Avatar 
              size="xl" 
              name={`${firstName} ${lastName}`} 
              src="" 
              bg="primary.500"
            />
            
            <Box>
              <Heading size="lg" mb={2}>{firstName} {lastName}</Heading>
              <Text className="text-gray-600">{email}</Text>
              <Text className="text-gray-500 mt-2">Member since {new Date().getFullYear()}</Text>
            </Box>
          </Flex>
        )}
      </Box>
      
      <Tabs colorScheme="primary" className="bg-white rounded-lg shadow-md p-6">
        <TabList>
          <Tab>Hosted Events ({hostedEvents.length})</Tab>
          <Tab>Joined Events ({joinedEvents.length})</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            {hostedEvents.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text fontSize="lg" mb={4} className="text-gray-600">You haven't hosted any events yet</Text>
                <Link href="/events/create" passHref>
                  <Button as="a" colorScheme="primary" size="lg">
                    Create Your First Event
                  </Button>
                </Link>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
                {hostedEvents.map((event) => (
                  <Link href={`/events/${event.id}`} key={event.id}>
                    <Box
                      className="card hover:border-secondary-300 cursor-pointer"
                      _hover={{
                        transform: 'translateY(-4px)',
                        boxShadow: 'md',
                      }}
                      transition="all 0.3s ease"
                    >
                      <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
                        <Heading size="md" className="text-primary-700 line-clamp-2">
                          {event.title}
                        </Heading>
                        <Badge colorScheme="purple" p={1} borderRadius="md">
                          {event.game}
                        </Badge>
                      </Flex>
                      
                      <Text 
                        className="text-gray-600 mb-4 line-clamp-3" 
                        title={event.description}
                      >
                        {event.description}
                      </Text>
                      
                      <Divider my={4} />
                      
                      <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={2}>
                        <Flex alignItems="center">
                          <CalendarIcon className="text-secondary-500 mr-2" />
                          <Text fontSize="sm" className="text-gray-700">
                            {formatDate(event.date)}
                          </Text>
                        </Flex>
                        
                        <Flex alignItems="center">
                          <TimeIcon className="text-secondary-500 mr-2" />
                          <Text fontSize="sm" className="text-gray-700">
                            {formatTime(event.date)}
                          </Text>
                        </Flex>
                      </Flex>
                      
                      <Flex alignItems="center" mt={3}>
                        <InfoIcon className="text-primary-500 mr-2" />
                        <Text fontSize="sm" className="text-gray-700 truncate" title={event.address || ''}>
                          {event.address || 'Location not specified'}
                        </Text>
                      </Flex>
                    </Box>
                  </Link>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
          
          <TabPanel>
            {joinedEvents.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text fontSize="lg" mb={4} className="text-gray-600">You haven't joined any events yet</Text>
                <Link href="/events" passHref>
                  <Button as="a" colorScheme="primary" size="lg">
                    Browse Events
                  </Button>
                </Link>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
                {joinedEvents.map((event) => (
                  <Link href={`/events/${event.id}`} key={event.id}>
                    <Box
                      className="card hover:border-secondary-300 cursor-pointer"
                      _hover={{
                        transform: 'translateY(-4px)',
                        boxShadow: 'md',
                      }}
                      transition="all 0.3s ease"
                    >
                      <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
                        <Heading size="md" className="text-primary-700 line-clamp-2">
                          {event.title}
                        </Heading>
                        <Badge colorScheme="purple" p={1} borderRadius="md">
                          {event.game}
                        </Badge>
                      </Flex>
                      
                      <Text 
                        className="text-gray-600 mb-4 line-clamp-3" 
                        title={event.description}
                      >
                        {event.description}
                      </Text>
                      
                      <Divider my={4} />
                      
                      <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={2}>
                        <Flex alignItems="center">
                          <CalendarIcon className="text-secondary-500 mr-2" />
                          <Text fontSize="sm" className="text-gray-700">
                            {formatDate(event.date)}
                          </Text>
                        </Flex>
                        
                        <Flex alignItems="center">
                          <TimeIcon className="text-secondary-500 mr-2" />
                          <Text fontSize="sm" className="text-gray-700">
                            {formatTime(event.date)}
                          </Text>
                        </Flex>
                      </Flex>
                      
                      <Flex alignItems="center" mt={3}>
                        <InfoIcon className="text-primary-500 mr-2" />
                        <Text fontSize="sm" className="text-gray-700 truncate" title={event.address || ''}>
                          {event.address || 'Location not specified'}
                        </Text>
                      </Flex>
                      
                      <Text fontSize="sm" className="text-gray-500 mt-3">
                        Hosted by: {event.author}
                      </Text>
                    </Box>
                  </Link>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
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
    const allEvents = await getAllEvents();
    
    // For demonstration purposes, we'll just split the events
    // In a real app, you would query the database for events hosted by the user
    // and events the user has joined
    const hostedEvents = allEvents.slice(0, 2);
    const joinedEvents = allEvents.slice(2, 4);

    return {
      props: {
        hostedEvents: JSON.parse(JSON.stringify(hostedEvents)),
        joinedEvents: JSON.parse(JSON.stringify(joinedEvents)),
      },
    };
  } catch (error) {
    console.error('Error fetching user events:', error);
    return {
      props: {
        hostedEvents: [],
        joinedEvents: [],
      },
    };
  }
};
