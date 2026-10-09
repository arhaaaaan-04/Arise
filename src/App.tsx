import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowDownToLine, ArrowLeft, ArrowRight, AudioLines, Bell, BookMarked,
  BookOpen, Brain, CalendarDays, Check, CheckCheck, ChevronDown, ChevronRight,
  CircleHelp, Clock3, CloudUpload, Command, Download, FileImage, FileText, Flame,
  FolderOpen, GraduationCap, Headphones, Home, Layers3, Lightbulb, ListChecks,
  LockKeyhole, LogOut, Menu, MessageSquareText, MoreHorizontal, PanelLeftClose,
  Play, Plus, Search, Settings, ShieldCheck, Sparkles, Target, Timer, Trash2,
  Trophy, Upload, WandSparkles, X, Zap
} from 'lucide-react'

type Page = 'Dashboard' | 'Study Studio' | 'My Library' | 'Study Planner' | 'Pending Work' | 'Syllabus' | 'Exam Prep' | 'Progress' | 'Contact Us'
type Output = 'AI Notes' | 'Must-learn points' | 'Flashcards' | 'Q&A' | 'Fill in the blanks' | 'MCQs' | 'Study podcast' | 'Mind map'
type Task = { id: number; title: string; subject: string; due: string; minutes: number; done: boolean; priority: 'High' | 'Medium' | 'Low' }

const outputOptions: { name: Output; icon: typeof Brain; color: string; description: string }[] = [
  { name: 'AI Notes', icon: FileText, color: 'violet', description: 'Clear, organized chapter notes' },
  { name: 'Must-learn points', icon: Lightbulb, color: 'amber', description: 'Key facts to remember' },
  { name: 'Flashcards', icon: Layers3, color: 'pink', description: 'Active recall cards' },
  { name: 'Q&A', icon: MessageSquareText, color: 'blue', description: 'Questions with answers' },
  { name: 'Fill in the blanks', icon: ListChecks, color: 'green', description: 'Test your memory' },
  { name: 'MCQs', icon: Target, color: 'orange', description: 'Practice with explanations' },
  { name: 'Study podcast', icon: Headphones, color: 'cyan', description: 'Listen and revise' },
  { name: 'Mind map', icon: Brain, color: 'purple', description: 'See how ideas connect' }
]
const initialTasks: Task[] = [
  { id: 1, title: 'Revise motion and laws of motion', subject: 'Science', due: 'Today', minutes: 35, done: false, priority: 'High' },
  { id: 2, title: 'Write history chapter notes', subject: 'Social Science', due: 'Today', minutes: 25, done: false, priority: 'Medium' },
  { id: 3, title: 'Practice linear equations', subject: 'Mathematics', due: 'Tomorrow', minutes: 30, done: true, priority: 'Medium' },
]
const navGroups = [
  { label: 'WORKSPACE', items: [{ name: 'Dashboard' as Page, icon: Home }, { name: 'Study Studio' as Page, icon: Sparkles }, { name: 'My Library' as Page, icon: FolderOpen }] },
  { label: 'PLAN & PREPARE', items: [{ name: 'Study Planner' as Page, icon: CalendarDays }, { name: 'Pending Work' as Page, icon: ListChecks }, { name: 'Syllabus' as Page, icon: BookMarked }, { name: 'Exam Prep' as Page, icon: GraduationCap }] },
  { label: 'YOUR GROWTH', items: [{ name: 'Progress' as Page, icon: Activity }, { name: 'Contact Us' as Page, icon: CircleHelp }] }
]

function Logo({ small = false }: { small?: boolean }) {
  return <div className={`brand ${small ? 'brand-small' : ''}`}>
    <div className="brand-mark"><span>A</span><Sparkles size={small ? 11 : 14} strokeWidth={2.8} /></div>
    {!small && <div className="brand-copy"><strong>ARISE</strong><small>Your AI Study Space</small></div>}
  </div>
}
function Tag({ children, color = 'violet' }: { children: React.ReactNode; color?: string }) { return <span className={`tag tag-${color}`}>{children}</span> }
function ProgressBar({ value, color = 'violet' }: { value: number; color?: string }) { return <div className="progress-track"><div className={`progress-fill fill-${color}`} style={{ width: `${value}%` }} /></div> }
function SectionTitle({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: React.ReactNode }) {
  return <div className="section-title"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{sub && <p>{sub}</p>}</div>{action}</div>
}

export default function App() {
  const [page, setPage] = useState<Page>('Dashboard')
  const [mobileNav, setMobileNav] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedOutputs, setSelectedOutputs] = useState<Output[]>(['AI Notes', 'Must-learn points', 'Flashcards', 'MCQs'])
  const [files, setFiles] = useState<File[]>([])
  const [subject, setSubject] = useState('Science')
  const [chapter, setChapter] = useState('Motion')
  const [level, setLevel] = useState('Balanced')
  const [language, setLanguage] = useState('Same as source')
  const [processing, setProcessing] = useState(false)
  const [resultReady, setResultReady] = useState(false)
  const [activeOutput, setActiveOutput] = useState<Output>('AI Notes')
  const [tasks, setTasks] = useState<Task[]>(() => {
    try { const saved = localStorage.getItem('arise-demo-tasks'); return saved ? JSON.parse(saved) as Task[] : initialTasks } catch { return initialTasks }
  })
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [toast, setToast] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const doneCount = tasks.filter(t => t.done).length
  
const normalizedSearch = search.trim().toLowerCase()

