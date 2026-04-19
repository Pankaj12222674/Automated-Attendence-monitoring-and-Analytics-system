const fs = require('fs');
const path = require('path');
const teacherPath = 'C:/Web Technology Things/cap/attendance-system/frontend/src/pages/teacher';
fs.readdirSync(teacherPath).forEach(file => {
  if (file.endsWith('.jsx')) {
    let p = path.join(teacherPath, file);
    let data = fs.readFileSync(p, 'utf8');
    let original = data;
    data = data.replace(/className= overflow-hidden relative\"min-h-screen/g, 'className=\"overflow-hidden relative min-h-screen');
    if (original !== data) {
      fs.writeFileSync(p, data);
      console.log('Fixed', file);
    }
  }
});