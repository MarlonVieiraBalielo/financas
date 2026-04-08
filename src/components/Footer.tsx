export function Footer() {
  return (
    <footer className="hidden md:flex items-center justify-center py-3 border-t border-white/5 bg-card mt-auto">
      <p className="text-muted text-xs">
        Desenvolvido por{" "}
        <a
          href="https://linkedin.com/in/marlon-balielo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-semibold hover:underline"
        >
          Marlon Balielo
        </a>
      </p>
    </footer>
  );
}
