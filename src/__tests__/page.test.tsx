import { render, screen } from '@testing-library/react';
import Home from '../pages/index';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { priority, ...otherProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...otherProps} alt={props.alt} />;
  },
}));

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
    expect(screen.getByText('English')).toBeInTheDocument();
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
});