const filteredTasks = useMemo(
  () =>
    tasks.filter(task =>
      `${task.title} ${task.subject} ${task.due} ${task.priority}`
        .toLowerCase()
        .includes(normalizedSearch)
    ),
  [tasks, normalizedSearch]
)


  useEffect(() => { localStorage.setItem('arise-demo-tasks', JSON.stringify(tasks)) }, [tasks])
  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(id)
  }, [toast])

  function go(next: Page) { setPage(next); setMobileNav(false); setShowProfile(false) }
  function toggleOutput(name: Output) {
    setSelectedOutputs(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name])
  }
  function addFiles(list: FileList | null) {
    if (!list) return
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png']
    const incoming = Array.from(list)
    const invalid = incoming.filter(f => !allowed.includes(f.type) && !/\.(pdf|docx|pptx|jpg|jpeg|png)$/i.test(f.name))
    const tooBig = incoming.filter(f => f.size > 15 * 1024 * 1024)
    if (invalid.length) setToast('Some files were skipped. Use PDF, DOCX, PPTX, JPG or PNG.')
    else if (tooBig.length) setToast('Each file must be 15 MB or smaller.')
    setFiles(prev => [...prev, ...incoming.filter(f => !invalid.includes(f) && !tooBig.includes(f))].slice(0, 5))
  }
  function generate() {
    if (!files.length) { setToast('Add at least one study file first 📚'); return }
    if (!selectedOutputs.length) { setToast('Choose at least one output to create.'); return }
    setProcessing(true); setResultReady(false)
    window.setTimeout(() => { setProcessing(false); setResultReady(true); setActiveOutput(selectedOutputs[0]); setToast('Demo preview is ready ✨') }, 1900)
  }
  function addTask() {
    if (!newTask.trim()) return
    setTasks(prev => [{ id: Date.now(), title: newTask.trim(), subject: 'General', due: 'Upcoming', minutes: 25, done: false, priority: 'Medium' }, ...prev])
    setNewTask(''); setShowTaskForm(false); setToast('Task added to your demo planner ✅')
  }
  function toggleTask(id: number) { setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t)) }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><Logo /><button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18}/></button></div>
      <div className="workspace-pill"><span className="workspace-dot" /> Student workspace <ChevronDown size={14}/></div>
      <nav>
        {navGroups.map(group => <div className="nav-group" key={group.label}>
          <div className="nav-label">{group.label}</div>
          {group.items.map(item => <button key={item.name} className={`nav-item ${page === item.name ? 'nav-active' : ''}`} onClick={() => go(item.name)}><item.icon size={18}/><span>{item.name}</span>{item.name === 'Study Studio' && <span className="nav-new">NEW</span>}</button>)}
        </div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><div className="upgrade-icon"><Zap size={18}/></div><strong>Your goals are waiting!</strong><p>One small study session at a time.</p><button onClick={() => go('Study Planner')}>View my plan <ArrowRight size={14}/></button><div className="upgrade-spark">✦</div></div>
        <button className="nav-item" onClick={() => { setToast('Settings are a frontend demo.'); }}><Settings size={18}/><span>Settings</span></button>
        <div className="profile-row" onClick={() => setShowProfile(!showProfile)} role="button" tabIndex={0}><div className="avatar">S</div><div className="profile-info"><strong>Student</strong><small>Free demo account</small></div><MoreHorizontal size={18}/></div>
      </div>
    </aside>
    {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar">
        <button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button>
        <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>{page}</strong></div>
        <div className="topbar-right"><div className="searchbox"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your workspace..." /></div><button className="icon-button notification-button" onClick={() => setToast('You’re all caught up! 🎉')} aria-label="Notifications"><Bell size={18}/><i/></button><button className="top-avatar" onClick={() => setShowProfile(!showProfile)}>S</button></div>
      </header>
      {showProfile && <div className="profile-pop"><strong>Student demo</strong><p>Your progress is saved in this browser only.</p><button onClick={() => { setShowProfile(false); setToast('Account sign-in needs a backend integration.') }}><LockKeyhole size={15}/> Sign-in not connected</button></div>}
      <div className="content">
        {page === 'Dashboard' && <Dashboard tasks={filteredTasks} doneCount={doneCount} go={go} toggleTask={toggleTask} setToast={setToast} />}
        {page === 'Study Studio' && <Studio files={files} addFiles={addFiles} removeFile={i => setFiles(prev => prev.filter((_, n) => n !== i))} fileInput={fileInput} subject={subject} setSubject={setSubject} chapter={chapter} setChapter={setChapter} level={level} setLevel={setLevel} language={language} setLanguage={setLanguage} selectedOutputs={selectedOutputs} toggleOutput={toggleOutput} generate={generate} processing={processing} resultReady={resultReady} activeOutput={activeOutput} setActiveOutput={setActiveOutput} />}
        {page === 'My Library' && <Library go={go} setToast={setToast} />}
        {page === 'Study Planner' && <Planner tasks={tasks} toggleTask={toggleTask} go={go} />}
        {page === 'Pending Work' && <PendingWork tasks={filteredTasks} toggleTask={toggleTask} showTaskForm={showTaskForm} setShowTaskForm={setShowTaskForm} newTask={newTask} setNewTask={setNewTask} addTask={addTask} />}
        {page === 'Syllabus' && <Syllabus setToast={setToast} />}
        {page === 'Exam Prep' && <ExamPrep setToast={setToast} />}
        {page === 'Progress' && <Progress tasks={tasks} doneCount={doneCount} />}
        {page === 'Contact Us' && <ContactUs />}

      </div>
      <footer className="footer"><span>✦ ARISE <span className="muted">Your AI Study Space</span></span><span><span className="demo-dot"/> Frontend demo mode <span className="footer-sep">•</span> Built to help you rise higher 🚀</span></footer>
    </main>
    {toast && <div className="toast"><CheckCircleIcon/><span>{toast}</span><button onClick={() => setToast('')} aria-label="Dismiss"><X size={15}/></button></div>}
  </div>
}
function CheckCircleIcon() { return <span className="toast-icon"><Check size={15}/></span> }

function Dashboard({ tasks, doneCount, go, toggleTask, setToast }: { tasks: Task[]; doneCount: number; go: (p: Page) => void; toggleTask: (id: number) => void; setToast: (s: string) => void }) {
  const [focus, setFocus] = useState(false)
  return <>
    <div className="welcome-row"><div><div className="eyebrow">THURSDAY, OCTOBER 9 <span className="eyebrow-spark">✦</span></div><h1>Hey, learner! <span className="wave">👋</span></h1><p className="lead">Ready to make today count? Every little step adds up.</p></div><div className="streak-pill"><span>🔥</span><div><strong>3 day streak</strong><small>Keep the momentum going!</small></div></div></div>
    <div className="hero-banner"><div className="hero-copy"><div className="hero-chip"><Sparkles size={13}/> YOUR NEXT BIG THING</div><h2>Small steps.<br/><span>Big progress.</span></h2><p>Your goals are closer than you think. Let's make learning feel easier today.</p><button className="button-white" onClick={() => go('Study Studio')}>Create study materials <ArrowRight size={16}/></button><div className="hero-footnote"><ShieldCheck size={14}/> Your study journey, one step at a time</div></div><div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-book"><BookOpen size={86}/><Sparkles size={24} className="book-spark"/></div><div className="floating-note note-a">✨ You got this!</div><div className="floating-note note-b">📚 Learn smarter</div><div className="hero-planet">✦</div><div className="hero-dot dot-a"/><div className="hero-dot dot-b"/></div></div>
    <div className="stats-grid">
      <StatCard icon={BookOpen} label="Study materials" value="12" note="+3 this week" color="violet" />
      <StatCard icon={CheckCheck} label="Tasks completed" value={`${doneCount + 8}`} note="You're making progress!" color="green" />
      <StatCard icon={Clock3} label="Focus time" value="4.5h" note="This week so far" color="blue" />
      <StatCard icon={Trophy} label="Study streak" value="3 days" note="A new habit is growing" color="amber" />
    </div>
    <div className="dashboard-grid">
      <section className="panel today-panel"><div className="panel-heading"><div><h3>Today's game plan <span>🎯</span></h3><p>A little progress goes a long way.</p></div><button className="text-button" onClick={() => go('Study Planner')}>Full plan <ArrowRight size={14}/></button></div><div className="plan-progress"><div><strong>Daily progress</strong><span>{Math.min(100, Math.round((doneCount + 1) / Math.max(tasks.length, 1) * 100))}% complete</span></div><ProgressBar value={Math.min(100, Math.round((doneCount + 1) / Math.max(tasks.length, 1) * 100))}/></div><div className="timeline">{tasks.slice(0, 3).map((task, i) => <div className={`timeline-item ${task.done ? 'timeline-done' : ''}`} key={task.id}><div className={`timeline-time time-${i}`}>{['4:00','4:45','5:30'][i]}</div><button className={`task-check ${task.done ? 'checked' : ''}`} onClick={() => toggleTask(task.id)} aria-label={`Toggle ${task.title}`}>{task.done && <Check size={13}/>}</button><div className="timeline-content"><strong>{task.title}</strong><div><span>{task.subject}</span><span>·</span><span>{task.minutes} min</span></div></div><Tag color={task.priority === 'High' ? 'pink' : 'blue'}>{task.priority}</Tag></div>)}</div><button className="add-plan-button" onClick={() => go('Pending Work')}><Plus size={16}/> Add a task to your day</button></section>
      <section className="panel quick-panel"><div className="panel-heading"><div><h3>Quick start <span>⚡</span></h3><p>Pick what you need right now.</p></div></div><div className="quick-list"><button onClick={() => go('Study Studio')}><div className="quick-icon quick-violet"><WandSparkles size={20}/></div><div><strong>Make AI study materials</strong><small>Turn your files into revision tools</small></div><ChevronRight size={17}/></button><button onClick={() => go('Exam Prep')}><div className="quick-icon quick-orange"><GraduationCap size={20}/></div><div><strong>Prepare for an exam</strong><small>Practice and check your readiness</small></div><ChevronRight size={17}/></button><button onClick={() => go('Study Planner')}><div className="quick-icon quick-green"><CalendarDays size={20}/></div><div><strong>Plan my study time</strong><small>Organize your week with a plan</small></div><ChevronRight size={17}/></button><button onClick={() => { setFocus(!focus); setToast(focus ? 'Focus session paused.' : 'Focus session started! Try 25 minutes on one task. ⏱️') }}><div className="quick-icon quick-blue"><Timer size={20}/></div><div><strong>{focus ? 'Focus session is running' : 'Start a focus session'}</strong><small>{focus ? 'One task at a time — you’ve got this' : '25 minutes, one task, no distractions'}</small></div><ChevronRight size={17}/></button></div></section>
    </div>
    <div className="bottom-callout"><div className="callout-emoji">💜</div><div><strong>Remember: progress, not perfection.</strong><p>You don't have to do it all today. Just take the next small step.</p></div><button className="text-button" onClick={() => setToast('You are doing better than you think. Keep going! 💜')}>A little motivation <ArrowRight size={14}/></button></div>
  </>
}
function StatCard({ icon: Icon, label, value, note, color }: { icon: typeof Brain; label: string; value: string; note: string; color: string }) {
  return <div className="stat-card"><div className={`stat-icon icon-${color}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div><div className={`stat-decoration decor-${color}`}/></div>
}

function Studio(props: {
  files: File[]; addFiles: (files: FileList | null) => void; removeFile: (i: number) => void; fileInput: React.RefObject<HTMLInputElement>;
  subject: string; setSubject: (s: string) => void; chapter: string; setChapter: (s: string) => void; level: string; setLevel: (s: string) => void; language: string; setLanguage: (s: string) => void;
  selectedOutputs: Output[]; toggleOutput: (s: Output) => void; generate: () => void; processing: boolean; resultReady: boolean; activeOutput: Output; setActiveOutput: (s: Output) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [showResults, setShowResults] = useState(false)
  useEffect(() => { if (props.resultReady) setShowResults(true) }, [props.resultReady])
  return <>
    <SectionTitle eyebrow="YOUR AI-POWERED WORKBENCH" title="Study Studio ✨" sub="Turn your study material into resources that work for the way you learn." action={<Tag color="amber">DEMO MODE</Tag>} />
    <div className="demo-alert"><div className="alert-icon"><CircleHelp size={18}/></div><div><strong>You're exploring a frontend demo</strong><p>Files stay in this browser session. The preview uses sample content and does not analyze your uploaded files with AI yet.</p></div></div>
    <div className="studio-layout">
      <div className="studio-main">
        <section className="panel studio-step"><div className="step-heading"><span className="step-number">1</span><div><h3>Bring your study material</h3><p>Upload notes, textbook pages, slides, or a worksheet.</p></div></div>
          <input ref={props.fileInput} type="file" multiple accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png" hidden onChange={e => { props.addFiles(e.target.files); e.currentTarget.value = '' }} />
          <div className={`upload-zone ${dragging ? 'upload-dragging' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); props.addFiles(e.dataTransfer.files) }} onClick={() => props.fileInput.current?.click()} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') props.fileInput.current?.click() }}>
            <div className="upload-cloud"><CloudUpload size={27}/></div><strong>Drop your files here, or <span>browse</span></strong><p>PDF, DOCX, PPTX, JPG or PNG · Up to 15 MB each</p><div className="upload-types"><span><FileText size={13}/> PDF</span><span><FileText size={13}/> DOCX</span><span><FileText size={13}/> PPTX</span><span><FileImage size={13}/> Images</span></div>
          </div>
          {props.files.length > 0 && <div className="file-list">{props.files.map((file, i) => <div className="file-row" key={`${file.name}-${i}`}><div className="file-type-icon"><FileText size={17}/></div><div className="file-details"><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB · Added to this demo</small></div><Tag color="green">Ready</Tag><button className="icon-button" onClick={() => props.removeFile(i)} aria-label="Remove file"><Trash2 size={15}/></button></div>)}</div>}
        </section>
        <section className="panel studio-step"><div className="step-heading"><span className="step-number">2</span><div><h3>Personalize your learning</h3><p>Give your study resources the right context.</p></div></div><div className="form-grid"><label className="field"><span>Subject</span><select value={props.subject} onChange={e => props.setSubject(e.target.value)}><option>Science</option><option>Mathematics</option><option>English</option><option>Social Science</option><option>Computer / IT</option><option>Language</option><option>Other</option></select></label><label className="field"><span>Chapter or topic</span><input value={props.chapter} onChange={e => props.setChapter(e.target.value)} placeholder="e.g. Motion and force"/></label><label className="field"><span>Explanation level</span><select value={props.level} onChange={e => props.setLevel(e.target.value)}><option>Quick Revision</option><option>Balanced</option><option>Detailed</option></select></label><label className="field"><span>Output language</span><select value={props.language} onChange={e => props.setLanguage(e.target.value)}><option>Same as source</option><option>English</option><option>Hindi</option><option>Gujarati</option></select></label></div></section>
        <section className="panel studio-step"><div className="step-heading"><span className="step-number">3</span><div><h3>Choose your study tools <span>🪄</span></h3><p>Only the outputs you select will appear in the results workspace.</p></div></div><div className="output-grid">{outputOptions.map(o => { const Icon = o.icon; const active = props.selectedOutputs.includes(o.name); return <button key={o.name} className={`output-card ${active ? 'output-selected' : ''}`} onClick={() => props.toggleOutput(o.name)}><div className={`output-icon output-${o.color}`}><Icon size={19}/></div><div className="output-copy"><strong>{o.name}</strong><small>{o.description}</small></div><span className={`output-check ${active ? 'is-selected' : ''}`}>{active && <Check size={12}/>}</span></button> })}</div></section>
        <button className="button-primary generate-button" onClick={props.generate} disabled={props.processing}><WandSparkles size={17}/>{props.processing ? 'Preparing demo preview…' : 'Create my study resources'}<ArrowRight size={16}/></button>
        {props.processing && <div className="processing-panel"><div className="processing-spinner"/><div><strong>Preparing your preview…</strong><p>Showing a sample workflow. Real AI processing is not connected yet.</p></div></div>}
        {showResults && props.resultReady && <Results selected={props.selectedOutputs} active={props.activeOutput} setActive={props.setActiveOutput} subject={props.subject} chapter={props.chapter} level={props.level} language={props.language}/>}
      </div>
      <aside className="studio-aside"><div className="aside-card aside-purple"><div className="aside-illustration">🧠<span>✦</span></div><h3>Make studying click.</h3><p>Use active recall, bite-sized notes, and practice questions to make revision more engaging.</p><div className="aside-mini-stat"><span>✨</span><div><strong>Built around you</strong><small>Choose the tools you need</small></div></div></div><div className="aside-card"><div className="aside-heading"><ShieldCheck size={17}/><strong>Your files, your control</strong></div><p className="aside-muted">This demo doesn't upload files to a server. Production storage and privacy controls still need to be implemented.</p><div className="privacy-points"><span><Check size={14}/> Local selection only</span><span><Check size={14}/> No AI API key in browser</span><span><Check size={14}/> No real analysis yet</span></div></div><div className="aside-card aside-tip"><div className="tip-icon"><Lightbulb size={18}/></div><div><strong>Study tip 💡</strong><p>Try flashcards after reading your notes, then use MCQs to check what stuck.</p></div></div></aside>
    </div>
  </>
}

function Results({ selected, active, setActive, subject, chapter, level, language }: { selected: Output[]; active: Output; setActive: (s: Output) => void; subject: string; chapter: string; level: string; language: string }) {
  const [flipped, setFlipped] = useState(false)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  return <section className="panel results-panel"><div className="results-heading"><div><Tag color="green">SAMPLE PREVIEW</Tag><h3>Your study resources are ready ✨</h3><p>{subject} · {chapter || 'Selected topic'} · {level} · {language}</p></div><button className="button-secondary" onClick={() => window.print()}><Download size={15}/> Print preview</button></div><div className="results-tabs">{selected.map(o => <button key={o} className={active === o ? 'results-tab active' : 'results-tab'} onClick={() => { setActive(o); setChecked(false); setFlipped(false) }}>{o}</button>)}</div>
    <div className="result-content">{active === 'AI Notes' && <><h4>📘 {chapter || 'Your chapter'} — quick notes</h4><p className="result-disclaimer">Example content only. Real AI-generated notes require backend integration and document extraction.</p><div className="note-highlight"><strong>Big idea</strong><p>Start by identifying the main concept, then connect important terms with examples from your textbook.</p></div><h4>Key concepts</h4><ul className="result-list"><li><strong>Definition:</strong> Write the meaning in your own words.</li><li><strong>Key principle:</strong> Remember the rule and when it applies.</li><li><strong>Example:</strong> Connect the concept to a real-world situation.</li></ul><div className="result-callout"><Lightbulb size={17}/><span><strong>Study strategy:</strong> Close your notes and explain each idea from memory.</span></div></>}
      {active === 'Must-learn points' && <><h4>⭐ Must-learn points</h4><p className="result-disclaimer">Sample checklist, not extracted from your file.</p>{['Know the main definitions and keywords.','Understand the central idea and why it matters.','Practice one example for each major concept.','Review diagrams, labels, dates, or formulas in your source.','Test yourself without looking at your notes.'].map((x,i) => <label className="learn-point" key={x}><input type="checkbox"/><span>{x}</span></label>)}</>}
      {active === 'Flashcards' && <><h4>🃏 Flashcards</h4><p className="result-disclaimer">Tap the card to flip between a sample prompt and answer.</p><button className="flashcard" onClick={() => setFlipped(!flipped)}><span>{flipped ? 'ANSWER' : 'QUESTION'}</span><strong>{flipped ? 'Explain the concept in your own words and give one example.' : 'What is the main idea of this topic?'}</strong><small>Tap to {flipped ? 'see question' : 'reveal answer'} ↻</small></button><div className="flashcard-controls"><button className="button-secondary" onClick={() => setFlipped(false)}><ArrowLeft size={14}/> Previous</button><Tag>Card 1 of 5</Tag><button className="button-secondary" onClick={() => setFlipped(true)}>Show answer <ArrowRight size={14}/></button></div></>}
      {active === 'MCQs' && <><h4>🎯 Quick practice</h4><p className="result-disclaimer">Sample question. It is not based on the uploaded material.</p><div className="mcq-question"><Tag color="blue">QUESTION 1</Tag><h4>Which is a useful first step when learning a new concept?</h4>{['Memorize every word immediately','Identify the main idea and key terms','Skip examples','Only reread without testing yourself'].map((o,i) => <label className={`mcq-option ${answer === o ? 'mcq-picked' : ''}`} key={o}><input type="radio" name="mcq" checked={answer === o} onChange={() => { setAnswer(o); setChecked(false) }}/><span>{String.fromCharCode(65+i)}</span>{o}</label>)}<button className="button-primary" disabled={!answer} onClick={() => setChecked(true)}>Check answer</button>{checked && <div className={`answer-feedback ${answer.includes('Identify') ? 'answer-correct' : ''}`}>{answer.includes('Identify') ? 'Correct! 🎉 Start by understanding the main idea.' : 'Not quite. Look for the option about understanding before memorizing.'}</div>}</div></>}
      {active === 'Q&A' && <><h4>💬 Practice questions</h4><p className="result-disclaimer">Generic sample questions.</p><details open><summary>1. Why is it helpful to summarize a topic?</summary><p>Summarizing makes you select the main ideas and explain them in your own words.</p></details><details><summary>2. How can you check whether you remember something?</summary><p>Try active recall: close your notes and explain the idea without looking.</p></details><details><summary>3. When should you revisit difficult concepts?</summary><p>Schedule short revision sessions and return to topics you found challenging.</p></details></>}
      {active === 'Fill in the blanks' && <><h4>✍️ Fill in the blanks</h4><p className="result-disclaimer">Practice examples; not extracted from your file.</p><div className="fill-question">1. Explaining an idea in your own words helps you check your <input placeholder="type answer" />.</div><div className="fill-question">2. Flashcards are useful for <input placeholder="type answer" /> recall.</div><div className="fill-question">3. A study plan helps organize your available <input placeholder="type answer" />.</div></>}
      {active === 'Study podcast' && <><h4>🎧 Study podcast preview</h4><p className="result-disclaimer">This is a sample script. Audio generation and playback are not connected yet.</p><div className="podcast-player"><div className="podcast-art"><AudioLines size={27}/></div><div className="podcast-info"><strong>{chapter || 'Your topic'} in a nutshell</strong><small>ARISE Study Audio · Sample script</small><div className="audio-track"><span/></div><small>00:00 <span>Audio not generated</span></small></div><button className="play-button" onClick={() => alert('Text-to-speech is not connected in this demo.')}><Play size={17} fill="currentColor"/></button></div><div className="transcript"><strong>🎙️ Sample intro</strong><p>Welcome back to your ARISE study session! Today, we’ll break down one key idea, look at an example, and finish with a quick question to test your understanding.</p></div></>}
      {active === 'Mind map' && <><h4>🧠 Concept map preview</h4><p className="result-disclaimer">Example structure to show how a mind map will look.</p><div className="mindmap"><div className="mindmap-center">{chapter || 'Main topic'}</div><div className="mindmap-branches"><span>📌 Key terms</span><span>💡 Main ideas</span><span>🧪 Examples</span><span>🎯 Practice</span></div></div></>}
    </div></section>
}

function Library({ go, setToast }: { go: (p: Page) => void; setToast: (s: string) => void }) {
  const [filter, setFilter] = useState('All')
  const materials = [{ title: 'Motion — Chapter Notes', subject: 'Science', type: 'AI Notes', color: 'violet', icon: FileText }, { title: 'Democracy — Flashcards', subject: 'Social Science', type: 'Flashcards', color: 'pink', icon: Layers3 }, { title: 'Linear Equations Practice', subject: 'Mathematics', type: 'MCQs', color: 'blue', icon: Target }, { title: 'Atmosphere — Audio Review', subject: 'Social Science', type: 'Podcast', color: 'green', icon: Headphones }]
  const shown = filter === 'All' ? materials : materials.filter(m => m.subject === filter)
  return <><SectionTitle eyebrow="YOUR PERSONAL STUDY SHELF" title="My Library 📚" sub="Keep your study resources organized and easy to find." action={<button className="button-primary" onClick={() => go('Study Studio')}><Plus size={16}/> New material</button>}/><div className="library-banner"><div className="library-banner-icon"><FolderOpen size={23}/></div><div><strong>Your learning collection</strong><p>These are example library items for the demo. Generated content isn't stored on a server.</p></div><Tag color="amber">SAMPLE DATA</Tag></div><div className="filter-row">{['All','Science','Mathematics','Social Science'].map(f => <button className={filter === f ? 'filter-active' : ''} key={f} onClick={() => setFilter(f)}>{f}</button>)}</div><div className="library-grid">{shown.map((m,i) => { const Icon = m.icon; return <article className="library-card" key={m.title}><div className="library-card-top"><div className={`library-file-icon output-${m.color}`}><Icon size={21}/></div><button className="icon-button" onClick={() => setToast('Library actions will work after backend storage is connected.')}><MoreHorizontal size={18}/></button></div><Tag color={m.color}>{m.type}</Tag><h3>{m.title}</h3><p>{m.subject} <span>·</span> Example material</p><div className="library-card-bottom"><span><Clock3 size={13}/> Demo item</span><button onClick={() => go('Study Studio')}>Open <ArrowRight size={14}/></button></div></article>})}</div></>
}

function Planner({ tasks, toggleTask, go }: { tasks: Task[]; toggleTask: (id: number) => void; go: (p: Page) => void }) {
  const days = [{ d: 'MON', n: '06', active: false },{d:'TUE',n:'07',active:false},{d:'WED',n:'08',active:false},{d:'THU',n:'09',active:true},{d:'FRI',n:'10',active:false},{d:'SAT',n:'11',active:false},{d:'SUN',n:'12',active:false}]
  return <><SectionTitle eyebrow="MAKE TIME FOR WHAT MATTERS" title="Study Planner 📅" sub="A flexible plan helps you prepare without feeling overwhelmed." action={<button className="button-primary" onClick={() => go('Pending Work')}><Plus size={16}/> Add task</button>}/><div className="planner-hero"><div><Tag color="green">THIS WEEK</Tag><h3>Your week, one step at a time 🌱</h3><p>This is a sample plan. Automatic scheduling from your syllabus and exam timetable isn't connected yet.</p></div><div className="planner-ring"><strong>68%</strong><small>weekly goal</small></div></div><div className="panel calendar-panel"><div className="calendar-header"><div><h3>October 2026</h3><p>Keep it realistic. Leave room for breaks.</p></div><div className="calendar-legend"><span><i className="legend-purple"/> Study session</span><span><i className="legend-green"/> Completed</span></div></div><div className="week-strip">{days.map(d => <button key={d.n} className={`day-cell ${d.active ? 'day-active' : ''}`}><span>{d.d}</span><strong>{d.n}</strong>{d.active && <i/>}</button>)}</div></div><div className="planner-columns"><section className="panel"><div className="panel-heading"><div><h3>Today's sessions</h3><p>Suggested demo schedule</p></div><Tag color="violet">3 sessions</Tag></div><div className="planner-sessions">{[{time:'4:00 PM',title:'Science revision',detail:'Motion · 35 minutes',color:'violet',icon:Brain},{time:'4:45 PM',title:'Social Science notes',detail:'History · 25 minutes',color:'pink',icon:BookOpen},{time:'5:30 PM',title:'Maths practice',detail:'Linear equations · 30 minutes',color:'blue',icon:Target}].map(s => {const Icon=s.icon;return <div className="session-row" key={s.title}><div className="session-time">{s.time}</div><div className={`session-icon output-${s.color}`}><Icon size={17}/></div><div className="session-info"><strong>{s.title}</strong><small>{s.detail}</small></div><span className={`session-dot dot-${s.color}`}/></div>})}</div></section><section className="panel"><div className="panel-heading"><div><h3>Study checklist</h3><p>Tick things off as you go.</p></div></div><div className="checklist">{tasks.slice(0,4).map(t => <label key={t.id}><input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)}/><span className={t.done ? 'line-through' : ''}>{t.title}</span></label>)}</div><button className="text-button" onClick={() => go('Pending Work')}>Manage all tasks <ArrowRight size={14}/></button></section></div></>
}

