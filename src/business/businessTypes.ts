export type BusinessUnit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type BusinessTerm = {
  id: string;
  unit: BusinessUnit;
  topicId: string;
  relatedTopicIds?: string[];
  sourceRefs?: number[];
  term: string;
  termZh: string;
  definitionEn: string;
  explanationZh: string;
  exampleEn: string;
  exampleZh: string;
  usageNoteZh?: string;
};

export type SyllabusSection = {
  id: string;
  unit: BusinessUnit;
  titleEn: string;
  titleZh: string;
};

export type BusinessUnitInfo = {
  id: BusinessUnit;
  titleEn: string;
  titleZh: string;
};
