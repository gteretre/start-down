import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { updateAuthorTermsAccepted } from '@/lib/mutations';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret });
  if (!token?.username || typeof token.username !== 'string') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await updateAuthorTermsAccepted(token.username, new Date());
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating terms acceptance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update terms acceptance' },
      { status: 500 }
    );
  }
}
