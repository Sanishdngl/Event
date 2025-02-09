import React, { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MessageSquare, Send, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import emailjs from '@emailjs/browser';
import { motion } from 'framer-motion';
import ContactImage from '/src/assets/images/ContactImage.avif';

const Contact = () => {
  const { isDarkMode } = useTheme();
  const form = useRef();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs.sendForm('service_5zu8wap', 'template_z89ddug', form.current, 'CynZIU6EnK4YuPEpF')
      .then(() => {
        alert('Email sent successfully!');
        form.current.reset();
      })
      .catch((error) => {
        console.error('FAILED...', error.text);
        alert('Failed to send email. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-white to-gray-50 text-gray-900'} pt-16`}>
      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${isDarkMode ? 'from-gray-700 to-gray-800' : 'from-blue-600 to-blue-800'} text-white py-20`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Have questions about eventA? We are here to help and would love to hear from you.
          </p>
        </div>
      </div>

      {/* Contact Form and Image Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Form */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Send us a Message</h2>
            <form ref={form} onSubmit={sendEmail} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your Name</label>
                <input
                  type="text"
                  name="from_name"
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                <input
                  type="email"
                  name="from_email"
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Message</label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                  }`}
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* 3D Motion Image */}
          <div className="w-full h-full flex justify-center items-center">
            <motion.img
              src={ContactImage}
              alt="3D Motion Image"
              className="rounded-2xl shadow-xl w-full max-w-sm"
              initial={{ scale: 1, rotateY: 0 }}
              animate={{ scale: 1.05, rotateY: 10 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 3 }}
            />
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} py-12`}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email */}
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8 text-center`}>
              <Mail className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              eventa2025@gmail.com</p>
            </div>

            {/* Phone */}
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8 text-center`}>
              <Phone className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Phone</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>+1 (123) 456-7890</p>
            </div>

            {/* Address */}
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8 text-center`}>
              <MapPin className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Address</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>123 Event Street, Kathmandu, Nepal 4001</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;