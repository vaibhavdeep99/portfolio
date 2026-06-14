import React, { useState } from 'react';
import { Mail, FileText, ArrowRight, ExternalLink, Calendar, GraduationCap, Briefcase, Award } from 'lucide-react';

const Github = ({ size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const PortfolioView = ({ data, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: 'Website',
    budget: '₹20,000 – ₹50,000',
    timeline: '2 – 3 weeks',
    details: ''
  });

  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  if (loading || !data) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div
          className="hero-circle"
          style={{
            filter: 'none',
            width: '80px',
            height: '80px',
            animation: 'spin 2s linear infinite'
          }}
        ></div>

        <img
          src="/profile.jpeg"
          alt="Vaibhav Deep Srivastava"
          style={{
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />

        <p style={{ color: 'var(--text-secondary)' }}>
          Loading Vaibhav's Portfolio...
        </p>

        <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    );
  }

  const { profile = {}, skills = [], projects = [], education = [], internships = [], services = [], certificates = [] } = data;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServiceSelect = (serviceTitle) => {
    let budget = '₹15,000+';
    let timeline = '1 - 2 weeks';

    if (serviceTitle === 'Fullstack Web App') {
      budget = '₹45,000+';
      timeline = '3 - 4 weeks';
    } else if (serviceTitle === 'UI/UX Design') {
      budget = '₹12,000+';
      timeline = '1 week';
    }

    setFormData({
      ...formData,
      projectType: serviceTitle,
      budget: budget,
      timeline: timeline,
      details: `Hi Vaibhav, I would like to inquire about the "${serviceTitle}" package.`
    });

    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = contactSection.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setFormStatus({ type: 'success', message: resData.message });
        setFormData({
          name: '',
          email: '',
          phone: '',
          projectType: 'Website',
          budget: '₹20,000 – ₹50,000',
          timeline: '2 – 3 weeks',
          details: ''
        });
      } else {
        setFormStatus({ type: 'danger', message: resData.message || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setFormStatus({ type: 'danger', message: 'Network error. Please check your backend connection.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="container hero-grid">
          <div>
            <span className="section-tag">Welcome to my universe</span>
            <h1 className="hero-title text-gradient">
              Hi, I'm <br />
              {profile.name || 'Vaibhav Deep Srivastava'}
            </h1>
            <p className="hero-subtitle">
              {profile.title || 'BTech CS Student & Fullstack Developer'}
            </p>
            <p className="hero-desc">
              {profile.about || 'Specializing in Data Structures, Algorithms, System Design, and building highly responsive, beautiful web applications.'}
            </p>
            <div className="hero-buttons">
              <a href="#contact" className="btn btn-primary">
                Let's Work Together <ArrowRight size={18} />
              </a>
              {profile.resumeUrl ? (
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  <FileText size={18} /> View Resume
                </a>
              ) : (
                <a href="#about" className="btn btn-secondary">
                  Learn More
                </a>
              )}
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-circle"></div>
            <img
              src="/profile.jpeg"
              alt="Vaibhav Deep Srivastava"
              className="hero-avatar"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <span className="section-tag">About Me</span>
          <div className="about-grid">
            <div className="about-info">
              <h3>CS Student & Creator</h3>
              <p>
                Currently in my 3rd year pursuing BTech in Computer Science. I have a deep command over core concepts of computer science including Data Structures, Algorithms, and System Design.
              </p>
              <p>
                I am passionate about creating end-to-end fullstack systems using the MERN Stack. I build web applications and digital mockups, paying close attention to premium aesthetic details and interactions.
              </p>
              <p style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                <a href={profile.github || '#'} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ borderRadius: '8px' }}>
                  <Github size={16} /> GitHub Profile
                </a>
                <a href={profile.linkedin ? `https://${profile.linkedin}` : '#'} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ borderRadius: '8px' }}>
                  <Linkedin size={16} /> LinkedIn Connect
                </a>
              </p>
            </div>
            <div className="about-details">
              <div className="detail-item">
                <div className="detail-label">Current Role</div>
                <div className="detail-value">BTech CS 3rd Year</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value" style={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>
                  {profile.email || 'vaibhavdeepsrivastava12345@gmail.com'}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Focus Areas</div>
                <div className="detail-value">DSA & System Design</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Core Technologies</div>
                <div className="detail-value">MERN Stack, SQL</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="skills-section">
        <div className="container">
          <span className="section-tag">Tech Stack</span>
          <h2 className="section-title">My Technical Skills</h2>
          <div className="skills-grid">
            {skills.map((skillGroup, idx) => (
              <div key={idx} className="glass-card skills-card">
                <h3>{skillGroup.category}</h3>
                <div className="skill-tags">
                  {skillGroup.items.map((skill, sIdx) => (
                    <span key={sIdx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects-section">
        <div className="container">
          <span className="section-tag">My Work</span>
          <h2 className="section-title">Featured Projects</h2>
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="glass-card project-card">
                <div className="project-meta">
                  {project.tech.map((t, idx) => (
                    <span key={idx} className="project-tech">{t}</span>
                  ))}
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                    View GitHub <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey (Education & Internships) */}
      <section id="education" className="journey-section">
        <div className="container journey-grid">
          {/* Education Column */}
          <div className="journey-column">
            <h3><GraduationCap size={28} className="text-gradient" /> Education</h3>
            <div className="timeline">
              {education.map((item) => (
                <div key={item.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-date">{item.duration}</div>
                  <div className="timeline-title">{item.degree}</div>
                  <div className="timeline-subtitle">{item.institution} · {item.board}</div>
                  <div className="timeline-badge">{item.performance}</div>
                  <div className="timeline-desc">{item.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Internships Column */}
          <div className="journey-column">
            <h3><Briefcase size={28} className="text-gradient" /> Internships</h3>
            {internships.length > 0 ? (
              <div className="timeline">
                {internships.map((item) => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-date">{item.duration}</div>
                    <div className="timeline-title">{item.role}</div>
                    <div className="timeline-subtitle">{item.company}</div>
                    <div className="timeline-desc">{item.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-items-placeholder">
                No internships listed yet. Add some from the admin panel.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services & Pricing */}
      <section id="services" className="services-section">
        <div className="container">
          <span className="section-tag">Services</span>
          <h2 className="section-title">Services & Pricing</h2>
          <div className="pricing-grid">
            {services.map((service) => (
              <div key={service.id} className={`glass-card pricing-card ${service.popular ? 'popular' : ''}`}>
                {service.popular && <span className="popular-badge">Most popular</span>}
                <h3 className="pricing-title">{service.title}</h3>
                <p className="pricing-desc">{service.description}</p>
                <div className="pricing-price">₹{service.price}</div>
                <div className="pricing-delivery">{service.delivery}</div>
                <ul className="pricing-features">
                  {service.features.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
                <button onClick={() => handleServiceSelect(service.title)} className={`btn ${service.popular ? 'btn-primary' : 'btn-secondary'}`}>
                  Choose plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificates */}
      <section id="certificates" className="certificates-section">
        <div className="container">
          <span className="section-tag">Credentials</span>
          <h2 className="section-title">Certificates</h2>
          <div className="certs-grid">
            {certificates.map((cert) => (
              <div key={cert.id} className="glass-card cert-card">
                <div className="cert-img-container">
                  {cert.imageUrl ? (
                    <img src={cert.imageUrl} alt={cert.title} className="cert-img" />
                  ) : (
                    <Award size={48} style={{ opacity: 0.2 }} />
                  )}
                </div>
                <div className="cert-body">
                  <div className="timeline-date">{cert.year}</div>
                  <h3 className="cert-title">{cert.title}</h3>
                  <p className="cert-issuer">{cert.issuer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container contact-grid">
          <div className="contact-info">
            <span className="section-tag">Get in Touch</span>
            <h3>Have a project?<br />Let's talk.</h3>
            <p>Drop your requirements below. I usually reply within 24 hours.</p>

            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-icon-box">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="contact-label">Email</div>
                  <div className="contact-value">
                    <a href={`mailto:${profile.email || 'vaibhavdeepsrivastava12345@gmail.com'}`}>
                      {profile.email || 'vaibhavdeepsrivastava12345@gmail.com'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon-box">
                  <Linkedin size={20} />
                </div>
                <div>
                  <div className="contact-label">LinkedIn</div>
                  <div className="contact-value">
                    <a href={profile.linkedin ? `https://${profile.linkedin}` : 'https://linkedin.com'} target="_blank" rel="noopener noreferrer">
                      vaibhav-deep-srivastava
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon-box">
                  <Github size={20} />
                </div>
                <div>
                  <div className="contact-label">GitHub</div>
                  <div className="contact-value">
                    <a href={profile.github || 'https://github.com'} target="_blank" rel="noopener noreferrer">
                      View my code
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            {formStatus.message && (
              <div className={`alert-banner alert-${formStatus.type}`}>
                <span>{formStatus.message}</span>
                <button onClick={() => setFormStatus({ type: '', message: '' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="phone">Phone (Optional)</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="projectType">Project Type</label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="form-control form-select"
                  >
                    <option value="Website">Website</option>
                    <option value="Fullstack Web App">Fullstack Web App</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Other">Other Custom Project</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="budget">Budget</label>
                  <input
                    type="text"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="e.g. ₹20,000 - ₹50,000"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="timeline">Timeline</label>
                  <input
                    type="text"
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="e.g. 2 - 3 weeks"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="details">Project Details</label>
                <textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Describe your project requirements, goals, or questions..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Sending Request...' : 'Send Request'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <p className="footer-text">
            © {new Date().getFullYear()} Vaibhav Deep Srivastava. Made with passion for Web Development & Design.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PortfolioView;
