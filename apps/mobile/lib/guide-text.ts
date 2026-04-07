import { ABOUT_EN } from './guide-documents/about.en';
import { ABOUT_PT } from './guide-documents/about.pt';
import { HOW_IT_WORKS_EN } from './guide-documents/how-it-works.en';
import { HOW_IT_WORKS_PT } from './guide-documents/how-it-works.pt';
import { FOR_EMPLOYERS_EN } from './guide-documents/for-employers.en';
import { FOR_EMPLOYERS_PT } from './guide-documents/for-employers.pt';
import { FOR_PROVIDERS_EN } from './guide-documents/for-providers.en';
import { FOR_PROVIDERS_PT } from './guide-documents/for-providers.pt';

type Language = 'en' | 'pt';
type GuideType = 'ABOUT' | 'HOW_IT_WORKS' | 'FOR_EMPLOYERS' | 'FOR_PROVIDERS';

const guides: Record<GuideType, Record<Language, string>> = {
  ABOUT: { en: ABOUT_EN, pt: ABOUT_PT },
  HOW_IT_WORKS: { en: HOW_IT_WORKS_EN, pt: HOW_IT_WORKS_PT },
  FOR_EMPLOYERS: { en: FOR_EMPLOYERS_EN, pt: FOR_EMPLOYERS_PT },
  FOR_PROVIDERS: { en: FOR_PROVIDERS_EN, pt: FOR_PROVIDERS_PT },
};

export function getGuideDocument(type: GuideType, language: Language = 'en'): string {
  return guides[type]?.[language] || guides[type]?.en || '';
}
