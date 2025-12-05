import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background to-secondary/60 flex items-center justify-center font-sans dark:bg-black">
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-4 py-20">
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            src="/logo.png"
            alt="Blind CU Logo"
            width={80}
            height={80}
            className="mb-2 drop-shadow-lg"
            priority
          />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">
            Welcome to Blind CU
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-4">
            A safe, anonymous community for Chandigarh University students to
            connect, share, and support each other. Post, comment, and interact
            freely—your identity stays private.
          </p>
          <div className="flex gap-4 mt-2">
            <Link
              href="/signin"
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl border border-primary text-primary font-semibold bg-white/70 dark:bg-black/30 shadow hover:bg-primary/10 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="bg-white/70 dark:bg-black/30 rounded-2xl p-6 shadow backdrop-blur-lg border border-border/60 flex flex-col items-center">
            <span className="text-3xl mb-2">🕵️‍♂️</span>
            <h2 className="font-bold text-lg mb-1">100% Anonymous</h2>
            <p className="text-sm text-muted-foreground">
              No names, no judgment. Share your thoughts and questions freely.
            </p>
          </div>
          <div className="bg-white/70 dark:bg-black/30 rounded-2xl p-6 shadow backdrop-blur-lg border border-border/60 flex flex-col items-center">
            <span className="text-3xl mb-2">🤝</span>
            <h2 className="font-bold text-lg mb-1">Supportive Community</h2>
            <p className="text-sm text-muted-foreground">
              Find help, advice, and friendship from fellow CU students.
            </p>
          </div>
          <div className="bg-white/70 dark:bg-black/30 rounded-2xl p-6 shadow backdrop-blur-lg border border-border/60 flex flex-col items-center">
            <span className="text-3xl mb-2">🔒</span>
            <h2 className="font-bold text-lg mb-1">Safe & Secure</h2>
            <p className="text-sm text-muted-foreground">
              Your privacy is our priority. All posts are moderated for safety.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-20 max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-2">Why Blind CU?</h3>
          <p className="text-md text-muted-foreground mb-4">
            Blind CU is built for students who want a space to express
            themselves, ask questions, and connect without fear of being judged.
            Whether you need advice, want to share a story, or just want to see
            what others are experiencing, this is your place.
          </p>
          <p className="text-md text-muted-foreground">
            Join now and be part of a positive, anonymous community at
            Chandigarh University.
          </p>
        </div>
      </main>
    </div>
  );
}
