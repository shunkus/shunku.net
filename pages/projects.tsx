// pages/projects.tsx

import Head from "next/head";
import Link from "next/link";

const projects = [
  {
    id: 0,
    title: "My Portfolio",
    description: "shunku's portfolio website you're visiting now.",
    technologies: ["JavaScript", "React", "Next.js", "Tailwind"],
    link: "https://github.com/shunkus/shunku.net",
  },
  {
    id: 1,
    title: "IAM Actions",
    description:
      "A tool for quickly viewing a list of AWS Identity and Access Management (IAM) actions",
    technologies: ["JavaScript", "React", "Next.js", "Tailwind", "AWS"],
    link: "https://github.com/shunkus/iam-actions",
  },
  {
    id: 2,
    title: "JavaScript Fundamentals: Your Path to Becoming an Expert",
    description:
      "An online course that explains the knowledge needed to take JavaScript from beginner to expert.",
    technologies: [
      "JavaScript",
      "React",
      "Next.js",
      "Remix",
      "Gatsby",
      "Angular",
      "Vue",
    ],
    link: "https://dev.to/shunku/chapter-1-introduction-to-javascript-517n",
  },
];

export default function Projects() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>Projects - shunku</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-2xl font-bold text-center">My Projects</h1>

          {projects.map((project) => (
            <div key={project.id} className="mt-6">
              <h2 className="text-xl font-bold">{project.title}</h2>
              <p className="mt-2 text-sm text-gray-500">
                {project.description}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Technologies: {project.technologies.join(", ")}
              </p>
              <Link
                href={project.link}
                className="text-cyan-500 hover:text-cyan-700 inline-block mt-2"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
