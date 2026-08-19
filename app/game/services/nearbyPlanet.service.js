import nearbyPlanetSchema from '../schema/nearByPlanet.schema';

const user_project = {
    WalletAddress: 1,
    DisplayName: 1,
    Profile: 1,
    profile_url: 1,
};
export const nearByPlanetFind = (query) => {
    return nearbyPlanetSchema.find(query).populate('acquiredBy', user_project).lean();
};

export const nearByPlanetFindOne = (query) => {
    return nearbyPlanetSchema.findOne(query).lean();
};

export const nearByPlanetwithSkipAndLimit = (query, skip = 0, limit = 12) => {
    return nearbyPlanetSchema
        .find(query)
        .populate('acquiredBy', user_project)
        .skip(skip)
        .limit(limit)
        .lean();
};
