import { Router } from 'express';
import { syncPlanets, syncAsteroids, syncShips, syncCrews, syncPlanetswithMetadata } from './sync.controller.js';
import { verifyTokenforgame } from '../../shared/credentialsetup';

const sync = Router();

// sync.post('/sync/planets', syncPlanets);
// sync.post('/sync/asteroids', syncAsteroids);
// sync.post('/sync/ships', syncShips);
// sync.post('/sync/crews', syncCrews);


sync.post('/sync/planets', verifyTokenforgame, syncPlanetswithMetadata);
sync.post('/sync/asteroids', verifyTokenforgame, syncAsteroids);
sync.post('/sync/ships', verifyTokenforgame, syncShips);
sync.post('/sync/crews', verifyTokenforgame, syncCrews);

export default sync;
