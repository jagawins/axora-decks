import axoraLogo from "@/assets/axora-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={axoraLogo} alt="Axora" className="h-8 w-auto" />
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2024 AXORA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
