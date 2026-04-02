"use client";

import Link from "next/link";
import { FiUserPlus } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { RegisterFormBindings } from "./useRegisterForm";

export function RegisterFormView({
    form,
    errors,
    isPending,
    canSubmit,
    handleInputChange,
    handleSubmit,
}: RegisterFormBindings) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_44%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_45%)]" />
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid w-full items-center gap-8 lg:grid-cols-[1.2fr_460px]">
                    <section className="hidden lg:block text-white">
                        <span className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200">
                            CRM Registration
                        </span>
                        <h1 className="mt-5 text-4xl font-bold leading-tight text-balance">
                            Tạo tài khoản CRM cho đội ngũ của bạn
                        </h1>
                        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                            Bắt đầu quản lý khách hàng, thương vụ và quy trình vận hành ngay hôm nay.
                        </p>
                    </section>

                    <Card className="border border-white/15 bg-white/95 shadow-2xl backdrop-blur-sm">
                        <CardHeader className="space-y-2 border-b border-gray-100">
                            <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
                            <p className="text-sm text-gray-600">
                                Nhập đầy đủ thông tin để tạo tài khoản mới.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <Input
                                    label="Họ và tên"
                                    placeholder="Ví dụ: Hồng Đức"
                                    value={form.full_name}
                                    onChange={(event) => handleInputChange("full_name", event.target.value)}
                                    error={errors.full_name}
                                    disabled={isPending}
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="example@domain.com"
                                    value={form.email}
                                    onChange={(event) => handleInputChange("email", event.target.value)}
                                    error={errors.email}
                                    autoComplete="email"
                                    disabled={isPending}
                                />

                                <Input
                                    label="Số điện thoại"
                                    placeholder="0396524810"
                                    value={form.phone}
                                    onChange={(event) => handleInputChange("phone", event.target.value)}
                                    error={errors.phone}
                                    autoComplete="tel"
                                    disabled={isPending}
                                />

                                <Input
                                    label="Mật khẩu"
                                    type="password"
                                    placeholder="Tối thiểu 8 ký tự"
                                    value={form.password}
                                    onChange={(event) => handleInputChange("password", event.target.value)}
                                    error={errors.password}
                                    autoComplete="new-password"
                                    disabled={isPending}
                                />

                                <Button
                                    type="submit"
                                    className="w-full gap-2"
                                    disabled={isPending || !canSubmit}
                                >
                                    {isPending ? (
                                        <Spinner size="sm" className="border-2 border-white/40 border-t-white" />
                                    ) : (
                                        <FiUserPlus className="h-4 w-4" />
                                    )}
                                    {isPending ? "Đang tạo tài khoản..." : "Đăng ký"}
                                </Button>

                                <p className="text-center text-sm text-gray-600">
                                    Đã có tài khoản?{" "}
                                    <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
                                        Đăng nhập
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
