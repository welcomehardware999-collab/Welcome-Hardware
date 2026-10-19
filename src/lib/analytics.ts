import { DoorAnalyticsEvent } from '../types';

const STORAGE_KEY = 'wh_door_analytics_events';

export function trackDoorAnalytics(
  event: DoorAnalyticsEvent['event'],
  details: Partial<Omit<DoorAnalyticsEvent, 'id' | 'event' | 'timestamp'>> = {}
): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const events: DoorAnalyticsEvent[] = raw ? JSON.parse(raw) : [];

    const newEvent: DoorAnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      event,
      timestamp: new Date().toISOString(),
      ...details
    };

    // Keep the latest 200 events
    const updated = [newEvent, ...events].slice(0, 200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Optional console log for development tracking
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DoorAnalytics] ${event}`, newEvent);
    }
  } catch (err) {
    console.warn('Analytics storage error:', err);
  }
}

export function getDoorAnalyticsEvents(): DoorAnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearDoorAnalyticsEvents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Analytics clear error:', err);
  }
}

export function getDoorAnalyticsSummary() {
  const events = getDoorAnalyticsEvents();
  const starts = events.filter(e => e.event === 'build_your_door_started').length;
  const completions = events.filter(e => e.event === 'build_your_door_completed').length;
  const productsAdded = events.filter(e => e.event === 'recommended_product_added' || e.event === 'all_recommended_products_added').length;
  const quotesRequested = events.filter(e => e.event === 'door_quote_requested').length;
  const clicks = events.filter(e => e.event === 'product_recommendation_clicked').length;

  const conversionRate = starts > 0 ? Math.round((completions / starts) * 100) : 0;

  return {
    totalStarts: starts,
    totalCompletions: completions,
    conversionRate,
    productsAdded,
    quotesRequested,
    clicks,
    recentEvents: events.slice(0, 20)
  };
}
