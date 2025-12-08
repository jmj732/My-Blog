import { Button } from "@/components/ui/button";
import { Github, Twitter, Mail, Code, Heart, Coffee } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="relative overflow-hidden min-h-screen bg-background">
            <div className="container relative z-10 py-20">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-border bg-muted animate-fade-in-up">
                        <Heart className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-sm font-bold tracking-wide uppercase">열정적인 개발자 & 크리에이터</span>
                    </div>

                    <h1 className="max-w-5xl mb-6 text-6xl font-black leading-none tracking-tighter animate-fade-in-up md:text-8xl lg:text-9xl uppercase" style={{ animationDelay: '0.1s' }}>
                        웹의 미래를 <br />
                        <span className="text-primary">
                            만들어갑니다.
                        </span>
                    </h1>

                    <p className="max-w-2xl text-lg text-muted-foreground animate-fade-in-up md:text-xl font-medium" style={{ animationDelay: '0.2s' }}>
                        저는 아름답고 접근성 높으며 성능이 뛰어난 웹 애플리케이션을 만드는 것에 열정을 가진 소프트웨어 엔지니어입니다.
                        이 블로그는 저의 여정, 배움, 그리고 새로운 기술에 대한 실험들을 공유하는 공간입니다.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {/* Mission Card */}
                    <div className="p-8 border border-border bg-card hover:border-primary transition-all duration-300 group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-muted group-hover:bg-primary transition-colors">
                                <Code className="w-6 h-6 text-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold uppercase tracking-tight">나의 미션</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            저의 목표는 복잡한 기술 개념을 단순화하고 다른 개발자들의 성장을 돕는 실용적인 지식을 공유하는 것입니다.
                            저는 오픈 소스, 커뮤니티 학습, 그리고 실제 문제를 해결하는 잘 만들어진 소프트웨어의 힘을 믿습니다.
                        </p>
                    </div>

                    {/* Interests Card */}
                    <div className="p-8 border border-border bg-card hover:border-primary transition-all duration-300 group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-muted group-hover:bg-primary transition-colors">
                                <Coffee className="w-6 h-6 text-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold uppercase tracking-tight">관심사</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            코딩 외에도 저는 AI, UI/UX 디자인, 시스템 아키텍처를 탐구하는 것을 즐기는 열렬한 학습자입니다.
                            책상 앞에 없을 때는 SF 소설을 읽거나, 커피 브루잉을 실험하거나, 등산을 즐기곤 합니다.
                        </p>
                    </div>
                </div>

                {/* Connect Section */}
                <div className="flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">연락하기</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="https://github.com" target="_blank">
                            <Button variant="outline" size="lg" className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-300 rounded-none px-8 h-12 text-lg font-bold gap-2">
                                <Github className="w-5 h-5" />
                                GitHub
                            </Button>
                        </Link>
                        <Link href="https://twitter.com" target="_blank">
                            <Button variant="outline" size="lg" className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-300 rounded-none px-8 h-12 text-lg font-bold gap-2">
                                <Twitter className="w-5 h-5" />
                                Twitter
                            </Button>
                        </Link>
                        <Link href="mailto:hello@example.com">
                            <Button variant="outline" size="lg" className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-300 rounded-none px-8 h-12 text-lg font-bold gap-2">
                                <Mail className="w-5 h-5" />
                                이메일 보내기
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
