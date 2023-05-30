// pages/projects.tsx

import Head from "next/head";
import Link from "next/link";

const projects = [
  {
    id: 1,
    title: "My Awesome App",
    description:
      "This is a mobile app that I built using React Native. It helps users track their fitness goals.",
    technologies: ["React Native", "TypeScript", "Firebase"],
    link: "https://github.com/johndoe/my-awesome-app",
  },
  {
    id: 2,
    title: "My Portfolio Site",
    description:
      "This is my personal portfolio site built with Next.js and Tailwind CSS.",
    technologies: ["Next.js", "Tailwind CSS", "TypeScript"],
    link: "https://github.com/johndoe/my-portfolio-site",
  },
  {
    id: 3,
    title: "My API Project",
    description:
      "This is an API that I built for a startup company. It was built using Node.js and Express.js.",
    technologies: ["Node.js", "Express.js", "MongoDB"],
    link: "https://github.com/johndoe/my-api-project",
  },
];

export default function Projects() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>Projects - John Doe</title>
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
                className="text-lightBlue-500 hover:text-lightBlue-700"
              >
                View on GitHub
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
