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
import { useSession, getSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { CalendarIcon, TimeIcon, InfoIcon, EditIcon } from '@chakra-ui/icons';
import EventCard from '../components/EventCard';
import { EventDisplay } from '../actions/events';
import { getAllEvents } from '../actions/events';
import { useState, useEffect } from 'react';
import { db } from '../lib/db/db';

interface ProfilePageProps {
  hostedEvents: EventDisplay[];
  joinedEvents: EventDisplay[];
}

export default function ProfilePage({ hostedEvents, joinedEvents }: ProfilePageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user) {
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

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        // Make API call to delete account
        const response = await fetch('/api/user/delete-account', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to delete account');
        }
        
        // Sign out the user and redirect to home page
        signOut({ callbackUrl: '/' });
        
        toast({
          title: 'Account deleted',
          description: 'Your account has been successfully deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error: any) {
        toast({
          title: 'Deletion failed',
          description: error.message || 'Failed to delete account',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsDeleting(false);
      }
    }
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
            
            <Flex mt={6} gap={4} justifyContent="space-between">
              <Button 
                variant="outline" 
                colorScheme="red"
                onClick={handleDeleteAccount}
                isLoading={isDeleting}
                leftIcon={<InfoIcon />}
              >
                Delete Account
              </Button>
              
              <Flex gap={4}>
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
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    date={event.date}
                    game={event.game}
                    address={event.address}
                    author={event.author}
                  />
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
  
  console.log('Session in getServerSideProps:', JSON.stringify(session, null, 2));
  
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
    
    // Get the user's ID from the session
    const userEmail = session.user?.email;
    
    console.log('User email from session:', userEmail);
    
    // Instead of using the API, query the database directly to get the account ID
    // This ensures we're using the same ID type as stored in the events table
    const accounts = await db
      .selectFrom('accounts')
      .select(['id', 'username'])
      .where('username', '=', userEmail || '')
      .execute();
    
    console.log('Accounts found:', accounts);
    
    if (!accounts || accounts.length === 0) {
      console.error('User account not found');
      throw new Error('User account not found');
    }
    
    const userId = accounts[0].id;
    console.log('User ID from database:', userId);
    
    // Log all events and their hostIds
    console.log('All events:', allEvents.map(event => ({ id: event.id, title: event.title, hostId: event.hostId })));
    
    // Get all accounts to find the one matching the user's email
    const allAccounts = await db
      .selectFrom('accounts')
      .selectAll()
      .execute();
      
    console.log('All accounts:', allAccounts);
    
    // Find the account with the matching email
    const userAccount = allAccounts.find(account => account.username === userEmail);
    
    console.log('User account found:', userAccount);
    
    let hostedEvents: EventDisplay[] = [];
    let joinedEvents: EventDisplay[] = [];
    
    if (userAccount) {
      // Filter events hosted by the user
      hostedEvents = allEvents.filter(event => {
        console.log(`Comparing event hostId ${event.hostId} with account ID ${userAccount.id}`);
        // Convert both to numbers for comparison
        return Number(event.hostId) === Number(userAccount.id);
      });
      
      // For joined events, we would normally query a participants table
      // Since we don't have that yet, we'll show all events the user didn't host
      joinedEvents = allEvents.filter(event => Number(event.hostId) !== Number(userAccount.id));
    } else {
      // If no account is found, show all events as joined events
      console.log('No user account found, showing all events as joined events');
      joinedEvents = allEvents;
    }
    
    console.log('Hosted events:', hostedEvents.length);
    console.log('Joined events:', joinedEvents.length);

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
