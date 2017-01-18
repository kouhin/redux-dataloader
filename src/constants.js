import { fixedWait } from './waitStrategies';

export const DEFAULT_OPTIONS = {
  ttl: 10000, // Default TTL: 10s
  retryTimes: 1,
  retryWait: fixedWait(0),
};

export const REDUX_DATALOADER_ACTION_ID = () => {};
