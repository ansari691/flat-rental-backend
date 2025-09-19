import { Property } from '../models/Property';

export const propertyService = {
  async createProperty(propertyData: {
    landlordId: string;
    title: string;
    description: string;
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
    images: string[];
  }) {
    const property = await Property.create(propertyData);
    return property;
  },

  async updateProperty(propertyId: string, propertyData: Partial<{
    title: string;
    description: string;
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
    images: string[];
    available: boolean;
  }>) {
    const property = await Property.findByIdAndUpdate(
      propertyId,
      propertyData,
      { new: true }
    );
    if (!property) {
      throw new Error('Property not found');
    }
    return property;
  },

  async deleteProperty(propertyId: string) {
    const property = await Property.findByIdAndDelete(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }
    return property;
  },

  async getPropertyById(propertyId: string) {
    const property = await Property.findById(propertyId).populate('landlordId', '-password');
    if (!property) {
      throw new Error('Property not found');
    }
    return property;
  },

  async getLandlordProperties(landlordId: string) {
    const properties = await Property.find({ landlordId }).populate('landlordId', '-password');
    return properties;
  },

  async searchProperties(filters: {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    location?: {
      latitude: number;
      longitude: number;
      radius?: number;
    };
  }) {
    const query: any = {};

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }
    if (filters.bedrooms) query.bedrooms = filters.bedrooms;
    if (filters.bathrooms) query.bathrooms = filters.bathrooms;
    if (filters.location) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.location.longitude, filters.location.latitude],
          },
          $maxDistance: filters.location.radius || 5000, // 5km default radius
        },
      };
    }

    return await Property.find(query).populate('landlordId', '-password');
  },
};