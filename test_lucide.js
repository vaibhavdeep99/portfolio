const lucide = require('./frontend/node_modules/lucide-react');
console.log('Keys matching twit:', Object.keys(lucide).filter(k => k.toLowerCase().includes('twit')));
console.log('Keys matching face:', Object.keys(lucide).filter(k => k.toLowerCase().includes('face')));
console.log('Keys matching insta:', Object.keys(lucide).filter(k => k.toLowerCase().includes('insta')));


