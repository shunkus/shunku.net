// pages/index.tsx

import Head from "next/head";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>shunku - JavaScript Expert / Data Scientist / Designer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-lightBlue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="flex justify-center">
            <img
              src="/my_photo.jpg"
              alt="shunku"
              className="h-24 w-24 rounded-full"
            />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-center">shunku</h1>
          <p className="mt-4 text-center text-sm text-gray-500">
            As a JavaScript Expert, Data Scientist, and Designer, I bring 13
            years of industry experience to my current role as a Cloud Support
            Engineer at AWS. With a passion for solving complex problems, I
            thrive in the ever-evolving world of technology.
          </p>
        </div>
      </div>
    </div>
  );
}
