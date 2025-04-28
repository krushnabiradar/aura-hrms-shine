
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle smooth scroll
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (!href?.startsWith('#')) return;
    
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 font-bold text-xl">
            <a href="#" className="flex items-center gap-2">
              <span className="text-accent">Aura</span>
              <span>HRMS</span>
            </a>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#features" onClick={handleNavClick} className="hover:text-accent transition-colors">Features</a>
            <a href="#use-cases" onClick={handleNavClick} className="hover:text-accent transition-colors">Use Cases</a>
            <a href="#pricing" onClick={handleNavClick} className="hover:text-accent transition-colors">Pricing</a>
            <a href="#docs" onClick={handleNavClick} className="hover:text-accent transition-colors">Docs</a>
            <a href="#blog" onClick={handleNavClick} className="hover:text-accent transition-colors">Blog</a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <Button className="btn-accent">Get Started</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground"
            >
              <Menu />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-sm shadow-sm">
          <a href="#features" onClick={handleNavClick} className="block px-3 py-2 hover:text-accent transition-colors">Features</a>
          <a href="#use-cases" onClick={handleNavClick} className="block px-3 py-2 hover:text-accent transition-colors">Use Cases</a>
          <a href="#pricing" onClick={handleNavClick} className="block px-3 py-2 hover:text-accent transition-colors">Pricing</a>
          <a href="#docs" onClick={handleNavClick} className="block px-3 py-2 hover:text-accent transition-colors">Docs</a>
          <a href="#blog" onClick={handleNavClick} className="block px-3 py-2 hover:text-accent transition-colors">Blog</a>
          <div className="px-3 py-2">
            <Button className="btn-accent w-full">Get Started</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
