import { NextApiRequest, NextApiResponse } from "next";
import { Location ,createLocation,deleteLocation,getLocation, updateLocation } from "../../actions/locations";

export default async function handler(
        req: NextApiRequest, 
        res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const {id} = req.body;
            const locale = await getLocation(id);
            res.status(200).json(locale);
        } catch (e) {
            res.status(500).json({message: 'Failed to fetch games'});
        }
    } else if (req.method === 'POST') {
        try {
            const {address, latitude, longitude} = req.body;
            if (!address || !latitude || !longitude) {
                res.status(400).json({message: 'missing parameters for location'});
            }
            const location: Omit<Location, 'id'> = {
                address: address,
                latitude: latitude,
                longitude: longitude,
            }
            const locale = await createLocation(location);
            res.status(200).json(locale);
        } catch (e) {
            res.status(500).json({message: `Failed to create${e}`})
        }
    } else if (req.method === 'DELETE') {
        try {
           const {id} = req.body;
           if(!id) {
                res.status(400).json({message: 'missing id to delete'});
           }
           const locale = await deleteLocation(id);
           res.status(200).json(locale);
        } catch (e) {
            res.status(500).json({message: 'Failed to delete account'});
        }
    } else if (req.method === 'PUT') {
        try {
            const {id, address, latitude, longitude} = req.body;
            if (!id) {
                res.status(400).json({message: 'missing id to update'})
            }
            const location: Omit<Location, 'id'> = {
                address: address,
                latitude: latitude,
                longitude: longitude
            }
            const locale = await updateLocation(id, location);
            res.status(200).json({locale});

        } catch (e) {
            res.status(500).json({message: 'failed to update'})
        }
    } else {
        res.status(405).json({message: 'da fuc dewd'})
    }
}