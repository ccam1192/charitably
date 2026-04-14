import { Container } from "./Section";
import { LogoWordmark } from "./Logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-white">
      <Container className="py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <LogoWordmark />
          <div className="text-sm text-muted">
            © {new Date().getFullYear()} Charitably. Built for St. Vincent de Paul conferences.
          </div>
        </div>
      </Container>
    </footer>
  );
}

