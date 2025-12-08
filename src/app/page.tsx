import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-background">
      <section className="container relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-border bg-muted animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold tracking-wide uppercase">AI 기반 블로그 플랫폼</span>
        </div>

        {/* Main heading */}
        <h1 className="max-w-5xl mb-6 text-6xl font-black leading-none tracking-tighter animate-fade-in-up md:text-8xl lg:text-9xl uppercase" style={{ animationDelay: '0.1s' }}>
          당신의 아이디어,<br />
          <span className="text-primary">
            완벽해지다.
          </span>
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl mb-12 text-lg text-muted-foreground animate-fade-in-up md:text-xl font-medium" style={{ animationDelay: '0.2s' }}>
          AI 기반 벡터 검색, 모던한 MDX 지원. 미학을 중요시하는 작가들을 위한 미니멀리즘 인터페이스.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col gap-4 mb-16 animate-fade-in-up sm:flex-row" style={{ animationDelay: '0.3s' }}>
          <Button size="lg" className="group bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300 rounded-none px-8 h-14 text-lg font-bold border-2 border-transparent hover:border-black dark:hover:border-white">
            글쓰기 시작
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-300 rounded-none px-8 h-14 text-lg font-bold">
            <Zap className="w-5 h-5 mr-2" />
            기능 살펴보기
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="p-8 border border-border bg-card hover:border-primary transition-all duration-300 group text-left">
            <div className="flex items-center justify-center w-14 h-14 mb-6 bg-muted group-hover:bg-primary transition-colors">
              <Sparkles className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="mb-3 text-xl font-bold uppercase tracking-tight">AI 벡터 검색</h3>
            <p className="text-muted-foreground leading-relaxed">
              Transformers.js를 사용한 강력한 임베딩으로 의미 기반 콘텐츠 검색을 경험하세요.
            </p>
          </div>

          <div className="p-8 border border-border bg-card hover:border-primary transition-all duration-300 group text-left">
            <div className="flex items-center justify-center w-14 h-14 mb-6 bg-muted group-hover:bg-primary transition-colors">
              <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-bold uppercase tracking-tight">MDX 지원</h3>
            <p className="text-muted-foreground leading-relaxed">
              마크다운과 JSX를 결합하여 풍부하고 인터랙티브한 콘텐츠를 작성하세요.
            </p>
          </div>

          <div className="p-8 border border-border bg-card hover:border-primary transition-all duration-300 group text-left">
            <div className="flex items-center justify-center w-14 h-14 mb-6 bg-muted group-hover:bg-primary transition-colors">
              <Zap className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="mb-3 text-xl font-bold uppercase tracking-tight">압도적인 속도</h3>
            <p className="text-muted-foreground leading-relaxed">
              Next.js 15와 React 19로 구축되어 놀라울 정도로 빠른 성능을 제공합니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

