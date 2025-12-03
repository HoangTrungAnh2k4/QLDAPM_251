'use client';

import { useState } from 'react';

import { loginApi } from '../../../api/authApi';
import { validateLogin } from '../../../utils/validators';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { log } from 'console';

export default function SignInPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState({ show: false, message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading) return;

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
            setIsLoading(true);
            setLoginError({ show: false, message: '' });

            const res = await loginApi(email, password);

            if (res.status === 200) {
                const accessToken = res.data.data;
                localStorage.setItem('access_token', accessToken);
                // successful login — navigate away
                window.location.href = '/station-management';
                return;
            }

            // non-200 handled here
            setLoginError({ show: true, message: 'Email hoặc mật khẩu không chính xác' });
            setIsLoading(false);
        } catch (error) {
            setLoginError({ show: true, message: 'Email hoặc mật khẩu không chính xác' });
            setIsLoading(false);
            console.log('Login error:', error);
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
                                    disabled={isLoading}
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
                                        disabled={isLoading}
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
                                <Button type="submit" disabled={isLoading} className="select-none">
                                    {isLoading ? (
                                        <>
                                            <svg
                                                className="mr-2 -ml-1 w-4 h-4 text-white animate-spin"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                ></path>
                                            </svg>
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign in'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
