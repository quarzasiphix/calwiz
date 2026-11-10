/**
 * Numerology interpretations (Pythagorean tradition). Symbolic, not predictive.
 */
import type { CoreNumber } from "./engine";

export interface NumberMeaning {
  title: string;
  keywords: string;
  /** As the number of a day (universal or personal). */
  day: string;
  /** As a Life Path. */
  lifePath: string;
  /** As a Personal Year theme. */
  year: string;
}

export const NUMBER_MEANING: Record<CoreNumber, NumberMeaning> = {
  1: {
    title: "The Initiator",
    keywords: "start · self · will",
    day: "A day associated with beginnings: start the thing, make the first move, decide alone.",
    lifePath: "Independence and leadership; learning to trust your own direction.",
    year: "A new nine-year cycle opens: plant seeds, take initiative.",
  },
  2: {
    title: "The Partner",
    keywords: "pairing · patience · tact",
    day: "Associated with cooperation and listening; good for diplomacy and details.",
    lifePath: "Sensitivity and partnership; strength through collaboration.",
    year: "A slower year of relationships, patience and quiet growth.",
  },
  3: {
    title: "The Communicator",
    keywords: "voice · joy · creation",
    day: "Associated with expression: write, talk, make something, see friends.",
    lifePath: "Creativity and expression; turning feeling into words and art.",
    year: "A social, creative year; ideas want an audience.",
  },
  4: {
    title: "The Builder",
    keywords: "order · work · foundations",
    day: "Associated with steady work: organise, repair, do the unglamorous task.",
    lifePath: "Discipline and reliability; building things that last.",
    year: "A year of effort and structure; foundations are laid.",
  },
  5: {
    title: "The Explorer",
    keywords: "change · freedom · senses",
    day: "Associated with movement and variety: travel, try, improvise.",
    lifePath: "Freedom and adaptability; learning through experience.",
    year: "A year of change, travel and unexpected turns.",
  },
  6: {
    title: "The Caretaker",
    keywords: "home · duty · harmony",
    day: "Associated with care: family, home, responsibilities, beauty.",
    lifePath: "Responsibility and nurture; the urge to make things right.",
    year: "A year centred on home, family and commitments.",
  },
  7: {
    title: "The Seeker",
    keywords: "inquiry · solitude · depth",
    day: "Associated with reflection: study, think, take time alone.",
    lifePath: "Analysis and inner life; searching for what is true.",
    year: "An inward year of study, rest and reassessment.",
  },
  8: {
    title: "The Executive",
    keywords: "power · money · results",
    day: "Associated with ambition and practical matters: finances, negotiation, decisions.",
    lifePath: "Authority and achievement; learning the right use of power.",
    year: "A year of results, recognition and material focus.",
  },
  9: {
    title: "The Humanitarian",
    keywords: "completion · compassion · release",
    day: "Associated with endings and generosity: finish, forgive, give away.",
    lifePath: "Idealism and compassion; serving something larger.",
    year: "The cycle closes: complete, release, make room.",
  },
  11: {
    title: "The Illuminator",
    keywords: "intuition · inspiration · nerves",
    day: "A master-number day (11 → 2) associated with intuition and heightened sensitivity.",
    lifePath: "Master number: inspiration and insight, with the 2's sensitivity amplified.",
    year: "A master year (11 → 2): intuition and revelation, alongside patience.",
  },
  22: {
    title: "The Master Builder",
    keywords: "vision · scale · practicality",
    day: "A master-number day (22 → 4) associated with large practical plans.",
    lifePath: "Master number: turning big visions into real structures.",
    year: "A master year (22 → 4): building at scale.",
  },
  33: {
    title: "The Master Teacher",
    keywords: "devotion · healing · guidance",
    day: "A master-number day (33 → 6) associated with service and compassion.",
    lifePath: "Master number: care and teaching elevated to a calling.",
    year: "A master year (33 → 6): responsibility for others.",
  },
};
