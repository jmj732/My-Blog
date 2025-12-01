import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-primary animate-gradient opacity-10 blur-3xl"></div>

      {/* Floating decoration orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      <section className="container relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass-effect animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-purple-500 animate-glow" />
          <span className="text-sm font-medium">AI-Powered Blog Platform</span>
        </div>

        {/* Main heading */}
        <h1 className="max-w-4xl mb-6 text-5xl font-bold leading-tight tracking-tight animate-fade-in-up md:text-7xl lg:text-8xl" style={{ animationDelay: '0.1s' }}>
          Your Ideas,{" "}
          <span className="text-gradient animate-gradient">
            Beautifully Crafted
          </span>
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl mb-12 text-lg text-muted-foreground animate-fade-in-up md:text-xl" style={{ animationDelay: '0.2s' }}>
          Create stunning blog posts with AI-powered vector search, modern MDX support,
          and a beautiful interface designed for writers who care about aesthetics.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col gap-4 mb-16 animate-fade-in-up sm:flex-row" style={{ animationDelay: '0.3s' }}>
          <Button size="lg" className="group bg-gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/50">
            Start Writing
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline" className="glass-effect hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <Zap className="w-4 h-4 mr-2" />
            Explore Features
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="p-6 rounded-2xl glass-effect hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-primary">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">AI Vector Search</h3>
            <p className="text-sm text-muted-foreground">
              Find content semantically with powerful embeddings using Transformers.js
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-effect hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">MDX Support</h3>
            <p className="text-sm text-muted-foreground">
              Write with Markdown and JSX combined for rich, interactive content
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-effect hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Built on Next.js 15 with React 19 for blazing fast performance
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

