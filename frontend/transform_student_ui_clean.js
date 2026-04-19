const fs = require('fs');

const transformUI = (p) => {
  if (!fs.existsSync(p)) return;
  let data = fs.readFileSync(p, 'utf8');

  data = data.replace(/indigo-[0-9]{3}/g, (match) => {
    return 'cyan-' + match.split('-')[1];
  });
  data = data.replace(/violet-[0-9]{3}/g, (match) => {
    return 'blue-' + match.split('-')[1];
  });

  fs.writeFileSync(p, data);
}

const files = [
  'C:/Web Technology Things/cap/attendance-system/frontend/src/pages/student/Assignments.jsx',
  'C:/Web Technology Things/cap/attendance-system/frontend/src/pages/student/Bursar.jsx',
  'C:/Web Technology Things/cap/attendance-system/frontend/src/pages/student/SubjectDetails.jsx',
  'C:/Web Technology Things/cap/attendance-system/frontend/src/pages/student/StudentQRScanner.jsx'
];

files.forEach(transformUI);
console.log('Advance UI deep clean complete!');