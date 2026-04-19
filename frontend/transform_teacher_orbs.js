const fs = require('fs');
const path = require('path');

const teacherPath = 'C:/Web Technology Things/cap/attendance-system/frontend/src/pages/teacher';
const animOrbs = `<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-slow" /><div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-delayed" /><div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none animate-float-slow" />`;

const transformLine = (p) => {
  let data = fs.readFileSync(p, 'utf8');
  let original = data;

  // Insert orbs into any `min-h-screen bg-slate-950` div that doesn't already have `<div className="absolute` right after it
  data = data.replace(/(<div className="min-h-screen bg-slate-950[^>]*">)(?!\s*<div className="absolute)/g, (match, p1) => {
    // Make sure it has overflow-hidden relative
    let updatedDiv = p1;
    if (!updatedDiv.includes('overflow-hidden relative')) {
       updatedDiv = updatedDiv.replace('"', ' overflow-hidden relative"');
    }
    return updatedDiv + '\n      ' + animOrbs;
  });

  if (original !== data) {
    fs.writeFileSync(p, data);
    console.log("Fixed orbs in ", path.basename(p));
  }
}

fs.readdirSync(teacherPath).forEach(file => {
  if (file.endsWith('.jsx')) transformLine(path.join(teacherPath, file));
});
