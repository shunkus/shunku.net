import Image from "next/image";
import Head from "next/head";
import { LinkedinIcon, MapPin, ChevronDown, BookOpen } from "lucide-react";
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale, locales, asPath } = router;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languageConfig = {
    en: { name: 'English', flag: '🇺🇸' },
    ja: { name: '日本語', flag: '🇯🇵' },
    ko: { name: '한국어', flag: '🇰🇷' },
    zh: { name: '中文', flag: '🇨🇳' },
    es: { name: 'Español', flag: '🇪🇸' },
    fr: { name: 'Français', flag: '🇫🇷' }
  };

  const currentLanguage = languageConfig[locale as keyof typeof languageConfig] || languageConfig.en;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const skills = [
    "JavaScript", "React", "Python", "AWS", "Linux", "MySQL", 
    "TypeScript", "Node.js", "Docker", "Shell Scripting"
  ];

  const achievements = [
    {
      title: t('achievements.awsSupport.title'),
      description: t('achievements.awsSupport.description'),
      date: t('achievements.awsSupport.date')
    },
    {
      title: t('achievements.automationTraining.title'),
      description: t('achievements.automationTraining.description'),
      date: t('achievements.automationTraining.date')
    },
    {
      title: t('achievements.toolingAutomation.title'),
      description: t('achievements.toolingAutomation.description'),
      date: t('achievements.toolingAutomation.date')
    },
    {
      title: t('achievements.securityLeadership.title'),
      description: t('achievements.securityLeadership.description'),
      date: t('achievements.securityLeadership.date')
    }
  ];

  const experience = [
    {
      company: t('experience.aws.company'),
      role: t('experience.aws.role'),
      period: t('experience.aws.period'),
      highlights: t('experience.aws.highlights', { returnObjects: true }) as string[]
    },
    {
      company: t('experience.iplug.company'),
      role: t('experience.iplug.role'),
      period: t('experience.iplug.period'),
      highlights: t('experience.iplug.highlights', { returnObjects: true }) as string[]
    },
    {
      company: t('experience.officemiks.company'),
      role: t('experience.officemiks.role'),
      period: t('experience.officemiks.period'),
      highlights: t('experience.officemiks.highlights', { returnObjects: true }) as string[]
    }
  ];

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Navigation and Language Switcher */}
          <div className="flex justify-between items-center mb-4">
            <nav>
              <Link 
                href="/blog" 
                className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-sm"
              >
                <BookOpen size={16} />
                {t('nav.blog')}
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              {/* Language Switcher Dropdown */}
              <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <span className="text-lg">{currentLanguage.flag}</span>
                <span>{currentLanguage.name}</span>
                <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {locales?.map((loc) => {
                    const langConfig = languageConfig[loc as keyof typeof languageConfig];
                    if (!langConfig) return null;
                    
                    return (
                      <Link
                        key={loc}
                        href={asPath}
                        locale={loc}
                        onClick={() => setIsDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          locale === loc ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{langConfig.flag}</span>
                        <span className="font-medium">{langConfig.name}</span>
                        {locale === loc && (
                          <span className="ml-auto text-blue-600">✓</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Image
                src="/shunku.jpeg"
                alt="Shun Kushigami"
                width={120}
                height={120}
                className="rounded-full object-cover border-4 border-blue-100"
                priority
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900">{t('name')}</h1>
              <p className="text-xl text-blue-600 mt-2">{t('role')}</p>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{t('location')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LinkedinIcon size={16} />
                  <a href="https://www.linkedin.com/in/shun-kushigami-b9964272" className="hover:text-blue-600 transition-colors" target="_blank" rel="noopener noreferrer">
                    {t('linkedinProfile')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* About Section */}
        <section className="mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('sections.about')}</h2>
            <p className="text-gray-700 leading-relaxed">
              {t('about.description')}
            </p>
          </div>
        </section>

        {/* Key Achievements Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('sections.keyAchievements')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{achievement.title}</h3>
                  <span className="text-sm text-blue-600 font-medium">{achievement.date}</span>
                </div>
                <p className="text-gray-700">{achievement.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('sections.professionalExperience')}</h2>
          <div className="space-y-6">
            {experience.map((job, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{job.role}</h3>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1">
                    <p className="text-blue-600 font-medium">{job.company}</p>
                    <p className="text-gray-600 text-sm">{job.period}</p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {job.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('sections.technicalSkills')}</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Recognition Highlights */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('sections.recognitionHighlights')}</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">53</div>
                <p className="text-gray-600">{t('recognition.totalAchievements')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">9</div>
                <p className="text-gray-600">{t('recognition.specialistsMentored')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">6+</div>
                <p className="text-gray-600">{t('recognition.awardPrograms')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('sections.education')}</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{t('education.university')}</h3>
            <p className="text-blue-600 font-medium">{t('education.degree')}</p>
            <p className="text-gray-600 text-sm">{t('education.graduationDate')}</p>
          </div>
        </section>

        {/* Languages */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('sections.languages')}</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex gap-6">
              <div>
                <span className="font-medium text-gray-900">{t('languages.japanese')}</span>
                <p className="text-sm text-gray-600">{t('languages.native')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">{t('languages.english')}</span>
                <p className="text-sm text-gray-600">{t('languages.professional')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Shun Kushigami. All rights reserved.</p>
            <p className="mt-2 text-sm">Built with Next.js and Tailwind CSS</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};