import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../pages/index';

// Mock next/router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    locales: ['en', 'ja', 'ko', 'zh', 'es', 'fr'],
    asPath: '/',
    push: mockPush,
  }),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { returnObjects?: boolean }) => {
      const translations: { [key: string]: string } = {
        'meta.title': 'Shun Kushigami - Cloud Support Engineer & Software Engineer',
        'name': 'Shun Kushigami',
        'role': 'Cloud Support Engineer / Software Engineer',
        'location': 'Osaka, Japan',
        'linkedinProfile': 'LinkedIn Profile',
        'sections.about': 'About',
        'about.description': 'Dedicated and skilled software engineer with over a decade of experience in web development and technical support. Proficient in a wide range of programming languages and tools, with a proven track record of contributing to team success through hard work, attention to detail, and excellent organizational skills. Currently focusing on AWS cloud technologies and automation tooling to improve customer experiences and team efficiency.',
        'sections.keyAchievements': 'Key Achievements',
        'achievements.awsSupport.title': 'AWS Support Tools Enhancement',
        'achievements.automationTraining.title': 'Automation Training Leadership',
        'achievements.toolingAutomation.title': 'Tooling & Automation Expertise',
        'achievements.securityLeadership.title': 'Security Leadership',
        'sections.professionalExperience': 'Professional Experience',
        'experience.aws.company': 'Amazon Web Services Japan G.K.',
        'experience.iplug.company': 'i-plug Inc.',
        'experience.officemiks.company': 'Officemiks Ltd.',
        'sections.technicalSkills': 'Technical Skills',
        'sections.recognitionHighlights': 'Recognition Highlights',
        'recognition.totalAchievements': 'Total Achievements',
        'recognition.specialistsMentored': 'Specialists Mentored (2024)',
        'sections.education': 'Education',
        'education.university': 'Kansai Gaidai University, Faculty of Foreign Studies',
        'education.degree': 'Bachelor of Arts in English and American Studies',
        'sections.languages': 'Languages',
        'languages.japanese': 'Japanese',
        'languages.english': 'English',
      };
      if (options?.returnObjects || key.includes('highlights')) {
        return ['Sample highlight 1', 'Sample highlight 2'];
      }
      return translations[key] || key;
    },
  }),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { [key: string]: unknown; alt: string }) => {
    const { priority: _priority, ...otherProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...(otherProps as React.ImgHTMLAttributes<HTMLImageElement>)} alt={props.alt} />;
  },
}));

// Mock Link component
jest.mock('next/link', () => {
  return ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
    return <a {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>;
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    render(<Home />);
  });

  it('renders the main heading with name', () => {
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Shun Kushigami');
  });

  it('renders the professional title', () => {
    const title = screen.getByText('Cloud Support Engineer / Software Engineer');
    expect(title).toBeInTheDocument();
  });

  it('renders the location information', () => {
    const location = screen.getByText('Osaka, Japan');
    expect(location).toBeInTheDocument();
  });

  it('renders the LinkedIn profile link', () => {
    const linkedinLink = screen.getByRole('link', { name: /linkedin profile/i });
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/shun-kushigami-b9964272');
    expect(linkedinLink).toHaveAttribute('target', '_blank');
  });

  it('renders the profile image', () => {
    const profileImage = screen.getByRole('img', { name: /shun kushigami/i });
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute('src', '/shunku.jpeg');
  });

  it('renders the about section', () => {
    const aboutHeading = screen.getByRole('heading', { name: /about/i });
    expect(aboutHeading).toBeInTheDocument();
    
    const aboutText = screen.getByText(/dedicated and skilled software engineer/i);
    expect(aboutText).toBeInTheDocument();
  });

  it('renders key achievements section', () => {
    const achievementsHeading = screen.getByRole('heading', { name: /key achievements/i });
    expect(achievementsHeading).toBeInTheDocument();

    // Check for specific achievements
    expect(screen.getByText('AWS Support Tools Enhancement')).toBeInTheDocument();
    expect(screen.getByText('Automation Training Leadership')).toBeInTheDocument();
    expect(screen.getByText('Tooling & Automation Expertise')).toBeInTheDocument();
    expect(screen.getByText('Security Leadership')).toBeInTheDocument();
  });

  it('renders professional experience section', () => {
    const experienceHeading = screen.getByRole('heading', { name: /professional experience/i });
    expect(experienceHeading).toBeInTheDocument();

    // Check for companies
    expect(screen.getByText('Amazon Web Services Japan G.K.')).toBeInTheDocument();
    expect(screen.getByText('i-plug Inc.')).toBeInTheDocument();
    expect(screen.getByText('Officemiks Ltd.')).toBeInTheDocument();
  });

  it('renders technical skills section', () => {
    const skillsHeading = screen.getByRole('heading', { name: /technical skills/i });
    expect(skillsHeading).toBeInTheDocument();

    // Check for some key skills
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
  });

  it('renders recognition highlights section', () => {
    const recognitionHeading = screen.getByRole('heading', { name: /recognition highlights/i });
    expect(recognitionHeading).toBeInTheDocument();

    // Check for statistics
    expect(screen.getByText('53')).toBeInTheDocument();
    expect(screen.getByText('Total Achievements')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('Specialists Mentored (2024)')).toBeInTheDocument();
  });

  it('renders education section', () => {
    const educationHeading = screen.getByRole('heading', { name: /education/i });
    expect(educationHeading).toBeInTheDocument();

    expect(screen.getByText('Kansai Gaidai University, Faculty of Foreign Studies')).toBeInTheDocument();
    expect(screen.getByText('Bachelor of Arts in English and American Studies')).toBeInTheDocument();
  });

  it('renders languages section', () => {
    const languagesHeading = screen.getByRole('heading', { name: /languages/i });
    expect(languagesHeading).toBeInTheDocument();

    expect(screen.getByText('Japanese')).toBeInTheDocument();
    // Use getAllByText for English since it appears multiple times
    expect(screen.getAllByText('English').length).toBeGreaterThan(0);
  });

  it('renders footer with copyright', () => {
    const copyright = screen.getByText(/© 2024 Shun Kushigami/);
    expect(copyright).toBeInTheDocument();
  });

  it('has accessible navigation structure', () => {
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('renders language switcher dropdown', () => {
    const languageButton = screen.getByRole('button');
    expect(languageButton).toBeInTheDocument();
    expect(languageButton).toHaveTextContent('English');
  });

  it('displays language options when dropdown is opened', async () => {
    const user = userEvent.setup();
    const languageButton = screen.getByRole('button');
    
    await user.click(languageButton);
    
    // Check for language links
    expect(screen.getAllByText('English').length).toBeGreaterThan(0);
    expect(screen.getByText('日本語')).toBeInTheDocument();
    expect(screen.getByText('한국어')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
  });

  it('shows flag icons in language switcher', () => {
    const languageButton = screen.getByRole('button');
    expect(languageButton).toHaveTextContent('🇺🇸');
  });
});