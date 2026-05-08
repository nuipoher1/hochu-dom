export interface CategoryWithSubs {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  importantNotes: string | null;
  commonMistakes: string | null;
  attentionPoints: string | null;
  tips: Tip[];
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number;
  order: number;
}

export interface Tip {
  id: number;
  text: string;
  type: string;
  order: number;
}

export interface ContractorWithSubs {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  geography: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  vk: string | null;
  telegram: string | null;
  whatsapp: string | null;
  isFestivalPartner: boolean;
  isSpeaker: boolean;
  speakerTopic: string | null;
  speakerLectureUrl: string | null;
  subcategories: {
    subcategory: Subcategory & { category: { name: string; slug: string } };
  }[];
}
