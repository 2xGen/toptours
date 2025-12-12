import { NextResponse } from 'next/server';
import { getOperators } from '@/lib/tourOperatorsCRM';

export async function GET() {
  try {
    const result = await getOperators();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

