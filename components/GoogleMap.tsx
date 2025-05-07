import React, { useState } from 'react';
import { Box, Text, Button, Center, Flex, Input, FormControl, FormLabel, Stack } from '@chakra-ui/react';

type Location = {
  lat: number;
  lng: number;
  address: string;
};

type MapProps = {
  onLocationSelect?: (location: Location) => void;
  initialLocation?: Location;
  readOnly?: boolean;
};

const MapComponent: React.FC<MapProps> = ({
  onLocationSelect,
  initialLocation,
  readOnly = false
}) => {
  // Default center (Charlotte, NC)
  const defaultCenter = { lat: 35.2271, lng: -80.8431 };
  
  // State for manual coordinates input
  const [manualLat, setManualLat] = useState<string>(initialLocation?.lat.toString() || defaultCenter.lat.toString());
  const [manualLng, setManualLng] = useState<string>(initialLocation?.lng.toString() || defaultCenter.lng.toString());
  const [marker, setMarker] = useState<Location | null>(initialLocation || null);

  // Handle manual coordinate input
  const handleManualCoordinates = () => {
    try {
      const lat = parseFloat(manualLat);
      const lng = parseFloat(manualLng);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates');
      }
      
      // Validate latitude range (-90 to 90)
      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      
      // Validate longitude range (-180 to 180)
      if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      
      const newLocation = {
        lat,
        lng,
        address: `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };
      
      setMarker(newLocation);
      
      if (onLocationSelect) {
        onLocationSelect(newLocation);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Invalid coordinates');
    }
  };

  // Handle random location for testing
  const handleRandomLocation = () => {
    // Generate random coordinates near Charlotte, NC
    const randomLat = defaultCenter.lat + (Math.random() - 0.5) * 0.1;
    const randomLng = defaultCenter.lng + (Math.random() - 0.5) * 0.1;
    
    setManualLat(randomLat.toFixed(6));
    setManualLng(randomLng.toFixed(6));
    
    const newLocation = {
      lat: randomLat,
      lng: randomLng,
      address: `Location at ${randomLat.toFixed(6)}, ${randomLng.toFixed(6)}`
    };
    
    setMarker(newLocation);
    
    if (onLocationSelect) {
      onLocationSelect(newLocation);
    }
  };

  return (
    <Box className="space-y-4">
      <Box 
        p={4} 
        bg="blue.50" 
        borderRadius="md" 
        border="1px solid" 
        borderColor="blue.200"
      >
        <Text mb={4} fontWeight="medium">
          Google Maps integration is currently experiencing issues with the API key. 
          Please use the coordinate input below to select a location.
        </Text>
        
        <Stack spacing={4}>
          <Flex gap={4}>
            <FormControl>
              <FormLabel>Latitude</FormLabel>
              <Input 
                type="number" 
                step="0.000001"
                value={manualLat} 
                onChange={(e) => setManualLat(e.target.value)}
                isReadOnly={readOnly}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Longitude</FormLabel>
              <Input 
                type="number" 
                step="0.000001"
                value={manualLng} 
                onChange={(e) => setManualLng(e.target.value)}
                isReadOnly={readOnly}
              />
            </FormControl>
          </Flex>
          
          {!readOnly && (
            <Flex gap={4}>
              <Button colorScheme="blue" onClick={handleManualCoordinates}>
                Set Location
              </Button>
              <Button variant="outline" onClick={handleRandomLocation}>
                Random Location (For Testing)
              </Button>
            </Flex>
          )}
        </Stack>
      </Box>
      
      {marker && (
        <Box mt={2} fontSize="sm" color="gray.600" p={3} bg="gray.50" borderRadius="md">
          <Text fontWeight="bold">Selected Location</Text>
          <Text><strong>Coordinates:</strong> {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}</Text>
        </Box>
      )}
    </Box>
  );
};

export default MapComponent;
