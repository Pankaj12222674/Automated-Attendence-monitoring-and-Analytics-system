const fs = require('fs');
const path = require('path');

const teacherPath = 'C:/Web Technology Things/cap/attendance-system/frontend/src/pages/teacher';

const transformUI = (p) => {
  let data = fs.readFileSync(p, 'utf8');

  // Replace old base backgrounds
  data = data.replace(/bg-\[#0b0f19\]/g, 'bg-slate-950');
  data = data.replace(/bg-\[#0b0f1a\]/g, 'bg-slate-950');
  
  data = data.replace(/bg-\[#111827\]\/95/g, 'bg-slate-900/70');
  data = data.replace(/bg-\[#111827\]/g, 'bg-slate-900/40 backdrop-blur-xl border border-slate-700/50');
  data = data.replace(/bg-\[#1e293b\]/g, 'bg-slate-900/40 backdrop-blur-xl border border-slate-700/50');

  // Add more glassmorphism
  data = data.replace(/bg-slate-900 border-b border-slate-800 sticky top-0/g, 'bg-slate-900/70 backdrop-blur-2xl border-b border-slate-700/50 sticky top-0');
  data = data.replace(/bg-slate-900 border border-slate-800/g, 'bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl hover:border-cyan-500/30 transition-colors duration-500');
  data = data.replace(/bg-slate-950 border border-slate-800/g, 'bg-slate-950/70 border border-slate-700/50 shadow-inner');

  // Gradients for buttons
  data = data.replace(/bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl/g, 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]');
  data = data.replace(/bg-indigo-600 hover:bg-indigo-700/g, 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]');

  // Replace default flat indigo and violet colours
  data = data.replace(/indigo-([0-9]{3})/g, (match, p1) => 'cyan-' + p1);
  data = data.replace(/violet-([0-9]{3})/g, (match, p1) => 'blue-' + p1);

  // Apply orbs wrapper if it hasn't been added and wrap min hr screens.
  const animOrbs = `<div className=\"absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-slow\" /><div className=\"absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none animate-float-delayed\" /><div className=\"absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none animate-float-slow\" />`;
  
  if (data.includes('min-h-screen bg-slate-950 flex') && !data.includes('animate-float-slow')) {
    data = data.replace('min-h-screen bg-slate-950 flex', 'min-h-screen bg-slate-950 flex overflow-hidden relative');
    data = data.replace(/(className=\"min-h-screen bg-slate-950 flex overflow-hidden relative[^\"]*\")>/, `$1>\n      ${animOrbs}`);
  } else if (data.includes('min-h-screen bg-slate-950') && !data.includes('animate-float-slow')) {
    if (!data.includes('overflow-hidden relative')) {
      data = data.replace('min-h-screen bg-slate-950', 'min-h-screen bg-slate-950 overflow-hidden relative');
    }
    data = data.replace(/(className=\"min-h-screen bg-slate-950[^\"]*\")>/, `$1>\n      ${animOrbs}`);
  }

  // Also replace `hover:bg-white/5` with something like `hover:bg-slate-800/50` for table hover
  data = data.replace(/hover:bg-white\/5/g, 'hover:bg-cyan-500/10');

  fs.writeFileSync(p, data);
};

fs.readdirSync(teacherPath).forEach(file => {
  if (file.endsWith('.jsx')) {
    transformUI(path.join(teacherPath, file));
    console.log('Transformed', file);
  }
});
