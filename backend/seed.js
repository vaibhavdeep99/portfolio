require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const portfolioSchema = new mongoose.Schema({
  profile: Object,
  skills: Array,
  projects: Array,
  education: Array,
  internships: Array,
  services: Array,
  certificates: Array
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

const data = {
  profile: {
    name: "Vaibhav",
    title: "Full Stack Developer",
    bio: "Portfolio Website"
  },
  skills: ["HTML", "CSS", "JavaScript"],
  projects: [],
  education: [],
  internships: [],
  services: [],
  certificates: []
};

async function seed() {
  await Portfolio.deleteMany({});
  await Portfolio.create(data);
  console.log("✅ Data Seeded Successfully");
  process.exit();
}

seed();
