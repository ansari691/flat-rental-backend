import { Request } from '../models/Request';

export const requestService = {
  async createRequest(requestData: {
    propertyId: string;
    tenantId: string;
    message: string;
  }) {
    const request = await Request.create({
      ...requestData,
      status: 'pending',
    });
    return await request.populate([
      { path: 'tenantId', select: '-password' },
      { path: 'propertyId', populate: { path: 'landlordId', select: '-password' } }
    ]);
  },

  async updateRequestStatus(requestId: string, status: 'approved' | 'rejected') {
    const request = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    ).populate([
      { path: 'tenantId', select: '-password' },
      { path: 'propertyId', populate: { path: 'landlordId', select: '-password' } }
    ]);

    if (!request) {
      throw new Error('Request not found');
    }
    return request;
  },

  async getTenantRequests(tenantId: string) {
    const requests = await Request.find({ tenantId })
      .populate([
        { path: 'tenantId', select: '-password' },
        { path: 'propertyId', populate: { path: 'landlordId', select: '-password' } }
      ])
      .sort({ createdAt: -1 });
    return requests;
  },

  async getLandlordRequests(propertyIds: string[]) {
    const requests = await Request.find({
      propertyId: { $in: propertyIds },
    })
      .populate([
        { path: 'tenantId', select: '-password' },
        { path: 'propertyId', populate: { path: 'landlordId', select: '-password' } }
      ])
      .sort({ createdAt: -1 });
    return requests;
  },

  async getRequestById(requestId: string) {
    const request = await Request.findById(requestId)
      .populate([
        { path: 'tenantId', select: '-password' },
        { path: 'propertyId', populate: { path: 'landlordId', select: '-password' } }
      ]);

    if (!request) {
      throw new Error('Request not found');
    }
    return request;
  },
};