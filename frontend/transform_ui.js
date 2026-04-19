const fs = require('fs');

const transformUI = (p) => {
  let data = fs.readFileSync(p, 'utf8');

  // Bulk replaces for Admin Dashboard
  data = data.replace(/bg-white/g, 'bg-slate-900/40 backdrop-blur-xl border border-slate-700/50');
  data = data.replace(/text-gray-800/g, 'text-white');
  data = data.replace(/text-gray-600/g, 'text-slate-300');
  data = data.replace(/text-gray-500/g, 'text-slate-400');
  data = data.replace(/border-gray-200/g, 'border-slate-700/50');
  data = data.replace(/border-gray-100/g, 'border-slate-700/30');
  data = data.replace(/bg-gray-50/g, 'bg-slate-800/30');
  data = data.replace(/bg-gray-100/g, 'bg-slate-800/40 text-white');
  data = data.replace(/text-gray-700/g, 'text-slate-200');
  data = data.replace(/bg-blue-50(?!0)/g, 'bg-blue-900/20');
  data = data.replace(/text-blue-700/g, 'text-cyan-400');
  data = data.replace(/border-blue-100/g, 'border-blue-500/30');
  
  // Specific LibraryManager fixes
  data = data.replace(/bg-purple-100/g, 'bg-purple-500/20');
  data = data.replace(/text-purple-700/g, 'text-purple-400');
  data = data.replace(/bg-blue-100/g, 'bg-blue-500/20');
  data = data.replace(/border-dashed border-gray-300/g, 'border-dashed border-slate-600');
  
  // Clean up nested duplicates caused by replacements
  data = data.replace(/(bg-slate-900\/40 backdrop-blur-xl border border-slate-700\/50)\s*bg-slate-900\/40 backdrop-blur-xl border border-slate-700\/50/g, '$1');
  data = data.replace(/border border-slate-700\/50\s*border border-slate-700\/50/g, 'border border-slate-700/50');
  
  fs.writeFileSync(p, data);
}

transformUI('C:/Web Technology Things/cap/attendance-system/frontend/src/pages/admin/AdminDashboard.jsx');
transformUI('C:/Web Technology Things/cap/attendance-system/frontend/src/components/admin/LibraryManager.jsx');
transformUI('C:/Web Technology Things/cap/attendance-system/frontend/src/components/admin/TimetableManager.jsx');

console.log('Transformation complete!');