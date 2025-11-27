'use client';

import { useEffect, useState } from 'react';

import { loginApi } from '../../../api/authApi';
import { validateLogin } from '../../../utils/validators';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SignInPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState({ show: false, message: '' });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        const errs = validateLogin(email);
        if (errs.email) {
            setLoginError({
                show: true,
                message: errs.email,
            });
            return;
        }

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.status === 200) {
                window.location.href = '/';
            }
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                setLoginError({
                    show: true,
                    message: 'Email hoặc mật khẩu không chính xác',
                });
            } else {
                setLoginError({
                    show: true,
                    message: 'Email hoặc mật khẩu không chính xác',
                });
            }
        }
    };

    return (
        <div className="flex flex-col flex-1 bg-primary py-8 h-screen">
            <div className="flex flex-col flex-1 justify-center bg-[#FDF5AA] mx-auto px-6 rounded-2xl w-full max-w-md">
                <div>
                    <Image src="/logoBlue.png" alt="Logo" width={180} height={180} className="mx-auto -mt-12" />
                    <p className="mb-6 font-semibold text-primary text-4xl text-center">STATION X</p>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div>
                                <label>Email</label>
                                <Input
                                    id="email"
                                    placeholder="info@gmail.com"
                                    required={true}
                                    className="border-[#868484]"
                                />
                            </div>
                            <div>
                                <label>Password</label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        required={true}
                                        className="border-[#868484]"
                                    />
                                    <span
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="top-1/2 right-4 z-30 absolute -translate-y-1/2 cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <FaEye className="fill-gray-500 dark:fill-gray-400 size-5" />
                                        ) : (
                                            <FaEyeSlash className="fill-gray-500 dark:fill-gray-400 size-5" />
                                        )}
                                    </span>
                                </div>
                            </div>

                            {loginError.show && (
                                <div className="flex justify-center mt-4">
                                    <p className="font-normal text-red-600 text-sm text-center">{loginError.message}</p>
                                </div>
                            )}

                            <div className="flex justify-center mt-12">
                                <Button type="submit" className="select-none">
                                    Sign in
                                </Button>
                            </div>
                        </div>
                    </form>

                    <div className="flex justify-center mt-4">
                        <p className="font-normal text-gray-700 dark:text-gray-400 text-sm text-center sm:text-start">
                            Don&apos;t have an account? {''}
                            <Link href="/signup" className="text-primary hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
