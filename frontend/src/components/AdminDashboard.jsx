import React, { useState, useEffect } from 'react';
import { LogOut, Save, Plus, Trash2, Edit2, Upload, MessageSquare, Briefcase, GraduationCap, Code, FileText, User, Settings, Award } from 'lucide-react';

const AdminDashboard = ({ portfolioData, onUpdateData }) => {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [localData, setLocalData] = useState(null);
  
  // Inquiries State
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Status banners
  const [status, setStatus] = useState({ type: '', message: '' });

  // Upload state
  const [uploadingResume, setUploadingResume] = useState(false);

  // Editing States for lists
  const [editingProject, setEditingProject] = useState(null); // id or 'new'
  const [projectForm, setProjectForm] = useState({ title: '', tech: '', description: '', github: '' });

  const [editingInternship, setEditingInternship] = useState(null);
  const [internshipForm, setInternshipForm] = useState({ role: '', company: '', duration: '', description: '' });

  const [editingEducation, setEditingEducation] = useState(null);
  const [educationForm, setEducationForm] = useState({ degree: '', institution: '', board: '', duration: '', performance: '', description: '' });

  const [editingCertificate, setEditingCertificate] = useState(null);
  const [certificateForm, setCertificateForm] = useState({ title: '', issuer: '', year: '', imageUrl: '' });

  // Skills Editing
  const [newSkillGroupTitle, setNewSkillGroupTitle] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [addingSkillToIdx, setAddingSkillToIdx] = useState(-1);

  // Setup local data when portfolio data loads
  useEffect(() => {
    if (portfolioData) {
      setLocalData(JSON.parse(JSON.stringify(portfolioData)));
    }
  }, [portfolioData]);

  // Load messages if authenticated
  useEffect(() => {
    if (token) {
      fetchMessages();
    }
  }, [token]);

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
      } else {
        setLoginError(data.message || 'Invalid admin password.');
      }
    } catch (err) {
      setLoginError('Failed to connect to backend.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const response = await fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message inquiry?')) return;
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMessages(messages.filter(msg => msg.id !== id));
        showStatus('success', 'Inquiry deleted successfully.');
      } else {
        showStatus('danger', 'Failed to delete inquiry.');
      }
    } catch (err) {
      showStatus('danger', 'Network error.');
    }
  };

  const saveAllData = async (updatedData = localData) => {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      const res = await response.json();
      if (response.ok && res.success) {
        onUpdateData(updatedData);
        showStatus('success', 'Changes saved successfully and live on the website!');
      } else {
        showStatus('danger', res.message || 'Failed to save changes.');
      }
    } catch (error) {
      showStatus('danger', 'Network error. Please try again.');
    }
  };

  // Resume Upload Handler
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const res = await response.json();
      if (response.ok && res.success) {
        const updated = { ...localData };
        updated.profile.resumeUrl = res.resumeUrl;
        setLocalData(updated);
        onUpdateData(updated);
        showStatus('success', 'Resume PDF uploaded successfully!');
      } else {
        showStatus('danger', res.message || 'Upload failed.');
      }
    } catch (err) {
      showStatus('danger', 'Error uploading file.');
    } finally {
      setUploadingResume(false);
    }
  };

  // Profile Form Updates
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setLocalData({
      ...localData,
      profile: {
        ...localData.profile,
        [name]: value
      }
    });
  };

  // Projects logic
  const startProjectEdit = (project) => {
    if (project) {
      setEditingProject(project.id);
      setProjectForm({
        title: project.title,
        tech: project.tech.join(', '),
        description: project.description,
        github: project.github
      });
    } else {
      setEditingProject('new');
      setProjectForm({ title: '', tech: '', description: '', github: '' });
    }
  };

  const saveProject = () => {
    const techArray = projectForm.tech.split(',').map(t => t.trim()).filter(t => t);
    const updated = { ...localData };
    
    if (editingProject === 'new') {
      const newProj = {
        id: Date.now().toString(),
        title: projectForm.title,
        description: projectForm.description,
        tech: techArray,
        github: projectForm.github
      };
      updated.projects.push(newProj);
    } else {
      updated.projects = updated.projects.map(p => 
        p.id === editingProject 
          ? { ...p, title: projectForm.title, description: projectForm.description, tech: techArray, github: projectForm.github }
          : p
      );
    }
    
    setLocalData(updated);
    saveAllData(updated);
    setEditingProject(null);
  };

  const deleteProject = (id) => {
    if (!window.confirm('Delete this project?')) return;
    const updated = { ...localData };
    updated.projects = updated.projects.filter(p => p.id !== id);
    setLocalData(updated);
    saveAllData(updated);
  };

  // Internships logic
  const startInternshipEdit = (intern) => {
    if (intern) {
      setEditingInternship(intern.id);
      setInternshipForm({
        role: intern.role,
        company: intern.company,
        duration: intern.duration,
        description: intern.description
      });
    } else {
      setEditingInternship('new');
      setInternshipForm({ role: '', company: '', duration: '', description: '' });
    }
  };

  const saveInternship = () => {
    const updated = { ...localData };
    if (editingInternship === 'new') {
      const newItem = {
        id: Date.now().toString(),
        role: internshipForm.role,
        company: internshipForm.company,
        duration: internshipForm.duration,
        description: internshipForm.description
      };
      updated.internships.push(newItem);
    } else {
      updated.internships = updated.internships.map(item => 
        item.id === editingInternship 
          ? { ...item, role: internshipForm.role, company: internshipForm.company, duration: internshipForm.duration, description: internshipForm.description }
          : item
      );
    }
    setLocalData(updated);
    saveAllData(updated);
    setEditingInternship(null);
  };

  const deleteInternship = (id) => {
    if (!window.confirm('Delete this internship experience?')) return;
    const updated = { ...localData };
    updated.internships = updated.internships.filter(item => item.id !== id);
    setLocalData(updated);
    saveAllData(updated);
  };

  // Education logic
  const startEducationEdit = (edu) => {
    if (edu) {
      setEditingEducation(edu.id);
      setEducationForm({
        degree: edu.degree,
        institution: edu.institution,
        board: edu.board,
        duration: edu.duration,
        performance: edu.performance,
        description: edu.description
      });
    } else {
      setEditingEducation('new');
      setEducationForm({ degree: '', institution: '', board: '', duration: '', performance: '', description: '' });
    }
  };

  const saveEducation = () => {
    const updated = { ...localData };
    if (editingEducation === 'new') {
      const newItem = {
        id: Date.now().toString(),
        degree: educationForm.degree,
        institution: educationForm.institution,
        board: educationForm.board,
        duration: educationForm.duration,
        performance: educationForm.performance,
        description: educationForm.description
      };
      updated.education.push(newItem);
    } else {
      updated.education = updated.education.map(item => 
        item.id === editingEducation 
          ? { 
              ...item, 
              degree: educationForm.degree, 
              institution: educationForm.institution, 
              board: educationForm.board, 
              duration: educationForm.duration, 
              performance: educationForm.performance, 
              description: educationForm.description 
            }
          : item
      );
    }
    setLocalData(updated);
    saveAllData(updated);
    setEditingEducation(null);
  };

  const deleteEducation = (id) => {
    if (!window.confirm('Delete this education history?')) return;
    const updated = { ...localData };
    updated.education = updated.education.filter(item => item.id !== id);
    setLocalData(updated);
    saveAllData(updated);
  };

  // Certificates logic
  const startCertificateEdit = (cert) => {
    if (cert) {
      setEditingCertificate(cert.id);
      setCertificateForm({
        title: cert.title,
        issuer: cert.issuer,
        year: cert.year,
        imageUrl: cert.imageUrl
      });
    } else {
      setEditingCertificate('new');
      setCertificateForm({ title: '', issuer: '', year: '', imageUrl: '' });
    }
  };

  const saveCertificate = () => {
    const updated = { ...localData };
    if (editingCertificate === 'new') {
      const newItem = {
        id: Date.now().toString(),
        title: certificateForm.title,
        issuer: certificateForm.issuer,
        year: certificateForm.year,
        imageUrl: certificateForm.imageUrl
      };
      updated.certificates.push(newItem);
    } else {
      updated.certificates = updated.certificates.map(item => 
        item.id === editingCertificate 
          ? { ...item, title: certificateForm.title, issuer: certificateForm.issuer, year: certificateForm.year, imageUrl: certificateForm.imageUrl }
          : item
      );
    }
    setLocalData(updated);
    saveAllData(updated);
    setEditingCertificate(null);
  };

  const deleteCertificate = (id) => {
    if (!window.confirm('Delete this certificate?')) return;
    const updated = { ...localData };
    updated.certificates = updated.certificates.filter(item => item.id !== id);
    setLocalData(updated);
    saveAllData(updated);
  };

  // Services/Pricing updates
  const handleServiceChange = (serviceId, field, value) => {
    const updated = { ...localData };
    updated.services = updated.services.map(s => {
      if (s.id === serviceId) {
        if (field === 'features') {
          return { ...s, features: value.split(',').map(f => f.trim()).filter(f => f) };
        }
        return { ...s, [field]: value };
      }
      return s;
    });
    setLocalData(updated);
  };

  // Skills handlers
  const handleAddSkillGroup = (e) => {
    e.preventDefault();
    if (!newSkillGroupTitle.trim()) return;
    const updated = { ...localData };
    updated.skills.push({
      category: newSkillGroupTitle,
      items: []
    });
    setLocalData(updated);
    saveAllData(updated);
    setNewSkillGroupTitle('');
  };

  const handleAddSkillToGroup = (e, groupIdx) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const updated = { ...localData };
    updated.skills[groupIdx].items.push(newSkillName.trim());
    setLocalData(updated);
    saveAllData(updated);
    setNewSkillName('');
    setAddingSkillToIdx(-1);
  };

  const handleDeleteSkillGroup = (groupIdx) => {
    if (!window.confirm('Delete this skill category?')) return;
    const updated = { ...localData };
    updated.skills = updated.skills.filter((_, idx) => idx !== groupIdx);
    setLocalData(updated);
    saveAllData(updated);
  };

  const handleDeleteSkill = (groupIdx, skillIdx) => {
    const updated = { ...localData };
    updated.skills[groupIdx].items = updated.skills[groupIdx].items.filter((_, idx) => idx !== skillIdx);
    setLocalData(updated);
    saveAllData(updated);
  };

  // Unauthenticated wrapper
  if (!token) {
    return (
      <div className="login-wrapper">
        <div className="glass-card login-card">
          <h2>Admin Access</h2>
          <p>Verify ownership to edit portfolio requirements and prices.</p>
          
          {loginError && (
            <div className="alert-banner alert-danger">
              <span>{loginError}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="adminPassword">Password</label>
              <input
                type="password"
                id="adminPassword"
                className="form-control"
                placeholder="Enter password (default: admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!localData) {
    return (
      <div className="container" style={{ padding: '8rem 0', textalign: 'center' }}>
        <p>Loading Dashboard Configuration...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Admin Title Banner */}
      <div className="admin-header">
        <div className="container admin-title-row">
          <div>
            <span className="section-tag" style={{ marginBottom: '0.25rem' }}>Dashboard</span>
            <h1 style={{ fontSize: '2.25rem' }}>Admin Control Panel</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ borderRadius: '8px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="container">
        {/* Save Banner */}
        {status.message && (
          <div className={`alert-banner alert-${status.type}`} style={{ margin: '2rem 0 0 0' }}>
            <span>{status.message}</span>
            <button onClick={() => setStatus({ type: '', message: '' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="admin-tabs">
          <button onClick={() => setActiveTab('profile')} className={`admin-tab ${activeTab === 'profile' ? 'active' : ''}`}>
            <User size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Profile
          </button>
          <button onClick={() => setActiveTab('resume')} className={`admin-tab ${activeTab === 'resume' ? 'active' : ''}`}>
            <FileText size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Resume
          </button>
          <button onClick={() => setActiveTab('skills')} className={`admin-tab ${activeTab === 'skills' ? 'active' : ''}`}>
            <Code size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Skills
          </button>
          <button onClick={() => setActiveTab('projects')} className={`admin-tab ${activeTab === 'projects' ? 'active' : ''}`}>
            <Settings size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Projects
          </button>
          <button onClick={() => setActiveTab('education')} className={`admin-tab ${activeTab === 'education' ? 'active' : ''}`}>
            <GraduationCap size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Education
          </button>
          <button onClick={() => setActiveTab('internships')} className={`admin-tab ${activeTab === 'internships' ? 'active' : ''}`}>
            <Briefcase size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Internships
          </button>
          <button onClick={() => setActiveTab('services')} className={`admin-tab ${activeTab === 'services' ? 'active' : ''}`}>
            <Save size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Services & Pricing
          </button>
          <button onClick={() => setActiveTab('certificates')} className={`admin-tab ${activeTab === 'certificates' ? 'active' : ''}`}>
            <Award size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Certificates
          </button>
          <button onClick={() => { setActiveTab('messages'); fetchMessages(); }} className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}>
            <MessageSquare size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Inquiries ({messages.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="admin-content">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="glass-card">
              <div className="admin-card-header">
                <h2>Edit Personal Information</h2>
                <button onClick={() => saveAllData()} className="btn btn-primary btn-sm">
                  <Save size={16} /> Save Profile
                </button>
              </div>
              <div className="admin-grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={localData.profile.name || ''}
                    onChange={handleProfileChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Title Tagline</label>
                  <input
                    type="text"
                    name="title"
                    value={localData.profile.title || ''}
                    onChange={handleProfileChange}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="admin-grid-2">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={localData.profile.email || ''}
                    onChange={handleProfileChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn Profile Url (e.g. linkedin.com/in/...)</label>
                  <input
                    type="text"
                    name="linkedin"
                    value={localData.profile.linkedin || ''}
                    onChange={handleProfileChange}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>GitHub Profile Link</label>
                <input
                  type="text"
                  name="github"
                  value={localData.profile.github || ''}
                  onChange={handleProfileChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>About Bio</label>
                <textarea
                  name="about"
                  value={localData.profile.about || ''}
                  onChange={handleProfileChange}
                  className="form-control"
                  style={{ minHeight: '150px' }}
                ></textarea>
              </div>
            </div>
          )}

          {/* RESUME TAB */}
          {activeTab === 'resume' && (
            <div className="glass-card">
              <div className="admin-card-header">
                <h2>Manage Resume Settings</h2>
                <button onClick={() => saveAllData()} className="btn btn-primary btn-sm">
                  <Save size={16} /> Save Preference
                </button>
              </div>
              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label>Resume Download URL (External Drive, LinkedIn, etc.)</label>
                <input
                  type="text"
                  name="resumeUrl"
                  value={localData.profile.resumeUrl || ''}
                  onChange={handleProfileChange}
                  className="form-control"
                  placeholder="https://drive.google.com/..."
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  If you upload a file below, it will override this URL with the local server path.
                </span>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingGet: '2.5rem', paddingTop: '2rem' }}>
                <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '1rem' }}>
                  Or Upload Resume PDF/Word Document
                </label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="file-upload-input"
                    disabled={uploadingResume}
                  />
                  <div className="file-upload-trigger">
                    <Upload size={24} className="text-gradient" />
                    <span>
                      {uploadingResume ? 'Uploading File...' : 'Drag and drop or click to upload PDF resume'}
                    </span>
                  </div>
                </div>
                {localData.profile.resumeUrl && localData.profile.resumeUrl.startsWith('/uploads/') && (
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.9rem' }}>Current active file: <strong>{localData.profile.resumeUrl}</strong></span>
                    <a href={localData.profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="project-link" style={{ fontSize: '0.85rem' }}>View live file</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div>
              {/* Add category */}
              <div className="glass-card" style={{ marginBottom: '3rem' }}>
                <h3>Add Skill Category</h3>
                <form onSubmit={handleAddSkillGroup} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Cloud & DevOps"
                    value={newSkillGroupTitle}
                    onChange={(e) => setNewSkillGroupTitle(e.target.value)}
                    style={{ flexGrow: 1 }}
                  />
                  <button type="submit" className="btn btn-primary">
                    <Plus size={16} /> Add Category
                  </button>
                </form>
              </div>

              {/* Edit existing categories */}
              <div className="skills-grid">
                {localData.skills.map((skillGroup, groupIdx) => (
                  <div key={groupIdx} className="glass-card skills-card" style={{ position: 'relative' }}>
                    <button 
                      onClick={() => handleDeleteSkillGroup(groupIdx)} 
                      style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                    </button>
                    <h3>{skillGroup.category}</h3>
                    
                    <div className="skill-tags" style={{ marginBottom: '1.5rem' }}>
                      {skillGroup.items.map((skill, skillIdx) => (
                        <span key={skillIdx} className="skill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {skill}
                          <button 
                            onClick={() => handleDeleteSkill(groupIdx, skillIdx)} 
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {addingSkillToIdx === groupIdx ? (
                      <form onSubmit={(e) => handleAddSkillToGroup(e, groupIdx)} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Skill name"
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          autoFocus
                          required
                        />
                        <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
                          Add
                        </button>
                        <button type="button" onClick={() => setAddingSkillToIdx(-1)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <button onClick={() => { setAddingSkillToIdx(groupIdx); setNewSkillName(''); }} className="btn btn-secondary btn-sm" style={{ width: '100%', borderRadius: '8px', padding: '0.5rem' }}>
                        <Plus size={14} /> Add Skill
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div>
              {editingProject ? (
                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                  <div className="admin-card-header">
                    <h2>{editingProject === 'new' ? 'Add Project' : 'Edit Project'}</h2>
                    <div className="admin-actions">
                      <button onClick={saveProject} className="btn btn-primary btn-sm">
                        <Save size={16} /> Save Project
                      </button>
                      <button onClick={() => setEditingProject(null)} className="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div className="admin-grid-2">
                    <div className="form-group">
                      <label>Project Title</label>
                      <input
                        type="text"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Tech Stack (Comma-separated, e.g. React, Node.js)</label>
                      <input
                        type="text"
                        value={projectForm.tech}
                        onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                        className="form-control"
                        placeholder="React, Node.js, OpenAI API"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>GitHub Repository URL</label>
                    <input
                      type="text"
                      value={projectForm.github}
                      onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })}
                      className="form-control"
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Project Description</label>
                    <textarea
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      className="form-control"
                      style={{ minHeight: '120px' }}
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="glass-card">
                  <div className="admin-card-header">
                    <h2>Manage Project Showcases</h2>
                    <button onClick={() => startProjectEdit(null)} className="btn btn-primary btn-sm">
                      <Plus size={16} /> Add Project
                    </button>
                  </div>
                  <div className="admin-list">
                    {localData.projects.map((project) => (
                      <div key={project.id} className="admin-list-item">
                        <div className="admin-list-item-info">
                          <span className="admin-list-item-title">{project.title}</span>
                          <span className="admin-list-item-sub">{project.tech.join(' | ')}</span>
                        </div>
                        <div className="admin-actions">
                          <button onClick={() => startProjectEdit(project)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px' }} title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteProject(project.id)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', color: '#ef4444' }} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EDUCATION TAB */}
          {activeTab === 'education' && (
            <div>
              {editingEducation ? (
                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                  <div className="admin-card-header">
                    <h2>{editingEducation === 'new' ? 'Add Education' : 'Edit Education'}</h2>
                    <div className="admin-actions">
                      <button onClick={saveEducation} className="btn btn-primary btn-sm">
                        <Save size={16} /> Save
                      </button>
                      <button onClick={() => setEditingEducation(null)} className="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div className="admin-grid-2">
                    <div className="form-group">
                      <label>Degree / Qualification</label>
                      <input
                        type="text"
                        value={educationForm.degree}
                        onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                        className="form-control"
                        placeholder="e.g. BTech in Computer Science"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Institution / School Name</label>
                      <input
                        type="text"
                        value={educationForm.institution}
                        onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                        className="form-control"
                        placeholder="e.g. Lovely Professional University"
                        required
                      />
                    </div>
                  </div>
                  <div className="admin-grid-2">
                    <div className="form-group">
                      <label>Board / University (e.g. CBSE, State Board)</label>
                      <input
                        type="text"
                        value={educationForm.board}
                        onChange={(e) => setEducationForm({ ...educationForm, board: e.target.value })}
                        className="form-control"
                        placeholder="CBSE"
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration / Years</label>
                      <input
                        type="text"
                        value={educationForm.duration}
                        onChange={(e) => setEducationForm({ ...educationForm, duration: e.target.value })}
                        className="form-control"
                        placeholder="e.g. 2023 - 2027"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Performance Grade / Percentage (e.g. 89% or CGPA 8.5/10)</label>
                    <input
                      type="text"
                      value={educationForm.performance}
                      onChange={(e) => setEducationForm({ ...educationForm, performance: e.target.value })}
                      className="form-control"
                      placeholder="e.g. 92%"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description Details</label>
                    <textarea
                      value={educationForm.description}
                      onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })}
                      className="form-control"
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="glass-card">
                  <div className="admin-card-header">
                    <h2>Manage Education Timeline</h2>
                    <button onClick={() => startEducationEdit(null)} className="btn btn-primary btn-sm">
                      <Plus size={16} /> Add Timeline Item
                    </button>
                  </div>
                  <div className="admin-list">
                    {localData.education.map((edu) => (
                      <div key={edu.id} className="admin-list-item">
                        <div className="admin-list-item-info">
                          <span className="admin-list-item-title">{edu.degree}</span>
                          <span className="admin-list-item-sub">{edu.institution} ({edu.duration}) · <strong>{edu.performance}</strong></span>
                        </div>
                        <div className="admin-actions">
                          <button onClick={() => startEducationEdit(edu)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteEducation(edu.id)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', color: '#ef4444' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INTERNSHIPS TAB */}
          {activeTab === 'internships' && (
            <div>
              {editingInternship ? (
                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                  <div className="admin-card-header">
                    <h2>{editingInternship === 'new' ? 'Add Experience' : 'Edit Experience'}</h2>
                    <div className="admin-actions">
                      <button onClick={saveInternship} className="btn btn-primary btn-sm">
                        <Save size={16} /> Save Experience
                      </button>
                      <button onClick={() => setEditingInternship(null)} className="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div className="admin-grid-2">
                    <div className="form-group">
                      <label>Job Role / Title</label>
                      <input
                        type="text"
                        value={internshipForm.role}
                        onChange={(e) => setInternshipForm({ ...internshipForm, role: e.target.value })}
                        className="form-control"
                        placeholder="e.g. Frontend Intern"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={internshipForm.company}
                        onChange={(e) => setInternshipForm({ ...internshipForm, company: e.target.value })}
                        className="form-control"
                        placeholder="e.g. Startup Inc."
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Duration / Duration Range</label>
                    <input
                      type="text"
                      value={internshipForm.duration}
                      onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })}
                      className="form-control"
                      placeholder="e.g. May 2025 - July 2025"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description & Contributions</label>
                    <textarea
                      value={internshipForm.description}
                      onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                      className="form-control"
                      style={{ minHeight: '120px' }}
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="glass-card">
                  <div className="admin-card-header">
                    <h2>Manage Experience & Internships</h2>
                    <button onClick={() => startInternshipEdit(null)} className="btn btn-primary btn-sm">
                      <Plus size={16} /> Add Internship
                    </button>
                  </div>
                  <div className="admin-list">
                    {localData.internships.length > 0 ? (
                      localData.internships.map((intern) => (
                        <div key={intern.id} className="admin-list-item">
                          <div className="admin-list-item-info">
                            <span className="admin-list-item-title">{intern.role}</span>
                            <span className="admin-list-item-sub">{intern.company} ({intern.duration})</span>
                          </div>
                          <div className="admin-actions">
                            <button onClick={() => startInternshipEdit(intern)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => deleteInternship(intern.id)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', color: '#ef4444' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-items-placeholder" style={{ padding: '2.5rem' }}>
                        No experience or internship history found. Use the add button to log one.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="glass-card">
              <div className="admin-card-header">
                <h2>Edit Service Prices & Structures</h2>
                <button onClick={() => saveAllData()} className="btn btn-primary btn-sm">
                  <Save size={16} /> Save Prices
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {localData.services.map((service, index) => (
                  <div key={service.id} style={{ borderBottom: index < localData.services.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: index < localData.services.length - 1 ? '2.5rem' : '0' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: service.popular ? 'var(--primary)' : 'inherit' }}>
                      {service.title} {service.popular && '(Most Popular Plan)'}
                    </h3>
                    <div className="admin-grid-2">
                      <div className="form-group">
                        <label>Starting Price (₹ - number format)</label>
                        <input
                          type="text"
                          value={service.price}
                          onChange={(e) => handleServiceChange(service.id, 'price', e.target.value)}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label>Delivery Timeline</label>
                        <input
                          type="text"
                          value={service.delivery}
                          onChange={(e) => handleServiceChange(service.id, 'delivery', e.target.value)}
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Features list (Comma-separated)</label>
                      <input
                        type="text"
                        value={service.features.join(', ')}
                        onChange={(e) => handleServiceChange(service.id, 'features', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Service Description</label>
                      <textarea
                        value={service.description}
                        onChange={(e) => handleServiceChange(service.id, 'description', e.target.value)}
                        className="form-control"
                        style={{ minHeight: '80px' }}
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CERTIFICATES TAB */}
          {activeTab === 'certificates' && (
            <div>
              {editingCertificate ? (
                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                  <div className="admin-card-header">
                    <h2>{editingCertificate === 'new' ? 'Add Certificate' : 'Edit Certificate'}</h2>
                    <div className="admin-actions">
                      <button onClick={saveCertificate} className="btn btn-primary btn-sm">
                        <Save size={16} /> Save Certificate
                      </button>
                      <button onClick={() => setEditingCertificate(null)} className="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div className="admin-grid-2">
                    <div className="form-group">
                      <label>Certificate Title</label>
                      <input
                        type="text"
                        value={certificateForm.title}
                        onChange={(e) => setCertificateForm({ ...certificateForm, title: e.target.value })}
                        className="form-control"
                        placeholder="e.g. MERN Stack Development"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Issuer Authority</label>
                      <input
                        type="text"
                        value={certificateForm.issuer}
                        onChange={(e) => setCertificateForm({ ...certificateForm, issuer: e.target.value })}
                        className="form-control"
                        placeholder="e.g. Apna College"
                        required
                      />
                    </div>
                  </div>
                  <div className="admin-grid-2">
                    <div className="form-group">
                      <label>Year Issued</label>
                      <input
                        type="text"
                        value={certificateForm.year}
                        onChange={(e) => setCertificateForm({ ...certificateForm, year: e.target.value })}
                        className="form-control"
                        placeholder="e.g. 2024"
                      />
                    </div>
                    <div className="form-group">
                      <label>Card Image URL (or Unsplash tech image)</label>
                      <input
                        type="text"
                        value={certificateForm.imageUrl}
                        onChange={(e) => setCertificateForm({ ...certificateForm, imageUrl: e.target.value })}
                        className="form-control"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card">
                  <div className="admin-card-header">
                    <h2>Manage Verification Certificates</h2>
                    <button onClick={() => startCertificateEdit(null)} className="btn btn-primary btn-sm">
                      <Plus size={16} /> Add Certificate
                    </button>
                  </div>
                  <div className="admin-list">
                    {localData.certificates.map((cert) => (
                      <div key={cert.id} className="admin-list-item">
                        <div className="admin-list-item-info">
                          <span className="admin-list-item-title">{cert.title}</span>
                          <span className="admin-list-item-sub">{cert.issuer} ({cert.year})</span>
                        </div>
                        <div className="admin-actions">
                          <button onClick={() => startCertificateEdit(cert)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteCertificate(cert.id)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', color: '#ef4444' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MESSAGES / INQUIRIES TAB */}
          {activeTab === 'messages' && (
            <div className="glass-card">
              <div className="admin-card-header">
                <h2>Customer Project Enquiries</h2>
                <button onClick={fetchMessages} className="btn btn-secondary btn-sm" disabled={loadingMessages}>
                  Refresh
                </button>
              </div>
              {loadingMessages ? (
                <p>Loading inquiries...</p>
              ) : messages.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {messages.map((msg) => (
                    <div key={msg.id} className="glass-card message-card" style={{ padding: '1.75rem', border: '1px solid var(--border)' }}>
                      <div className="message-header">
                        <div className="message-meta">
                          <strong>{msg.name}</strong>
                          <a href={`mailto:${msg.email}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{msg.email}</a>
                          <span>Phone: {msg.phone}</span>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          <span>{new Date(msg.createdAt).toLocaleString()}</span>
                          <button onClick={() => deleteMessage(msg.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                      <div className="admin-grid-2" style={{ backgroundColor: 'rgba(255,255,255,0.01)', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <div><strong>Service Needed:</strong> {msg.projectType}</div>
                        <div><strong>Timeline Requested:</strong> {msg.timeline}</div>
                        <div><strong>Est. Budget:</strong> {msg.budget}</div>
                      </div>
                      <div className="message-body">
                        <strong>Project Details:</strong>
                        <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{msg.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-items-placeholder" style={{ padding: '3rem' }}>
                  No customer request submissions received yet.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
