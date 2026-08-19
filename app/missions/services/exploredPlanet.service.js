import explorePlanet from '../schema/exploredPlanets.schema';

export const explorePlanetFindOne = (query) => {
    return explorePlanet.findOne(query);
};

export const explorePlanetFind = (query) => {
    return explorePlanet.find(query);
};

// used to entry for the nearby planet is explored by the user
export const explorePlanetCreate = (data) => {
    return explorePlanet.create(data);
};
