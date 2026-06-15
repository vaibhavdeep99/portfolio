require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vaibhavdeepsrivastava12345_db_user:VAIBHAV966089@cluster0.bo23akz.mongodb.net/vaibhav-portfolio?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => { console.error('❌ Error:', err.message); process.exit(1); });

const portfolioSchema = new mongoose.Schema({
  profile: { type: Object, default: {} },
  skills: { type: Array, default: [] },
  projects: { type: Array, default: [] },
  education: { type: Array, default: [] },
  internships: { type: Array, default: [] },
  services: { type: Array, default: [] },
  certificates: { type: Array, default: [] }
}, { timestamps: true });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

const portfolioData = {
  profile: {
    name: "Vaibhav Deep Srivastava",
    title: "BTech Computer Science Student | MERN Stack Developer",
    email: "vaibhavdeepsrivastava12345@gmail.com",
    linkedin: "linkedin.com/in/vaibhav-deep-srivastava-121673323",
    github: "https://github.com/vaibhav-deep-srivastava",
    about: "I am a BTech 3rd year Computer Science student with a strong command of Data Structures & Algorithms (DSA), System Design, and Fullstack Web Development. I create clean, robust, and premium web designs and applications for clients and users.",
    resumeUrl: ""
  },
  skills: [
    {
      category: "MERN Stack Web Development",
      items: ["MongoDB", "Express.js", "React.js", "Node.js"]
    },
    {
      category: "Frontend",
      items: ["HTML", "CSS", "JavaScript", "React"]
    },
    {
      category: "Backend",
      items: ["NodeJS", "Express", "MongoDB", "SQL"]
    },
    {
      category: "Core CS & Design",
      items: ["Data Structures & Algorithms (DSA)", "System Design", "Operating System", "DBMS"]
    }
  ],
  projects: [
    {
      id: "1",
      title: "ChatGPT Clone",
      description: "A fully functional AI chatbot built on top of the OpenAI API with streaming responses, chat history, and prompt presets.",
      tech: ["React", "Node.js", "OpenAI API"],
      github: "https://github.com/vaibhav-deep-srivastava/chatgpt-clone",
      link: "",
      image: ""
    },
    {
      id: "2",
      title: "LinkedIn Clone",
      description: "MERN-stack social network with authentication, posts, likes, comments, real-time feed, and connection requests.",
      tech: ["MongoDB", "Express", "React", "Node.js"],
      github: "https://github.com/vaibhav-deep-srivastava/linkedin-clone",
      link: "",
      image: ""
    },
    {
      id: "3",
      title: "GitHub Clone",
      description: "A full stack version control system project implementing core GitHub features with repository management.",
      tech: ["Node.js", "MongoDB", "HTML", "CSS", "JavaScript"],
      github: "https://github.com/vaibhav-deep-srivastava/github-clone",
      link: "",
      image: ""
    }
  ],
  education: [
    {
      id: "1",
      degree: "BTech in Computer Science",
      institution: "Axis Institute Of Technology & Management, Kanpur",
      board: "A.P.J Abdul Kalam University, Lucknow",
      duration: "2024 - 2028",
      performance: "CGPA 8.5/10",
      description: "Currently in 2nd year. Specializing in DSA, System Design, and Fullstack Web Development."
    },
    {
      id: "2",
      degree: "Class 12th (Senior Secondary)",
      institution: "Adarsh Vidya Mandir Geetapuram, Unnao, Uttar Pradesh",
      board: "CBSE",
      duration: "2022 - 2023",
      performance: "84%",
      description: "PCM with Computer Science"
    },
    {
      id: "3",
      degree: "Class 10th (Secondary)",
      institution: "Adarsh Vidya Mandir Geetapuram, Unnao, Uttar Pradesh",
      board: "CBSE",
      duration: "2020 - 2021",
      performance: "92.3%",
      description: "General Subjects"
    }
  ],
  internships: [],
  services: [
    {
      id: "1",
      title: "Website Development",
      description: "Marketing sites, landing pages and product websites with modern design and performance.",
      price: "15,000",
      delivery: "10 days delivery",
      features: ["Responsive design", "SEO ready", "CMS optional", "1 month support"],
      popular: false
    },
    {
      id: "2",
      title: "Fullstack Web App",
      description: "MERN stack web applications with authentication, dashboard, payments and API integrations.",
      price: "45,000",
      delivery: "21 days delivery",
      features: ["MERN stack", "Auth & roles", "Database & APIs", "Deployment included"],
      popular: true
    },
    {
      id: "3",
      title: "UI/UX Design",
      description: "Pixel-perfect Figma designs and design systems tailored to your brand.",
      price: "12,000",
      delivery: "7 days delivery",
      features: ["Figma source", "Design system", "Prototype", "2 revisions"],
      popular: false
    }
  ],
  certificates: [
    {
      id: "1",
      title: "Data Structures & Algorithms",
      issuer: "Apna College",
      year: "2024",
      imageUrl: "https://images.unsplash.com/photo-1516116211223-5c359a36298a?w=600&auto=format&fit=crop&q=60"
    },
    {
      id: "2",
      title: "MERN Stack Development",
      issuer: "Online Certification",
      year: "2024",
      imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=60"
    }
  ]
};

async function seed() {
  try {
    await Portfolio.deleteMany({});
    console.log('🗑️  Cleared old data');
    
    const result = await Portfolio.create(portfolioData);
    console.log('✅ Portfolio data seeded successfully!');
    console.log('📋 ID:', result._id);
    console.log('👤 Name:', result.profile.name);
    console.log('🎯 Skills categories:', result.skills.length);
    console.log('💼 Projects:', result.projects.length);
    console.log('🎓 Education:', result.education.length);
    console.log('🛠️ Services:', result.services.length);
    console.log('🏆 Certificates:', result.certificates.length);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
