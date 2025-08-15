
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, ArrowRight, Star, Users, BookOpen } from 'lucide-react';
import Image from 'next/image';

const HomePage = () => {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState(null);

  const mentors = [
    {
      id: 'hitesh',
      name: 'Hitesh Choudhary',
      title: 'Chai aur Code Creator',
      description: 'JavaScript, React, Backend Development, and Full-Stack Projects',
      image: '/hitesh.png',
      specialties: ['JavaScript Mastery', 'React Development', 'Backend with Node.js', 'Full-Stack Projects'],
      followers: '2M+',
      courses: '20+',
      bgGradient: 'from-orange-500 to-red-600',
      cardBg: 'from-orange-50 to-red-50',
      accentColor: 'orange'
    },
    {
      id: 'piyush',
      name: 'Piyush Garg',
      title: 'Tech Educator & Developer',
      description: 'Web Development, System Design, and Programming Fundamentals',
      image: '/piyush.png',
      specialties: ['System Design', 'Web Development', 'Programming Logic', 'Interview Prep'],
      followers: '300K+',
      courses: '15+',
      bgGradient: 'from-blue-500 to-purple-600',
      cardBg: 'from-blue-50 to-purple-50',
      accentColor: 'blue'
    }
  ];

  const handleCardClick = (mentorId) => {
    // Navigate to dashboard with mentor parameter
    router.push(`/dashboard?mentor=${mentorId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-16 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-full border border-orange-500/30 mb-6">
            <MessageCircle className="w-5 h-5 mr-2 text-orange-400" />
            <span className="text-sm font-medium text-gray-300">AI-Powered Learning Experience</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent leading-tight">
            Chat with Your Favorite
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
              Tech Gurus
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Get personalized advice from <span className="text-orange-400 font-semibold">Hitesh Choudhary</span> and{' '}
            <span className="text-blue-400 font-semibold">Piyush Garg</span> personas.{' '}
            <br className="hidden md:block" />
            Switch instantly and experience their unique teaching styles!
          </p>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400 mt-8">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>2.5M+ Combined Followers</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>35+ Courses</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Expert Guidance</span>
            </div>
          </div>
        </div>

        {/* Mentor Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className={`group relative cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                hoveredCard === mentor.id ? 'z-20' : 'z-10'
              }`}
              onMouseEnter={() => setHoveredCard(mentor.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(mentor.id)}
            >
              {/* Card Background with Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mentor.cardBg} rounded-3xl transform transition-all duration-500 group-hover:scale-105 opacity-10`}></div>
              
              {/* Main Card */}
              <div className="relative bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 transition-all duration-500 group-hover:border-gray-600/70 group-hover:shadow-2xl">
                
                {/* Card Header */}
                <div className="flex items-start space-x-6 mb-6">
                  {/* Profile Image */}
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${mentor.bgGradient} rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500`}></div>
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/20 group-hover:border-white/40 transition-all duration-500">
                      <Image
                        src={mentor.image}
                        alt={mentor.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Mentor Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-gray-100 transition-colors">
                      {mentor.name}
                    </h3>
                    <p className={`text-${mentor.accentColor}-400 font-semibold mb-2`}>
                      {mentor.title}
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {mentor.description}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    <div className="text-lg font-bold text-white">{mentor.followers}</div>
                    <div className="text-xs text-gray-400">Followers</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    <div className="text-lg font-bold text-white">{mentor.courses}</div>
                    <div className="text-xs text-gray-400">Courses</div>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Specialties:</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 bg-${mentor.accentColor}-500/20 text-${mentor.accentColor}-300 text-xs rounded-full border border-${mentor.accentColor}-500/30`}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <button className={`w-full bg-gradient-to-r ${mentor.bgGradient} text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-${mentor.accentColor}-500/25 group-hover:scale-105 flex items-center justify-center space-x-2`}>
                  <span>Start Chatting with {mentor.name.split(' ')[0]}</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-br ${mentor.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">
            Switch between mentors anytime during your conversation
          </p>
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-800/50 rounded-full border border-gray-700/50">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">AI Powered • Real-time Responses • Personalized Learning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
