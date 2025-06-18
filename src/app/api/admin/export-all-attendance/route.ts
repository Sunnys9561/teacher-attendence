
// This file is no longer needed as the export functionality has been moved to the client-side
// in src/app/admin/dashboard/page.tsx.
// You can safely delete this file.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: false, message: 'This API route is deprecated. Export is handled client-side.' }, { status: 410 });
}
