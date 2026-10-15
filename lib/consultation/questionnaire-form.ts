import type { ConsultQuestionnaireAnswers } from "@/types/consultation";

export type QuestionnaireForm = {
  name: string;
  phone: string;
  email: string;
  comms: string;
  spaceType: string;
  spaceOther: string;
  scope: string;
  scopeOther: string;
  siteVisit: boolean | null;
  location: string;
  tenure: string;
  consultWhen: string;
  drawings: boolean | null;
  size: string;
  measureService: boolean | null;
  engineerAnalysis: boolean | null;
  goals: string;
  stylesPref: string;
  mustHaves: string;
  avoid: string;
  budget: string;
  budgetNotes: string;
  startDate: string;
  endDate: string;
  likes: string;
  dislikes: string;
  keepFurniture: string;
  useSpace: string;
  functional: string;
  specialNeeds: string;
  colors: string;
  materials: string;
  inspoFileName: string | null;
  brands: string;
  structural: string;
  lighting: string;
  temperature: string;
  concerns: string;
  other: string;
};

export function questionnaireToAnswers(form: QuestionnaireForm): ConsultQuestionnaireAnswers {
  return {
    name: form.name,
    phone: form.phone,
    email: form.email,
    preferred_communication: form.comms,
    space_type: form.spaceType,
    space_other: form.spaceOther,
    scope: form.scope,
    scope_other: form.scopeOther,
    site_visit: form.siteVisit,
    location: form.location,
    tenure: form.tenure,
    consult_when: form.consultWhen,
    drawings: form.drawings,
    size: form.size,
    measure_service: form.measureService,
    engineer_analysis: form.engineerAnalysis,
    goals: form.goals,
    styles_pref: form.stylesPref,
    must_haves: form.mustHaves,
    avoid: form.avoid,
    budget: form.budget,
    budget_notes: form.budgetNotes,
    start_date: form.startDate,
    end_date: form.endDate,
    likes: form.likes,
    dislikes: form.dislikes,
    keep_furniture: form.keepFurniture,
    use_space: form.useSpace,
    functional: form.functional,
    special_needs: form.specialNeeds,
    colors: form.colors,
    materials: form.materials,
    inspo_file_name: form.inspoFileName,
    brands: form.brands,
    structural: form.structural,
    lighting: form.lighting,
    temperature: form.temperature,
    concerns: form.concerns,
    other: form.other,
  };
}

export function questionnaireFromAnswers(
  answers: ConsultQuestionnaireAnswers,
  seed: QuestionnaireForm,
): QuestionnaireForm {
  return {
    name: answers.name ?? seed.name,
    phone: answers.phone ?? seed.phone,
    email: answers.email ?? seed.email,
    comms: answers.preferred_communication ?? seed.comms,
    spaceType: answers.space_type ?? seed.spaceType,
    spaceOther: answers.space_other ?? seed.spaceOther,
    scope: answers.scope ?? seed.scope,
    scopeOther: answers.scope_other ?? seed.scopeOther,
    siteVisit: answers.site_visit === undefined ? seed.siteVisit : answers.site_visit,
    location: answers.location ?? seed.location,
    tenure: answers.tenure ?? seed.tenure,
    consultWhen: answers.consult_when ?? seed.consultWhen,
    drawings: answers.drawings === undefined ? seed.drawings : answers.drawings,
    size: answers.size ?? seed.size,
    measureService:
      answers.measure_service === undefined ? seed.measureService : answers.measure_service,
    engineerAnalysis:
      answers.engineer_analysis === undefined ? seed.engineerAnalysis : answers.engineer_analysis,
    goals: answers.goals ?? seed.goals,
    stylesPref: answers.styles_pref ?? seed.stylesPref,
    mustHaves: answers.must_haves ?? seed.mustHaves,
    avoid: answers.avoid ?? seed.avoid,
    budget: answers.budget ?? seed.budget,
    budgetNotes: answers.budget_notes ?? seed.budgetNotes,
    startDate: answers.start_date ?? seed.startDate,
    endDate: answers.end_date ?? seed.endDate,
    likes: answers.likes ?? seed.likes,
    dislikes: answers.dislikes ?? seed.dislikes,
    keepFurniture: answers.keep_furniture ?? seed.keepFurniture,
    useSpace: answers.use_space ?? seed.useSpace,
    functional: answers.functional ?? seed.functional,
    specialNeeds: answers.special_needs ?? seed.specialNeeds,
    colors: answers.colors ?? seed.colors,
    materials: answers.materials ?? seed.materials,
    inspoFileName:
      answers.inspo_file_name === undefined ? seed.inspoFileName : answers.inspo_file_name,
    brands: answers.brands ?? seed.brands,
    structural: answers.structural ?? seed.structural,
    lighting: answers.lighting ?? seed.lighting,
    temperature: answers.temperature ?? seed.temperature,
    concerns: answers.concerns ?? seed.concerns,
    other: answers.other ?? seed.other,
  };
}
