const axios = require('axios');

module.exports.getAddressCoordinate = async (address) => {
    const apiKey = process.env.GOOGLE_MAPS_API;
    const [origin, destination] = address.split(' to ');

    console.log(origin, destination);

    const url = `https://maps.gomaps.pro/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log(response.data);

        if (response.data.status === 'OK' && response.data.routes.length > 0) {
            // Extracting coordinates directly from the directions response
            const originCoords = response.data.routes[0].legs[0].start_location;
            const destinationCoords = response.data.routes[0].legs[0].end_location;

            console.log('Origin Coordinates:', originCoords);
            console.log('Destination Coordinates:', destinationCoords);

            return {
                origin: {
                    lat: originCoords.lat,
                    lng: originCoords.lng
                },
                destination: {
                    lat: destinationCoords.lat,
                    lng: destinationCoords.lng
                }
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};


module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;

    const url = `https://maps.gomaps.pro/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {


        
        const response = await axios.get(url);
        //await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("STATUS:", response.data?.status);
        
        //console.log(response.data.routes.length);
        if (response.data.status === 'OK' && response.data.routes?.length > 0) {
            const leg = response.data.routes[0].legs[0];
            return {
                
                distance: {
                    text: leg.distance.text,   // Example: "1421 km"
                    value: leg.distance.value  // Example: 1420085 (in meters)
                },
                duration: {
                    text: leg.duration.text,   // Example: "15 hours 30 mins"
                    value: leg.duration.value  // Example: 55800 (in seconds)
                },
                status: "OK"
            };
        } else {
           
            throw new Error('Unable to fetch distance and time');
        }

    } catch (err) {
        console.error(err, "ERROR");
        throw err;
    }
}


module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('Query is required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            return {
                status: "OK",
                predictions: response.data.predictions.map(prediction => ({
                    description: prediction.description,   // Full location name
                    place_id: prediction.place_id,       // Unique place ID
                    reference: prediction.reference,     // Reference token
                    matched_substrings: prediction.matched_substrings, // Highlighted matches
                    structured_formatting: prediction.structured_formatting, // Formatted result
                    terms: prediction.terms,             // Components of address
                    offset: prediction.matched_substrings?.[0]?.offset || 0, // Position of match
                    value: input                          // Input value
                }))
            };
        } else {
            throw new Error('Unable to fetch autocomplete suggestions');
        }

    } catch (err) {
        console.error(err);
        throw err;
    }
};
