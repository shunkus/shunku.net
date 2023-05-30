// pages/skills.tsx

import Head from "next/head";

const skills = [
  { id: 1, name: "JavaScript", startYear: 2010 },
  { id: 2, name: "Data Science", startYear: 2017 },
  { id: 3, name: "Design", startYear: 2010 },
  { id: 4, name: "AWS Cloud", startYear: 2017 },
  { id: 5, name: "Python", startYear: 2015 },
  { id: 6, name: "React.js", startYear: 2016 },
  { id: 7, name: "Next.js", startYear: 2019 },
];

export default function Skills() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>Skills - Shunku</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-2xl font-bold text-center">My Skills</h1>

          {skills.map((skill) => (
            <div key={skill.id} className="mt-6">
              <h2 className="text-xl font-bold">{skill.name}</h2>
              <p className="mt-2 text-sm text-gray-500">
                Experience: {currentYear - skill.startYear} years
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
