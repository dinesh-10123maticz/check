import { Router } from 'express';
import { convertAmount } from './amountConvert.js';

const amountConvertionRoute = Router();

amountConvertionRoute.post('/convert', convertAmount);

export default amountConvertionRoute;
