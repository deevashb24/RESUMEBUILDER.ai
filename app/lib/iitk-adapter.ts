import { ParsedResumeData } from "./resume";

export type IITKExperienceEntry =
  | {
      id: string;
      variant: "simple";
      role: string;
      organization: string;
      displayDate?: string;
      bullets: string[];
      isVisible?: boolean;
    }
  | {
      id: string;
      variant: "structured";
      role: string;
      organization: string;
      displayDate?: string;
      highlight?: string;
      blocks: Array<{
        label: "Objective" | "Approach" | "Impact" | string;
        items: string[];
      }>;
      isVisible?: boolean;
    };

export interface IITKAchievement {
  id: string;
  text: string;
  trailingDate?: string;
  isVisible?: boolean;
}

export interface IITKProjectEntry {
  id: string;
  title: string;
  context?: string;
  subtitle?: string;
  displayDate?: string;
  bullets: string[];
  link?: string;
  isVisible?: boolean;
}

export interface IITKHeaderData {
  name: string;
  academicLine1?: string;
  academicLine2?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
}

export interface IITKResumeDocument {
  header: IITKHeaderData;
  academicQualifications?: { id: string; year: string; degree: string; institute: string; performance: string; isVisible?: boolean }[];
  academicAchievements?: IITKAchievement[];
  professionalExperience?: IITKExperienceEntry[];
  projectsAndWorkshops?: IITKProjectEntry[];
  technicalSkillsTable?: { id: string; label: string; text: string; isVisible?: boolean }[];
  positionsOfResponsibility?: { id: string; role: string; organization: string; displayDate?: string; bullets: string[]; isVisible?: boolean }[];
  extracurricularCategories?: { id: string; category: string; bullets: string[]; isVisible?: boolean }[];
}

export function mapParsedResumeToIITKDocument(data: ParsedResumeData): IITKResumeDocument {
  const iitk = data.layoutOverrides?.iitk as Partial<IITKResumeDocument> | undefined;
  
  const extractUsername = (url: string) => {
    if (!url) return url;
    try {
      const match = url.replace(/\/$/, "").split("/");
      return match[match.length - 1] || url;
    } catch {
      return url;
    }
  }

  return {
    header: {
      name: iitk?.header?.name || data.personal.name || "Full Name",
      academicLine1: iitk?.header?.academicLine1 || "Academic Title / Department",
      academicLine2: iitk?.header?.academicLine2 || "Secondary Title / Minor",
      email: iitk?.header?.email || data.personal.email,
      phone: iitk?.header?.phone || data.personal.phone,
      linkedin: iitk?.header?.linkedin || extractUsername(data.personal.linkedin),
      github: iitk?.header?.github || extractUsername(data.personal.summary || "github_username"),
    },
    academicQualifications: iitk?.academicQualifications || data.education.map(ed => ({
      id: ed.id,
      year: `${ed.start}${ed.end ? ` - ${ed.end}` : ''}`,
      degree: ed.degree ? `${ed.degree}, ${ed.field}` : ed.field,
      institute: ed.school,
      performance: ed.gpa || "",
      isVisible: ed.isVisible
    })),
    academicAchievements: iitk?.academicAchievements || [],
    professionalExperience: iitk?.professionalExperience || data.experience.map(exp => ({
      id: exp.id,
      variant: "simple",
      role: exp.role,
      organization: exp.company,
      displayDate: `${exp.start}${exp.end ? ` - ${exp.end}` : ''}`,
      bullets: exp.bullets,
      isVisible: exp.isVisible
    })),
    projectsAndWorkshops: iitk?.projectsAndWorkshops || data.projects.map(proj => ({
      id: proj.id,
      title: proj.title,
      subtitle: proj.tech.join(" | "),
      bullets: proj.bullets,
      link: proj.link,
      isVisible: proj.isVisible
    })),
    technicalSkillsTable: iitk?.technicalSkillsTable || [
      { id: "s-lang", label: "Programming Languages", text: data.skills.languages.join(" | ") },
      { id: "s-frame", label: "Frameworks & Libraries", text: data.skills.frameworks.join(" | ") },
      { id: "s-tool", label: "Tools", text: data.skills.tools.join(" | ") },
      { id: "s-con", label: "Concepts", text: data.skills.concepts.join(" | ") },
    ].filter(s => s.text.length > 0),
    positionsOfResponsibility: iitk?.positionsOfResponsibility || [],
    extracurricularCategories: iitk?.extracurricularCategories || []
  };
}
