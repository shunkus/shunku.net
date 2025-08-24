import Image from "next/image";
import { Linkedin, MapPin } from "lucide-react";

export default function Home() {
  const skills = [
    "JavaScript", "React", "Python", "AWS", "Linux", "MySQL", 
    "TypeScript", "Node.js", "Docker", "Shell Scripting"
  ];

  const achievements = [
    {
      title: "AWS Support Tools Enhancement",
      description: "Delivered 21 incremental enhancements for EC2 Instance Connect Console, focusing on case prevention and reducing failed connections.",
      date: "2025"
    },
    {
      title: "Automation Training Leadership",
      description: "Led and organized automation training bootcamps, training engineers and improving assessment pass rates to >70%.",
      date: "2024"
    },
    {
      title: "Tooling & Automation Expertise",
      description: "Mentored 9 new automation specialists in 2024, contributing to AWS Support's automation and tooling community growth.",
      date: "2024"
    },
    {
      title: "Security Leadership",
      description: "First security specialist for the support team, improving security across the organization through tool development.",
      date: "2023"
    }
  ];

  const experience = [
    {
      company: "Amazon Web Services Japan G.K.",
      role: "Cloud Support Engineer",
      period: "December 2017 - Present",
      highlights: [
        "Provide technical support and guidance on AWS services to customers",
        "Develop internal tools to improve team efficiency and customer service quality",
        "Create training materials and videos for new employees and customers",
        "Collaborate on console improvements and bug fixes, enhancing user experience"
      ]
    },
    {
      company: "i-plug Inc.",
      role: "Software Engineer",
      period: "December 2014 - December 2017",
      highlights: [
        "Developed and maintained a matching service platform for new graduates and hiring companies",
        "Redesigned database architecture to improve search performance by tenfold"
      ]
    },
    {
      company: "Officemiks Ltd.",
      role: "Software Engineer", 
      period: "November 2011 - December 2014",
      highlights: [
        "Led development projects for clients ranging from SMEs to large corporations",
        "Created a custom CMS for a major beverage company's internal communication system"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
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
              <h1 className="text-4xl font-bold text-gray-900">Shun Kushigami</h1>
              <p className="text-xl text-blue-600 mt-2">Cloud Support Engineer / Software Engineer</p>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>Osaka, Japan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin size={16} />
                  <a href="https://www.linkedin.com/in/shun-kushigami-b9964272" className="hover:text-blue-600 transition-colors" target="_blank" rel="noopener noreferrer">
                    LinkedIn Profile
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">
              Dedicated and skilled software engineer with over a decade of experience in web development and technical support. 
              Proficient in a wide range of programming languages and tools, with a proven track record of contributing to team 
              success through hard work, attention to detail, and excellent organizational skills. Currently focusing on AWS cloud 
              technologies and automation tooling to improve customer experiences and team efficiency.
            </p>
          </div>
        </section>

        {/* Key Achievements Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Achievements</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Experience</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Skills</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recognition Highlights</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">53</div>
                <p className="text-gray-600">Total Achievements</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">9</div>
                <p className="text-gray-600">Specialists Mentored (2024)</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">6+</div>
                <p className="text-gray-600">Award Programs</p>
              </div>
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Education</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Kansai Gaidai University, Faculty of Foreign Studies</h3>
            <p className="text-blue-600 font-medium">Bachelor of Arts in English and American Studies</p>
            <p className="text-gray-600 text-sm">October 2010</p>
          </div>
        </section>

        {/* Languages */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Languages</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex gap-6">
              <div>
                <span className="font-medium text-gray-900">Japanese</span>
                <p className="text-sm text-gray-600">Native</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">English</span>
                <p className="text-sm text-gray-600">Professional</p>
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
  );
}