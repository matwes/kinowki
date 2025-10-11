import { UserFlyerStatus } from '@kinowki/shared';

export const getClassForStatus = (status: UserFlyerStatus | undefined, hover = false): string => {
  let result = hover ? 'hover ' : '';
  switch (status) {
    case UserFlyerStatus.HAVE: {
      result += 'status-have';
      break;
    }
    case UserFlyerStatus.TRADE: {
      result += 'status-trade';
      break;
    }
    case UserFlyerStatus.WANT: {
      result += 'status-want';
      break;
    }
    case UserFlyerStatus.UNWANTED: {
      result += 'status-unwanted';
      break;
    }
    default: {
      result += 'status-unknown';
      break;
    }
  }
  return result;
};
