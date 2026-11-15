const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Add 'achievements' to activeTab state
code = code.replace(
  /"profile" \| "projects" \| "skills" \| "experience" \| "education" \| \n    "announcements" \| "testimonials" \| "comments" \| "messages" \| "media"/,
  '"profile" | "projects" | "skills" | "experience" | "education" | \n    "achievements" | "announcements" | "testimonials" | "comments" | "messages" | "media"'
);

// 2. Add achievements state array
code = code.replace(
  /const \[education, setEducation\] = useState<any\[\]>\(\[\]\);/,
  `const [education, setEducation] = useState<any[]>([]);\n  const [achievements, setAchievements] = useState<any[]>([]);`
);

// 3. Add fetch logic in loadAllCollections
code = code.replace(
  /const eduSnap = await getDocs\(collection\(db, "education"\)\);\n      setEducation\(eduSnap\.docs\.map\(doc => \(\{ \.\.\.doc\.data\(\), id: doc\.id \}\)\)\);/,
  `const eduSnap = await getDocs(collection(db, "education"));\n      setEducation(eduSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));\n\n      const achSnap = await getDocs(collection(db, "achievements"));\n      setAchievements(achSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));`
);

// 4. Add Sidebar Button for achievements
const expSidebarBtn = `<button \n            onClick={() => { setActiveTab("experience"); setIsAdding(false); setEditingId(null); }}\n            className={\`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors \${activeTab === "experience" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}\`}\n          >\n            <Briefcase className="w-4 h-4" />\n            <span>Manage Experience</span>\n          </button>`;

const achievementsSidebarBtn = expSidebarBtn + `\n\n          <button \n            onClick={() => { setActiveTab("achievements"); setIsAdding(false); setEditingId(null); }}\n            className={\`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors \${activeTab === "achievements" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}\`}\n          >\n            <Award className="w-4 h-4" />\n            <span>Manage Achievements</span>\n          </button>`;

code = code.replace(expSidebarBtn, achievementsSidebarBtn);

// 5. Add TAB panel for achievements
const tabPanelStart = `          {/* TAB 2: PROJECTS MANAGEMENT */}`;
const achievementsTabPanel = `
          {/* TAB: ACHIEVEMENTS MANAGEMENT */}
          {activeTab === "achievements" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-900">
                <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
                  Professional Achievements
                </h2>
                {!isAdding && !editingId && (
                  <button 
                    onClick={() => { setIsAdding(true); setGenericForm({ title: "", description: "", date: "", imageUrl: "", order: 1 }); }}
                    className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Achievement</span>
                  </button>
                )}
              </div>

              {(isAdding || editingId) ? (
                <form onSubmit={(e) => handleCRUDSubmit(e, "achievements")} className="bg-zinc-50 dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Title</label>
                      <input type="text" required value={genericForm.title || ""} onChange={(e) => setGenericForm({ ...genericForm, title: e.target.value })} className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Date String</label>
                      <input type="text" value={genericForm.date || ""} onChange={(e) => setGenericForm({ ...genericForm, date: e.target.value })} className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-zinc-900 dark:text-zinc-100" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Description</label>
                    <textarea rows={3} value={genericForm.description || ""} onChange={(e) => setGenericForm({ ...genericForm, description: e.target.value })} className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-zinc-900 dark:text-zinc-100"></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Image URL</label>
                      <input type="text" value={genericForm.imageUrl || ""} onChange={(e) => setGenericForm({ ...genericForm, imageUrl: e.target.value })} className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Display Order</label>
                      <input type="number" value={genericForm.order || 1} onChange={(e) => setGenericForm({ ...genericForm, order: Number(e.target.value) })} className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-zinc-900 dark:text-zinc-100" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-5 py-2.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-sm font-bold transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow">Save Achievement</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {achievements.sort((a, b) => a.order - b.order).map((ach) => (
                    <div key={ach.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex justify-between items-center group transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{ach.title}</h4>
                        <span className="text-xs text-zinc-400 font-mono">{ach.date}</span>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingId(ach.id); setGenericForm(ach); }} className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg shadow-sm"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleCRUDDelete("achievements", ach.id)} className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/30 dark:hover:border-red-900 text-red-500 rounded-lg shadow-sm"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {achievements.length === 0 && <p className="text-sm text-zinc-400 italic">No achievements found.</p>}
                </div>
              )}
            </div>
          )}

`;

code = code.replace(tabPanelStart, achievementsTabPanel + tabPanelStart);

fs.writeFileSync('src/pages/Admin.tsx', code);
console.log("Admin page patched");