function PendingWork({ tasks, toggleTask, showTaskForm, setShowTaskForm, newTask, setNewTask, addTask }: { tasks: Task[]; toggleTask: (id: number) => void; showTaskForm: boolean; setShowTaskForm: (v: boolean) => void; newTask: string; setNewTask: (v: string) => void; addTask: () => void }) {
  const [status, setStatus] = useState('All')
  const shown = tasks.filter(t => status === 'All' || (status === 'Completed' ? t.done : !t.done))
  return <><SectionTitle eyebrow="CLEAR YOUR MIND, ONE TASK AT A TIME" title="Pending Work ✅" sub="Keep homework and revision tasks in one calm, organized place." action={<button className="button-primary" onClick={() => setShowTaskForm(!showTaskForm)}><Plus size={16}/> Add task</button>}/>{showTaskForm && <form className="panel add-task-form" onSubmit={e => {e.preventDefault();addTask()}}><label className="field"><span>What do you need to do?</span><input autoFocus value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="e.g. Finish science notebook work" required/></label><button className="button-primary" type="submit"><Plus size={15}/> Save task</button></form>}<div className="task-summary-grid"><div className="task-summary"><span>Open tasks</span><strong>{tasks.filter(t=>!t.done).length}</strong><small>One step at a time</small></div><div className="task-summary"><span>Completed</span><strong>{tasks.filter(t=>t.done).length}</strong><small>Look how far you've come</small></div><div className="task-summary"><span>Estimated time left</span><strong>{tasks.filter(t=>!t.done).reduce((a,t)=>a+t.minutes,0)}m</strong><small>Split it into small sessions</small></div></div><div className="panel pending-panel"><div className="filter-row">{['All','Pending','Completed'].map(f => <button key={f} className={status===f?'filter-active':''} onClick={()=>setStatus(f)}>{f}</button>)}</div>{shown.length ? shown.map(t=><div className={`pending-row ${t.done?'pending-done':''}`} key={t.id}><button className={`task-check ${t.done?'checked':''}`} onClick={()=>toggleTask(t.id)} aria-label="Toggle task">{t.done&&<Check size={13}/>}</button><div className="pending-main"><strong>{t.title}</strong><div><span>{t.subject}</span><span>·</span><span><Clock3 size={12}/>{t.minutes} min</span><span>·</span><span>{t.due}</span></div></div><Tag color={t.priority==='High'?'pink':'blue'}>{t.priority}</Tag></div>):<div className="empty-state"><div>🎉</div><h3>Nothing here right now</h3><p>You're all caught up for this filter.</p></div>}</div><div className="bottom-callout"><div className="callout-emoji">🌈</div><div><strong>Break big work into tiny wins.</strong><p>Small, focused sessions are easier to start and easier to finish.</p></div></div></>
}

