const fs = require('fs');

const transformUI = (p) => {
  if (!fs.existsSync(p)) return;
  let data = fs.readFileSync(p, 'utf8');

  data = data.replace(/bg-\[#0b0f19\]/g, 'bg-slate-950');
  
  data = data.replace(/bg-slate-900 border-b border-slate-800 sticky top-0/g, 'bg-slate-900/70 backdrop-blur-2xl border-b border-slate-700/50 sticky top-0');
  
  data = data.replace(/bg-slate-900 border border-slate-800/g, 'bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:border-cyan-500/30 transition-colors duration-500');
  
  data = data.replace(/bg-slate-950 border border-slate-800/g, 'bg-slate-950/70 border border-slate-700/50 shadow-inner');

  data = data.replace(/bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl/g, 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]');
  
  data = data.replace(/bg-indigo-600 hover:bg-indigo-700/g, 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]');
  
  data = data.replace(/text-indigo-400/g, 'text-cyan-400');
  data = data.replace(/text-indigo-500/g, 'text-cyan-400');
  data = data.replace(/border-indigo-500\/20/g, 'border-cyan-500/30');
  data = data.replace(/border-indigo-500\/30/g, 'border-cyan-500/40');
  data = data.replace(/bg-indigo-500\/10/g, 'bg-cyan-500/10');
  data = data.replace(/border-indigo-500 border-t-indigo-500/g, 'border-cyan-500/20 border-t-cyan-500');
  data = data.replace(/border-indigo-200/g, 'border-cyan-500/20');
  data = data.replace(/text-indigo-200/g, 'text-cyan-100');
  data = data.replace(/from-indigo-600 to-violet-600/g, 'from-cyan-600 to-blue-600');
  data = data.replace(/from-indigo-500\/20 to-violet-500\/10/g, 'from-cyan-500/20 to-blue-600/10');
  data = data.replace(/hover:border-indigo-500\/50/g, 'hover:border-cyan-500/50');
  data = data.replace(/hover:border-indigo-500\/30/g, 'hover:border-cyan-500/30');
  data = data.replace(/text-violet-400/g, 'text-blue-400');
  data = data.replace(/border-violet-500\/20/g, 'border-blue-500/30');
  data = data.replace(/bg-violet-500\/10/g, 'bg-blue-500/10');
  data = data.replace(/from-slate-900 to-\[#12182b\]/g, 'from-slate-900/60 to-slate-950/60 backdrop-blur-2xl border-slate-700/50');
  
  // Add animation orbs to the parent container if it is not there
  const animOrbs = `<div className=\"absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-slow\" /><div className=\"absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-delayed\" /><div className=\"absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none animate-float-slow\" />`;
  
  if (data.includes('min-h-screen bg-slate-950 text-slate-200 pb-20 font-sans') && !data.includes('animate-float-slow') && !data.includes('bg-[#0b0f19]')) {
    data = data.replace(
      'className=\"min-h-screen bg-slate-950 text-slate-200 pb-20 font-sans\">',
      'className=\"min-h-screen bg-slate-950 text-slate-200 pb-20 font-sans selection:bg-cyan-500/30 overflow-hidden relative\">\n      ' + animOrbs
    );
  }

  if (data.includes('min-h-screen bg-[#0b0f19] text-slate-200 pb-20 font-sans') && !data.includes('animate-float-slow')) {
     data = data.replace(
      'className=\"min-h-screen bg-[#0b0f19] text-slate-200 pb-20 font-sans\">',
      'className=\"min-h-screen bg-slate-950 text-slate-200 pb-20 font-sans selection:bg-cyan-500/30 overflow-hidden relative\">\n      ' + animOrbs
    );
  }

  fs.writeFileSync(p, data);
}

const files = [
  'C:/Web Technology Things/cap/attendance-system/frontend/src/pages/student/Assignments.jsx',
  'C:/Web Technology Things/cap/attendance-system/frontend/src/pages/student/Bursar.jsx',
  'C:/Web Technology Things/cap/attendance-system/frontend/src/pages/student/SubjectDetails.jsx',
  'C:/Web Technology Things/cap/attendance-system/frontend/src/pages/student/StudentQRScanner.jsx'
];

files.forEach(transformUI);
console.log('Advanced UI applied to Student Modules!');
