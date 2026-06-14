import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Key, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  const handleScroll = (id) => {
    setIsOpen(false);
    if (isAdminPage) return;
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          VD<span>.</span>
        </Link>

        {isAdminPage ? (
          <div className="nav-links open" style={{ display: 'flex' }}>
            <Link to="/" className="nav-link">
              View Site
            </Link>
          </div>
        ) : (
          <>
            <div className={`nav-links ${isOpen ? 'open' : ''}`}>
              <a onClick={() => handleScroll('about')} className="nav-link">About</a>
              <a onClick={() => handleScroll('skills')} className="nav-link">Skills</a>
              <a onClick={() => handleScroll('projects')} className="nav-link">Projects</a>
              <a onClick={() => handleScroll('education')} className="nav-link">Education</a>
              <a onClick={() => handleScroll('services')} className="nav-link">Services</a>
              <a onClick={() => handleScroll('contact')} className="nav-link">Contact</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/admin" className="nav-link" title="Admin Panel" style={{ display: 'flex', alignItems: 'center' }}>
                <Key size={18} />
              </Link>
              <button onClick={() => handleScroll('contact')} className="btn btn-primary btn-sm nav-btn">
                Get in touch <ArrowRight size={14} />
              </button>
              <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
