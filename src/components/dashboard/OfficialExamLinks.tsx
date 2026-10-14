import React from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Building2,
  FileText,
  Award,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getOfficialLinksForUser, OfficialLink } from '../../services/officialLinksService';

interface OfficialExamLinksProps {
  user: UserProfile;
  className?: string;
}

export const OfficialExamLinks: React.FC<OfficialExamLinksProps> = ({ user, className = '' }) => {
  const { examName, authorityName, links } = getOfficialLinksForUser(
    user.path,
    user.board,
    user.path === 'competitive' ? user.competitiveExam : user.board
  );

  return (
    <div className={`glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Globe className="w-4 h-4 text-cyan-400" />
            </span>
            <h2 className="text-base md:text-lg font-bold text-white font-heading">
              Official Examination Portals & Regulatory Authorities
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verified official portals tailored strictly for your syllabus: <strong className="text-cyan-300">{examName}</strong> ({authorityName})
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Government / Apex Verified</span>
        </div>
      </div>

      {/* Grid of official portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between shadow-sm hover:shadow-cyan-500/10"
          >
            <div>
              {/* Badge & Category */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  {link.category}
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  {link.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xs md:text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-start justify-between gap-1.5">
                <span>{link.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 mt-0.5 transition-colors" />
              </h3>

              {/* Organization */}
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                <Building2 className="w-3 h-3 text-slate-500" />
                <span>{link.organization}</span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {link.description}
              </p>
            </div>

            {/* Direct Link Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-cyan-400 transition-colors">
              <span className="font-mono truncate max-w-[180px]">{link.url.replace('https://', '')}</span>
              <span className="font-semibold text-cyan-400 text-xs flex items-center gap-1">
                Visit Portal &rarr;
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