function Syllabus({ setToast }: { setToast: (s: string) => void }) {
  const [syllabusFile, setSyllabusFile] = useState('')
  const [examDate, setExamDate] = useState('2026-10-20')
  const [subjectName, setSubjectName] = useState('Science')
  const [chapterName, setChapterName] = useState('')
  const [chapters, setChapters] = useState([{subject:'Science',name:'Motion',done:true},{subject:'Science',name:'Force and Laws of Motion',done:false},{subject:'Mathematics',name:'Linear Equations',done:false},{subject:'Social Science',name:'Democracy',done:true}])
  return <><SectionTitle eyebrow="KNOW WHAT'S LEFT TO LEARN" title="Syllabus & Exams 📖" sub="Track chapters, add exam dates, and keep your preparation visible." action={<Tag color="amber">DEMO MODE</Tag>}/><div className="syllabus-grid"><section className="panel syllabus-upload"><div className="syllabus-icon"><CloudUpload size={22}/></div><h3>Bring your syllabus</h3><p>Choose a syllabus file to preview the upload flow. It won't be analyzed in this demo.</p><label className="button-secondary file-picker"><Upload size={15}/> {syllabusFile || 'Choose syllabus file'}<input type="file" accept=".pdf,.docx,.jpg,.png" onChange={e=>setSyllabusFile(e.target.files?.[0]?.name||'')}/></label>{syllabusFile && <div className="inline-success"><Check size={14}/> Selected: {syllabusFile}</div>}</section><section className="panel exam-date-card"><div className="panel-heading"><div><h3>Upcoming exam</h3><p>Set a date to keep it in view.</p></div><div className="quick-icon quick-pink"><CalendarDays size={20}/></div></div><label className="field"><span>Exam date</span><input type="date" value={examDate} onChange={e=>setExamDate(e.target.value)}/></label><label className="field"><span>Subject</span><select value={subjectName} onChange={e=>setSubjectName(e.target.value)}><option>Science</option><option>Mathematics</option><option>English</option><option>Social Science</option><option>Computer / IT</option></select></label><button className="button-primary" onClick={()=>setToast('Exam saved in this demo screen only. Add a backend for durable storage.')}>Save exam details <Check size={15}/></button></section></div><section className="panel chapter-panel"><div className="panel-heading"><div><h3>Chapter tracker <span>🌱</span></h3><p>Check off topics as you finish them.</p></div><Tag color="green">{chapters.filter(c=>c.done).length} of {chapters.length} done</Tag></div><ProgressBar value={chapters.filter(c=>c.done).length/chapters.length*100} color="green"/><div className="chapter-add"><input value={chapterName} onChange={e=>setChapterName(e.target.value)} placeholder="Add a chapter or topic…"/><select value={subjectName} onChange={e=>setSubjectName(e.target.value)}><option>Science</option><option>Mathematics</option><option>English</option><option>Social Science</option><option>Computer / IT</option></select><button className="button-primary" onClick={()=>{if(chapterName.trim()){setChapters([...chapters,{subject:subjectName,name:chapterName.trim(),done:false}]);setChapterName('')}}}><Plus size={15}/> Add</button></div><div className="chapter-list">{chapters.map((c,i)=><label key={`${c.name}-${i}`} className="chapter-row"><input type="checkbox" checked={c.done} onChange={()=>setChapters(chapters.map((x,j)=>j===i?{...x,done:!x.done}:x))}/><div><strong className={c.done?'line-through':''}>{c.name}</strong><small>{c.subject}</small></div><Tag color={c.done?'green':'blue'}>{c.done?'Completed':'To study'}</Tag></label>)}</div></section></>
}

