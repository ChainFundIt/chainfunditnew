import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema/users';
import { eq } from 'drizzle-orm';
import { parse } from 'cookie';
import { verifyUserJWT } from '@/lib/auth';

function normalizePhone(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

async function getUserFromRequest(request: NextRequest) {
  const cookie = request.headers.get('cookie') || '';
  const cookies = parse(cookie);
  const token = cookies['auth_token'];
  if (!token) return null;
  const userPayload = verifyUserJWT(token);
  if (!userPayload || !userPayload.email) return null;
  return userPayload.email;
}

export async function GET(request: NextRequest) {
  try {
    const email = await getUserFromRequest(request);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        countryCode: users.countryCode,
        avatar: users.avatar,
        bio: users.bio,
        hasCompletedProfile: users.hasCompletedProfile,
        hasSeenWelcomeModal: users.hasSeenWelcomeModal,
        instagram: users.instagram,
        facebook: users.facebook,
        linkedin: users.linkedin,
        twitter: users.twitter,
        tiktok: users.tiktok,
        youtube: users.youtube,
        role: users.role,
        // Payout/account verification fields used by payout flow
        accountNumber: users.accountNumber,
        bankCode: users.bankCode,
        bankName: users.bankName,
        accountName: users.accountName,
        accountVerified: users.accountVerified,
        accountLocked: users.accountLocked,
        accountChangeRequested: users.accountChangeRequested,
        accountChangeReason: users.accountChangeReason,
        internationalBankAccountNumber: users.internationalBankAccountNumber,
        internationalBankRoutingNumber: users.internationalBankRoutingNumber,
        internationalBankSwiftBic: users.internationalBankSwiftBic,
        internationalBankCountry: users.internationalBankCountry,
        internationalBankName: users.internationalBankName,
        internationalAccountName: users.internationalAccountName,
        internationalAccountVerified: users.internationalAccountVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user.length) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: user[0] });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const email = await getUserFromRequest(request);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    const {
      fullName,
      avatar,
      bio,
      phone,
      instagram,
      facebook,
      linkedin,
      twitter,
      tiktok,
      youtube,
    } = await request.json();

    const normalizedPhone = normalizePhone(phone);
    const updateResult = await db.update(users)
      .set({
        fullName,
        avatar,
        bio,
        phone: normalizedPhone || null,
        instagram,
        facebook,
        linkedin,
        twitter,
        tiktok,
        youtube,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        countryCode: users.countryCode,
        avatar: users.avatar,
        bio: users.bio,
        hasCompletedProfile: users.hasCompletedProfile,
        hasSeenWelcomeModal: users.hasSeenWelcomeModal,
        instagram: users.instagram,
        facebook: users.facebook,
        linkedin: users.linkedin,
        twitter: users.twitter,
        tiktok: users.tiktok,
        youtube: users.youtube,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (!updateResult.length) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: updateResult[0] });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const email = await getUserFromRequest(request);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    const { hasSeenWelcomeModal } = await request.json();
    if (typeof hasSeenWelcomeModal !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Invalid value for hasSeenWelcomeModal' }, { status: 400 });
    }
    const updateResult = await db.update(users)
      .set({ hasSeenWelcomeModal, updatedAt: new Date() })
      .where(eq(users.email, email))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        countryCode: users.countryCode,
        avatar: users.avatar,
        bio: users.bio,
        hasCompletedProfile: users.hasCompletedProfile,
        hasSeenWelcomeModal: users.hasSeenWelcomeModal,
        instagram: users.instagram,
        facebook: users.facebook,
        linkedin: users.linkedin,
        twitter: users.twitter,
        tiktok: users.tiktok,
        youtube: users.youtube,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
    if (!updateResult.length) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: updateResult[0] });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}