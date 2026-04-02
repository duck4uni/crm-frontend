"use client";

import Link from "next/link";
import { FiLogIn } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { LoginFormBindings } from "./useLoginForm";

export function LoginFormView({
    form,
    errors,
    isPending,
    canSubmit,
    handleInputChange,
    handleSubmit,
}: LoginFormBindings) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.24),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.18),_transparent_45%)]" />
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid w-full items-center gap-8 lg:grid-cols-[1.2fr_420px]">
                    <section className="hidden lg:block text-white">
                        <span className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200">
                            CRM Authentication
                        </span>
                        <h1 className="mt-5 text-4xl font-bold leading-tight text-balance">
                            Đăng nhập vào hệ thống CRM doanh nghiệp
                        </h1>
                        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                            Quản lý khách hàng, thương vụ và vận hành đội ngũ trên một nền tảng thống nhất.
                        </p>
                    </section>

                    <Card className="border border-white/15 bg-white/95 shadow-2xl backdrop-blur-sm">
                        <CardHeader className="space-y-2 border-b border-gray-100">
                            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
                            <p className="text-sm text-gray-600">
                                Sử dụng email, số điện thoại hoặc tên Zalo và mật khẩu của bạn.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <Input
                                    label="Định danh"
                                    placeholder="Email / số điện thoại / tên Zalo"
                                    value={form.identifier}
                                    onChange={(event) => handleInputChange("identifier", event.target.value)}
                                    error={errors.identifier}
                                    autoComplete="username"
                                    disabled={isPending}
                                />

                                <Input
                                    label="Mật khẩu"
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    value={form.password}
                                    onChange={(event) => handleInputChange("password", event.target.value)}
                                    error={errors.password}
                                    autoComplete="current-password"
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
                                        <FiLogIn className="h-4 w-4" />
                                    )}
                                    {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
                                </Button>

                                <p className="text-center text-sm text-gray-600">
                                    Chưa có tài khoản?{" "}
                                    <Link href="/register" className="font-medium text-primary-600 hover:text-primary-700">
                                        Đăng ký ngay
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
