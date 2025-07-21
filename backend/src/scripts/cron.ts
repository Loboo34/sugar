import cron from 'node-cron';
import { logger } from '../config/logger';
import { generateLowItemStockNotification, generateLowProductStockNotification } from '../controllers/Notification.controller';

export const startNotifications = () => {
    cron.schedule('*/10 * * * *', async () => {
        try {
            logger.info('Running daily notification tasks');
            await generateLowProductStockNotification();
            await generateLowItemStockNotification();
            logger.info('Daily notification tasks completed successfully');
        } catch (error: any) {
            logger.error(`Error in daily notification tasks: ${error.message}`);
        }
    }, {
        timezone: "Africa/Nairobi"
    });
}