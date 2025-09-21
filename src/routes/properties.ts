import { Router } from 'express';
import { propertyService } from '../services/propertyService';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { authService } from '../services/authService';

const router = Router();

router.use(authMiddleware);

router.post('/', async (req: AuthRequest, res) => {
  try {
    const propertyData = {
      ...req.body,
      landlordId: req.user!.userId,
    };
    const property = await propertyService.createProperty(propertyData);
    res.status(201).json(property);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const { minPrice, maxPrice, bedrooms, bathrooms, lat, lng, radius } = req.query;
    
    const filters: any = {};
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    if (bedrooms) filters.bedrooms = Number(bedrooms);
    if (bathrooms) filters.bathrooms = Number(bathrooms);
    if (lat && lng) {
      filters.location = {
        latitude: Number(lat),
        longitude: Number(lng),
        radius: radius ? Number(radius) : undefined,
      };
    }

    const user: any = await authService.getUserById(req.user!.userId);

    if(user.userType === 'tenant'){
      filters.available = true;
    }

    const properties = await propertyService.searchProperties(filters);
    res.json(properties);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/landlord', async (req: AuthRequest, res) => {
  try {
    const properties = await propertyService.getLandlordProperties(req.user!.userId);
    res.json(properties);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/shortlisted', async (req: AuthRequest, res) => {
  try {
    const properties = await propertyService.getShortlistedProperties(req.user!.userId);
    res.json(properties);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    res.json(property);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    if (property.landlordId._id.toString() !== req.user!.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProperty = await propertyService.updateProperty(req.params.id, req.body);
    res.json(updatedProperty);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    if (property.landlordId._id.toString() !== req.user!.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await propertyService.deleteProperty(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Shortlist routes
router.post('/:id/shortlist', async (req: AuthRequest, res) => {
  try {
    await propertyService.addToShortlist(req.params.id, req.user!.userId);
    res.status(201).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id/shortlist', async (req: AuthRequest, res) => {
  try {
    await propertyService.removeFromShortlist(req.params.id, req.user!.userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id/shortlist', async (req: AuthRequest, res) => {
  try {
    const isShortlisted = await propertyService.isPropertyShortlisted(req.params.id, req.user!.userId);
    if (isShortlisted) {
      res.status(200).send();
    } else {
      res.status(404).send();
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;