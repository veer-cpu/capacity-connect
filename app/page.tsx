import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/20 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <p className="font-heading text-lg font-bold tracking-[0.08em]">
            CAPACITY CONNECT
          </p>
          <p className="hidden text-xs text-primary-foreground/70 sm:block">
            Designed for MoES / IMD
          </p>
        </div>
      </header>
      <main>
        <section className="institutional-grid overflow-hidden bg-primary text-primary-foreground">
          <div className="relative mx-auto grid min-h-[34rem] max-w-screen-2xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
            <div className="relative z-10 max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.14em] text-[var(--institutional-saffron)] uppercase">
                Designed for MoES / IMD
              </p>
              <h1 className="mt-5 font-heading text-5xl font-bold leading-none sm:text-6xl">
                CAPACITY CONNECT
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-primary-foreground/82">
                Competency Intelligence &amp; Capacity Building Platform
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "bg-[var(--institutional-saffron)] text-primary hover:bg-[var(--institutional-saffron)]/85",
                  })}
                >
                  Access Portal
                </Link>
                <a
                  href="#capabilities"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className:
                      "border-white/45 bg-transparent text-white hover:bg-white/10 hover:text-white",
                  })}
                >
                  Learn How It Works
                </a>
              </div>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-sm">
              <div className="absolute inset-0 rounded-full border border-[var(--scientific-blue)]/65" />
              <div className="absolute inset-[12%] rounded-full border border-[var(--scientific-blue)]/65" />
              <div className="absolute inset-[26%] rounded-full border border-[var(--institutional-saffron)]/80" />
              <div className="absolute top-1/2 right-[6%] left-[6%] h-px bg-[var(--scientific-blue)]/70" />
              <div className="absolute top-[6%] bottom-[6%] left-1/2 w-px bg-[var(--scientific-blue)]/70" />
              <div className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--institutional-saffron)]" />
              <p className="absolute right-0 bottom-2 border-l border-[var(--scientific-blue)] pl-3 text-xs tracking-[0.1em] text-primary-foreground/70 uppercase">
                Competency signal map
              </p>
            </div>
          </div>
        </section>
        <section
          id="capabilities"
          className="mx-auto max-w-screen-2xl px-5 py-16 sm:px-8 lg:py-20"
        >
          <p className="text-xs font-semibold tracking-[0.12em] text-[var(--institutional-slate)] uppercase">
            Platform capabilities
          </p>
          <div className="mt-5 grid gap-0 border-y border-border md:grid-cols-3">
            {[
              [
                "Training Management",
                "Coordinate learning pathways, course delivery, and professional development.",
              ],
              [
                "Competency Intelligence",
                "Translate assessment evidence into focused capability insights.",
              ],
              [
                "Knowledge Sharing",
                "Connect expertise, learning resources, and organizational capacity.",
              ],
            ].map(([title, description], index) => (
              <article
                key={title}
                className="border-b border-border py-7 last:border-b-0 md:border-r md:border-b-0 md:px-7 md:first:pl-0 md:last:border-r-0"
              >
                <p className="text-xs font-semibold text-[var(--institutional-saffron)]">
                  0{index + 1}
                </p>
                <h2 className="mt-3 font-heading text-xl font-bold">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border bg-muted/70">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-2 px-5 py-8 text-sm sm:px-8">
          <p className="font-heading font-bold text-primary">
            CAPACITY CONNECT
          </p>
          <p className="text-muted-foreground">
            Capacity Building &amp; Competency Intelligence
          </p>
          <p className="text-xs text-muted-foreground">
            Designed for MoES / IMD
          </p>
        </div>
      </footer>
    </div>
  );
}
