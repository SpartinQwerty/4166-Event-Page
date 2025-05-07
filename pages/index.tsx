import { Box, Container, Heading, SimpleGrid, Text, Button } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { prisma } from '../lib/prisma';
import Link from 'next/link';
import {Event} from '../actions/events'
import { useSession } from 'next-auth/react';
import { db } from '../lib/db/db';



interface HomeProps {
  events: Event[];
}

export default function Home({ events }: HomeProps) {
  const { data: session } = useSession();
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
        <Heading color="primary.700">Upcoming Events</Heading>
        {session && (
          <Link href="/events/create" passHref>
            <Button as="a" colorScheme="primary">
              Create Event
            </Button>
          </Link>
        )}
      </Box>

      {events.length === 0 ? (
        <Box textAlign="center" py={10} bg="white" shadow="sm" borderRadius="lg" p={8}>
          <Text fontSize="xl" mb={4} color="primary.700">No events found</Text>
          {session ? (
            <Text color="gray.600">Create your first event to get started!</Text>
          ) : (
            <Link href="/auth/signin" passHref>
              <Button as="a" colorScheme="primary" size="lg">
                Sign in to create events
              </Button>
            </Link>
          )}
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {events.map((event) => (
            <Box
              key={event.id}
              p={6}
              bg="white"
              shadow="sm"
              borderRadius="lg"
              _hover={{
                shadow: 'md',
                borderColor: 'secondary.200',
                transform: 'translateY(-2px)',
              }}
              transition="all 0.2s"
              border="1px solid"
              borderColor="gray.100"
            >
              <Heading size="md" mb={3} color="primary.700">{event.title}</Heading>
              <Box>
                <Text mb={4} color="gray.600">{event.description}</Text>
                <Box borderTop="1px solid" borderColor="gray.100" pt={4}>
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    <Text as="span" fontWeight="medium" color="secondary.600">Location:</Text> {event.location}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    <Text as="span" fontWeight="medium" color="secondary.600">Date:</Text> {new Date(event.date).toLocaleDateString()}
                  </Text>
                </Box>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  console.log(db);
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'asc',
      },
    });

    return {
      props: {
        events: JSON.parse(JSON.stringify(events)),
      },
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      props: {
        events: [],
      },
    };
  }
};
