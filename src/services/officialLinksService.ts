import { EducationPath, SchoolBoard, CompetitiveExam } from '../types';

export interface OfficialLink {
  title: string;
  organization: string;
  url: string;
  description: string;
  category: 'Portal' | 'Admit Card' | 'Syllabus' | 'Results & Counseling' | 'PYQs & Textbooks';
  badge: string;
  isGovernment: boolean;
}

export function getOfficialLinksForUser(
  path: EducationPath,
  board?: SchoolBoard,
  exam?: CompetitiveExam | string
): {
  examName: string;
  authorityName: string;
  links: OfficialLink[];
} {
  if (path === 'competitive') {
    switch (exam) {
      case 'JEE Main':
        return {
          examName: 'Joint Entrance Examination (Main)',
          authorityName: 'National Testing Agency (NTA)',
          links: [
            {
              title: 'NTA JEE (Main) Official Candidate Portal',
              organization: 'NTA & Ministry of Education',
              url: 'https://jeemain.nta.nic.in',
              description: 'Official application forms, city intimation slips, admit cards, answer key challenge, and final scorecards.',
              category: 'Portal',
              badge: 'Official Primary',
              isGovernment: true,
            },
            {
              title: 'National Testing Agency Central Portal',
              organization: 'NTA',
              url: 'https://nta.ac.in',
              description: 'Official public notices, press releases, grievance portal, and exam calendar.',
              category: 'Portal',
              badge: 'Govt Apex Body',
              isGovernment: true,
            },
            {
              title: 'JoSAA Joint Seat Allocation Authority',
              organization: 'JoSAA (IITs & NITs+)',
              url: 'https://josaa.nic.in',
              description: 'Official centralized counseling and seat allocation for 23 IITs, 32 NITs, 26 IIITs, and other GFTIs.',
              category: 'Results & Counseling',
              badge: 'IIT / NIT Counseling',
              isGovernment: true,
            },
            {
              title: 'JEE (Advanced) Official Examination Portal',
              organization: 'Organizing IIT (IIT Madras / IIT Kanpur)',
              url: 'https://jeeadv.ac.in',
              description: 'Eligibility criteria, detailed syllabus, past question papers, and candidate registration for IIT admissions.',
              category: 'Syllabus',
              badge: 'IIT Admissions',
              isGovernment: true,
            },
            {
              title: 'NCERT Digital Textbook & Exemplar Repository',
              organization: 'NCERT',
              url: 'https://ncert.nic.in/textbook.php',
              description: 'Official PDF curriculum textbooks, standard exemplar problems, and rationalized chapter guidelines.',
              category: 'PYQs & Textbooks',
              badge: 'Syllabus Baseline',
              isGovernment: true,
            },
          ],
        };

      case 'JEE Advanced':
        return {
          examName: 'Joint Entrance Examination (Advanced)',
          authorityName: 'Joint Admission Board (JAB) / IITs',
          links: [
            {
              title: 'JEE (Advanced) Official Portal',
              organization: 'Organizing IIT',
              url: 'https://jeeadv.ac.in',
              description: 'Official syllabus, sample papers, registration portal, response sheets, and rank lists for IIT seats.',
              category: 'Portal',
              badge: 'Official IIT Portal',
              isGovernment: true,
            },
            {
              title: 'JoSAA Central Seat Counseling',
              organization: 'JoSAA',
              url: 'https://josaa.nic.in',
              description: 'Choice filling, mock seat allotments, seat acceptance fees, and opening/closing ranks across IITs.',
              category: 'Results & Counseling',
              badge: 'Official Seat Matrix',
              isGovernment: true,
            },
            {
              title: 'JEE (Main) NTA Portal',
              organization: 'NTA',
              url: 'https://jeemain.nta.nic.in',
              description: 'Qualifying score requirements and registration roll number verification.',
              category: 'Admit Card',
              badge: 'Qualifier Portal',
              isGovernment: true,
            },
          ],
        };

      case 'NEET':
        return {
          examName: 'National Eligibility cum Entrance Test (UG)',
          authorityName: 'NTA & National Medical Commission (NMC)',
          links: [
            {
              title: 'NTA NEET (UG) Official Candidate Portal',
              organization: 'National Testing Agency',
              url: 'https://exams.nta.ac.in/NEET/',
              description: 'Information bulletin, online applications, admit card download, OMR sheets, and NTA scorecards.',
              category: 'Portal',
              badge: 'Official Primary',
              isGovernment: true,
            },
            {
              title: 'Medical Counselling Committee (MCC)',
              organization: 'DGHS / Ministry of Health',
              url: 'https://mcc.nic.in',
              description: '15% All India Quota (AIQ), Central & Deemed Universities, AIIMS, and JIPMER MBBS/BDS online counseling.',
              category: 'Results & Counseling',
              badge: 'Official AIQ Counseling',
              isGovernment: true,
            },
            {
              title: 'National Medical Commission (NMC)',
              organization: 'NMC India',
              url: 'https://www.nmc.org.in',
              description: 'Statutory medical education regulatory body; defines NEET UG official syllabus, eligibility, and medical seat matrix.',
              category: 'Syllabus',
              badge: 'Apex Medical Council',
              isGovernment: true,
            },
            {
              title: 'NCERT Biology, Chemistry & Physics e-Books',
              organization: 'NCERT',
              url: 'https://ncert.nic.in/textbook.php',
              description: 'Official foundational NCERT material containing line-by-line high-yield NEET biology & chemistry content.',
              category: 'PYQs & Textbooks',
              badge: 'High-Yield Source',
              isGovernment: true,
            },
          ],
        };

      case 'UPSC CSE':
        return {
          examName: 'Civil Services Examination (IAS/IPS/IFS)',
          authorityName: 'Union Public Service Commission (UPSC)',
          links: [
            {
              title: 'UPSC Official Commission Portal',
              organization: 'UPSC',
              url: 'https://upsc.gov.in',
              description: 'Official annual examination calendar, notifications, e-admit cards, answer keys, and final merit lists.',
              category: 'Portal',
              badge: 'Constitutional Body',
              isGovernment: true,
            },
            {
              title: 'UPSC One Time Registration (OTR) Portal',
              organization: 'UPSC',
              url: 'https://upsconline.nic.in',
              description: 'Candidate profile setup, online CSE Prelims and Mains application form submissions.',
              category: 'Admit Card',
              badge: 'Official Applications',
              isGovernment: true,
            },
            {
              title: 'Press Information Bureau (PIB)',
              organization: 'Ministry of Information & Broadcasting',
              url: 'https://pib.gov.in',
              description: 'Official government press releases, schemes, economic data, and current affairs reference.',
              category: 'PYQs & Textbooks',
              badge: 'Current Affairs Source',
              isGovernment: true,
            },
          ],
        };

      case 'GATE':
        return {
          examName: 'Graduate Aptitude Test in Engineering',
          authorityName: 'National Coordination Board (NCB) - GATE / IITs',
          links: [
            {
              title: 'GATE Official Organizing Institute Portal',
              organization: 'Organizing IIT (IIT Roorkee / IIT KGP)',
              url: 'https://gate2026.iitk.ac.in',
              description: 'Information brochure, GOAPS candidate registration, paper patterns, two-paper combinations, and scorecards.',
              category: 'Portal',
              badge: 'Official GATE',
              isGovernment: true,
            },
            {
              title: 'CCMT Centralized Counseling (M.Tech)',
              organization: 'NITs & CFTIs',
              url: 'https://ccmt.admissions.nic.in',
              description: 'Centralized counseling for M.Tech/M.Arch/M.Plan admissions based on valid GATE scores.',
              category: 'Results & Counseling',
              badge: 'M.Tech Admissions',
              isGovernment: true,
            },
            {
              title: 'COAP Common Offer Acceptance Portal',
              organization: 'IITs',
              url: 'https://coap.iitd.ac.in',
              description: 'Synchronized seat allocation portal for IIT M.Tech programs and PSU job interviews.',
              category: 'Results & Counseling',
              badge: 'IIT Seats & PSUs',
              isGovernment: true,
            },
          ],
        };

      case 'CAT':
        return {
          examName: 'Common Admission Test (IIM CAT)',
          authorityName: 'Indian Institutes of Management (IIMs)',
          links: [
            {
              title: 'IIM CAT Official Testing Portal',
              organization: 'IIM CAT Organizing Committee',
              url: 'https://iimcat.ac.in',
              description: 'Online registration, mock tests, admit cards, score release, and non-IIM member institutes list.',
              category: 'Portal',
              badge: 'Official IIM Portal',
              isGovernment: true,
            },
          ],
        };

      case 'SSC CGL':
        return {
          examName: 'Staff Selection Commission - Combined Graduate Level',
          authorityName: 'Staff Selection Commission (Govt of India)',
          links: [
            {
              title: 'SSC Official Commission Portal',
              organization: 'Staff Selection Commission',
              url: 'https://ssc.gov.in',
              description: 'Tier-I & Tier-II notifications, exam calendars, regional portals, answer keys, and post-wise allocations.',
              category: 'Portal',
              badge: 'Official Portal',
              isGovernment: true,
            },
          ],
        };

      case 'CLAT':
        return {
          examName: 'Common Law Admission Test',
          authorityName: 'Consortium of National Law Universities',
          links: [
            {
              title: 'Consortium of NLUs Official Portal',
              organization: 'Consortium of NLUs',
              url: 'https://consortiumofnlus.ac.in',
              description: 'Syllabus, sample questions, registration, counseling schedule, and allotment to 24 National Law Universities.',
              category: 'Portal',
              badge: 'Official NLU Body',
              isGovernment: false,
            },
          ],
        };

      default:
        return {
          examName: exam || 'National Competitive Exam',
          authorityName: 'Examination Authority',
          links: [
            {
              title: 'National Testing Agency',
              organization: 'NTA',
              url: 'https://nta.ac.in',
              description: 'Central apex testing organization in India conducting higher education entrance examinations.',
              category: 'Portal',
              badge: 'Official Primary',
              isGovernment: true,
            },
            {
              title: 'NCERT Central Educational Resource',
              organization: 'NCERT',
              url: 'https://ncert.nic.in',
              description: 'Standard textbooks, curriculum standards, and reference research.',
              category: 'PYQs & Textbooks',
              badge: 'Govt Portal',
              isGovernment: true,
            },
          ],
        };
    }
  }

  // School Board paths
  if (board === 'ICSE') {
    return {
      examName: 'CISCE Board (ICSE / ISC)',
      authorityName: 'Council for the Indian School Certificate Examinations',
      links: [
        {
          title: 'CISCE Official Council Portal',
          organization: 'CISCE',
          url: 'https://cisce.org',
          description: 'Official notifications, circulars, board date sheets, and result verification portal.',
          category: 'Portal',
          badge: 'Official CISCE',
          isGovernment: false,
        },
        {
          title: 'CISCE Regulations & Syllabuses',
          organization: 'CISCE Academic',
          url: 'https://cisce.org/regulations-and-syllabuses',
          description: 'Comprehensive chapter-wise weightage and scope of syllabus for Class 10 (ICSE) and Class 12 (ISC).',
          category: 'Syllabus',
          badge: 'Official Syllabus',
          isGovernment: false,
        },
        {
          title: 'CISCE Specimen Question Papers',
          organization: 'CISCE Examination',
          url: 'https://cisce.org/specimen-question-papers',
          description: 'Official specimen papers, answer patterns, and marking guidelines issued for the current academic session.',
          category: 'PYQs & Textbooks',
          badge: 'Specimen Papers',
          isGovernment: false,
        },
      ],
    };
  }

  // Default to CBSE / State Board
  return {
    examName: `${board || 'CBSE'} Examination`,
    authorityName: 'Central Board of Secondary Education',
    links: [
      {
        title: 'CBSE Official Main Website',
        organization: 'CBSE / Ministry of Education',
        url: 'https://cbse.gov.in',
        description: 'Main circulars, press notices, board exam date sheets, and result announcements.',
        category: 'Portal',
        badge: 'Official CBSE',
        isGovernment: true,
      },
      {
        title: 'CBSE Academic Website',
        organization: 'CBSE Curriculum Division',
        url: 'https://cbseacademic.nic.in',
        description: 'Official curriculum guidelines, sample question papers (SQPs), marking schemes, and question banks.',
        category: 'Syllabus',
        badge: 'Academic & Papers',
        isGovernment: true,
      },
      {
        title: 'Pariksha Sangam Portal',
        organization: 'CBSE Exams',
        url: 'https://parikshasangam.cbse.gov.in',
        description: 'Single window portal for school affiliation, exam center locator, practical marks upload, and admit cards.',
        category: 'Admit Card',
        badge: 'Exam Services',
        isGovernment: true,
      },
      {
        title: 'NCERT Digital Books & Exemplars',
        organization: 'NCERT',
        url: 'https://ncert.nic.in/textbook.php',
        description: 'Prescribed textbooks for classes 6 to 12 in English, Hindi, and Urdu with rationalized syllabi.',
        category: 'PYQs & Textbooks',
        badge: 'Official Textbooks',
        isGovernment: true,
      },
      {
        title: 'DIKSHA National Digital Infrastructure',
        organization: 'Ministry of Education',
        url: 'https://diksha.gov.in',
        description: 'Interactive quizzes, lesson plans, audiobooks, and state-aligned digital content.',
        category: 'PYQs & Textbooks',
        badge: 'Digital Content',
        isGovernment: true,
      },
    ],
  };
}
