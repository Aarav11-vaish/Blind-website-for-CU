import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center font-sans">
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-4 py-20">
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/logo.png"
            alt="Blind CU Logo"
            width={60}
            height={60}
            className="mb-2 drop-shadow-lg"
            priority
          />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary mb-1">
            Welcome to <span className="text-secondary">Blind CU</span>
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-foreground mb-3 font-medium">
            <span role="img" aria-label="wave">
              👋
            </span>{" "}
            Hello, and welcome!
            <br />
            <span className="text-muted-foreground">
              A safe, anonymous community for Chandigarh University students to
              connect, share, and support each other. Post, comment, and
              interact freely—your identity stays private.
            </span>
          </p>
          <div className="flex gap-3 mt-1">
            <Link
              href="/signin"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow hover:bg-primary/90 transition-colors text-base"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          <div className="bg-white/70 dark:bg-black/30 rounded-xl p-4 shadow border border-border/60 flex flex-col items-center">
            <span className="text-2xl mb-1">🕵️‍♂️</span>
            <h2 className="font-bold text-base mb-0.5">100% Anonymous</h2>
            <p className="text-xs text-muted-foreground">
              No names, no judgment. Share your thoughts and questions freely.
            </p>
          </div>
          <div className="bg-white/70 dark:bg-black/30 rounded-xl p-4 shadow border border-border/60 flex flex-col items-center">
            <span className="text-2xl mb-1">🤝</span>
            <h2 className="font-bold text-base mb-0.5">Supportive Community</h2>
            <p className="text-xs text-muted-foreground">
              Find help, advice, and friendship from fellow CU students.
            </p>
          </div>
          <div className="bg-white/70 dark:bg-black/30 rounded-xl p-4 shadow border border-border/60 flex flex-col items-center">
            <span className="text-2xl mb-1">🔒</span>
            <h2 className="font-bold text-base mb-0.5">Safe & Secure</h2>
            <p className="text-xs text-muted-foreground">
              Your privacy is our priority. All posts are moderated for safety.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-1">Why Blind CU?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Blind CU is built for students who want a space to express
            themselves, ask questions, and connect without fear of being judged.
            Whether you need advice, want to share a story, or just want to see
            what others are experiencing, this is your place.
          </p>
          <p className="text-sm text-muted-foreground">
            Join now and be part of a positive, anonymous community at
            Chandigarh University.
          </p>
        </div>
      </main>
    </div>
  );
}
