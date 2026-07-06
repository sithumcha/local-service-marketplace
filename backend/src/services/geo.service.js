import User from '../models/User.model.js';
import ProviderProfile from '../models/ProviderProfile.model.js';

export const findProvidersNearby = async ({ lng, lat, radiusInKm = 10, categoryId }) => {
  const maxDistanceInMeters = Number(radiusInKm) * 1000;

  // 1. Run geoNear aggregation to resolve users with the provider role sorted by proximity
  const pipeline = [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)],
        },
        distanceField: 'distance', // injects calculated distance in meters
        maxDistance: maxDistanceInMeters,
        query: { role: 'provider' },
        spherical: true,
      },
    },
  ];

  const nearbyUsers = await User.aggregate(pipeline);

  if (nearbyUsers.length === 0) {
    return [];
  }

  // 2. Fetch ProviderProfile metadata linked to these user accounts
  const userIds = nearbyUsers.map((user) => user._id);
  
  const query = { userId: { $in: userIds }, isApproved: true };
  if (categoryId) {
    query.serviceCategories = categoryId;
  }


  const profiles = await ProviderProfile.find(query)
    .populate('userId', 'name email phone location profileImage')
    .populate('serviceCategories', 'name category icon');

  // 3. Attach calculated proximity distance metric to each profile record and sort
  const results = profiles.map((profile) => {
    const matchedUser = nearbyUsers.find(
      (u) => u._id.toString() === profile.userId._id.toString()
    );
    return {
      ...profile.toObject(),
      distanceKm: matchedUser ? matchedUser.distance / 1000 : null,
    };
  });

  // Sort results by proximity
  return results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
};
