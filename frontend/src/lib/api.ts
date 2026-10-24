import { VerificationReport, FixtureProperty, WatchlistItem } from './types';

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8000';

export async function getFixtures(): Promise<FixtureProperty[]> {
  try {
    const res = await fetch(`${WORKER_URL}/api/v1/fixtures`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data.fixtures || [];
    }
  } catch (e) {
    console.warn('Could not fetch fixtures from worker, using local fallback:', e);
  }

  // Fallback fixtures
  return [
    {
      key: 'clean',
      title: 'Sunshine Residency Phase 1',
      badge: 'High Trust (Score: 92/100)',
      rera_id: 'P52100012345',
      project_name: 'Sunshine Residency Phase 1',
      promoter_name: 'Godrej Properties Limited',
      city: 'Pune',
      state: 'Maharashtra',
      address: 'Survey No. 42/1, Baner-Pashan Link Road, Pune 411045',
      listing_url: 'https://housing.com/in/buy/projects/page/102938-sunshine-residency-baner'
    },
    {
      key: 'delayed',
      title: 'Green Valley Towers Phase 2',
      badge: 'Moderate Risk (Score: 68/100)',
      rera_id: 'P52100088765',
      project_name: 'Green Valley Towers Phase 2',
      promoter_name: 'Apex Skyline Developers Pvt Ltd',
      city: 'Pune',
      state: 'Maharashtra',
      address: 'Sector 14, Hinjewadi Phase 3, Pune 411057',
      listing_url: 'https://99acres.com/green-valley-towers-hinjewadi-pune'
    },
    {
      key: 'flagged',
      title: 'Royal Empire Luxury Towers',
      badge: 'Critical Alert (Score: 28/100)',
      rera_id: 'P51700099881',
      project_name: 'Royal Empire Luxury Towers',
      promoter_name: 'Royal Imperial Realcon Ltd',
      city: 'Thane',
      state: 'Maharashtra',
      address: 'Ghodbunder Road, Near Ovala Junction, Thane West 400615',
      listing_url: 'https://magicbricks.com/royal-empire-ghodbunder-road-thane'
    }
  ];
}

export async function triggerVerification(params: {
  property_url?: string;
  project_name?: string;
  promoter_name?: string;
  rera_number?: string;
  state?: string;
  city?: string;
  address?: string;
}): Promise<{ report_id: string; status: string }> {
  const body: any = {};
  if (params.property_url) {
    body.property_url = params.property_url;
  }
  if (params.project_name || params.rera_number) {
    body.manual_details = {
      project_name: params.project_name,
      promoter_name: params.promoter_name,
      rera_number: params.rera_number,
      state: params.state || 'Maharashtra',
      city: params.city,
      address: params.address,
    };
  }

  const res = await fetch(`${WORKER_URL}/api/v1/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Verification failed with HTTP ${res.status}`);
  }

  return res.json();
}

export async function getReport(reportId: string): Promise<VerificationReport> {
  const res = await fetch(`${WORKER_URL}/api/v1/report/${reportId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Report ${reportId} not found or in error status`);
  }

  return res.json();
}

export async function addToWatchlist(reportId: string): Promise<any> {
  const res = await fetch(`${WORKER_URL}/api/v1/watchlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_id: reportId }),
  });
  return res.json();
}

export async function getWatchlist(): Promise<{ items: WatchlistItem[]; total: number }> {
  try {
    const res = await fetch(`${WORKER_URL}/api/v1/watchlist`, { cache: 'no-store' });
    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    console.warn('Could not fetch watchlist from worker:', e);
  }

  return {
    items: [
      {
        watchlist_id: 'wl_sunshine_baner',
        property_name: 'Sunshine Residency Phase 1',
        promoter_name: 'Godrej Properties Limited',
        rera_id: 'P52100012345',
        city: 'Pune',
        current_trust_score: 92,
        score_delta_7d: 0,
        status: 'active',
        last_checked_at: '2026-10-24T06:00:00Z',
        alert_threshold: 10,
      },
      {
        watchlist_id: 'wl_green_valley',
        property_name: 'Green Valley Towers Phase 2',
        promoter_name: 'Apex Skyline Developers Pvt Ltd',
        rera_id: 'P52100088765',
        city: 'Pune',
        current_trust_score: 68,
        score_delta_7d: -4,
        status: 'active',
        last_checked_at: '2026-10-24T06:00:00Z',
        alert_threshold: 10,
      },
    ],
    total: 2,
  };
}

export async function resolveHITL(reportId: string, checkType: string, resolutionData: any): Promise<any> {
  const res = await fetch(`${WORKER_URL}/api/v1/hil/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      report_id: reportId,
      check_type: checkType,
      resolution_data: resolutionData,
    }),
  });
  return res.json();
}
