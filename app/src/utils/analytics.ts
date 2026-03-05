/**
 * Lightweight analytics abstraction.
 *
 * All calls are currently no-ops. To enable analytics, add a provider here.
 * To switch providers later, only this file needs to change.
 */

type Properties = Record<string, string | number | boolean | undefined>;

// ── Public API ─────────────────────────────────────────────────────

export const analytics = {
  /** Identify the authenticated user */
  identify(userId: string, traits?: Properties) {
    postHogIdentify?.(userId, traits);
  },

  /** Track an event */
  track(event: string, properties?: Properties) {
    postHogCapture?.(event, properties);
  },

  // ── Convenience helpers for key events ──

  signUp() {
    this.track('sign_up');
  },

  signIn() {
    this.track('sign_in');
  },

  onboardingComplete() {
    this.track('onboarding_complete');
  },

  subscriptionStarted(plan?: string) {
    this.track('subscription_started', { plan });
  },

  foodLogged(method: 'text' | 'voice' | 'library' | 'quick_add') {
    this.track('food_logged', { method });
  },

  screenView(name: string) {
    this.track('screen_view', { screen: name });
  },
};
