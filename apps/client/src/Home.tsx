import React, { useState, useEffect } from 'react';
import { 
  Infinity as InfinityIcon, 
  FileText, 
  Search, 
  Tags, 
  Upload, 
  Shield, 
  Zap, 
  Github, 
  Globe,
  X,
  ChevronRight,
  // File as FileIcon,
  Image,
  Music,
  Video,
  Archive,
  Code
} from 'lucide-react';

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [floatingFiles, setFloatingFiles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    // Generate floating file particles
    const files = Array.from({length: 12}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setFloatingFiles(files);
  }, []);

  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:4000/auth/github/login";
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google/login";
  };

  const features = [
    {
      icon: Upload,
      title: "Smart File Storage",
      description: "Seamlessly store and organize your files with intelligent categorization"
    },
    {
      icon: Tags,
      title: "AI-Powered Tagging", 
      description: "Automatic tag generation using machine learning or create your own custom tags"
    },
    {
      icon: Search,
      title: "Semantic Search",
      description: "Find files using natural language queries and contextual understanding"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your files are encrypted and stored with enterprise-grade security"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant file access and real-time synchronization across all devices"
    },
    {
      icon: FileText,
      title: "Universal Support",
      description: "Support for all file types with advanced preview capabilities"
    }
  ];

  // Different file type icons for the orbiting animation
  const orbitingFileIcons = [FileText, Image, Music, Video, Archive, Code];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {floatingFiles.map((file) => (
          <div
            key={file.id}
            className="absolute w-3 h-3 bg-blue-400/20 rounded-sm animate-pulse"
            style={{
              left: `${file.x}%`,
              top: `${file.y}%`,
              animationDelay: `${file.delay}s`,
              animation: `float 6s ease-in-out infinite ${file.delay}s, fadeInOut 4s ease-in-out infinite ${file.delay + 1}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <InfinityIcon className="w-8 h-8 text-blue-400 animate-pulse" />
            <div className="absolute inset-0 w-8 h-8 text-blue-400 animate-ping opacity-20">
              <InfinityIcon className="w-full h-full" />
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            NeuroStore
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
          <button className="text-gray-300 hover:text-white transition-colors duration-200">
            Features
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-8 mt-12 md:mt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
              Infinite
            </span>
            <br />
            <span className="text-white">File Storage</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Store, organize, and discover your files with the power of AI. 
            Experience semantic search and intelligent tagging like never before.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25 flex items-center space-x-2"
            >
              <span>Start Storing</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            
            <button className="text-gray-300 hover:text-white font-medium text-lg flex items-center space-x-2 transition-colors duration-200">
              <span>Learn More</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Blackhole Animation */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-20">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-spin" 
               style={{animationDuration: '20s'}} />
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 animate-spin" 
               style={{animationDuration: '15s', animationDirection: 'reverse'}} />
          <div className="absolute inset-8 rounded-full bg-gradient-to-r from-purple-700/40 to-blue-700/40 animate-spin"
               style={{animationDuration: '10s'}} />
          <div className="absolute inset-12 rounded-full bg-black/80 flex items-center justify-center">
            <InfinityIcon className="w-16 h-16 text-blue-400 animate-pulse" />
          </div>
          
          {/* Orbiting Files */}
          {orbitingFileIcons.map((IconComponent, i) => (
            <div
              key={i}
              className="absolute flex items-center justify-center"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `orbit 8s linear infinite ${i * 1.3}s`
              }}
            >
              <div className="bg-gradient-to-r from-blue-500/80 to-purple-500/80 p-2 rounded-lg shadow-lg backdrop-blur-sm border border-white/20">
                <IconComponent className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 md:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105 hover:bg-white/10"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-blue-300 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contribute Section */}
      <div className="relative z-10 px-6 md:px-8 py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              Open Source
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            NeuroStore is built by the community, for the community. 
            Join us in creating the future of file storage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="group bg-gray-800 hover:bg-gray-700 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3">
              <Github className="w-5 h-5" />
              <span>Contribute on GitHub</span>
            </button>
            <button className="text-teal-400 hover:text-teal-300 font-medium flex items-center space-x-2 transition-colors duration-200">
              <Globe className="w-5 h-5" />
              <span>View Documentation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <InfinityIcon className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Welcome to NeuroStore</h3>
              <p className="text-gray-300">Choose your preferred login method</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
              >
                <Globe className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>
              
              <button
                onClick={handleGitHubLogin}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
              >
                <Github className="w-5 h-5" />
                <span>Continue with GitHub</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <div className="animate-float" />

    </div>
  );
}

export default Home;