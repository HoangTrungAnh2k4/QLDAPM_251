import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginApi } from '@/api/authApi';

export async function POST(req: Request) {
    const { email, password } = await req.json();

    try {
        const res = await loginApi(email, password);

        const token = res.data.data;
        const cookieStore = await cookies();

        cookieStore.set('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ message: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }
}
