/**
 * Lead export to XLSX.
 *
 * Reads filters from the query string (same shape as the /leads page filters)
 * so the user can build a filter, see the table, then download exactly what
 * they see. Returns a styled workbook with one row per business.
 */

import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { queries } from '@seed-panel/db';
import type { Business } from '@seed-panel/db';
import { getCurrentUser } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CATEGORY_LABELS: Record<string, string> = {
  salon_ladies: "Salon — ladies'",
  salon_mens_barber: "Salon — men's barber",
  salon_premium: 'Salon — premium',
  salon_hammam_spa: 'Salon / Hammam / Spa',
  salon_brow_lash: 'Brow / lash / nail',
  salon_mobile: 'Mobile salon',
  restaurant: 'Restaurant',
  clinic_dental: 'Clinic — dental',
  clinic_dermatology: 'Clinic — dermatology',
  clinic_general: 'Clinic — general',
  real_estate_broker: 'Real estate',
  auto_garage: 'Auto garage',
  tailor: 'Tailor',
  cleaning_services: 'Cleaning',
  law_firm: 'Law firm',
  consultancy: 'Consultancy',
  other: 'Other',
};

const EMIRATE_LABELS: Record<string, string> = {
  dubai: 'Dubai',
  abu_dhabi: 'Abu Dhabi',
  sharjah: 'Sharjah',
  ajman: 'Ajman',
  fujairah: 'Fujairah',
  ras_al_khaimah: 'Ras Al Khaimah',
  umm_al_quwain: 'Umm Al Quwain',
};

function digitsOnly(s: string | null | undefined): string {
  return (s ?? '').replace(/\D/g, '');
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const sp = url.searchParams;

  // Pull filters using the same shape as findLeads
  const category = sp.get('category') || undefined;
  const areaZone = sp.get('areaZone') || undefined;
  const emirate = sp.get('emirate') || undefined;
  const status = sp.get('status') || undefined;
  const hasWebsiteRaw = sp.get('hasWebsite');
  const hasWebsite =
    hasWebsiteRaw === 'true' ? true : hasWebsiteRaw === 'false' ? false : undefined;
  const search = sp.get('q') || undefined;
  const limit = Math.min(Number(sp.get('limit') || '5000'), 10000);

  let leads: Business[];
  try {
    leads = await queries.findLeads({
      category: category as Business['category'],
      areaZone,
      emirate: emirate as Business['emirate'],
      status: status as Business['status'],
      hasWebsite,
      search,
      limit,
      orderBy: 'created_desc',
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Could not load leads: ${msg}` }, { status: 500 });
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = 'SEED IT';
  wb.created = new Date();

  const ws = wb.addWorksheet('Leads', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: 'Business name', key: 'name', width: 36 },
    { header: 'Category', key: 'category', width: 22 },
    { header: 'Area', key: 'areaZone', width: 18 },
    { header: 'Emirate', key: 'emirate', width: 14 },
    { header: 'Phone', key: 'phone', width: 20 },
    { header: 'WhatsApp', key: 'whatsapp', width: 28 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Website', key: 'website', width: 32 },
    { header: 'Instagram', key: 'instagram', width: 22 },
    { header: 'Google rating', key: 'rating', width: 12 },
    { header: 'Reviews', key: 'reviews', width: 10 },
    { header: 'Address', key: 'address', width: 40 },
    { header: 'Google Maps', key: 'mapsUrl', width: 18 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Lead score', key: 'leadScore', width: 12 },
    { header: 'Source', key: 'source', width: 18 },
    { header: 'Scraped at', key: 'scrapedAt', width: 18 },
  ];

  // Header styling
  const header = ws.getRow(1);
  header.font = { name: 'Inter', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6C2BD9' }, // SEED IT purple
  };
  header.alignment = { vertical: 'middle', horizontal: 'left' };
  header.height = 22;
  header.eachCell((cell) => {
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF4B1FA3' } },
    };
  });

  for (const lead of leads) {
    const waDigits = digitsOnly(lead.whatsappNumber);
    const row = ws.addRow({
      name: lead.name,
      category: CATEGORY_LABELS[lead.category] ?? lead.category,
      areaZone: lead.areaZone ?? '',
      emirate: EMIRATE_LABELS[lead.emirate] ?? lead.emirate,
      phone: lead.phone ?? '',
      whatsapp: lead.whatsappNumber
        ? { text: lead.whatsappNumber, hyperlink: `https://wa.me/${waDigits}` }
        : '',
      email: lead.email
        ? { text: lead.email, hyperlink: `mailto:${lead.email}` }
        : '',
      website: lead.websiteUrl
        ? { text: lead.websiteUrl, hyperlink: lead.websiteUrl }
        : '',
      instagram: lead.instagramHandle
        ? {
            text: `@${lead.instagramHandle.replace(/^@/, '')}`,
            hyperlink: `https://instagram.com/${lead.instagramHandle.replace(/^@/, '')}`,
          }
        : '',
      rating: lead.googleRating ?? '',
      reviews: lead.googleReviewCount ?? '',
      address: lead.address ?? '',
      mapsUrl: lead.googleMapsUrl
        ? { text: 'Open in Maps', hyperlink: lead.googleMapsUrl }
        : '',
      status: lead.status,
      leadScore: lead.leadScore ?? '',
      source: lead.source,
      scrapedAt: new Date(lead.scrapedAt),
    });

    // Hyperlinks get a blue link style
    ['whatsapp', 'email', 'website', 'instagram', 'mapsUrl'].forEach((key) => {
      const cell = row.getCell(key);
      if (cell.value && typeof cell.value === 'object' && 'hyperlink' in cell.value) {
        cell.font = { color: { argb: 'FF6C2BD9' }, underline: true };
      }
    });

    // Date cell format
    row.getCell('scrapedAt').numFmt = 'yyyy-mm-dd hh:mm';

    // Rating to one decimal
    if (lead.googleRating !== null && lead.googleRating !== undefined) {
      row.getCell('rating').numFmt = '0.0';
    }

    // Highlight rows where there's no website (the buying signal)
    if (!lead.hasWebsite) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF7E6' }, // soft amber
        };
      });
    }
  }

  // Auto-filter
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: leads.length + 1, column: ws.columns.length },
  };

  const buffer = await wb.xlsx.writeBuffer();
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filenameParts = ['leads'];
  if (areaZone) filenameParts.push(areaZone.replace(/\s+/g, '-').toLowerCase());
  if (category) filenameParts.push(category);
  filenameParts.push(dateStamp);
  const filename = `${filenameParts.join('_')}.xlsx`;

  return new NextResponse(buffer as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
