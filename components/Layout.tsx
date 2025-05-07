import {
  Box,
  Container,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Link as ChakraLink,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
} from '@chakra-ui/react';
import { SearchIcon, StarIcon, CalendarIcon, TimeIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { isAdmin } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debug session data
  console.log('Session data:', session);
  console.log('Is admin:', isAdmin);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <Box>
      <Box as="nav" bg="primary.600" py={2} position="sticky" top={0} zIndex={1000}>
        <Container maxW="container.xl">
          <Flex align="center" gap={4}>
            {/* Logo/Home */}
            <ChakraLink 
              as="a"
              href="/"
              fontSize="xl" 
              fontWeight="bold" 
              color="white" 
              _hover={{ textDecoration: 'none', color: 'primary.100' }}
            >
              EventHub
            </ChakraLink>

            {/* Search Bar */}
            <Flex flex={1} mx={4}>
              <form onSubmit={handleSearch} style={{ width: '100%' }}>
                <InputGroup size="md">
                  <Input
                    bg="white"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="md"
                    height="40px"
                    _focus={{
                      borderColor: 'secondary.300',
                      boxShadow: '0 0 0 1px var(--chakra-colors-secondary-300)',
                    }}
                  />
                  <InputRightElement h="100%">
                    <Button
                      height="100%"
                      w="100%"
                      onClick={handleSearch}
                      bg="secondary.500"
                      color="white"
                      _hover={{ bg: 'secondary.600' }}
                      borderLeftRadius="0"
                      borderRightRadius="md"
                    >
                      <SearchIcon />
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </form>
            </Flex>

            {/* Navigation Items */}
            <Flex gap={4} align="center">
              {session ? (
                <>
                  <ChakraLink 
                    as="a"
                    href="/events/create"
                    color="white" 
                    _hover={{ color: 'secondary.200' }}
                  >
                    Create Event
                  </ChakraLink>
                  
                  {/* Admin Button - Only visible to admin users */}
                  {isAdmin && (
                    <Button
                      as="a"
                      href="/admin"
                      colorScheme="red"
                      size="sm"
                      leftIcon={<Icon as={StarIcon} />}
                      _hover={{ bg: 'red.600' }}
                    >
                      Admin
                    </Button>
                  )}
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      color="white"
                      _hover={{ bg: 'primary.700' }}
                      _active={{ bg: 'primary.700' }}
                    >
                      Account
                    </MenuButton>
                    <MenuList>
                      <MenuItem as="a" href="/profile">
                        Profile
                      </MenuItem>
                      <MenuItem as="a" href="/favorites">
                        My Favorites
                      </MenuItem>
                      <MenuItem onClick={() => {
                        signOut({ 
                          callbackUrl: '/',
                          redirect: true
                        });
                      }}>
                        Sign Out
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </>
              ) : (
                <>
                  <ChakraLink 
                    as="a"
                    href="/auth/signin"
                    color="white" 
                    _hover={{ color: 'secondary.200' }}
                  >
                    Sign In
                  </ChakraLink>
                  <Button
                    as="a"
                    href="/auth/signup"
                    colorScheme="secondary"
                    size="sm"
                    _hover={{ bg: 'secondary.600' }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Secondary Navigation Bar */}
      <Box bg="primary.700" py={2}>
        <Container maxW="container.xl">
          <Flex gap={6}>
            <Link href="/events" legacyBehavior>
              <ChakraLink 
                color="white" 
                _hover={{ color: 'secondary.200' }} 
                display="flex" 
                alignItems="center" 
                gap={2}
              >
                <CalendarIcon />
                All Events
              </ChakraLink>
            </Link>
            <Link href="/events/today" legacyBehavior>
              <ChakraLink 
                color="white" 
                _hover={{ color: 'secondary.200' }} 
                display="flex" 
                alignItems="center" 
                gap={2}
              >
                <TimeIcon />
                Today's Events
              </ChakraLink>
            </Link>
            <Link href="/events/popular" legacyBehavior>
              <ChakraLink 
                color="white" 
                _hover={{ color: 'secondary.200' }} 
                display="flex" 
                alignItems="center" 
                gap={2}
              >
                <StarIcon />
                Popular
              </ChakraLink>
            </Link>
            <Link href="/favorites" legacyBehavior>
              <ChakraLink 
                color="white" 
                _hover={{ color: 'secondary.200' }} 
                display="flex" 
                alignItems="center" 
                gap={2}
              >
                <StarIcon />
                Favorites
              </ChakraLink>
            </Link>
            <Link href="/events/nearby" legacyBehavior>
              <ChakraLink 
                color="white" 
                _hover={{ color: 'secondary.200' }} 
                display="flex" 
                alignItems="center" 
                gap={2}
              >
                <TimeIcon />
                Near Me
              </ChakraLink>
            </Link>
          </Flex>
        </Container>
      </Box>

      <Box as="main">
        {children}
      </Box>
    </Box>
  );
}