function ExamPrep({ setToast }: { setToast: (s: string) => void }) {
  const [examSubject,setExamSubject]=useState('Science')
  const [examChapters,setExamChapters]=useState('Motion, Force and Laws of Motion')
  const [marks,setMarks]=useState('40')
  const [difficulty,setDifficulty]=useState('Balanced')
  const [questionTypes,setQuestionTypes]=useState(['MCQs','Short answers','Long answers'])
  const [paperReady,setPaperReady]=useState(false)
  const [answerFile,setAnswerFile]=useState('')
  return <><SectionTitle eyebrow="PRACTICE MAKES PROGRESS" title="Exam Prep 📝" sub="Create a practice-paper plan and review what you know." action={<Tag color="amber">DEMO MODE</Tag>}/><div className="exam-prep-grid"><section className="panel exam-builder"><div className="step-heading"><span className="step-number">1</span><div><h3>Build a practice paper</h3><p>Customize your revision test.</p></div></div><div className="form-grid"><label className="field"><span>Subject</span><select value={examSubject} onChange={e=>setExamSubject(e.target.value)}><option>Science</option><option>Mathematics</option><option>English</option><option>Social Science</option><option>Computer / IT</option></select></label><label className="field"><span>Total marks</span><select value={marks} onChange={e=>setMarks(e.target.value)}><option>20</option><option>40</option><option>50</option><option>80</option><option>100</option></select></label><label className="field field-wide"><span>Chapters / topics</span><textarea rows={3} value={examChapters} onChange={e=>setExamChapters(e.target.value)} placeholder="List the chapters to include"/></label><label className="field"><span>Difficulty</span><select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>Easy</option><option>Balanced</option><option>Challenging</option></select></label></div><div className="field"><span>Question types</span><div className="question-type-list">{['MCQs','Short answers','Long answers','Fill in the blanks','Case-based'].map(t=><label key={t}><input type="checkbox" checked={questionTypes.includes(t)} onChange={()=>setQuestionTypes(questionTypes.includes(t)?questionTypes.filter(x=>x!==t):[...questionTypes,t])}/>{t}</label>)}</div></div><button className="button-primary full-button" onClick={()=>{setPaperReady(true);setToast('Sample paper preview created. Real AI paper generation is not connected.')}}><WandSparkles size={16}/> Create sample paper</button></section><section className="panel answer-checker"><div className="checker-art">📝<span>✨</span></div><h3>Check your answers</h3><p>In the full version, submit typed answers or photos of handwritten work for question-by-question feedback.</p><label className="button-secondary file-picker"><Upload size={15}/>{answerFile||'Select answer photo or file'}<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>setAnswerFile(e.target.files?.[0]?.name||'')}/></label>{answerFile&&<div className="inline-success"><Check size={14}/>{answerFile} selected locally</div>}<div className="checker-note"><ShieldCheck size={16}/><span>Handwriting OCR and AI marking are not implemented in this demo. You can select a file, but it won't be graded.</span></div></section></div>{paperReady&&<section className="panel sample-paper"><div className="sample-paper-header"><div><Tag color="green">SAMPLE PREVIEW</Tag><h3>{examSubject} practice paper</h3><p>{examChapters||'Selected topics'} · {marks} marks · {difficulty} difficulty</p></div><button className="button-secondary" onClick={()=>window.print()}><Download size={15}/> Print</button></div><p className="result-disclaimer">Generic sample questions below are not generated from your syllabus.</p><div className="paper-question"><strong>Q1. Multiple choice (1 mark)</strong><p>Which study habit helps you check your understanding?</p><span>A. Active recall</span><span>B. Skipping practice</span><span>C. Never reviewing</span><span>D. Studying without breaks</span></div><div className="paper-question"><strong>Q2. Short answer (3 marks)</strong><p>Explain one concept from your chosen chapter in your own words and give an example.</p></div><div className="paper-question"><strong>Q3. Long answer (5 marks)</strong><p>Describe a key idea from the topic and explain how it can be applied.</p></div><div className="answer-key"><strong>Answer key — sample</strong><p>Q1: A. For Q2 and Q3, award marks for accurate concepts, clear explanation, and relevant examples.</p></div></section>}</>
}

