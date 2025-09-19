import { Router } from 'express';
import { requestService } from '../services/requestService';
import { propertyService } from '../services/propertyService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', async (req: AuthRequest, res) => {
  try {
    const requestData = {
      ...req.body,
      tenantId: req.user!.userId,
    };
    const request = await requestService.createRequest(requestData);
    res.status(201).json(request);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/tenant', async (req: AuthRequest, res) => {
  try {
    const requests = await requestService.getTenantRequests(req.user!.userId);
    res.json(requests);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/landlord', async (req: AuthRequest, res) => {
  try {
    const properties = await propertyService.getLandlordProperties(req.user!.userId);
    const propertyIds: any = properties.map(p => p._id);
    const requests = await requestService.getLandlordRequests(propertyIds);
    res.json(requests);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/status', async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await requestService.getRequestById(req.params.id);
    const property = await propertyService.getPropertyById(request.propertyId.toString());
    
    if (property.landlordId.toString() !== req.user!.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedRequest = await requestService.updateRequestStatus(req.params.id, status);
    res.json(updatedRequest);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const request = await requestService.getRequestById(req.params.id);
    res.json(request);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

export default router;