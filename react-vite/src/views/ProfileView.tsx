import React, { useState } from 'react';
import { Award, Calendar, Link as LinkIcon, MapPin, Github, FileText, Heart, ShieldAlert, Star, MessageSquare } from 'lucide-react';
import { User, Question } from '../types';

interface ProfileViewProps {
  currentUser: User;
  questions: Question[];
  onUpdateProfile: (updatedData: Partial<User>) => void;
  onQuestionClick: (id: string) => void;
}

export default function ProfileView({
  currentUser,
  questions,
  onUpdateProfile,
  onQuestionClick,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [websiteUrl, setWebsiteUrl] = useState(currentUser.websiteUrl || '');
  const [githubUrl, setGithubUrl] = useState(currentUser.githubUrl || '');

  // Filter questions asked by this specific current user
  const userQuestions = questions.filter((q) => q.author.id === currentUser.id);

  // Filter questions that current user answered
  const userAnswersCount = questions.reduce((acc, q) => {
    const hasAnswered = q.answers.some((ans) => ans.author.id === currentUser.id);
    return acc + (hasAnswered ? 1 : 0);
  }, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      displayName,
      bio,
      location,
      websiteUrl,
      githubUrl,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner & Primary Info Card */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Colorful visual pattern background banner */}
        <div className="h-32 bg-gradient-to-r from-brand-blue to-sky-600 relative" />

        <div className="p-6 relative pt-0">
          {/* Overlapping Profile Photo */}
          <div className="-mt-16 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                referrerPolicy="no-referrer"
                className="h-28 w-28 rounded-2xl object-cover border-4 border-white dark:border-zinc-950 shadow-md bg-zinc-100"
              />
              <div className="space-y-1 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>{currentUser.displayName}</span>
                  <span className="text-xs bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded-full font-sans font-bold uppercase tracking-wider">
                    Developer elite
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 font-mono">@{currentUser.username}</p>
              </div>
            </div>

            {/* Toggle edit state button */}
            {!isEditing && (
              <button
                id="btn-edit-profile-toggle"
                onClick={() => setIsEditing(true)}
                className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer active:scale-97 transition-all"
              >
                Edit Profil Developer
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-900/60">
            {/* Left Col: Contact and credentials links */}
            <div className="space-y-3.5 text-xs sm:text-sm text-zinc-650 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-zinc-450 shrink-0" />
                <span>Terdaftar: <strong className="text-zinc-800 dark:text-zinc-200 font-normal">{currentUser.joinedDate}</strong></span>
              </div>
              {currentUser.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-zinc-450 shrink-0" />
                  <span>Lokasi: <strong className="text-zinc-800 dark:text-zinc-200 font-normal">{currentUser.location}</strong></span>
                </div>
              )}
              {currentUser.websiteUrl && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-zinc-450 shrink-0" />
                  <a
                    href={currentUser.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-blue hover:underline font-medium"
                  >
                    {currentUser.websiteUrl.replace(/https?:\/\//, '')}
                  </a>
                </div>
              )}
              {currentUser.githubUrl && (
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-zinc-450 shrink-0" />
                  <a
                    href={currentUser.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-blue hover:underline font-medium"
                  >
                    {currentUser.githubUrl.replace(/https?:\/\/github\.com\//, '')}
                  </a>
                </div>
              )}
            </div>

            {/* Right Cols: Bio information */}
            <div className="md:col-span-2 text-left">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                Rangkuman Bio Profesional
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                {currentUser.bio || 'Belum ada ringkasan bio ditulis. Klik Edit Profil untuk membagikan keahlian Anda ke sesama developer.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Overlay Form inside layout */}
      {isEditing && (
        <div className="p-5 bg-white dark:bg-zinc-950 rounded-2xl border border-brand-blue/30 shadow-md">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
            Edit Profil Detail Anda
          </h2>
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Nama Tampilan</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Lokasi Kerja</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Cth: Kota Bandung, Indonesia"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Tautan Web Portfolio</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://myportfolio.com"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Tautan Akun GitHub</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/myusername"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 font-sans">Keahlian & Pengantar Bio Dirimu</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tuliskan bio draf singkat..."
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="text-xs bg-brand-blue hover:bg-brand-blue-hover text-white px-3.5 py-2 rounded-lg font-semibold cursor-pointer"
              >
                Simpan Perubahan
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3.5 py-2 rounded-lg font-semibold cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Developer Stats Bento Grid Badge Achievements */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat Box B: Reputation */}
        <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs text-center">
          <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Reputasi</div>
          <div className="mt-1 text-2xl font-black text-brand-blue font-mono">
            {currentUser.reputation.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">92th percentile</div>
        </div>

        {/* Badge Box: Gold */}
        <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs text-center flex flex-col justify-between">
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-wide flex justify-center items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Medali Emas</span>
          </div>
          <div className="mt-1.5 text-2xl font-black text-zinc-800 dark:text-zinc-100 font-mono">
            {currentUser.badges.gold}
          </div>
          <div className="text-[9px] font-medium text-zinc-400 mt-1 uppercase tracking-wide">Solusi Top Kategori</div>
        </div>

        {/* Badge Box: Silver */}
        <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs text-center flex flex-col justify-between">
          <div className="text-xs font-semibold text-zinc-400 dark:text-slate-400 uppercase tracking-wide flex justify-center items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-slate-400" />
            <span>Medali Perak</span>
          </div>
          <div className="mt-1.5 text-2xl font-black text-zinc-800 dark:text-zinc-100 font-mono">
            {currentUser.badges.silver}
          </div>
          <div className="text-[9px] font-medium text-zinc-400 mt-1 uppercase tracking-wide">Jawaban Mendukung</div>
        </div>

        {/* Badge Box: Bronze */}
        <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs text-center flex flex-col justify-between">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide flex justify-center items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            <span>Medali Perunggu</span>
          </div>
          <div className="mt-1.5 text-2xl font-black text-zinc-800 dark:text-zinc-100 font-mono">
            {currentUser.badges.bronze}
          </div>
          <div className="text-[9px] font-medium text-zinc-400 mt-1 uppercase tracking-wide">Keaktifan Komunitas</div>
        </div>
      </div>

      {/* Contribution Feed Tabs List (Questions asked or Answered by User) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Questions block */}
        <div className="space-y-3.5">
          <div className="p-1 px-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between pb-2.5">
            <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-100 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-brand-blue" />
              <span>Pertanyaan Anda ({userQuestions.length})</span>
            </h3>
            <span className="text-[10px] bg-zinc-150 dark:bg-zinc-850 text-zinc-500 dark:text-zinc-400 px-2.0 py-0.5 rounded-full font-mono">asked</span>
          </div>
          
          <div className="space-y-2 mt-2">
            {userQuestions.length > 0 ? (
              userQuestions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => onQuestionClick(q.id)}
                  className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-850 hover:border-brand-blue cursor-pointer transition-all duration-150 text-left space-y-1.5"
                >
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 hover:text-brand-blue">
                    {q.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 px-1.5 py-0.5 rounded font-bold text-brand-blue font-mono">
                      {q.votes} votes
                    </span>
                    <span>{q.answers.length} jawaban • {q.views} views</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-505 italic text-center py-6 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-xl border border-zinc-100 dark:border-zinc-900/50">
                Belum menanyakan apapun di web ini.
              </p>
            )}
          </div>
        </div>

        {/* Stats Summary overview / Skills matrix box */}
        <div className="space-y-3.5">
          <div className="p-1 px-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between pb-2.5">
            <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-100 flex items-center gap-1.5">
              <Star className="h-4 w-4 text-brand-blue" />
              <span>Tingkat Keaktifan & Skill</span>
            </h3>
            <span className="text-[10px] bg-zinc-150 dark:bg-zinc-850 text-zinc-500 dark:text-zinc-400 px-2.0 py-0.5 rounded-full font-mono font-medium">skills</span>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-850 space-y-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>Jawaban Diberikan:</span>
                <span className="font-bold text-zinc-850 dark:text-white font-mono">{userAnswersCount} kali</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>Pertanyaan Diterbitkan:</span>
                <span className="font-bold text-zinc-850 dark:text-white font-mono">{userQuestions.length} kali</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>Persentase Diterima (*Accepted*):</span>
                <span className="font-bold text-zinc-850 dark:text-white font-mono">100%</span>
              </div>
            </div>

            {/* Simulated expert status tags tags tag list */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900/60">
              <span className="block text-[10px] uppercase font-bold text-zinc-455 mb-2 dark:text-zinc-505">Tag Terlaris di Profil Anda:</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 rounded font-mono font-semibold">react (3 posts)</span>
                <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 rounded font-mono font-semibold">tailwindcss (2 posts)</span>
                <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 rounded font-mono font-semibold">next.js (2 posts)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
