import React, { useEffect } from 'react';
import { Calendar, Users, MapPin, Trophy, Star, ArrowRight } from 'lucide-react';
import { motion } from "framer-motion";
import { useTheme } from '../context/ThemeContext';
import eventImage from '/src/assets/images/event.webp';
import communityImage from '/src/assets/images/community.webp';
import locationImage from '/src/assets/images/location.jpg';
import premiumImage from '/src/assets/images/premium.jpg';
import bookingImage from '/src/assets/images/booking.jpg';
import Man1 from '/src/assets/images/Man1.jpg';
import Man2 from '/src/assets/images/Man2.jpg';
import Woman from '/src/assets/images/Woman.jpg';

const Home = () => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <Calendar className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />,
      title: 'Event Creation & Customization',
      description: 'Create and manage events effortlessly with our intuitive interface',
      image: eventImage,
    },
    {
      icon: <Calendar className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />,
      title: 'Seamless Ticket Booking',
      description: 'Create and manage events effortlessly with our intuitive interface',
      image: bookingImage,
    },
    {
      icon: <Users className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />,
      title: 'Community Building',
      description: 'Connect with like-minded people and build your community',
      image: communityImage,
    },
    {
      icon: <MapPin className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />,
      title: 'Location Services',
      description: 'Find events near you with advanced location filtering',
      image: locationImage,
    },
    {
      icon: <Trophy className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />,
      title: 'Premium Features',
      description: 'Access exclusive features and premium event content',
      image: premiumImage,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Event Organizer',
      content: 'eventA has transformed how I manage my events. The platform is intuitive and powerful.',
      rating: 5,
      image: Man1,
    },
    {
      name: 'Michael Chen',
      role: 'Regular Attendee',
      content: "I've discovered amazing events and met wonderful people through this platform.",
      rating: 5,
      image: Man2,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Community Leader',
      content: 'The best platform for creating and managing community events. Highly recommended!',
      rating: 5,
      image: Woman,
    },
  ];

  return (
    <div className={`min-h-screen  ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div
        className={`relative w-full ${
          isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-blue-600 to-blue-800'
        } text-white py-20`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center leading-tight mb-6">
            Discover.Create.Celebrate.
            <br />
            Events with eventA
          </h1>
          <p
            className={`text-lg md:text-xl ${isDarkMode ? 'text-gray-200' : 'text-blue-100'} text-center max-w-2xl mb-8`}
          >
            Your ultimate platform to host unforgettable events, connect with your audience, and build lasting memories.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <a href='/LoginSignup'>
              <button
                className={`px-6 py-3 md:px-8 md:py-3 bg-white rounded-full font-bold transition-colors ${
                  isDarkMode ? 'text-gray-700 hover:bg-gray-100' : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                Get Started
              </button>
            </a>
            <a href='/about'>
              <button className="px-6 py-3 md:px-8 md:py-3 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors">
                Learn More
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Below Hero Section */}
      <div className={` ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} py-20`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center">
          {/* Content Section */}
          <div className={`flex-1 p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              eventA has served enterprises across <span className="text-indigo-600">10+ cities</span> 
              and served more than <span className="text-indigo-600">500K attendees.</span>
            </h1>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              The company recently secured $20 million in Series B funding from VisionNext Capital, 
              a global leader in enterprise solutions, and TechSpring Ventures, a prominent private 
              equity fund focusing on technology-driven sectors. The funding round also saw participation 
              from InnovateX Partners and other strategic investors.
            </p>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              The funds come at a pivotal moment for eventA, as it reported a remarkable 130% quarter-on-quarter 
              growth in online event attendees in Q4 of 2021. These resources will be utilized for strategic M&A 
              opportunities, geographical expansion, and the development of advanced product features.
            </p>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              eventA's all-in-one event management platform offers robust features such as CRM integration, 
              attendee behavior analytics, and automated marketing tools. These capabilities enable businesses 
              to track, analyze, and optimize the effectiveness of their campaigns, delivering unmatched value 
              to marketers and event organizers alike.
            </p>
          </div>

          {/* Image Section */}
          <div className="flex-1 flex items-center justify-center p-6">
            <img
              src="/src/assets/images/eventAoffice.webp"
              alt="eventA Office"
              className="rounded-xl shadow-lg w-full max-w-md object-cover"
            />
          </div>
        </div>
      </div>

      {/* Motion Section */}
      <div className={`flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4`}>
        {/* Main Container */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
          {/* Animation Div */}
          <motion.div
            className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="text-center">
              <motion.div
                className="w-20 h-20 bg-white rounded-full mb-4"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <img 
                  src="/src/assets/images/CEO.png" 
                  alt="Abishek Bhatta" 
                  className="w-full h-full object-cover rounded-full"
                />
              </motion.div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Abishek Bhatta</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>CEO of eventA</p>
            </div>
          </motion.div>

          {/* Content Div */}
          <div className={`flex flex-col items-start justify-center p-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <h1 className="text-2xl font-bold mb-4">Welcome to Our Website</h1>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              "At eventA, we believe that every event is an opportunity to create connections, drive impact, 
              and inspire innovation. Our mission is to empower businesses with cutting-edge event management tools 
              that simplify processes, amplify reach, and maximize results. We’re not just building software; we’re 
              building experiences that transform the way the world connects. Join us in shaping the future of events, 
              where every interaction becomes a meaningful opportunity."
            </p>
          </div>
        </div>
      </div>

      {/* Full Animation Div */}
      <div className={`flex h-60 items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <motion.div
          className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-green-500 text-white"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 8 }}
        >
          <div className="text-center">
            <motion.h1
              className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Discover, Create and Plan
            </motion.h1>
            <motion.p
              className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              all in one place
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Key Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Make Every Event Extraordinary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Plan with Ease',
                description: 'Use our tools to create detailed event schedules and agendas effortlessly.',
                icon: <Calendar className={`w-12 h-12 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />,
              },
              {
                title: 'Host Seamlessly',
                description: 'From ticketing to check-ins, simplify every aspect of hosting.',
                icon: <Trophy className={`w-12 h-12 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />,
              },
              {
                title: 'Connect & Network',
                description: 'Engage with attendees and build lasting relationships.',
                icon: <Users className={`w-12 h-12 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />,
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl shadow-lg transition-all ${
                  isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                } hover:shadow-xl`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className={` ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Hear From Our Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border transition-all duration-300 ${
                  isDarkMode ? 'bg-gray-900 border-gray-700 hover:border-gray-400' : 'bg-white border-gray-200 hover:border-blue-500/50'
                } hover:shadow-lg`}
              >
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mb-4"
                />
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        isDarkMode ? 'fill-gray-400 text-gray-400' : 'fill-blue-400 text-blue-400'
                      }`}
                    />
                  ))}
                </div>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{testimonial.content}</p>
                <div className="mt-4">
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {testimonial.name}
                  </p>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <br/>

      {/* CTA Section */}
      <div
        className={`bg-gradient-to-r ${isDarkMode ? 'from-gray-700 to-gray-800' : 'from-blue-600 to-blue-800'} py-12`}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Create Your Event?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful event organizers on eventA
          </p>
          <a href='/LoginSignup'>
            <button className="px-8 py-3 bg-white rounded-full font-semibold text-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;