function Progress({ tasks, doneCount }: { tasks: Task[]; doneCount: number }) {
  const subjects=[{name:'Science',value:72,color:'violet',emoji:'🧪'},{name:'Mathematics',value:58,color:'blue',emoji:'📐'},{name:'Social Science',value:81,color:'pink',emoji:'🌍'},{name:'English',value:64,color:'green',emoji:'📖'}]
  return <><SectionTitle eyebrow="LOOK HOW FAR YOU'VE COME" title="Your Progress 📈" sub="Build consistency, celebrate small wins, and spot topics to revisit." action={<Tag color="green">KEEP GOING!</Tag>}/><div className="progress-hero"><div><div className="hero-chip"><Sparkles size={13}/> YOUR LEARNING JOURNEY</div><h2>You're growing<br/><span>every day.</span></h2><p>Progress isn't always a straight line. Showing up is a win.</p></div><div className="progress-hero-art"><div className="growth-sun">☀️</div><div className="growth-plant">🌱</div><div className="growth-stars">✦ ✧ ✦</div></div></div><div className="progress-overview"><div className="panel overview-card"><div className="overview-icon quick-violet"><CheckCheck size={20}/></div><span>Tasks completed</span><strong>{doneCount+8}</strong><small>Demo total, including sample history</small></div><div className="panel overview-card"><div className="overview-icon quick-blue"><Clock3 size={20}/></div><span>Focus time</span><strong>4.5 hrs</strong><small>Example weekly activity</small></div><div className="panel overview-card"><div className="overview-icon quick-orange"><Flame size={20}/></div><span>Current streak</span><strong>3 days</strong><small>Demo streak</small></div></div><section className="panel subject-progress"><div className="panel-heading"><div><h3>Subject confidence</h3><p>Example progress values — customize once your data is connected.</p></div></div>{subjects.map(s=><div className="subject-row" key={s.name}><div className="subject-name"><span>{s.emoji}</span><strong>{s.name}</strong></div><ProgressBar value={s.value} color={s.color}/><strong className="subject-percent">{s.value}%</strong></div>)}</section><div className="bottom-callout"><div className="callout-emoji">🏆</div><div><strong>Celebrate effort, not just scores.</strong><p>Every question you practice and every topic you revisit is progress.</p></div></div></>
}

