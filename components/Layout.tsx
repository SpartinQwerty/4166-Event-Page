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

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

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
            <Link href="/events" passHref>
              <ChakraLink fontSize="xl" fontWeight="bold" color="white" _hover={{ textDecoration: 'none', color: 'primary.100' }}>
                EventHub
              </ChakraLink>
            </Link>

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
                  <Link href="/events/create" passHref>
                    <ChakraLink color="white" _hover={{ color: 'secondary.200' }}>
                      Create Event
                    </ChakraLink>
                  </Link>
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
                      <Link href="/profile" passHref style={{ textDecoration: 'none' }}>
                        <MenuItem as="a">
                          Profile
                        </MenuItem>
                      </Link>
                      <Link href="/favorites" passHref style={{ textDecoration: 'none' }}>
                        <MenuItem as="a">
                          My Favorites
                        </MenuItem>
                      </Link>
                      <MenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                        Sign Out
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" passHref>
                    <ChakraLink color="white" _hover={{ color: 'secondary.200' }}>
                      Sign In
                    </ChakraLink>
                  </Link>
                  <Link href="/auth/signup" passHref>
                    <Button
                      colorScheme="secondary"
                      size="sm"
                      _hover={{ bg: 'secondary.600' }}
                    >
                      Sign Up
                    </Button>
                  </Link>
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
            <Link href="/events" passHref>
              <ChakraLink color="white" _hover={{ color: 'secondary.200' }} display="flex" alignItems="center" gap={2}>
                <CalendarIcon />
                All Events
              </ChakraLink>
            </Link>
            <Link href="/events/today" passHref>
              <ChakraLink color="white" _hover={{ color: 'secondary.200' }} display="flex" alignItems="center" gap={2}>
                <TimeIcon />
                Today's Events
              </ChakraLink>
            </Link>
            <Link href="/events/popular" passHref>
              <ChakraLink color="white" _hover={{ color: 'secondary.200' }} display="flex" alignItems="center" gap={2}>
                <StarIcon />
                Popular
              </ChakraLink>
            </Link>
            <Link href="/favorites" passHref>
              <ChakraLink color="white" _hover={{ color: 'secondary.200' }} display="flex" alignItems="center" gap={2}>
                <StarIcon />
                Favorites
              </ChakraLink>
            </Link>
            <Link href="/events/nearby" passHref>
              <ChakraLink color="white" _hover={{ color: 'secondary.200' }} display="flex" alignItems="center" gap={2}>
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
