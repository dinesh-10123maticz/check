import { CRON_REFFERAL } from '../app/user/user.controller';
import cryptoprice from './app/nft/schema/cryptoprice.schema';
import cron from 'node-cron';
import logger from './logger';

// moongose.strictPopulate
CRON_REFFERAL();
updateCryptoPrices();

cron.schedule('0 */6 * * *', () => {
    updateCryptoPrices();
});

// getonChainCurrencyforuser("0x025c1667471685c323808647299e5dbf9d6adcc9" , "665d77e8f794e1b257bf1987")

// DataOfTranscation("0x43bff1623e410fb1cb707facfea6a9b52f3e97b82b791a9c20837d0fd85133cc")

// Your code to fetch BNB and MATIC prices from the API goes here

const updateCryptoPrices = async () => {
    try {
        const response = await axios.get(
            `https://min-api.cryptocompare.com/data/price?fsym=BNB&tsyms=USD`,
        );

        const bnbPriceUSD = response.data.USD;
        const responsematic = await axios.get(
            `https://min-api.cryptocompare.com/data/price?fsym=MATIC&tsyms=USD`,
        );
        const maticPriceUSD = responsematic.data.USD;

        // Update the schema with the fetched prices
        // await cryptoprice.create({
        //     bnbPriceUSD,
        //     maticPriceUSD,
        //     source: 'cryptocompare' // Replace with your actual data source
        // });

        await cryptoprice.findByIdAndUpdate('663358c2b1c587063b18bcd4', {
            bnbPriceUSD,
            maticPriceUSD,
        });

        logger.info('Crypto prices updated successfully:', { bnbPriceUSD, maticPriceUSD });
    } catch (error) {
        logger.error('Error updating crypto prices:', error);
    }
};