function ContactUs() {
  return (
    <>
      <SectionTitle
        eyebrow="WE'RE LISTENING"
        title="Contact Us 💬"
        sub="Have a question or an idea? Let us know."
      />

      <div className="contact-intro">
        <h3>Get in Touch with ARISE</h3>
        <p>
          Have a question, found a problem, or have an idea to make ARISE
          better? We'd love to hear from you!
        </p>

        <div className="contact-reasons">
          <div><strong>💬 Queries</strong><p>Ask questions about ARISE or its features.</p></div>
          <div><strong>🛠️ Complaints</strong><p>Report bugs, errors, or any issues you experience.</p></div>
          <div><strong>💡 Suggestions</strong><p>Share ideas to improve the platform.</p></div>
          <div><strong>🚀 Update Requests</strong><p>Tell us which features or improvements you'd like to see in future updates.</p></div>
        </div>

        <h3>Contact Options</h3>
        <div className="contact-methods">
          <a href="https://wa.me/919510405170" target="_blank" rel="noreferrer" className="contact-method">
            <span className="contact-method-icon">💬</span>
            <span><strong>Chat with us on WhatsApp</strong><small>Send us your question, complaint, suggestion, or update request.</small><b>+91 9510405170</b></span>
            <span className="contact-arrow">↗</span>
          </a>
          <a href="mailto:khanarhaan19512@gmail.com" className="contact-method">
            <span className="contact-method-icon">✉️</span>
            <span><strong>Email Us</strong><small>Email us the details of your query, issue, suggestion, or requested update.</small><b>khanarhaan19512@gmail.com</b></span>
            <span className="contact-arrow">↗</span>
          </a>
        </div>

        <p className="contact-thanks">
          Your feedback helps us make ARISE better. Thank you for being part of our journey! 💜
        </p>
      </div>
    </>
  )
}
