export function Hero() {
  function scrollToForm() {
    document.getElementById("builder")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section className="mb-12 mt-4">
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">
          $ ssh guest@your-name.dev
        </p>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-hot">
          CV via SSH, is there any other way 2026?
        </h1>
        <p className="text-xl md:text-2xl text-zinc-200 mt-2 italic">I think not!</p>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-accent/30 shadow-[0_0_40px_-10px_rgba(125,86,244,0.4)] bg-ink">
        <video
          className="w-full block"
          src="/tui-demo.mov"
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          aria-label="Demo of the terminal CV TUI in action"
        />
      </div>

      <div className="text-center mt-8 mb-4">
        <p className="text-base md:text-lg text-muted italic">
          Don't know what SSH is? Then maybe my CV isn't for you.
        </p>
      </div>

      <div className="flex justify-center gap-3 mt-6">
        <button
          type="button"
          onClick={scrollToForm}
          className="btn btn-primary font-bold"
        >
          Build yours ↓
        </button>
        <a
          href="https://en.wikipedia.org/wiki/Secure_Shell"
          target="_blank"
          rel="noreferrer"
          className="btn text-xs self-center text-muted"
        >
          wait, what's SSH?
        </a>
      </div>
    </section>
  )
}
