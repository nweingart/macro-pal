import { useRealSubscription } from '../context/SubscriptionContext';
import { useDevMode } from '../dev/DevModeContext';

export function useSubscription() {
  const realSub = useRealSubscription();
  const dev = useDevMode();

  if (dev.enabled) {
    return {
      isSubscribed: dev.subscriptionOverride,
      isLoading: false,
      checkSubscription: async () => {},
    };
  }

  return realSub;
}
